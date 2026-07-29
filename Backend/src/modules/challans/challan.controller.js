const pool = require('../../config/db');
const ApiError = require('../../utils/api-error');
const { sendSuccess } = require('../../utils/api-response');
const { generateInvoicePdf } = require('../../utils/invoice-pdf');
const {
  requireField,
  requireEnum,
  toPositiveInt,
  parsePagination
} = require('../../utils/validation');

const CHALLAN_STATUSES = ['DRAFT', 'CONFIRMED', 'CANCELLED'];

/**
 * Validates the shape of the `items` array shared by create/update.
 * Returns a normalized array of { productId, quantity }.
 */
function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'At least one challan item is required');
  }

  return items.map((item, index) => {
    requireField(item.productId, `items[${index}].productId`);
    requireField(item.quantity, `items[${index}].quantity`);
    return {
      productId: toPositiveInt(item.productId, `items[${index}].productId`),
      quantity: toPositiveInt(item.quantity, `items[${index}].quantity`)
    };
  });
}

/**
 * Formats a human-readable, unique challan number from the numeric id.
 * Example: id 42 -> "CH-000042"
 */
function formatChallanNumber(id) {
  return `CH-${String(id).padStart(6, '0')}`;
}

/**
 * POST /api/challans
 * Creates a new challan in DRAFT status. Draft creation never touches
 * product stock -- stock is only affected on confirmation.
 */
