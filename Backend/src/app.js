const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const customerRoutes = require('./modules/customers/customer.routes');
const productRoutes = require('./modules/products/product.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const challanRoutes = require('./modules/challans/challan.routes');
const userRoutes = require('./modules/users/user.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://erp-crm-operations-portal-rg4xa02nk-xenithriders-projects.vercel.app',
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any *.vercel.app deployment and all configured origins
      if (
        ALLOWED_ORIGINS.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/challans', challanRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
