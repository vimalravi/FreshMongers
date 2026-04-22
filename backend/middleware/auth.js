// backend/middleware/auth.js
const { verifyToken } = require('../utils/auth');
const { AppError } = require('../utils/errors');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }

    if (decoded.role !== 'admin' && decoded.role !== 'moderator') {
      throw new AppError('Access denied. Admin only', 403);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          req.user = decoded;
        }
      } catch {
        // ignore auth parse errors in optional auth paths
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authMiddleware,
  adminAuthMiddleware,
  optionalAuth,
};
