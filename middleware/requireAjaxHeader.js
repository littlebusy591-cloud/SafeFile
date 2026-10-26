// Simple protection against CSRF (a malicious site making your browser send requests).
// Our own JavaScript adds the header "X-Requested-With: SafeFile" to every request.
// A different website cannot add custom headers to requests sent to us,
// so any POST / PUT / DELETE without this header is rejected.
module.exports = function requireAjaxHeader(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();
  if (req.get('X-Requested-With') === 'SafeFile') return next();
  return res.status(403).json({ message: 'Request blocked for security reasons.' });
};
