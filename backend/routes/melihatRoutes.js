const express = require('express');
const router = express.Router();
const MelihatController = require('../controllers/melihatController');
const authMiddleware = require('../middleware/auth');

// Protected routes (require auth)
router.get('/history', authMiddleware(), MelihatController.getViewHistory);
router.get('/most-viewed', authMiddleware(), MelihatController.getMostViewed);
router.get('/stats', authMiddleware(), MelihatController.getViewStats);
router.delete('/clear', authMiddleware(), MelihatController.clearViewHistory);
router.delete('/remove/:book_id', authMiddleware(), MelihatController.removeFromHistory);

module.exports = router;