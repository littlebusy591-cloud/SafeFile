// Handles the file part of the upload form using multer.
// The file is kept in memory first so we can check it BEFORE saving anything to disk.
const path = require('path');
const multer = require('multer');
const config = require('../config/env');
const allowedTypes = require('../config/fileTypes');

const maxBytes = config.maxFileSizeMB * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes[extension]) return cb(new Error('UNSUPPORTED_TYPE'));
    return cb(null, true);
  },
});

// Wrapper that turns multer errors into friendly JSON messages.
function uploadSingleFile(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: `File is too large. The maximum size is ${config.maxFileSizeMB} MB.` });
    }
    if (err.message === 'UNSUPPORTED_TYPE') {
      return res.status(400).json({ message: 'This file type is not allowed. Use PDF, DOC, DOCX, TXT, PNG or JPG.' });
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'The upload could not be processed. Please try again.' });
    }
    return next(err);
  });
}

module.exports = { uploadSingleFile };
