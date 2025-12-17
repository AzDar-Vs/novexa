const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Public routes
router.get('/:id/public', UserController.getById); // Public profile

// Protected routes (require auth)
router.get('/profile', authMiddleware(), UserController.getDashboardStats);
router.put('/profile', authMiddleware(), upload.single('avatar'), UserController.updateProfile);
router.put('/change-password', authMiddleware(), UserController.changePassword);

// User cart routes
router.get('/cart', authMiddleware(), UserController.getCart);
router.get('/transactions', authMiddleware(), UserController.getTransactions);

// Admin only routes
router.get('/', authMiddleware(['admin']), UserController.getAll);
router.patch('/:id/role', authMiddleware(['admin']), UserController.changeRole);
router.delete('/:id', authMiddleware(['admin']), UserController.delete);

// Seller/Autor specific routes
router.get('/:id/books', authMiddleware(['admin', 'seller']), UserController.getUserBooks);
router.get('/:id/stats', authMiddleware(['admin', 'seller']), UserController.getUserStats);

module.exports = router;