const express = require('express');
const multer = require('multer');
const productController = require('./product.controller');
const authenticate = require('../../middleware/auth.middleware');
const allowRoles = require('../../middleware/role.middleware');
const asyncHandler = require('../../utils/async-handler');

const router = express.Router();

// Images are held in memory only long enough to stream to S3; nothing is
// written to local disk. 5MB limit matches image-upload.js's own check.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// All authenticated roles may read product data.
// Only ADMIN and WAREHOUSE may create/update products (see README Assumptions).

router.get(
  '/',
  authenticate,
  allowRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  asyncHandler(productController.list)
);

router.post(
  '/',
  authenticate,
  allowRoles('ADMIN', 'WAREHOUSE'),
  asyncHandler(productController.create)
);

router.get(
  '/:id',
  authenticate,
  allowRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  asyncHandler(productController.getOne)
);

router.put(
  '/:id',
  authenticate,
  allowRoles('ADMIN', 'WAREHOUSE'),
  asyncHandler(productController.update)
);

router.post(
  '/:id/image',
  authenticate,
  allowRoles('ADMIN', 'WAREHOUSE'),
  upload.single('image'),
  asyncHandler(productController.uploadImage)
);

module.exports = router;
