const { validationResult } = require('express-validator');

// Put this after a list of express-validator rules.
// If any rule failed, answer with 400 and the first error message.
function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => e.msg);
  return res.status(400).json({ message: errors[0], errors });
}

// Checks that :id in the URL looks like a MongoDB id (24 hex characters).
function requireValidId(req, res, next) {
  if (/^[a-f\d]{24}$/i.test(req.params.id)) return next();
  return res.status(404).json({ message: 'Document not found.' });
}

module.exports = { handleValidation, requireValidId };
