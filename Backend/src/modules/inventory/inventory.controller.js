const pool = require('../../config/db');
const ApiError = require('../../utils/api-error');
const { sendSuccess } = require('../../utils/api-response');
const {
  requireField,
  requireEnum,
  toPositiveInt,
  parsePagination
} = require('../../utils/validation');

const MOVEMENT_TYPES = ['IN', 'OUT'];

/**
 * GET /api/inventory/movements
 * Lists stock movement history, optionally filtered by product.
 */
async function listMovements(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { productId, movementType } = req.query;

  const conditions = [];
  const params = [];

  if (productId) {
    conditions.push('product_id = ?');
    params.push(toPositiveInt(productId, 'productId'));
  }

  if (movementType) {
    requireEnum(movementType, MOVEMENT_TYPES, 'movementType');
    conditions.push('movement_type = ?');
    params.push(movementType);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT sm.*, p.name AS product_name, p.sku AS product_sku
     FROM stock_movements sm
     JOIN products p ON p.id = sm.product_id
     ${whereClause}
     ORDER BY sm.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM stock_movements sm ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  sendSuccess(res, {
    message: 'Stock movements fetched successfully',
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
 * POST /api/inventory/movements
 * Records a manual stock IN or OUT movement and updates the product's
 * current_stock accordingly. Runs inside a transaction with row locking
 * so concurrent movements on the same product cannot corrupt stock levels
 * or push it below zero.
 */
async function createMovement(req, res) {
  const { productId, quantity, movementType, reason } = req.body;

  requireField(productId, 'productId');
  requireField(quantity, 'quantity');
  requireField(movementType, 'movementType');
  requireEnum(movementType, MOVEMENT_TYPES, 'movementType');

  const parsedProductId = toPositiveInt(productId, 'productId');
  const parsedQuantity = toPositiveInt(quantity, 'quantity');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [productRows] = await connection.execute(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [parsedProductId]
    );
    const product = productRows[0];

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (movementType === 'OUT' && parsedQuantity > product.current_stock) {
      throw new ApiError(409, 'Insufficient stock for this movement', {
        productId: product.id,
        productName: product.name,
        availableStock: product.current_stock,
        requestedQuantity: parsedQuantity
      });
    }

    const newStock =
      movementType === 'IN'
        ? product.current_stock + parsedQuantity
        : product.current_stock - parsedQuantity;

    await connection.execute('UPDATE products SET current_stock = ? WHERE id = ?', [
      newStock,
      parsedProductId
    ]);

    const [movementResult] = await connection.execute(
      `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [parsedProductId, parsedQuantity, movementType, reason || null, req.user.id]
    );

    await connection.commit();

    const [movementRows] = await pool.execute(
      'SELECT * FROM stock_movements WHERE id = ?',
      [movementResult.insertId]
    );

    sendSuccess(res, {
      statusCode: 201,
      message: 'Stock movement recorded successfully',
      data: {
        movement: movementRows[0],
        currentStock: newStock
      }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { listMovements, createMovement };
