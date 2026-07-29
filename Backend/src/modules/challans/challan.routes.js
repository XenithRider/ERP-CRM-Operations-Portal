const express = require('express');
const challanController = require('./challan.controller');
const authenticate = require('../../middleware/auth.middleware');
const allowRoles = require('../../middleware/role.middleware');
const asyncHandler = require('../../utils/async-handler');

const router = express.Router();

// Challans can be read by ADMIN, SALES, and ACCOUNTS.
// Only ADMIN and SALES can create, edit, confirm, or cancel challans.

router.get(
  '/',
  authenticate,
  allowRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  asyncHandler(challanController.list)
);

router.post(
  '/',
  authenticate,
  allowRoles('ADMIN', 'SALES'),
  asyncHandler(challanController.create)
);

router.get(
  '/:id',
  authenticate,
  allowRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  asyncHandler(challanController.getOne)
);

router.put(
  '/:id',
  authenticate,
  allowRoles('ADMIN', 'SALES'),
  asyncHandler(challanController.update)
);

router.post(
  '/:id/confirm',
  authenticate,
  allowRoles('ADMIN', 'SALES'),
  asyncHandler(challanController.confirm)
);

router.post(
  '/:id/cancel',
  authenticate,
  allowRoles('ADMIN', 'SALES'),
  asyncHandler(challanController.cancel)
);

router.get(
  '/:id/invoice',
  authenticate,
  allowRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  asyncHandler(challanController.downloadInvoice)
);

module.exports = router;
