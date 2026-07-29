const pool = require('../../config/db');
const ApiError = require('../../utils/api-error');
const { sendSuccess } = require('../../utils/api-response');
const {
  requireField,
  requireEnum,
  requireValidEmail,
  requireValidMobile,
  toPositiveInt,
  parsePagination,
  toOptionalDate
} = require('../../utils/validation');

const CUSTOMER_TYPES = ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'];
const CUSTOMER_STATUSES = ['LEAD', 'ACTIVE', 'INACTIVE'];

/**
 * Validates and normalizes the shared customer payload used by
 * create/update. Throws ApiError(400) on any bad input.
 */
function parseCustomerPayload(body) {
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
  } = body;

  requireField(name, 'name');
  requireField(mobile, 'mobile');
  requireValidMobile(mobile, 'mobile');

  if (email) {
    requireValidEmail(email, 'email');
  }

  const resolvedType = customerType || 'RETAIL';
  const resolvedStatus = status || 'LEAD';
  requireEnum(resolvedType, CUSTOMER_TYPES, 'customerType');
  requireEnum(resolvedStatus, CUSTOMER_STATUSES, 'status');
  const resolvedFollowUpDate = toOptionalDate(followUpDate, 'followUpDate');

  return {
    name,
    mobile,
    email: email || null,
    businessName: businessName || null,
    gstNumber: gstNumber || null,
    customerType: resolvedType,
    address: address || null,
    status: resolvedStatus,
    followUpDate: resolvedFollowUpDate,
    notes: notes || null
  };
}

/**
 * Throws a 409 ApiError if another customer already uses this mobile
 * number. `excludeId` lets updates ignore the customer's own row.
 */
async function assertMobileNotTaken(mobile, excludeId) {
  const [rows] = await pool.execute(
    'SELECT id FROM customers WHERE mobile = ? AND id != ?',
    [mobile, excludeId || 0]
  );
  if (rows[0]) {
    throw new ApiError(409, 'A customer with this mobile number already exists', undefined, [
      { field: 'mobile', message: 'This mobile number is already registered to another customer' }
    ]);
  }
}

/**
 * POST /api/customers
 * Creates a new customer. Rejects duplicate mobile numbers with a clear
 * 409 error (also enforced at the database level by a UNIQUE constraint).
 */
async function create(req, res) {
  const payload = parseCustomerPayload(req.body);
  await assertMobileNotTaken(payload.mobile);

  let insertId;
  try {
    const [result] = await pool.execute(
      `INSERT INTO customers
        (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.name,
        payload.mobile,
        payload.email,
        payload.businessName,
        payload.gstNumber,
        payload.customerType,
        payload.address,
        payload.status,
        payload.followUpDate,
        payload.notes,
        req.user.id
      ]
    );
    insertId = result.insertId;
  } catch (error) {
    // Safety net: a concurrent request could slip past the pre-check above;
    // the DB-level UNIQUE constraint on `mobile` catches that race and we
    // still return a clean, predictable error instead of a raw SQL error.
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'A customer with this mobile number already exists', undefined, [
        { field: 'mobile', message: 'This mobile number is already registered to another customer' }
      ]);
    }
    throw error;
  }

  const customer = await getCustomerById(insertId);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Customer created successfully',
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

  sendSuccess(res, {
    message: 'Customers fetched successfully',
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

  sendSuccess(res, {
    message: 'Customer fetched successfully',
    data: { ...customer, followUps }
  });
}

/**
 * PUT /api/customers/:id
 * Updates an existing customer's details. Rejects a mobile number that
 * belongs to a different customer with a 409 error.
 */
async function update(req, res) {
  const id = toPositiveInt(req.params.id, 'id');
  await getCustomerById(id); // ensures the customer exists

  const payload = parseCustomerPayload(req.body);
  await assertMobileNotTaken(payload.mobile, id);

  try {
    await pool.execute(
      `UPDATE customers SET
        name = ?, mobile = ?, email = ?, business_name = ?, gst_number = ?,
        customer_type = ?, address = ?, status = ?, follow_up_date = ?, notes = ?
       WHERE id = ?`,
      [
        payload.name,
        payload.mobile,
        payload.email,
        payload.businessName,
        payload.gstNumber,
        payload.customerType,
        payload.address,
        payload.status,
        payload.followUpDate,
        payload.notes,
        id
      ]
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'A customer with this mobile number already exists', undefined, [
        { field: 'mobile', message: 'This mobile number is already registered to another customer' }
      ]);
    }
    throw error;
  }

  const customer = await getCustomerById(id);

  sendSuccess(res, {
    message: 'Customer updated successfully',
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

  sendSuccess(res, {
    statusCode: 201,
    message: 'Follow-up added successfully',
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
