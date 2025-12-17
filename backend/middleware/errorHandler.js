const ResponseHandler = require('../utils/response');
const config = require('../config/config');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error in development
  if (config.app.env === 'development') {
    console.error('🔥 Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user ? req.user.id : 'unauthenticated'
    });
  }

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    return ResponseHandler.unauthorized(res, 'Token tidak valid');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHandler.unauthorized(res, 'Token telah kadaluarsa');
  }

  if (err.name === 'ValidationError') {
    return ResponseHandler.badRequest(res, 'Validasi gagal', err.errors);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return ResponseHandler.badRequest(res, 'Data sudah ada');
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return ResponseHandler.badRequest(res, 'Data referensi tidak ditemukan');
  }

  if (err.code === 'ER_DATA_TOO_LONG') {
    return ResponseHandler.badRequest(res, 'Data terlalu panjang');
  }

  if (err.code === 'ER_BAD_NULL_ERROR') {
    return ResponseHandler.badRequest(res, 'Data tidak boleh kosong');
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ResponseHandler.badRequest(res, 'Ukuran file terlalu besar. Maksimal 5MB');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return ResponseHandler.badRequest(res, 'Field upload tidak sesuai');
    }
  }

  // Handle custom AppError
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.app.env === 'development' && { stack: err.stack })
    });
  }

  // Generic error response
  const message = config.app.env === 'production' 
    ? 'Terjadi kesalahan pada server' 
    : err.message;

  return ResponseHandler.error(res, message, err.statusCode);
};

// 404 Error Handler Middleware
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} tidak ditemukan`, 404);
  next(error);
};

// Async error wrapper (to avoid try-catch in controllers)
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  catchAsync,
  AppError
};