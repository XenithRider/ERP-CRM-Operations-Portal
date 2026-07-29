const db = require('../../config/db');
const bcrypt = require('bcryptjs');

exports.list = async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  res.status(200).json({
    success: true,
    data: rows
  });
};

exports.create = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const validRoles = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const [result] = await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, password_hash, role]
  );

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { id: result.insertId, name, email, role }
  });
};

exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  if (Number(id) === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot change your own role' });
  }

  const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Role updated successfully',
    data: { id: Number(id), role }
  });
};
