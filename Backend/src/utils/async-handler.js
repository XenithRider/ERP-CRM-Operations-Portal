/**
 * Wraps an async Express route handler so rejected promises are
 * automatically forwarded to the centralized error middleware via next().
 *
 * Usage:
 *   router.get('/', asyncHandler(controller.list));
 */
function asyncHandler(handler) {
    return function wrappedHandler(req, res, next) {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  }
  
  module.exports = asyncHandler;
  