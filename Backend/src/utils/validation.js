const ApiError = require('./api-error');

/**
 * Ensures a value is present (not undefined, null, or an empty string).
 */
function requireField(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, `${fieldName} is required`);
  }
}

/**
 * Ensures a value, if provided, is one of the allowed enum values.
 */
function requireEnum(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    throw new ApiError(
      400,
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }
}

/**
 * Parses and validates a positive integer (e.g. an id or quantity).
 */
function toPositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive integer`);
  }
  return parsed;
}

/**
 * Parses and validates a non-negative number (e.g. unit price, minimum stock).
 */
function toNonNegativeNumber(value, fieldName) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new ApiError(400, `${fieldName} must be a non-negative number`);
  }
  return parsed;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts an optional leading + followed by 7-15 digits, covering both
// domestic (e.g. 10-digit Indian) and international mobile numbers.
const MOBILE_REGEX = /^\+?[0-9]{7,15}$/;

/**
 * Validates an email format. Optional fields should only call this when a
 * value is actually present (skip the call for empty/undefined values).
 */
function requireValidEmail(value, fieldName) {
  if (!EMAIL_REGEX.test(value)) {
    throw new ApiError(400, `${fieldName} must be a valid email address`);
  }
}

/**
 * Validates a mobile number format (digits only, optional leading '+',
 * 7-15 digits total).
 */
function requireValidMobile(value, fieldName) {
  if (!MOBILE_REGEX.test(value)) {
    throw new ApiError(400, `${fieldName} must be a valid mobile number`);
  }
}

/**
 * Parses pagination query params into safe, bounded values.
 * Enforces a maximum page size so clients cannot request unbounded result sets.
 */
function parsePagination(query, maxLimit = 100) {
  let page = Number.parseInt(query.page, 10);
  let limit = Number.parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }
  if (!Number.isInteger(limit) || limit < 1) {
    limit = 10;
  }
  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Validates a simple date string in YYYY-MM-DD format. Returns null for
 * empty/undefined input since many date fields (e.g. follow_up_date) are optional.
 */
function toOptionalDate(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(value);
  if (!isValidFormat || Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `${fieldName} must be a valid date (YYYY-MM-DD)`);
  }
  return value;
}

module.exports = {
  requireField,
  requireEnum,
  requireValidEmail,
  requireValidMobile,
  toPositiveInt,
  toNonNegativeNumber,
  parsePagination,
  toOptionalDate
};
