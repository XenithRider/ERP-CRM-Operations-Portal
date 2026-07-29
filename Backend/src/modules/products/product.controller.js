const pool = require('../../config/db');
const ApiError = require('../../utils/api-error');
const { sendSuccess } = require('../../utils/api-response');
const { uploadProductImage } = require('../../utils/image-upload');
const {
  requireField,
  toPositiveInt,
  toNonNegativeNumber,
  parsePagination
} = require('../../utils/validation');

/**
 * POST /api/products
 * Creates a new product. Initial stock is set explicitly here (not via
 * a stock movement) since the product does not exist yet; any later
 * stock changes must go through the inventory module so they remain
 * traceable in stock_movements.
 */
async function create(req, res) {
  const { name, sku, category, unitPrice, currentStock, minimumStock, warehouseLocation } = req.body;

  requireField(name, 'name');
  requireField(sku, 'sku');
  const price = toNonNegativeNumber(unitPrice, 'unitPrice');
  const initialStock = currentStock === undefined ? 0 : toNonNegativeNumber(currentStock, 'currentStock');
  const minStock = minimumStock === undefined ? 0 : toNonNegativeNumber(minimumStock, 'minimumStock');

  const [existing] = await pool.execute('SELECT id FROM products WHERE sku = ?', [sku]);
  if (existing[0]) {
    throw new ApiError(409, `A product with SKU '${sku}' already exists`, undefined, [
      { field: 'sku', message: 'This SKU is already in use by another product' }
    ]);
  }

  const [result] = await pool.execute(
    `INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, sku, category || null, price, initialStock, minStock, warehouseLocation || null]
  );

  if (initialStock > 0) {
    await pool.execute(
      `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
       VALUES (?, ?, 'IN', 'Initial stock on product creation', ?)`,
      [result.insertId, initialStock, req.user.id]
    );
  }

  const product = await getProductById(result.insertId);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Product created successfully',
    data: product
  });
}

/**
 * GET /api/products
 * Lists products with pagination, search (name/sku/category), and an
 * optional lowStock=true filter (current_stock <= minimum_stock).
 */
async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { search, category, lowStock } = req.query;

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(name LIKE ? OR sku LIKE ? OR category LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (lowStock === 'true') {
    conditions.push('current_stock <= minimum_stock');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT * FROM products ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM products ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  sendSuccess(res, {
    message: 'Products fetched successfully',
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0
    }
  });
}

/**
 * GET /api/products/:id
 */
async function getOne(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  const product = await getProductById(id);

  sendSuccess(res, {
    message: 'Product fetched successfully',
    data: product
  });
}

/**
 * PUT /api/products/:id
 * Updates product master data. Deliberately does NOT allow changing
 * current_stock directly; stock must move through the inventory module
 * so every change is recorded as a stock movement.
 */
async function update(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  await getProductById(id);

  const { name, sku, category, unitPrice, minimumStock, warehouseLocation } = req.body;

  requireField(name, 'name');
  requireField(sku, 'sku');
  const price = toNonNegativeNumber(unitPrice, 'unitPrice');
  const minStock = minimumStock === undefined ? 0 : toNonNegativeNumber(minimumStock, 'minimumStock');

  const [existing] = await pool.execute(
    'SELECT id FROM products WHERE sku = ? AND id != ?',
    [sku, id]
  );
  if (existing[0]) {
    throw new ApiError(409, `A product with SKU '${sku}' already exists`, undefined, [
      { field: 'sku', message: 'This SKU is already in use by another product' }
    ]);
  }

  await pool.execute(
    `UPDATE products SET
      name = ?, sku = ?, category = ?, unit_price = ?, minimum_stock = ?, warehouse_location = ?
     WHERE id = ?`,
    [name, sku, category || null, price, minStock, warehouseLocation || null, id]
  );

  const product = await getProductById(id);

  sendSuccess(res, {
    message: 'Product updated successfully',
    data: product
  });
}

/**
 * Internal helper: fetches a product by id or throws a 404 ApiError.
 */
async function getProductById(id) {
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
  const product = rows[0];
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
}

/**
 * POST /api/products/:id/image
 * Uploads a product image to AWS S3 and stores the resulting URL on the
 * product. Returns 503 with a clear message if AWS S3 is not configured
 * for this environment (see .env.example).
 */
async function uploadImage(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  await getProductById(id);

  const imageUrl = await uploadProductImage(req.file, id);

  await pool.execute('UPDATE products SET image_url = ? WHERE id = ?', [imageUrl, id]);

  const product = await getProductById(id);

  sendSuccess(res, {
    message: 'Product image uploaded successfully',
    data: product
  });
}

module.exports = { create, list, getOne, update, uploadImage, getProductById };
