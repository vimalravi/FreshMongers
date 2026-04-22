// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { AppError } = require('../utils/errors');

// Upload payment screenshot
router.post('/upload-screenshot', authMiddleware, async (req, res, next) => {
  try {
    const { order_id, screenshot_url, transaction_id, notes } = req.body;
    const customerId = req.user.id;

    if (!order_id || !screenshot_url) {
      throw new AppError('Order ID and screenshot URL required', 400);
    }

    const connection = await pool.getConnection();

    // Verify order belongs to customer
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
      [order_id, customerId]
    );

    if (!orders.length) {
      connection.release();
      throw new AppError('Order not found', 404);
    }

    const order = orders[0];

    // Check if payment already exists
    const [existingPayments] = await connection.query(
      'SELECT * FROM payments WHERE order_id = ?',
      [order_id]
    );

    let paymentId;
    if (existingPayments.length) {
      // Update existing payment
      const [result] = await connection.query(
        `UPDATE payments 
         SET screenshot_url = ?, transaction_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE order_id = ?`,
        [screenshot_url, transaction_id, notes, order_id]
      );
      paymentId = existingPayments[0].id;
    } else {
      // Create new payment
      const [result] = await connection.query(
        `INSERT INTO payments (order_id, payment_method, amount, screenshot_url, transaction_id, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [order_id, order.payment_method, order.total_amount, screenshot_url, transaction_id, notes]
      );
      paymentId = result.insertId;
    }

    // Update order status
    await connection.query(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      ['confirmed', 'pending', order_id]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Payment screenshot uploaded. Pending verification.',
      data: { paymentId, orderId: order_id },
    });
  } catch (error) {
    next(error);
  }
});

// Get payment info for an order
router.get('/order/:orderId', authMiddleware, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user.id;

    const connection = await pool.getConnection();

    // Verify order belongs to customer
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
      [orderId, customerId]
    );

    if (!orders.length) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [payments] = await connection.query(
      'SELECT * FROM payments WHERE order_id = ?',
      [orderId]
    );

    connection.release();

    res.json({
      success: true,
      data: payments.length ? payments[0] : null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
