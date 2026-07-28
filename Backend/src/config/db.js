const mysql = require('mysql2/promise');

/**
 * A single shared MySQL connection pool for the whole application.
 * All modules should reuse this pool instead of creating new connections.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

/**
 * Verifies the pool can reach the database. Intended to be called once
 * during server startup so failures are surfaced early and clearly.
 */
async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;
