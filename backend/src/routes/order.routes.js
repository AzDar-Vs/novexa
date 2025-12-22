const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/order.controller');

router.get('/', auth, controller.list);        // order history
router.get('/:id', auth, controller.detail);   // order detail

module.exports = router;