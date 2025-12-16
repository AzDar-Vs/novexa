const express = require('express');
const router = express.Router();
const TransaksiController = require('../controllers/transaksiController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Protected routes
router.get('/', authMiddleware(), TransaksiController.getTransactions);
router.get('/payment-methods', authMiddleware(), TransaksiController.getPaymentMethods);
router.post('/', authMiddleware(), validate.createTransaction, TransaksiController.create);
router.get('/:id', authMiddleware(), TransaksiController.getById);

// Admin only routes
router.patch('/:id/status', authMiddleware(['admin']), TransaksiController.updateStatus);
router.get('/admin/stats', authMiddleware(['admin']), TransaksiController.getStatsAdmin);

// Payment callback (public)
router.post('/payment/callback', TransaksiController.paymentCallback);

module.exports = router;