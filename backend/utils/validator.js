const { body, param, query, validationResult } = require('express-validator');

const Validator = {
  // User validators
  validateRegister: [
    body('nama')
      .notEmpty().withMessage('Nama wajib diisi')
      .trim()
      .escape(),
    body('email')
      .isEmail().withMessage('Email tidak valid')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
  ],
  
  validateLogin: [
    body('email')
      .isEmail().withMessage('Email tidak valid')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password wajib diisi')
  ],
  
  // Book validators
  validateCreateBook: [
    body('judul')
      .notEmpty().withMessage('Judul wajib diisi')
      .isLength({ max: 100 }).withMessage('Judul maksimal 100 karakter'),
    body('deskripsi')
      .notEmpty().withMessage('Deskripsi wajib diisi'),
    body('harga')
      .isInt({ min: 0 }).withMessage('Harga harus angka positif'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'draft']).withMessage('Status tidak valid')
  ],
  
  // Review validators
  validateCreateReview: [
    body('rating')
      .isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1-5'),
    body('komentar')
      .optional()
      .isLength({ max: 500 }).withMessage('Komentar maksimal 500 karakter')
  ],
  
  // ID param validator
  validateIdParam: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID harus angka positif')
  ],
  
  // Pagination validator
  validatePagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page harus angka positif'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100')
  ],
  
  // Handle validation errors
  handleValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }
    next();
  }
};

module.exports = Validator;