// Serves the HTML pages. The HTML files live in "views/" (not "public/"),
// so the dashboard pages can be protected: not logged in = redirected to /login.
const express = require('express');
const path = require('path');
const { requirePageAuth, redirectIfLoggedIn } = require('../middleware/auth');

const router = express.Router();
const view = (name) => path.join(__dirname, '..', 'views', name);

// Public pages
router.get('/', (req, res) => res.sendFile(view('index.html')));
router.get('/login', redirectIfLoggedIn, (req, res) => res.sendFile(view('login.html')));
router.get('/register', redirectIfLoggedIn, (req, res) => res.sendFile(view('register.html')));

// Protected pages (login required)
const protectedPages = {
  '/dashboard': 'dashboard.html',
  '/upload': 'upload.html',
  '/documents': 'documents.html',
  '/activity': 'activity.html',
  '/profile': 'profile.html',
};

Object.entries(protectedPages).forEach(([route, file]) => {
  router.get(route, requirePageAuth, (req, res) => {
    res.set('Cache-Control', 'no-store'); // back button after logout should not show the page
    res.sendFile(view(file));
  });
});

// Anything else
router.use((req, res) => res.status(404).sendFile(view('404.html')));

module.exports = router;
