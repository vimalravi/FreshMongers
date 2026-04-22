// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { schemas, validate } = require('../utils/validators');
const { generateOrderNumber } = require('../utils/auth');
const { AppError } = require('../utils/errors');

// Create order
router.post('/', authMiddleware, validate(schemas.createOrder), async (req, res, next) => {
  let connection;
  try {
    const { address_id, items, coupon_code, payment_method } = req.validatedData;
    const customerId = req.user.id;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Validate address belongs to customer
    const [addresses] = await connection.query(
      'SELECT * FROM addresses WHERE id = ? AND customer_id = ?',
      [address_id, customerId]
    );

    if (!addresses.length) {
      throw new AppError('Invalid address', 400);
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await connection.query(
        'SELECT * FROM products WHERE id = ? AND is_available = TRUE',
        [item.product_id]
      );

      if (!products.length) {
        throw new AppError(`Product ${item.product_id} not available`, 404);
      }

      const product = products[0];
      const itemTotal = product.price_per_kg * item.quantity_kg;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity_kg: item.quantity_kg,
        unit_price: product.price_per_kg,
        total_price: itemTotal,
      });
    }

    // Apply coupon
    let discountAmount = 0;
    let couponId = null;

    if (coupon_code) {
      const [coupons] = await connection.query(
        `SELECT * FROM coupons 
         WHERE code = ? 
         AND is_active = TRUE 
         AND CURDATE() BETWEEN valid_from AND valid_till`,
        [coupon_code.toUpperCase()]
      );

      if (coupons.length && subtotal >= coupons[0].min_order_amount) {
        const coupon = coupons[0];
        couponId = coupon.id;

        if (coupon.discount_type === 'percentage') {
          discountAmount = (subtotal * coupon.discount_value) / 100;
        } else {
          discountAmount = coupon.discount_value;
        }

        if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
          discountAmount = coupon.max_discount_amount;
        }
      }
    }

    // Create order
    const deliveryCharge = 50;
    const totalAmount = subtotal - discountAmount + deliveryCharge;
    const orderNumber = generateOrderNumber();

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (order_number, customer_id, address_id, subtotal, discount_amount, delivery_charge, total_amount, payment_method, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [orderNumber, customerId, address_id, subtotal, discountAmount, deliveryCharge, totalAmount, payment_method]
    );

    const orderId = orderResult.insertId;

    // Add order items
    for (const item of orderItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity_kg, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity_kg, item.unit_price, item.total_price]
      );

      // Atomically update stock to prevent overselling
      const [stockResult] = await connection.query(
        'UPDATE products SET stock_kg = stock_kg - ? WHERE id = ? AND stock_kg >= ?',
        [item.quantity_kg, item.product_id, item.quantity_kg]
      );

      if (!stockResult.affectedRows) {
        throw new AppError('Insufficient stock for one or more items', 400);
      }
    }

    // Update coupon usage
    if (couponId) {
      await connection.query(
        'INSERT INTO order_coupons (order_id, coupon_id, discount_amount) VALUES (?, ?, ?)',
        [orderId, couponId, discountAmount]
      );

      await connection.query(
        'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?',
        [couponId]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId,
        orderNumber,
        totalAmount: Math.round(totalAmount * 100) / 100,
        paymentMethod: payment_method,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// Get customer orders
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = `
      SELECT o.*, c.code AS coupon_code
      FROM orders o
      LEFT JOIN order_coupons oc ON oc.order_id = o.id
      LEFT JOIN coupons c ON c.id = oc.coupon_id
      WHERE o.customer_id = ?
    `;
    const params = [customerId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    const [orders] = await connection.query(
      query + ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?',
      [...params, parseInt(limit), offset]
    );

    // Get items for each order
    for (const order of orders) {
      const [items] = await connection.query(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    connection.release();

    res.json({
      success: true,
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
});

// Get order details
router.get('/:orderId', authMiddleware, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user.id;

    const connection = await pool.getConnection();

    const [orders] = await connection.query(
      `SELECT o.*, c.code AS coupon_code
       FROM orders o
       LEFT JOIN order_coupons oc ON oc.order_id = o.id
       LEFT JOIN coupons c ON c.id = oc.coupon_id
       WHERE o.id = ? AND o.customer_id = ?`,
      [orderId, customerId]
    );

    if (!orders.length) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [items] = await connection.query(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const [payment] = await connection.query(
      'SELECT * FROM payments WHERE order_id = ?',
      [orderId]
    );

    connection.release();

    const order = orders[0];
    order.items = items;
    order.payment = payment.length ? payment[0] : null;

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
