/**
 * Represents a predictable, application-level error.
 * Thrown from controllers/business logic and caught by the centralized
 * error middleware, which turns it into a consistent JSON response.
 */
class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code to respond with.
     * @param {string} message - Human-readable error message.
     * @param {object} [details] - Optional extra context (e.g. which product,
     *   available vs requested quantity). Never include sensitive data here.
     */
    constructor(statusCode, message, details) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.details = details;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = ApiError;
  