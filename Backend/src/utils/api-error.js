/**
 * Represents a predictable, application-level error.
 * Thrown from controllers/business logic and caught by the centralized
 * error middleware, which turns it into a consistent JSON response.
 */
class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code to respond with.
     * @param {string} message - Human-readable error message.
     * @param {object} [details] - Optional extra context for business-rule
     *   conflicts (e.g. which product, available vs requested quantity).
     *   Never include sensitive data here.
     * @param {Array<{field?: string, message: string}>} [errors] - Optional
     *   structured list of field-level validation errors.
     */
    constructor(statusCode, message, details, errors) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.details = details;
      this.errors = errors;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = ApiError;
  