const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/auth');

// Protected routes (require auth)
router.get('/', authMiddleware(), FavoriteController.getUserFavorites);
router.get('/stats', authMiddleware(), FavoriteController.getFavoriteStats);
router.get('/check/:book_id', authMiddleware(), FavoriteController.checkFavorite);
router.post('/add', authMiddleware(), FavoriteController.addToFavorites);
router.post('/toggle', authMiddleware(), FavoriteController.toggleFavorite);
router.delete('/remove/:book_id', authMiddleware(), FavoriteController.removeFromFavorites);

module.exports = router;