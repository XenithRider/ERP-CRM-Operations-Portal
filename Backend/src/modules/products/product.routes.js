const express = require('express');
const productController = require('./product.controller');
const authenticate = require('../../middleware/auth.middleware');
const allowRoles = require('../../middleware/role.middleware');
const asyncHandler = require('../../utils/async-handler');

const router = express.Router();

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

module.exports = router;
