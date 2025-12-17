const { body, param, query, validationResult } = require('express-validator');
const ResponseHandler = require('../utils/response');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    ResponseHandler.validationError(res, errors.array());
  };
};

// Common validation rules
const validations = {
  // Auth validations
  register: validate([
    body('nama')
      .trim()
      .notEmpty().withMessage('Nama wajib diisi')
      .isLength({ min: 3, max: 50 }).withMessage('Nama harus 3-50 karakter'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email wajib diisi')
      .isEmail().withMessage('Email tidak valid')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password wajib diisi')
      .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),
    body('confirm_password')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Konfirmasi password tidak cocok');
        }
        return true;
      })
  ]),

  login: validate([
    body('email')
      .trim()
      .notEmpty().withMessage('Email wajib diisi')
      .isEmail().withMessage('Email tidak valid')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password wajib diisi')
  ]),

  // Book validations
  createBook: validate([
    body('judul')
      .trim()
      .notEmpty().withMessage('Judul wajib diisi')
      .isLength({ min: 3, max: 100 }).withMessage('Judul harus 3-100 karakter'),
    body('deskripsi')
      .trim()
      .notEmpty().withMessage('Deskripsi wajib diisi')
      .isLength({ min: 10 }).withMessage('Deskripsi minimal 10 karakter'),
    body('harga')
      .isInt({ min: 0 }).withMessage('Harga harus angka positif')
      .toInt(),
    body('status')
      .optional()
      .isIn(['draft', 'active', 'inactive']).withMessage('Status tidak valid'),
    body('genre_ids')
      .optional()
      .isArray().withMessage('Genre harus berupa array')
      .custom((ids) => {
        if (ids && !ids.every(id => Number.isInteger(id))) {
          throw new Error('Semua genre ID harus angka');
        }
        return true;
      })
  ]),

  updateBook: validate([
    param('id')
      .isInt({ min: 1 }).withMessage('ID buku tidak valid'),
    body('judul')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Judul harus 3-100 karakter'),
    body('deskripsi')
      .optional()
      .trim()
      .isLength({ min: 10 }).withMessage('Deskripsi minimal 10 karakter'),
    body('harga')
      .optional()
      .isInt({ min: 0 }).withMessage('Harga harus angka positif'),
    body('status')
      .optional()
      .isIn(['draft', 'active', 'inactive']).withMessage('Status tidak valid')
  ]),

  // Chapter validations
  createChapter: validate([
    param('bookId')
      .isInt({ min: 1 }).withMessage('ID buku tidak valid'),
    body('judul_bab')
      .trim()
      .notEmpty().withMessage('Judul bab wajib diisi')
      .isLength({ min: 3, max: 100 }).withMessage('Judul bab harus 3-100 karakter'),
    body('isi')
      .trim()
      .notEmpty().withMessage('Isi bab wajib diisi')
      .isLength({ min: 10 }).withMessage('Isi bab minimal 10 karakter'),
    body('nomer_bab')
      .isInt({ min: 1 }).withMessage('Nomor bab harus angka positif')
      .toInt()
  ]),

  // Review validations
  createReview: validate([
    body('book_id')
      .isInt({ min: 1 }).withMessage('ID buku tidak valid'),
    body('rating')
      .isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1-5')
      .toInt(),
    body('komentar')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Komentar maksimal 1000 karakter')
  ]),

  // Transaction validations
  createTransaction: validate([
    body('items')
      .isArray({ min: 1 }).withMessage('Minimal 1 item dalam transaksi'),
    body('payment_method')
      .optional()
      .isIn(['bank_transfer', 'ewallet', 'credit_card', 'qris'])
      .withMessage('Metode pembayaran tidak valid')
  ]),

  // User validations
  updateProfile: validate([
    body('nama')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Nama harus 3-50 karakter'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Bio maksimal 500 karakter'),
    body('current_password')
      .optional()
      .custom((value, { req }) => {
        if (req.body.new_password && !value) {
          throw new Error('Password saat ini wajib diisi untuk mengubah password');
        }
        return true;
      }),
    body('new_password')
      .optional()
      .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka')
  ]),

  // ID param validation
  idParam: validate([
    param('id')
      .isInt({ min: 1 }).withMessage('ID harus angka positif')
  ]),

  // Pagination validation
  pagination: validate([
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Halaman harus angka positif')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100')
      .toInt()
  ]),

  // Search validation
  search: validate([
    query('q')
      .trim()
      .notEmpty().withMessage('Kata kunci pencarian wajib diisi')
      .isLength({ min: 2 }).withMessage('Kata kunci minimal 2 karakter')
  ]),

  // File upload validation
  validateFile: (fieldName, maxSize = 5 * 1024 * 1024) => {
    return (req, res, next) => {
      if (!req.file) {
        return next();
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/epub+zip'
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return ResponseHandler.badRequest(res, 
          'Tipe file tidak diizinkan. Hanya JPG, PNG, GIF, WEBP, PDF, EPUB yang diperbolehkan'
        );
      }

      if (req.file.size > maxSize) {
        return ResponseHandler.badRequest(res, 
          `Ukuran file terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB`
        );
      }

      next();
    };
  }
};

// Sanitization middleware
const sanitize = {
  email: body('email').normalizeEmail(),
  trimStrings: (fields) => {
    return (req, res, next) => {
      fields.forEach(field => {
        if (req.body[field]) {
          req.body[field] = req.body[field].trim();
        }
      });
      next();
    };
  }
};

module.exports = {
  validate: validations,
  sanitize,
  validationResult
};