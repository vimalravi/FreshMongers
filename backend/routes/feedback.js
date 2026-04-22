// backend/routes/feedback.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { schemas, validate } = require('../utils/validators');

// Add feedback/review
router.post('/', authMiddleware, validate(schemas.addFeedback), async (req, res, next) => {
  try {
    const { order_id, product_id, rating, comment, image_url } = req.validatedData;
    const customerId = req.user.id;

    const connection = await pool.getConnection();

    // Verify order belongs to customer and is delivered
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND customer_id = ? AND status = "delivered"',
      [order_id, customerId]
    );

    if (!orders.length) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Invalid order' });
    }

    // Check if feedback already exists
    const [existing] = await connection.query(
      'SELECT * FROM feedback WHERE order_id = ? AND product_id = ? AND customer_id = ?',
      [order_id, product_id, customerId]
    );

    let feedbackId;

    if (existing.length) {
      // Update existing feedback
      await connection.query(
        'UPDATE feedback SET rating = ?, comment = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ? AND product_id = ?',
        [rating, comment, image_url, order_id, product_id]
      );
      feedbackId = existing[0].id;
    } else {
      // Create new feedback
      const [result] = await connection.query(
        `INSERT INTO feedback (order_id, product_id, customer_id, rating, comment, image_url, is_verified_purchase)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [order_id, product_id, customerId, rating, comment, image_url]
      );
      feedbackId = result.insertId;
    }

    // Update product rating
    const [ratings] = await connection.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM feedback WHERE product_id = ?',
      [product_id]
    );

    const avgRating = ratings[0].avg_rating || 0;
    const count = ratings[0].count || 0;

    await connection.query(
      'UPDATE products SET rating = ?, total_reviews = ? WHERE id = ?',
      [Math.round(avgRating * 10) / 10, count, product_id]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted',
      data: { feedbackId },
    });
  } catch (error) {
    next(error);
  }
});

// Get feedbacks for a product
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = `
      SELECT f.*, c.name as customer_name
      FROM feedback f
      JOIN customers c ON f.customer_id = c.id
      WHERE f.product_id = ?
    `;

    if (sort === 'recent') {
      query += ' ORDER BY f.created_at DESC';
    } else if (sort === 'helpful') {
      query += ' ORDER BY f.rating DESC';
    }

    query += ' LIMIT ? OFFSET ?';

    const [feedbacks] = await connection.query(query, [productId, parseInt(limit), offset]);

    const [countResult] = await connection.query(
      'SELECT COUNT(*) as total FROM feedback WHERE product_id = ?',
      [productId]
    );

    connection.release();

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get customer's feedbacks
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const customerId = req.user.id;

    const connection = await pool.getConnection();

    const [feedbacks] = await connection.query(
      `SELECT f.*, p.name as product_name, o.order_number
       FROM feedback f
       JOIN products p ON f.product_id = p.id
       JOIN orders o ON f.order_id = o.id
       WHERE f.customer_id = ?
       ORDER BY f.created_at DESC`,
      [customerId]
    );

    connection.release();

    res.json({ success: true, data: feedbacks });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
