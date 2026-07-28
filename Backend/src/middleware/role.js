const ApiError = require('../utils/api-error');

/**
 * Restricts a route to the given roles. Must run after `authenticate`
 * so that req.user is already populated from the verified JWT.
 *
 * Usage:
 *   router.post('/', authenticate, allowRoles('ADMIN', 'SALES'), controller.create);
 */
function allowRoles(...allowedRoles) {
  return function checkRole(req, res, next) {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication is required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }

    return next();
  };
}

module.exports = allowRoles;
