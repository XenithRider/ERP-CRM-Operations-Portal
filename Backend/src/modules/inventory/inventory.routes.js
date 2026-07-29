const express = require('express');
const inventoryController = require('./inventory.controller');
const authenticate = require('../../middleware/auth.middleware');
const allowRoles = require('../../middleware/role.middleware');
const asyncHandler = require('../../utils/async-handler');

const router = express.Router();

// Movement history is readable by ADMIN, WAREHOUSE, and ACCOUNTS (auditability).
// Only ADMIN and WAREHOUSE may record new stock movements.

router.get(
  '/movements',
  authenticate,
  allowRoles('ADMIN', 'WAREHOUSE', 'ACCOUNTS'),
  asyncHandler(inventoryController.listMovements)
);

router.post(
  '/movements',
  authenticate,
  allowRoles('ADMIN', 'WAREHOUSE'),
  asyncHandler(inventoryController.createMovement)
);

module.exports = router;
