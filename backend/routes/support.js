// backend/routes/support.js
// FIX: admin GET /admin/tickets N+1 replaced with JOIN.
// FIX: connection.release() always called via finally blocks.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');
const { schemas, validate } = require('../utils/validators');
const { generateTicketNumber } = require('../utils/auth');
const { AppError } = require('../utils/errors');

// ── Create Support Ticket ────────────────────────────────────
router.post('/', authMiddleware, validate(schemas.createSupportTicket), async (req, res, next) => {
  let connection;
  try {
    const { subject, description, category, order_id } = req.validatedData;
    const customerId = req.user.id;
    const ticketNumber = generateTicketNumber();

    connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO support_tickets (ticket_number, customer_id, order_id, subject, description, category, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, 'open', 'medium')`,
      [ticketNumber, customerId, order_id || null, subject, description, category || 'other']
    );

    res.status(201).json({
      success: true,
      message: 'Support ticket created',
      data: { ticketNumber, ticketId: result.insertId },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Customer: Get Own Tickets ────────────────────────────────
router.get('/', authMiddleware, async (req, res, next) => {
  let connection;
  try {
    const customerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    connection = await pool.getConnection();

    let query = 'SELECT * FROM support_tickets WHERE customer_id = ?';
    const params = [customerId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const [tickets] = await connection.query(
      query + ' ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: tickets,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Admin: Get All Tickets — FIX: JOIN instead of N+1 ────────
router.get('/admin/tickets', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    connection = await pool.getConnection();

    const conditions = ['1=1'];
    const params = [];

    if (status) {
      conditions.push('st.status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('st.priority = ?');
      params.push(priority);
    }

    const whereClause = conditions.join(' AND ');

    const [tickets] = await connection.query(
      `SELECT st.*,
              c.id    AS c_id,
              c.phone AS c_phone,
              c.name  AS c_name,
              c.email AS c_email
       FROM support_tickets st
       JOIN customers c ON c.id = st.customer_id
       WHERE ${whereClause}
       ORDER BY FIELD(st.priority,'high','medium','low'), st.created_at ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const result = tickets.map((t) => ({
      ...t,
      customer: { id: t.c_id, phone: t.c_phone, name: t.c_name, email: t.c_email },
    }));
    result.forEach((t) => { delete t.c_id; delete t.c_phone; delete t.c_name; delete t.c_email; });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Admin: Update Ticket ─────────────────────────────────────
router.patch('/admin/:ticketId', adminAuthMiddleware, async (req, res, next) => {
  let connection;
  try {
    const { ticketId } = req.params;
    const { status, priority, assigned_to, resolution_notes } = req.body;

    const updateData = {};
    if (status)            updateData.status = status;
    if (priority)          updateData.priority = priority;
    if (assigned_to)       updateData.assigned_to = assigned_to;
    if (resolution_notes)  updateData.resolution_notes = resolution_notes;
    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date();
    }
    updateData.updated_at = new Date();

    connection = await pool.getConnection();

    await connection.query('UPDATE support_tickets SET ? WHERE id = ?', [updateData, ticketId]);

    res.json({ success: true, message: 'Ticket updated' });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// ── Customer: Get Single Ticket ──────────────────────────────
router.get('/:ticketId', authMiddleware, async (req, res, next) => {
  let connection;
  try {
    const { ticketId } = req.params;
    const customerId = req.user.id;

    connection = await pool.getConnection();

    const [tickets] = await connection.query(
      'SELECT * FROM support_tickets WHERE id = ? AND customer_id = ?',
      [ticketId, customerId]
    );

    if (!tickets.length) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, data: tickets[0] });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
