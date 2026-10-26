// MongoDB connection lives here (separate from the rest of the app).
// Works with a local MongoDB or MongoDB Atlas - only MONGODB_URI changes.
const mongoose = require('mongoose');

async function connectDB(uri) {
  // Give up after 5 seconds instead of waiting forever if MongoDB is not running.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected.'));
  mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected.'));
}

function isDBConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

module.exports = { connectDB, isDBConnected };
