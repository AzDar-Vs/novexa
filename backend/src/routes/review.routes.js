const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/review.controller');

router.post('/', auth, controller.create);
router.get('/book/:bookId', controller.listByBook);

module.exports = router;