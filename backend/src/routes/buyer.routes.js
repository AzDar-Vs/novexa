const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const controller = require('../controllers/buyer.controller');

router.use(auth);
router.use(role('buyer'));
router.get('/dashboard', controller.getDashboard);
router.get('/library', controller.getLibrary);
router.get('/reading-history', controller.getReadingHistory);
router.get('/reviews', controller.getMyReviews);

module.exports = router;
