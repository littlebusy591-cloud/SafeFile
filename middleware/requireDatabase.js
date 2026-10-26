const { isDBConnected } = require('../config/db');

// If MongoDB goes down while the server is running, stop here with a clear message
// instead of pretending that something was saved.
module.exports = function requireDatabase(req, res, next) {
  if (isDBConnected()) return next();
  return res.status(503).json({
    message: 'The database is currently unavailable. Nothing was saved. Please try again shortly.',
  });
};
