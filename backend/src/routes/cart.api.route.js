const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/cart.controller');

router.get('/', auth, controller.getCart);
router.post('/add', auth, controller.addToCart);
router.delete('/remove/:bookId', auth, controller.removeFromCart);

module.exports = router;
