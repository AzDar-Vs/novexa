const express = require('express');
const router = express.Router();
const BabController = require('../controllers/babController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Public routes
router.get('/book/:bookId', BabController.getByBook);
router.get('/:id', BabController.getById);

// Protected routes (require auth)
router.post(
  '/book/:bookId',
  authMiddleware(['author', 'admin']),
  validate.createChapter,
  BabController.create
);

router.put(
  '/:id',
  authMiddleware(['author', 'admin']),
  validate.updateBook,
  BabController.update
);

router.delete(
  '/:id',
  authMiddleware(['author', 'admin']),
  validate.idParam,
  BabController.delete
);

router.post(
  '/book/:bookId/reorder',
  authMiddleware(['author', 'admin']),
  BabController.reorder
);

module.exports = router;