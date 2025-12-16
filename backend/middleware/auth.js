const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak ditemukan'
        });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Check if role is authorized
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak'
        });
      }
      
      // Attach user to request
      req.user = decoded;
      next();
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token telah kadaluarsa'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token tidak valid'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  };
};

module.exports = authMiddleware;