const express = require('express');
const customerController = require('./customer.controller');
const authenticate = require('../../middleware/auth.middleware');
const allowRoles = require('../../middleware/role.middleware');
const asyncHandler = require('../../utils/async-handler');

const router = express.Router();

// Customers can be read by ADMIN, SALES, and ACCOUNTS.
// Only ADMIN and SALES can create/update customers or add follow-ups.
// WAREHOUSE has no access to the CRM module (see README Assumptions).

router.get(
  '/',
  authenticate,
  allowRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  asyncHandler(customerController.list)
);

router.post(
  '/',
  authenticate,
  allowRoles('ADMIN', 'SALES'),
  asyncHandler(customerController.create)
);

router.get(
  '/:id',
  authenticate,
  allowRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  asyncHandler(customerController.getOne)
);

router.put(
  '/:id',
  authenticate,
  allowRoles('ADMIN', 'SALES'),
  asyncHandler(customerController.update)
);

router.post(
  '/:id/follow-ups',
  authenticate,
  allowRoles('ADMIN', 'SALES'),
  asyncHandler(customerController.addFollowUp)
);

module.exports = router;
