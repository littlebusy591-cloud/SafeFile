// Login checks. A user is "logged in" when their session contains a userId.

// For API routes: answer with JSON 401.
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ message: 'Please log in to continue.' });
}

// For HTML pages (dashboard etc.): send visitors who are not logged in to the login page.
function requirePageAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.redirect('/login');
}

// For login/register pages: logged-in users go straight to the dashboard.
function redirectIfLoggedIn(req, res, next) {
  if (req.session && req.session.userId) return res.redirect('/dashboard');
  return next();
}

module.exports = { requireAuth, requirePageAuth, redirectIfLoggedIn };
