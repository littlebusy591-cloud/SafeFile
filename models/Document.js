const mongoose = require('mongoose');
const CATEGORIES = require('../config/categories');

// Only the METADATA is stored in MongoDB.
// The actual file lives in storage (local folder now, Amazon S3 later).
const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // owner
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    category: { type: String, enum: CATEGORIES, required: true },
    originalName: { type: String, required: true }, // name shown to the user
    storageKey: { type: String, required: true }, // where the file is kept in storage
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // bytes
  },
  { timestamps: true }
);

// Makes "my documents, newest first" fast.
documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
