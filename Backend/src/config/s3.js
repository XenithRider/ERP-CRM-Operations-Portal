const { S3Client } = require('@aws-sdk/client-s3');

/**
 * Whether AWS S3 has been configured via environment variables.
 * Image upload is an optional feature: the rest of the API works fine
 * without these variables set, but the upload endpoint will return a
 * clear 503 instead of crashing if they are missing.
 */
function isS3Configured() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      process.env.AWS_S3_BUCKET
  );
}

let cachedClient = null;

/**
 * Returns a lazily-created S3 client. Only call this after confirming
 * isS3Configured() is true.
 */
function getS3Client() {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }
  return cachedClient;
}

module.exports = { isS3Configured, getS3Client };
