require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.testConnection();
    console.log('MySQL connection verified.');

    app.listen(PORT, () => {
      console.log(`Mini ERP + CRM backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

start();
