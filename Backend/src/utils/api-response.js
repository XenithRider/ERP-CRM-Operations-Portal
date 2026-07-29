/**
 * Sends a consistent success response envelope:
 *   { success: true, message, data, pagination? }
 *
 * `pagination` is only included when provided, so single-resource
 * responses stay clean.
 */
function sendSuccess(res, { statusCode = 200, message = 'Operation completed successfully', data = null, pagination } = {}) {
    const body = { success: true, message, data };
    if (pagination) {
      body.pagination = pagination;
    }
    return res.status(statusCode).json(body);
  }
  
  module.exports = { sendSuccess };
  