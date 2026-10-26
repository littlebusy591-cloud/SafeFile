const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true, // no two accounts with the same email
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // We store only the bcrypt hash, never the real password.
    // select:false means it is NOT returned by queries unless we ask for it.
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('User', userSchema);
