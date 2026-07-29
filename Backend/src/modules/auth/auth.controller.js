const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const ApiError = require('../../utils/api-error');
const { requireField } = require('../../utils/validation');
const { sendSuccess } = require('../../utils/api-response');

/**
 * POST /api/auth/login
 * Authenticates a user with email + password and returns a JWT.
 */
async function login(req, res) {
  const { email, password } = req.body;

  requireField(email, 'email');
  requireField(password, 'password');

  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  const user = rows[0];

  // Use the same error message for "unknown user" and "wrong password"
  // so the API does not reveal which emails are registered.
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

  sendSuccess(res, {
    message: 'Login successful',
    data: { token, user: tokenPayload }
  });
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user, derived from the verified JWT.
 * Useful for the frontend to validate a stored token on app load.
 */
async function me(req, res) {
  sendSuccess(res, { message: 'Current user fetched', data: req.user });
}

module.exports = { login, me };
