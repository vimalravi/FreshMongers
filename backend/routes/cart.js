// backend/routes/cart.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { schemas, validate } = require('../utils/validators');

// Cart is typically client-side (localStorage), but we can store it server-side for logged-in users
// For now, this is a placeholder for cart validation and operations

// Validate cart items
router.post('/validate', validate(schemas.addToCart), async (req, res, next) => {
  try {
    const { product_id, quantity_kg } = req.validatedData;

    const connection = await pool.getConnection();

    const [products] = await connection.query(
      'SELECT * FROM products WHERE id = ? AND is_available = TRUE',
      [product_id]
    );

    connection.release();

    if (!products.length) {
      return res.status(404).json({ success: false, message: 'Product not available' });
    }

    const product = products[0];

    if (product.stock_kg < quantity_kg) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock_kg}kg available`,
      });
    }

    if (quantity_kg < product.min_order_kg) {
      return res.status(400).json({
        success: false,
        message: `Minimum order quantity is ${product.min_order_kg}kg`,
      });
    }

    res.json({
      success: true,
      data: {
        product_id,
        quantity_kg,
        price_per_kg: product.price_per_kg,
        total_price: product.price_per_kg * quantity_kg,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Validate coupon
router.post('/validate-coupon', async (req, res, next) => {
  try {
    const { coupon_code, subtotal } = req.body;

    const connection = await pool.getConnection();

    const [coupons] = await connection.query(
      `SELECT * FROM coupons 
       WHERE code = ? 
       AND is_active = TRUE 
       AND CURDATE() BETWEEN valid_from AND valid_till
       AND (usage_limit IS NULL OR usage_count < usage_limit)`,
      [coupon_code.toUpperCase()]
    );

    connection.release();

    if (!coupons.length) {
      return res.status(400).json({ success: false, message: 'Invalid coupon' });
    }

    const coupon = coupons[0];

    if (subtotal < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }

    res.json({
      success: true,
      data: {
        coupon_id: coupon.id,
        discount_amount: Math.round(discount),
        final_amount: Math.round(subtotal - discount),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
