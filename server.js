// SafeFile - Secure Document Vault
// Start here: this file connects to MongoDB, sets up security, and starts the web server.
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const config = require('./config/env');
const { connectDB } = require('./config/db');
const requireDatabase = require('./middleware/requireDatabase');
const requireAjaxHeader = require('./middleware/requireAjaxHeader');
const errorHandler = require('./middleware/errorHandler');

async function start() {
  // 1. Connect to MongoDB FIRST. If it fails, stop with a clear message.
  try {
    await connectDB(config.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('\n❌ Could not connect to MongoDB.');
    console.error('   Reason:', err.message);
    console.error('   Things to check:');
    console.error('   - Local MongoDB: is the MongoDB service running?');
    console.error('   - Atlas: correct username/password, and your IP is allowed in Network Access?');
    console.error('   - Is MONGODB_URI in your .env file correct?\n');
    process.exit(1);
  }

  const app = express();
  if (config.trustProxy) app.set('trust proxy', 1); // needed later behind EC2 / a load balancer

  // 2. Security headers (helmet) - protects against clickjacking, XSS tricks, MIME sniffing...
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          // Only force https when running with secure cookies (production).
          'upgrade-insecure-requests': config.cookieSecure ? [] : null,
        },
      },
    })
  );

  // 3. Read JSON request bodies (small limit; file uploads are handled by multer)
  app.use(express.json({ limit: '10kb' }));

  // 4. CSS, JS and images. HTML pages are NOT here (they are protected, see routes/pages.js)
  app.use(express.static(path.join(__dirname, 'public'), { index: false }));

  // 5. API safety checks
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use('/api', requireDatabase);

  // 6. Login sessions, stored in MongoDB so they survive a server restart
  app.use(
    session({
      name: 'safefile.sid',
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions',
        ttl: 60 * 60 * 24, // 1 day
      }),
      cookie: {
        httpOnly: true, // JavaScript in the page cannot read the cookie
        sameSite: 'lax', // cookie is not sent on cross-site POST requests
        secure: config.cookieSecure, // https only (when enabled)
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );

  app.use('/api', requireAjaxHeader);

  // 7. API routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/documents', require('./routes/documents'));
  app.use('/api/activity', require('./routes/activity'));
  app.use('/api/profile', require('./routes/profile'));
  app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));

  // 8. HTML pages
  app.use('/', require('./routes/pages'));

  // 9. Errors
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`🔒 SafeFile is running at http://localhost:${config.port}`);
  });
}

process.on('unhandledRejection', (err) => console.error('Unhandled promise rejection:', err));

start();
