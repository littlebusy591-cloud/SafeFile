// Last line of defence: any error that was not handled earlier ends up here.
const DB_ERRORS = [
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoServerSelectionError',
  'MongoNotConnectedError',
];

module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (DB_ERRORS.includes(err.name)) {
    return res.status(503).json({
      message: 'The database is currently unavailable. Nothing was saved. Please try again shortly.',
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'The request body is not valid JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'The request is too large.' });
  }

  console.error(err); // full details only in the server console
  return res.status(500).json({ message: 'Something went wrong on the server. Please try again.' });
};
