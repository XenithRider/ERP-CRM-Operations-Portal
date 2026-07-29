const pool = require('../../config/db');
const ApiError = require('../../utils/api-error');
const {
  requireField,
  requireEnum,
  toPositiveInt,
  parsePagination,
  toOptionalDate
} = require('../../utils/validation');

const CUSTOMER_TYPES = ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'];
const CUSTOMER_STATUSES = ['LEAD', 'ACTIVE', 'INACTIVE'];

/**
 * POST /api/customers
 * Creates a new customer.
 */
async function create(req, res) {
  const {
    name,
    mobile,
    email,
    businessName,
    gstNumber,
    customerType,
    address,
    status,
    followUpDate,
    notes
  } = req.body;

  requireField(name, 'name');
  requireField(mobile, 'mobile');

  const resolvedType = customerType || 'RETAIL';
  const resolvedStatus = status || 'LEAD';
  requireEnum(resolvedType, CUSTOMER_TYPES, 'customerType');
  requireEnum(resolvedStatus, CUSTOMER_STATUSES, 'status');
  const resolvedFollowUpDate = toOptionalDate(followUpDate, 'followUpDate');

  const [result] = await pool.execute(
    `INSERT INTO customers
      (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      mobile,
      email || null,
      businessName || null,
      gstNumber || null,
      resolvedType,
      address || null,
      resolvedStatus,
      resolvedFollowUpDate,
      notes || null,
      req.user.id
    ]
  );

  const customer = await getCustomerById(result.insertId);

  res.status(201).json({
    success: true,
    data: customer
  });
}

/**
 * GET /api/customers
 * Lists customers with pagination and optional search across
 * name, mobile, business_name, and email.
 */
async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { search, status, customerType } = req.query;

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(name LIKE ? OR mobile LIKE ? OR business_name LIKE ? OR email LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  if (status) {
    requireEnum(status, CUSTOMER_STATUSES, 'status');
    conditions.push('status = ?');
    params.push(status);
  }

  if (customerType) {
    requireEnum(customerType, CUSTOMER_TYPES, 'customerType');
    conditions.push('customer_type = ?');
    params.push(customerType);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM customers ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  res.status(200).json({
    success: true,
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
 * GET /api/customers/:id
 * Returns a single customer, including recent follow-up history.
 */
async function getOne(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  const customer = await getCustomerById(id);

  const [followUps] = await pool.execute(
    `SELECT id, note, follow_up_date, created_by, created_at
     FROM customer_follow_ups
     WHERE customer_id = ?
     ORDER BY created_at DESC`,
    [id]
  );

  res.status(200).json({
    success: true,
    data: { ...customer, followUps }
  });
}

/**
 * PUT /api/customers/:id
 * Updates an existing customer's details.
 */
async function update(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  await getCustomerById(id); // ensures the customer exists

  const {
    name,
    mobile,
    email,
    businessName,
    gstNumber,
    customerType,
    address,
    status,
    followUpDate,
    notes
  } = req.body;

  requireField(name, 'name');
  requireField(mobile, 'mobile');

  const resolvedType = customerType || 'RETAIL';
  const resolvedStatus = status || 'LEAD';
  requireEnum(resolvedType, CUSTOMER_TYPES, 'customerType');
  requireEnum(resolvedStatus, CUSTOMER_STATUSES, 'status');
  const resolvedFollowUpDate = toOptionalDate(followUpDate, 'followUpDate');

  await pool.execute(
    `UPDATE customers SET
      name = ?, mobile = ?, email = ?, business_name = ?, gst_number = ?,
      customer_type = ?, address = ?, status = ?, follow_up_date = ?, notes = ?
     WHERE id = ?`,
    [
      name,
      mobile,
      email || null,
      businessName || null,
      gstNumber || null,
      resolvedType,
      address || null,
      resolvedStatus,
      resolvedFollowUpDate,
      notes || null,
      id
    ]
  );

  const customer = await getCustomerById(id);

  res.status(200).json({
    success: true,
    data: customer
  });
}

/**
 * POST /api/customers/:id/follow-ups
 * Records a new CRM follow-up note for a customer.
 */
async function addFollowUp(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  await getCustomerById(id); // ensures the customer exists

  const { note, followUpDate } = req.body;
  requireField(note, 'note');
  const resolvedFollowUpDate = toOptionalDate(followUpDate, 'followUpDate');

  const [result] = await pool.execute(
    `INSERT INTO customer_follow_ups (customer_id, note, follow_up_date, created_by)
     VALUES (?, ?, ?, ?)`,
    [id, note, resolvedFollowUpDate, req.user.id]
  );

  // Keep the customer's headline follow_up_date in sync with the latest entry.
  if (resolvedFollowUpDate) {
    await pool.execute('UPDATE customers SET follow_up_date = ? WHERE id = ?', [
      resolvedFollowUpDate,
      id
    ]);
  }

  const [rows] = await pool.execute(
    'SELECT id, note, follow_up_date, created_by, created_at FROM customer_follow_ups WHERE id = ?',
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    data: rows[0]
  });
}

/**
 * Internal helper: fetches a customer by id or throws a 404 ApiError.
 */
async function getCustomerById(id) {
  const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [id]);
  const customer = rows[0];
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  return customer;
}

module.exports = { create, list, getOne, update, addFollowUp };
