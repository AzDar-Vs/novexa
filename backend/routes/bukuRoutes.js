const express = require('express');
const router = express.Router();
const BukuController = require('../controllers/bukuController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', BukuController.getAll);
router.get('/search', BukuController.search);
router.get('/popular', BukuController.getPopular);
router.get('/:id', BukuController.getById);
router.get('/slug/:slug', BukuController.getBySlug);

// Protected routes (require auth)
router.post('/', authMiddleware(['admin', 'author']), upload.single('cover'), BukuController.create);
router.put('/:id', authMiddleware(['admin', 'author']), upload.single('cover'), BukuController.update);
router.delete('/:id', authMiddleware(['admin']), BukuController.delete);

// Author specific routes
router.get('/author/my-books', authMiddleware(['author']), BukuController.getMyBooks);

// Admin only routes
router.get('/admin/all', authMiddleware(['admin']), BukuController.getAllForAdmin);
router.patch('/:id/status', authMiddleware(['admin']), BukuController.updateStatus);

module.exports = router;