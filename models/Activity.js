const mongoose = require('mongoose');

// One row for every upload, download or delete.
const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['upload', 'download', 'delete'], required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId },
    // The title is copied here so the history still makes sense after the document is deleted.
    documentTitle: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
