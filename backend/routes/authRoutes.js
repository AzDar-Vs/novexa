const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('nama').notEmpty().withMessage('Nama wajib diisi'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi')
];

// Public routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

// Protected routes
router.get('/profile', authMiddleware(), AuthController.profile);
router.post('/logout', authMiddleware(), AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;