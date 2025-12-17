const express = require('express');
const router = express.Router();
const KeranjangController = require('../controllers/keranjangController');
const authMiddleware = require('../middleware/auth');

// Protected routes (require auth)
router.get('/', authMiddleware(), KeranjangController.getCart);
router.get('/summary', authMiddleware(), KeranjangController.getSummary);
router.post('/add', authMiddleware(), KeranjangController.addToCart);
router.delete('/remove/:book_id', authMiddleware(), KeranjangController.removeFromCart);
router.patch('/update/:book_id', authMiddleware(), KeranjangController.updateQuantity);
router.delete('/clear', authMiddleware(), KeranjangController.clearCart);
router.post('/checkout', authMiddleware(), KeranjangController.checkout);

module.exports = router;