const jwt = require('jsonwebtoken');
const ApiError = require('../utils/api-error');

/**
 * Verifies the JWT sent in the Authorization header and attaches the
 * decoded user (id, name, email, role) to req.user.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token is missing'));
  }

  const token = header.slice('Bearer '.length).trim();

  if (!token) {
    return next(new ApiError(401, 'Authentication token is missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { 
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired authentication token'));
  }
}

module.exports = authenticate;
