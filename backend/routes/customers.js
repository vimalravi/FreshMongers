// backend/routes/customers.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { schemas, validate } = require('../utils/validators');

// Get customer profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const customerId = req.user.id;

    const connection = await pool.getConnection();

    const [customers] = await connection.query(
      'SELECT id, phone, email, name, avatar_url, created_at FROM customers WHERE id = ?',
      [customerId]
    );

    connection.release();

    if (!customers.length) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customers[0] });
  } catch (error) {
    next(error);
  }
});

// Update customer profile
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { name, email, avatar_url } = req.body;

    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE customers SET name = ?, email = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, avatar_url, customerId]
    );

    connection.release();

    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
});

// Get addresses
router.get('/addresses', authMiddleware, async (req, res, next) => {
  try {
    const customerId = req.user.id;

    const connection = await pool.getConnection();

    const [addresses] = await connection.query(
      'SELECT * FROM addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
      [customerId]
    );

    connection.release();

    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
});

// Add address
router.post('/addresses', authMiddleware, validate(schemas.addAddress), async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { name, phone, street, city, state, pincode, type, is_default } = req.validatedData;

    const connection = await pool.getConnection();

    // If this is the first address or marked as default, make it default
    const [existingAddresses] = await connection.query(
      'SELECT COUNT(*) as count FROM addresses WHERE customer_id = ?',
      [customerId]
    );

    const isDefault = is_default || existingAddresses[0].count === 0;

    // If marking as default, unset other defaults
    if (isDefault) {
      await connection.query(
        'UPDATE addresses SET is_default = FALSE WHERE customer_id = ?',
        [customerId]
      );
    }

    const [result] = await connection.query(
      `INSERT INTO addresses (customer_id, name, phone, street, city, state, pincode, type, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, name, phone, street, city, state, pincode, type, isDefault]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Address added',
      data: { addressId: result.insertId },
    });
  } catch (error) {
    next(error);
  }
});

// Update address
router.put('/addresses/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;
    const { name, phone, street, city, state, pincode, type, is_default } = req.body;

    const connection = await pool.getConnection();

    // Verify address belongs to customer
    const [addresses] = await connection.query(
      'SELECT * FROM addresses WHERE id = ? AND customer_id = ?',
      [id, customerId]
    );

    if (!addresses.length) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If marking as default, unset other defaults
    if (is_default) {
      await connection.query(
        'UPDATE addresses SET is_default = FALSE WHERE customer_id = ? AND id != ?',
        [customerId, id]
      );
    }

    await connection.query(
      'UPDATE addresses SET name = ?, phone = ?, street = ?, city = ?, state = ?, pincode = ?, type = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, phone, street, city, state, pincode, type, is_default || false, id]
    );

    connection.release();

    res.json({ success: true, message: 'Address updated' });
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/addresses/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'DELETE FROM addresses WHERE id = ? AND customer_id = ?',
      [id, customerId]
    );

    connection.release();

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