async function create(req, res) {
  const { customerId, items } = req.body;

  requireField(customerId, 'customerId');
  const parsedCustomerId = toPositiveInt(customerId, 'customerId');
  const normalizedItems = normalizeItems(items);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [customerRows] = await connection.execute(
      'SELECT id FROM customers WHERE id = ?',
      [parsedCustomerId]
    );
    if (!customerRows[0]) {
      throw new ApiError(400, 'Customer not found');
    }

    // Fetch product snapshots for every item up front; also validates that
    // every referenced product exists before any rows are written.
    const productMap = await fetchProductsByIds(
      connection,
      normalizedItems.map((item) => item.productId)
    );

    const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

    const [challanResult] = await connection.execute(
      `INSERT INTO challans (challan_number, customer_id, total_quantity, status, created_by)
       VALUES (?, ?, ?, 'DRAFT', ?)`,
      [`TEMP-${Date.now()}`, parsedCustomerId, totalQuantity, req.user.id]
    );

    const challanId = challanResult.insertId;
    const challanNumber = formatChallanNumber(challanId);

    await connection.execute('UPDATE challans SET challan_number = ? WHERE id = ?', [
      challanNumber,
      challanId
    ]);

    await insertChallanItems(connection, challanId, normalizedItems, productMap);

    await connection.commit();

    const challan = await getChallanWithItems(challanId);

    sendSuccess(res, {
      statusCode: 201,
      message: 'Challan created successfully',
      data: challan
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * GET /api/challans
 * Lists challans with pagination and optional status/customer filter.
 */
async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { status, customerId } = req.query;

  const conditions = [];
  const params = [];

  if (status) {
    requireEnum(status, CHALLAN_STATUSES, 'status');
    conditions.push('c.status = ?');
    params.push(status);
  }

  if (customerId) {
    conditions.push('c.customer_id = ?');
    params.push(toPositiveInt(customerId, 'customerId'));
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT c.*, cu.name AS customer_name, cu.mobile AS customer_mobile
     FROM challans c
     JOIN customers cu ON cu.id = c.customer_id
     ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM challans c ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  sendSuccess(res, {
    message: 'Challans fetched successfully',
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
 * GET /api/challans/:id
 */
async function getOne(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  const challan = await getChallanWithItems(id);

  sendSuccess(res, {
    message: 'Challan fetched successfully',
    data: challan
  });
}

/**
 * PUT /api/challans/:id
 * Replaces the customer/items of a DRAFT challan. Confirmed or cancelled
 * challans can no longer be edited.
 */
async function update(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  const { customerId, items } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [challanRows] = await connection.execute(
      'SELECT * FROM challans WHERE id = ? FOR UPDATE',
      [id]
    );
    const challan = challanRows[0];
    if (!challan) {
      throw new ApiError(404, 'Challan not found');
    }
    if (challan.status !== 'DRAFT') {
      throw new ApiError(409, `Only DRAFT challans can be edited (current status: ${challan.status})`);
    }

    requireField(customerId, 'customerId');
    const parsedCustomerId = toPositiveInt(customerId, 'customerId');
    const normalizedItems = normalizeItems(items);

    const [customerRows] = await connection.execute(
      'SELECT id FROM customers WHERE id = ?',
      [parsedCustomerId]
    );
    if (!customerRows[0]) {
      throw new ApiError(400, 'Customer not found');
    }

    const productMap = await fetchProductsByIds(
      connection,
      normalizedItems.map((item) => item.productId)
    );

    const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

    await connection.execute('DELETE FROM challan_items WHERE challan_id = ?', [id]);
    await insertChallanItems(connection, id, normalizedItems, productMap);

    await connection.execute(
      'UPDATE challans SET customer_id = ?, total_quantity = ? WHERE id = ?',
      [parsedCustomerId, totalQuantity, id]
    );

    await connection.commit();

    const updatedChallan = await getChallanWithItems(id);

    sendSuccess(res, {
      message: 'Challan updated successfully',
      data: updatedChallan
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * POST /api/challans/:id/confirm
 *
 * The most critical business operation in the system. Confirming a
 * challan must:
 *   1. Lock the challan row.
 *   2. Lock every referenced product row (in a stable order to avoid deadlocks).
 *   3. Verify every item has sufficient stock.
 *   4. If any item is short, roll back the whole transaction -- no partial
 *      stock reduction, no partial movements, challan stays DRAFT.
 *   5. Otherwise, reduce stock, write OUT stock movements, and mark the
 *      challan CONFIRMED, all inside one transaction.
 */
async function confirm(req, res) {
  const id = toPositiveInt(req.params.id, 'id');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [challanRows] = await connection.execute(
      'SELECT * FROM challans WHERE id = ? FOR UPDATE',
      [id]
    );
    const challan = challanRows[0];
    if (!challan) {
      throw new ApiError(404, 'Challan not found');
    }
    if (challan.status !== 'DRAFT') {
      throw new ApiError(409, `Only DRAFT challans can be confirmed (current status: ${challan.status})`);
    }

    const [items] = await connection.execute(
      'SELECT * FROM challan_items WHERE challan_id = ?',
      [id]
    );
    if (items.length === 0) {
      throw new ApiError(409, 'Challan has no items to confirm');
    }

    // Lock product rows in a consistent order (by id) to reduce the chance
    // of a deadlock when multiple challans are confirmed concurrently.
    const sortedProductIds = [...new Set(items.map((item) => item.product_id))].sort(
      (a, b) => a - b
    );

    const productRowsById = new Map();
    for (const productId of sortedProductIds) {
      const [rows] = await connection.execute(
        'SELECT * FROM products WHERE id = ? FOR UPDATE',
        [productId]
      );
      const product = rows[0];
      if (!product) {
        throw new ApiError(400, `Product ${productId} referenced by this challan no longer exists`);
      }
      productRowsById.set(productId, product);
    }

    // Validate stock for every item BEFORE making any changes.
    for (const item of items) {
      const product = productRowsById.get(item.product_id);
      if (item.quantity > product.current_stock) {
        throw new ApiError(409, 'Insufficient stock to confirm this challan', {
          productId: product.id,
          productName: product.name,
          availableStock: product.current_stock,
          requestedQuantity: item.quantity
        });
      }
    }

    // All items have sufficient stock: apply the reduction and record movements.
    for (const item of items) {
      const product = productRowsById.get(item.product_id);
      const newStock = product.current_stock - item.quantity;

      await connection.execute('UPDATE products SET current_stock = ? WHERE id = ?', [
        newStock,
        product.id
      ]);

      await connection.execute(
        `INSERT INTO stock_movements
          (product_id, quantity, movement_type, reason, reference_type, reference_id, created_by)
         VALUES (?, ?, 'OUT', ?, 'CHALLAN', ?, ?)`,
        [product.id, item.quantity, `Sales challan ${challan.challan_number}`, id, req.user.id]
      );

      // Keep the local map's stock value current in case the same product
      // appears more than once in the challan.
      product.current_stock = newStock;
    }

    await connection.execute("UPDATE challans SET status = 'CONFIRMED' WHERE id = ?", [id]);

    await connection.commit();

    const confirmedChallan = await getChallanWithItems(id);

    sendSuccess(res, {
      message: 'Challan confirmed successfully',
      data: confirmedChallan
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * POST /api/challans/:id/cancel
 * Cancels a DRAFT challan. Since drafts never reduce stock, cancellation
 * requires no inventory changes.
 */
async function cancel(req, res) {
  const id = toPositiveInt(req.params.id, 'id');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [challanRows] = await connection.execute(
      'SELECT * FROM challans WHERE id = ? FOR UPDATE',
      [id]
    );
    const challan = challanRows[0];
    if (!challan) {
      throw new ApiError(404, 'Challan not found');
    }
    if (challan.status !== 'DRAFT') {
      throw new ApiError(409, `Only DRAFT challans can be cancelled (current status: ${challan.status})`);
    }

    await connection.execute("UPDATE challans SET status = 'CANCELLED' WHERE id = ?", [id]);
    await connection.commit();

    const cancelledChallan = await getChallanWithItems(id);

    sendSuccess(res, {
      message: 'Challan cancelled successfully',
      data: cancelledChallan
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * GET /api/challans/:id/invoice
 * Generates and streams a PDF invoice for a CONFIRMED challan. Only
 * confirmed challans have a finalized, stock-backed set of items, so
 * DRAFT/CANCELLED challans are rejected with 409.
 */
async function downloadInvoice(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  const challan = await getChallanWithItems(id);

  if (challan.status !== 'CONFIRMED') {
    throw new ApiError(
      409,
      `Only CONFIRMED challans can be exported as an invoice (current status: ${challan.status})`
    );
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="invoice-${challan.challan_number}.pdf"`
  );

  generateInvoicePdf(challan, res);
}

/**
 * Internal helper: fetches products by id within a transaction connection.
 * Throws a 400 ApiError if any referenced product does not exist.
 */
async function fetchProductsByIds(connection, productIds) {
  const uniqueIds = [...new Set(productIds)];
  const placeholders = uniqueIds.map(() => '?').join(', ');

  const [rows] = await connection.query(
    `SELECT * FROM products WHERE id IN (${placeholders})`,
    uniqueIds
  );

  const productMap = new Map(rows.map((row) => [row.id, row]));

  for (const id of uniqueIds) {
    if (!productMap.has(id)) {
      throw new ApiError(400, `Product ${id} not found`);
    }
  }

  return productMap;
}

/**
 * Internal helper: inserts challan_items rows, copying product snapshot
 * fields (name, sku, category, unit price) so historical challan data
 * stays accurate even if the product master record changes later.
 */
async function insertChallanItems(connection, challanId, items, productMap) {
  for (const item of items) {
    const product = productMap.get(item.productId);
    await connection.execute(
      `INSERT INTO challan_items
        (challan_id, product_id, product_name_snapshot, sku_snapshot, category_snapshot, unit_price_snapshot, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        challanId,
        product.id,
        product.name,
        product.sku,
        product.category || null,
        product.unit_price,
        item.quantity
      ]
    );
  }
}

/**
 * Internal helper: fetches a challan with its customer info and items,
 * or throws a 404 ApiError.
 */
async function getChallanWithItems(id) {
  const [challanRows] = await pool.execute(
    `SELECT c.*, cu.name AS customer_name, cu.mobile AS customer_mobile
     FROM challans c
     JOIN customers cu ON cu.id = c.customer_id
     WHERE c.id = ?`,
    [id]
  );
  const challan = challanRows[0];
  if (!challan) {
    throw new ApiError(404, 'Challan not found');
  }

  const [items] = await pool.execute(
    'SELECT * FROM challan_items WHERE challan_id = ? ORDER BY id ASC',
    [id]
  );

  return { ...challan, items };
}

module.exports = { create, list, getOne, update, confirm, cancel, downloadInvoice };
