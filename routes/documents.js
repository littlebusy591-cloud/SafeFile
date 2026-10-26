// /api/documents  -  upload, list/search/filter, download, delete
// EVERY query includes  user: req.session.userId  so people only ever see their own files.
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { body, query } = require('express-validator');

const Document = require('../models/Document');
const CATEGORIES = require('../config/categories');
const allowedTypes = require('../config/fileTypes');
const config = require('../config/env');
const storage = require('../services/storage');
const { logActivity } = require('../services/activityService');
const { requireAuth } = require('../middleware/auth');
const { uploadSingleFile } = require('../middleware/upload');
const { handleValidation, requireValidId } = require('../middleware/validate');
const { hasValidSignature } = require('../utils/fileValidation');
const escapeRegex = require('../utils/escapeRegex');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireAuth); // nothing below works without logging in

// Only send safe fields to the browser (never the storage key or the owner id).
function toJSON(doc) {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    originalName: doc.originalName,
    size: doc.size,
    mimeType: doc.mimeType,
    createdAt: doc.createdAt,
  };
}

// ---------- Settings the upload form needs ----------
router.get('/categories', (req, res) => {
  res.json({
    categories: CATEGORIES,
    maxFileSizeMB: config.maxFileSizeMB,
    allowedExtensions: Object.keys(allowedTypes),
  });
});

// ---------- Dashboard numbers ----------
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.session.userId);

    const grouped = await Document.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 }, size: { $sum: '$size' } } },
    ]);

    const categories = CATEGORIES.map((name) => {
      const found = grouped.find((g) => g._id === name);
      return { name, count: found ? found.count : 0 };
    });
    const totalDocuments = grouped.reduce((sum, g) => sum + g.count, 0);
    const totalSize = grouped.reduce((sum, g) => sum + g.size, 0);

    const recent = await Document.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean();

    res.json({ totalDocuments, totalSize, categories, recent: recent.map(toJSON) });
  })
);

// ---------- List  (?search=title&category=Finance) ----------
router.get(
  '/',
  [
    query('search').optional({ values: 'falsy' }).isString().trim().isLength({ max: 100 })
      .withMessage('Search text is too long.'),
    query('category').optional({ values: 'falsy' }).isIn(CATEGORIES).withMessage('Unknown category.'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const filter = { user: req.session.userId };
    if (req.query.search) {
      filter.title = { $regex: escapeRegex(req.query.search), $options: 'i' }; // case-insensitive
    }
    if (req.query.category) filter.category = req.query.category;

    const docs = await Document.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ documents: docs.map(toJSON) });
  })
);

// ---------- Upload ----------
router.post(
  '/',
  uploadSingleFile, // 1. receive the file (in memory)
  [
    body('title').isString().withMessage('Title is required.').bail()
      .trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1 to 100 characters.'),
    body('description').optional({ values: 'falsy' }).isString().trim()
      .isLength({ max: 500 }).withMessage('Description can be at most 500 characters.'),
    body('category').isIn(CATEGORIES).withMessage('Please choose a category.'),
  ],
  handleValidation, // 2. check the text fields
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Please choose a file to upload.' });
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    if (!hasValidSignature(extension, req.file.buffer)) {
      return res.status(400).json({ message: 'The file contents do not match its type. Upload a real PDF, DOC, DOCX, TXT, PNG or JPG file.' });
    }

    const userId = req.session.userId;
    // 3. save the file to storage, 4. save the details in MongoDB
    const storageKey = await storage.save({ buffer: req.file.buffer, extension, userId });

    try {
      const doc = await Document.create({
        user: userId,
        title: req.body.title,
        description: req.body.description || '',
        category: req.body.category,
        originalName: path.basename(req.file.originalname).slice(0, 150),
        storageKey,
        mimeType: allowedTypes[extension],
        size: req.file.size,
      });
      await logActivity(userId, 'upload', doc);
      return res.status(201).json({ message: 'Document uploaded.', document: toJSON(doc) });
    } catch (err) {
      // The database save failed, so remove the file we just stored (no orphan files).
      await storage.remove(storageKey).catch(() => {});
      throw err;
    }
  })
);

// ---------- Download ----------
router.get(
  '/:id/download',
  requireValidId,
  asyncHandler(async (req, res) => {
    const doc = await Document.findOne({ _id: req.params.id, user: req.session.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    if (!(await storage.exists(doc.storageKey))) {
      return res.status(404).json({ message: 'The file is missing from storage.' });
    }

    await logActivity(req.session.userId, 'download', doc);

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Length', doc.size);
    res.attachment(doc.originalName); // sets Content-Disposition: attachment; filename=...

    const stream = storage.getStream(doc.storageKey);
    stream.on('error', (err) => {
      console.error('Download stream error:', err.message);
      res.destroy();
    });
    stream.pipe(res);
  })
);

// ---------- Delete ----------
router.delete(
  '/:id',
  requireValidId,
  asyncHandler(async (req, res) => {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    try {
      await storage.remove(doc.storageKey);
    } catch (err) {
      // The record is gone; a leftover file is harmless but we log it.
      console.error('Could not delete stored file:', doc.storageKey, err.message);
    }
    await logActivity(req.session.userId, 'delete', doc);

    res.json({ message: 'Document deleted.' });
  })
);

module.exports = router;
