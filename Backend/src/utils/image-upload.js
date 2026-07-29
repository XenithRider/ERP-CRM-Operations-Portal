const crypto = require('crypto');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { isS3Configured, getS3Client } = require('../config/s3');
const ApiError = require('./api-error');

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Uploads a single in-memory file (from multer's memoryStorage) to the
 * configured S3 bucket under a `products/` prefix, and returns the
 * resulting public object URL to store as products.image_url.
 *
 * Throws:
 *   - ApiError(503) if AWS S3 is not configured for this environment.
 *   - ApiError(400) if the file is missing, too large, or an unsupported type.
 */
async function uploadProductImage(file, productId) {
  if (!isS3Configured()) {
    throw new ApiError(
      503,
      'Image upload is not configured on this server. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET to enable it.'
    );
  }

  if (!file) {
    throw new ApiError(400, 'An image file is required (field name: image)');
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new ApiError(400, 'Unsupported image type. Allowed types: JPEG, PNG, WEBP, GIF');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ApiError(400, 'Image file is too large. Maximum size is 5MB');
  }

  const extension = path.extname(file.originalname) || '';
  const key = `products/${productId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = { uploadProductImage, isS3Configured };
