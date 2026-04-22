// backend/routes/products.js
// FIX: count query uses separate WHERE clause, not subquery-on-subquery.
// FIX: added missing connection.release() in single-product error path.
// FIX: parseInt(limit) used consistently so LIMIT never gets a string.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

// ── Get All Products (with filters, pagination) ──────────────
router.get('/', optionalAuth, async (req, res, next) => {
  let connection;
  try {
    const { category, search, sort = 'newest', page = 1, limit = 20 } = req.query;
    const pageInt  = Math.max(1, parseInt(page)  || 1);
    const limitInt = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset   = (pageInt - 1) * limitInt;

    // Build shared WHERE conditions
    const conditions = ['p.is_available = TRUE'];
    const filterParams = [];

    if (category) {
      conditions.push('c.slug = ?');
      filterParams.push(category);
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      filterParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.join(' AND ');

    // Sort clause
    const sortMap = {
      price_low:  'p.price_per_kg ASC',
      price_high: 'p.price_per_kg DESC',
      rating:     'avg_rating DESC',
      newest:     'p.created_at DESC',
    };
    const orderBy = sortMap[sort] || sortMap.newest;

    connection = await pool.getConnection();

    // Data query
    const [products] = await connection.query(
      `SELECT p.*, c.name AS category_name,
              COUNT(f.id)   AS review_count,
              AVG(f.rating) AS avg_rating
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN feedback   f ON p.id = f.product_id
       WHERE ${whereClause}
       GROUP BY p.id
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...filterParams, limitInt, offset]
    );

    // Count query — reuses same WHERE without GROUP BY overhead
    const [countResult] = await connection.query(
      `SELECT COUNT(DISTINCT p.id) AS total
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}`,
      filterParams
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page:  pageInt,
        limit: limitInt,
        pages: Math.ceil(total / limitInt),
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Get Categories ───────────────────────────────────────────
router.get('/categories/list', async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [categories] = await connection.query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order'
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Get Single Product ───────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  let connection;
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    connection = await pool.getConnection();

    const [products] = await connection.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (!products.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch images and reviews in parallel
    const [images, reviews] = await Promise.all([
      connection.query(
        'SELECT image_url, alt_text FROM product_images WHERE product_id = ? ORDER BY display_order',
        [id]
      ),
      connection.query(
        `SELECT f.*, c.name AS customer_name
         FROM feedback f
         JOIN customers c ON f.customer_id = c.id
         WHERE f.product_id = ?
         ORDER BY f.created_at DESC
         LIMIT 10`,
        [id]
      ),
    ]);

    const product = products[0];
    product.images  = images[0];
    product.reviews = reviews[0];

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
