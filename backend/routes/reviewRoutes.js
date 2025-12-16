const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Public routes
router.get('/book/:bookId', ReviewController.getByBook);
router.get('/recent', ReviewController.getRecent);
router.get('/helpful', ReviewController.getHelpful);

// Protected routes
router.get('/my-reviews', authMiddleware(), ReviewController.getUserReviews);
router.get('/user/:userId', ReviewController.getUserReviews);
router.post('/', authMiddleware(), validate.createReview, ReviewController.create);
router.put('/:id', authMiddleware(), ReviewController.update);
router.delete('/:id', authMiddleware(), ReviewController.delete);
router.post('/:id/helpful', authMiddleware(), ReviewController.markHelpful);

module.exports = router;