// LOCAL FILE STORAGE (used now).
// Files are saved inside the "uploads/" folder: uploads/<userId>/<random-name>.<ext>
//
// Every storage driver must provide the same four functions:
//   save({ buffer, extension, userId }) -> returns a "storage key" (a string)
//   getStream(key)                      -> returns a readable stream of the file
//   exists(key)                         -> true / false
//   remove(key)                         -> deletes the file
// Later, an S3 driver with the same four functions can replace this file.
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const UPLOAD_ROOT = path.resolve(__dirname, '..', '..', 'uploads');

// Turns a key into a real path and makes sure it stays inside the uploads folder.
function resolveSafe(key) {
  const fullPath = path.resolve(UPLOAD_ROOT, key);
  if (!fullPath.startsWith(UPLOAD_ROOT + path.sep)) {
    throw new Error('Invalid storage key');
  }
  return fullPath;
}

async function save({ buffer, extension, userId }) {
  // The stored name is random, so the user's file name can never cause problems.
  const key = `${userId}/${crypto.randomUUID()}${extension}`;
  const fullPath = resolveSafe(key);
  await fsp.mkdir(path.dirname(fullPath), { recursive: true });
  await fsp.writeFile(fullPath, buffer, { flag: 'wx' }); // 'wx' = never overwrite
  return key;
}

function getStream(key) {
  return fs.createReadStream(resolveSafe(key));
}

async function exists(key) {
  try {
    await fsp.access(resolveSafe(key));
    return true;
  } catch {
    return false;
  }
}

async function remove(key) {
  try {
    await fsp.unlink(resolveSafe(key));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err; // already gone is fine
  }
}

module.exports = { save, getStream, exists, remove };
