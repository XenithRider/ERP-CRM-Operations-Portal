const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const customerRoutes = require('./modules/customers/customer.routes');
const productRoutes = require('./modules/products/product.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const challanRoutes = require('./modules/challans/challan.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/challans', challanRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
