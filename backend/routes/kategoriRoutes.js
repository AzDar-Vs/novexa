const express = require('express');
const router = express.Router();
const KategoriController = require('../controllers/kategoriController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/genres', KategoriController.getAllGenres);
router.get('/genres/popular', KategoriController.getPopularGenres);
router.get('/genres/search', KategoriController.searchGenres);
router.get('/genres/:id', KategoriController.getGenreById);
router.get('/genres/:id/books', KategoriController.getBooksByGenre);
router.get('/books/multiple-genres', KategoriController.getBooksByMultipleGenres);

// Protected routes (admin only)
router.post('/genres', authMiddleware(['admin']), KategoriController.createGenre);
router.put('/genres/:id', authMiddleware(['admin']), KategoriController.updateGenre);
router.delete('/genres/:id', authMiddleware(['admin']), KategoriController.deleteGenre);

// Book category management
router.post('/books/categories', authMiddleware(['admin', 'author']), KategoriController.addCategoryToBook);
router.delete('/books/:book_id/categories/:genre_id', authMiddleware(['admin', 'author']), KategoriController.removeCategoryFromBook);
router.put('/books/:bookId/categories', authMiddleware(['admin', 'author']), KategoriController.updateBookCategories);

module.exports = router;