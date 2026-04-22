// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { generateToken, hashPassword, comparePassword } = require('../utils/auth');
const { schemas, validate } = require('../utils/validators');
const { AppError } = require('../utils/errors');

// Register / Login Customer
router.post('/customer/register', validate(schemas.registerCustomer), async (req, res, next) => {
  let connection;
  try {
    const { phone, name, email, firebase_uid } = req.validatedData;
    connection = await pool.getConnection();

    // Check if customer exists
    const [existing] = await connection.query(
      'SELECT id, phone, name, firebase_uid FROM customers WHERE phone = ?',
      [phone]
    );

    let customerId;
    if (existing.length > 0) {
      if (!firebase_uid) {
        throw new AppError('firebase_uid is required for existing accounts', 400);
      }
      if (existing[0].firebase_uid && existing[0].firebase_uid !== firebase_uid) {
        throw new AppError('Authentication failed for this account', 401);
      }
      customerId = existing[0].id;
    } else {
      if (!firebase_uid) {
        throw new AppError('firebase_uid is required for new registration', 400);
      }
      // Create new customer
      const [result] = await connection.query(
        'INSERT INTO customers (phone, name, email, firebase_uid) VALUES (?, ?, ?, ?)',
        [phone, name, email, firebase_uid]
      );
      customerId = result.insertId;
    }

    const [customers] = await connection.query(
      'SELECT id, phone, name FROM customers WHERE id = ?',
      [customerId]
    );

    const customer = customers[0];

    const token = generateToken({ id: customer.id, phone: customer.phone, role: 'customer' });

    res.status(201).json({
      success: true,
      message: existing.length > 0 ? 'Logged in successfully' : 'Registered successfully',
      data: { customerId: customer.id, token, phone: customer.phone, name: customer.name },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// Admin Login
router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password required', 400);
    }

    const connection = await pool.getConnection();

    const [admins] = await connection.query(
      'SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    connection.release();

    if (!admins.length) {
      throw new AppError('Invalid credentials', 401);
    }

    const admin = admins[0];
    const isMatch = await comparePassword(password, admin.password_hash);

    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken({
      id: admin.id,
      email,
      role: admin.role,
      isAdmin: true,
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { adminId: admin.id, token, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
});

// Verify Token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token' });
  }

  try {
    const decoded = require('../utils/auth').verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.json({ success: true, data: decoded });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
