// AMAZON S3 STORAGE
// Uses the same four functions as localStorage.js.

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

const { randomUUID } = require('crypto');
const { PassThrough } = require('stream');

const REGION = process.env.AWS_REGION || 'eu-north-1';
const BUCKET = process.env.S3_BUCKET;

if (!BUCKET) {
  throw new Error('Missing S3_BUCKET environment variable.');
}

const s3 = new S3Client({
  region: REGION,
});

// Upload a file and return its storage key.
async function save({ buffer, extension, userId }) {
  const key = `${userId}/${randomUUID()}${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
    })
  );

  return key;
}

// Return a readable stream for the requested file.
// PassThrough lets the existing download route use this synchronously.
function getStream(key) {
  const output = new PassThrough();

  s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
    .then(({ Body }) => {
      if (!Body) {
        throw new Error('S3 returned an empty file stream.');
      }

      Body.on('error', (err) => output.destroy(err));
      Body.pipe(output);
    })
    .catch((err) => output.destroy(err));

  return output;
}

// Check whether the file exists.
async function exists(key) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );

    return true;
  } catch (err) {
    if (
      err.name === 'NotFound' ||
      err.name === 'NoSuchKey' ||
      err.$metadata?.httpStatusCode === 404
    ) {
      return false;
    }

    throw err;
  }
}

// Delete the file from S3.
async function remove(key) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

module.exports = { save, getStream, exists, remove };