const express = require('express');
const router = express.Router();
const NotifikasiController = require('../controllers/notifikasiController');
const authMiddleware = require('../middleware/auth');

// Protected routes
router.get('/', authMiddleware(), NotifikasiController.getUserNotifications);
router.get('/stats', authMiddleware(), NotifikasiController.getStats);
router.patch('/:id/read', authMiddleware(), NotifikasiController.markAsRead);
router.patch('/read-all', authMiddleware(), NotifikasiController.markAllAsRead);
router.delete('/:id', authMiddleware(), NotifikasiController.delete);
router.delete('/', authMiddleware(), NotifikasiController.clearAll);

// Admin only routes
router.post('/admin/create', authMiddleware(['admin']), NotifikasiController.create);

module.exports = router;