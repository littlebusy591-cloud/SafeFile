// /api/activity  -  the logged-in user's history of uploads, downloads and deletions
const express = require('express');
const { query } = require('express-validator');

const Activity = require('../models/Activity');
const { requireAuth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireAuth);

router.get(
  '/',
  [query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 100 }).withMessage('Limit must be 1 to 100.')],
  handleValidation,
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 20;
    const items = await Activity.find({ user: req.session.userId }).sort({ createdAt: -1 }).limit(limit).lean();

    res.json({
      activities: items.map((a) => ({
        id: a._id,
        action: a.action,
        documentTitle: a.documentTitle,
        createdAt: a.createdAt,
      })),
    });
  })
);

module.exports = router;
