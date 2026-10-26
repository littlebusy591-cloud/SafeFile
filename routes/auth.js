// /api/auth  -  register, login, logout, who-am-i
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');

const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const SESSION_COOKIE = 'safefile.sid';

// A fake hash used when the email does not exist, so login always takes similar time.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

// Slows down password guessing: max 20 attempts per 15 minutes per IP address.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

const emailRule = body('email')
  .isString().withMessage('Enter a valid email address.').bail()
  .trim().toLowerCase()
  .isEmail().withMessage('Enter a valid email address.')
  .isLength({ max: 254 }).withMessage('Email is too long.');

// ---------- Register ----------
router.post(
  '/register',
  authLimiter,
  [
    body('name')
      .isString().withMessage('Name is required.').bail()
      .trim()
      .isLength({ min: 2, max: 60 }).withMessage('Name must be 2 to 60 characters.'),
    emailRule,
    body('password')
      .isString().withMessage('Password is required.').bail()
      .isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters.')
      .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter.')
      .matches(/\d/).withMessage('Password must contain at least one number.'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match.'),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12); // 12 = how slow/strong the hashing is
    try {
      await User.create({ name, email, passwordHash });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      throw err;
    }

    return res.status(201).json({ message: 'Account created. You can now log in.' });
  })
);

// ---------- Login ----------
router.post(
  '/login',
  authLimiter,
  [
    emailRule,
    body('password').isString().notEmpty().withMessage('Password is required.'),
  ],
  handleValidation,
  asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    const passwordOk = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

    if (!user || !passwordOk) {
      // Same message for both cases, so attackers cannot find out which emails exist.
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    // regenerate() gives a brand-new session id after login (prevents session fixation).
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user._id.toString();
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        return res.json({ message: 'Logged in.', user: { id: user._id, name: user.name, email: user.email } });
      });
    });
  })
);

// ---------- Logout ----------
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie(SESSION_COOKIE);
    return res.json({ message: 'Logged out.' });
  });
});

// ---------- Who am I? (used by the frontend to show the user's name) ----------
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) {
      // The account no longer exists, so end the session.
      return req.session.destroy(() => res.status(401).json({ message: 'Please log in to continue.' }));
    }
    return res.json({ user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } });
  })
);

module.exports = router;
