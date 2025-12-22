const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/checkout.controller');

router.post('/', auth, controller.checkout);

module.exports = router;