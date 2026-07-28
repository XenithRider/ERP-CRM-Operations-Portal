const ApiError = require('../utils/api-error');

/**
 * Handles requests to routes that do not exist.
 * Should be registered after all valid routes, before the error handler.
 */
function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized error handler. Converts ApiError instances (and any
 * unexpected errors) into a consistent JSON response shape and never
 * leaks internals such as stack traces or SQL details to the client.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : 'Internal server error';

  if (!isApiError) {
    // Unexpected errors are logged for diagnosis but never exposed to the client.
    console.error('Unexpected error:', err.message);
  }

  const response = {
    success: false,
    message
  };

  if (isApiError && err.details) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
}

module.exports = { notFoundHandler, errorHandler };
