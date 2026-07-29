const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middleware/auth.middleware');
const allowRoles = require('../../middleware/role.middleware');
const asyncHandler = require('../../utils/async-handler');

const router = express.Router();

// Only ADMIN can manage users
router.use(authenticate);
router.use(allowRoles('ADMIN'));

router.get('/', asyncHandler(userController.list));
router.post('/', asyncHandler(userController.create));
router.put('/:id/role', asyncHandler(userController.updateRole));

module.exports = router;
