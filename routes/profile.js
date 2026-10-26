// /api/profile  -  view profile, change name, change password
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { body } = require('express-validator');

const User = require('../models/User');
const Document = require('../models/Document');
const { requireAuth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ message: 'Please log in to continue.' });

    const stats = await Document.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.session.userId) } },
      { $group: { _id: null, count: { $sum: 1 }, size: { $sum: '$size' } } },
    ]);

    res.json({
      user: { name: user.name, email: user.email, createdAt: user.createdAt },
      documentCount: stats[0] ? stats[0].count : 0,
      storageUsed: stats[0] ? stats[0].size : 0,
    });
  })
);

router.put(
  '/',
  [
    body('name').isString().withMessage('Name is required.').bail()
      .trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2 to 60 characters.'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.session.userId, { name: req.body.name }, { new: true });
    if (!user) return res.status(401).json({ message: 'Please log in to continue.' });
    res.json({ message: 'Profile updated.', user: { name: user.name, email: user.email } });
  })
);

router.put(
  '/password',
  [
    body('currentPassword').isString().notEmpty().withMessage('Enter your current password.'),
    body('newPassword').isString().withMessage('Enter a new password.').bail()
      .isLength({ min: 8, max: 72 }).withMessage('New password must be 8 to 72 characters.')
      .matches(/[A-Za-z]/).withMessage('New password must contain at least one letter.')
      .matches(/\d/).withMessage('New password must contain at least one number.'),
    body('confirmPassword').custom((value, { req }) => value === req.body.newPassword)
      .withMessage('New passwords do not match.'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.userId).select('+passwordHash');
    if (!user) return res.status(401).json({ message: 'Please log in to continue.' });

    const ok = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Your current password is incorrect.' });

    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();
    res.json({ message: 'Password changed.' });
  })
);

module.exports = router;
