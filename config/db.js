// MongoDB connection lives here (separate from the rest of the app).
// Works with a local MongoDB or MongoDB Atlas - only MONGODB_URI changes.
const dns = require('dns');
const mongoose = require('mongoose');

async function connectDB(uri) {
  // If using MongoDB Atlas SRV URI, ensure reliable DNS resolution on Windows/Node
  if (uri && uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    } catch {
      // Ignore if setServers is not permitted
    }
  }

  // Give up after 5 seconds instead of waiting forever if MongoDB is not running.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected.'));
  mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected.'));
}

function isDBConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

module.exports = { connectDB, isDBConnected };
