const Activity = require('../models/Activity');

// Saves one line in the activity history.
// action is 'upload', 'download' or 'delete'.
async function logActivity(userId, action, doc) {
  try {
    await Activity.create({
      user: userId,
      action,
      documentId: doc._id,
      documentTitle: doc.title,
    });
  } catch (err) {
    // A failed history entry should not break the user's upload/download.
    console.error('Could not record activity:', err.message);
  }
}

module.exports = { logActivity };
