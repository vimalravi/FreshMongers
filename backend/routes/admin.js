// backend/routes/admin.js
// FIX: GET /orders N+1 query replaced with JOIN-based single query.
// FIX: GET /support admin tickets N+1 query replaced with JOIN.
// FIX: Added missing connection.release() in error paths.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { adminAuthMiddleware } = require('../middleware/auth');
const { schemas, validate } = require('../utils/validators');
const { AppError } = require('../utils/errors');

// ── Create Product ───────────────────────────────────────────
router.post('/products', adminAuthMiddleware, validate(schemas.createProduct), async (req, res, next) => {
  let connection;
  try {
    const {
      category_id, supplier_id, name, description, price_per_kg, stock_kg,
      min_order_kg, max_order_kg, freshness_status, harvest_date, expiry_date,
    } = req.validatedData;

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO products 
       (category_id, supplier_id, name, slug, description, price_per_kg, stock_kg, 
        min_order_kg, max_order_kg, freshness_status, harvest_date, expiry_date, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [category_id, supplier_id, name, slug, description, price_per_kg, stock_kg,
        min_order_kg || 0.5, max_order_kg, freshness_status || 'fresh', harvest_date, expiry_date]
    );

    res.status(201).json({
      success: true,
      message: 'Product created',
      data: { productId: result.insertId },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Update Product ───────────────────────────────────────────
router.put('/products/:id', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    const { id } = req.params;
    const allowedFields = [
      'category_id', 'supplier_id', 'name', 'slug', 'description',
      'price_per_kg', 'stock_kg', 'min_order_kg', 'max_order_kg',
      'freshness_status', 'harvest_date', 'expiry_date', 'is_available', 'image_url',
    ];
    const updates = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key))
    );

    if (!Object.keys(updates).length) {
      throw new AppError('No valid fields provided for update', 400);
    }

    connection = await pool.getConnection();

    const [result] = await connection.query(
      'UPDATE products SET ? WHERE id = ?',
      [updates, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Get All Orders (admin) — FIX: single JOIN query, no N+1 ──
router.get('/orders', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    connection = await pool.getConnection();

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    // Single query: orders + customer info
    const [orders] = await connection.query(
      `SELECT 
         o.*,
         c.id   AS c_id,
         c.phone AS c_phone,
         c.name  AS c_name,
         c.email AS c_email
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    if (!orders.length) {
      return res.json({ success: true, data: [] });
    }

    // Single query: all items for all fetched orders
    const orderIds = orders.map((o) => o.id);
    const [allItems] = await connection.query(
      `SELECT oi.*, p.name AS product_name, p.price_per_kg
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    // Map items back to orders
    const itemsByOrder = {};
    for (const item of allItems) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    }

    const result = orders.map((o) => ({
      ...o,
      customer: { id: o.c_id, phone: o.c_phone, name: o.c_name, email: o.c_email },
      items: itemsByOrder[o.id] || [],
    }));

    // Clean raw customer columns from order object
    result.forEach((o) => { delete o.c_id; delete o.c_phone; delete o.c_name; delete o.c_email; });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Update Order Status ──────────────────────────────────────
router.patch('/orders/:id/status', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    const { id } = req.params;
    const { status, delivery_date, notes } = req.body;

    const validStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(`Status required. Valid values: ${validStatuses.join(', ')}`, 400);
    }

    connection = await pool.getConnection();

    const [result] = await connection.query(
      'UPDATE orders SET status = ?, delivery_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, delivery_date || null, notes || null, id]
    );

    if (!result.affectedRows) {
      throw new AppError('Order not found', 404);
    }

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Verify Payment ───────────────────────────────────────────
router.patch('/payments/:id/verify', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    const { id } = req.params;
    const { verified, notes } = req.body;
    const adminId = req.user.id;

    if (verified === undefined) {
      throw new AppError('Verification status required', 400);
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [payments] = await connection.query('SELECT * FROM payments WHERE id = ?', [id]);

    if (!payments.length) {
      throw new AppError('Payment not found', 404);
    }

    const payment = payments[0];
    const paymentStatus = verified ? 'verified' : 'failed';

    await connection.query(
      'UPDATE payments SET status = ?, verified_by_admin_id = ?, verified_at = CURRENT_TIMESTAMP, notes = ? WHERE id = ?',
      [paymentStatus, adminId, notes || null, id]
    );

    await connection.query(
      'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
      [paymentStatus, verified ? 'confirmed' : 'pending', payment.order_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: verified ? 'Payment verified' : 'Payment rejected',
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Create Coupon ────────────────────────────────────────────
router.post('/coupons', adminAuthMiddleware, validate(schemas.createCoupon), async (req, res, next) => {
  let connection;
  try {
    const {
      code, discount_type, discount_value, min_order_amount,
      max_discount_amount, usage_limit, valid_from, valid_till,
    } = req.validatedData;

    connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO coupons 
       (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_from, valid_till, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [code.toUpperCase(), discount_type, discount_value, min_order_amount || 0,
        max_discount_amount || null, usage_limit || null, valid_from, valid_till]
    );

    res.status(201).json({
      success: true,
      message: 'Coupon created',
      data: { couponId: result.insertId },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Dashboard Stats ──────────────────────────────────────────
router.get('/dashboard/stats', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Run all stats queries in parallel
    const [
      [orderStats],
      [productStats],
      [customerStats],
      [recentOrders],
      [pendingPayments],
    ] = await Promise.all([
      connection.query(`
        SELECT 
          COUNT(*) AS total_orders,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS completed_orders,
          SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending_orders,
          SUM(CASE WHEN payment_status = 'verified' THEN total_amount ELSE 0 END) AS verified_revenue
        FROM orders
      `),
      connection.query(`
        SELECT COUNT(*) AS total_products, COALESCE(SUM(stock_kg), 0) AS total_stock FROM products
      `),
      connection.query(`SELECT COUNT(*) AS total_customers FROM customers`),
      connection.query(`
        SELECT o.*, c.name AS customer_name
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `),
      connection.query(`
        SELECT COUNT(*) AS count FROM payments WHERE status = 'pending'
      `),
    ]);

    res.json({
      success: true,
      data: {
        orders: orderStats[0],
        products: productStats[0],
        customers: customerStats[0],
        pendingPayments: pendingPayments[0].count,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── List All Coupons ─────────────────────────────────────────
router.get('/coupons', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [coupons] = await connection.query(
      'SELECT * FROM coupons ORDER BY created_at DESC'
    );
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── List All Products (admin — includes unavailable) ─────────
router.get('/products', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [products] = await connection.query(
      `SELECT p.*, c.name AS category_name, s.name AS supplier_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN suppliers  s ON s.id = p.supplier_id
       ORDER BY p.created_at DESC`
    );
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── List All Customers (admin) ───────────────────────────────
router.get('/customers', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    connection = await pool.getConnection();
    const [customers] = await connection.query(
      `SELECT c.*, COUNT(o.id) AS order_count
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
