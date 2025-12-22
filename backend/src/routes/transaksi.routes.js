const express = require('express');
const router = express.Router();

const transaksiController = require('../controllers/transaksi.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// BUYER ONLY
router.post('/checkout', auth, role('buyer'), transaksiController.checkout);
router.get('/', auth, role('buyer'), transaksiController.getMyTransaksi);

// ADMIN
router.get('/admin', auth, role('admin'), transaksiController.getAllTransaksi);
router.patch('/:id/status', auth, role('admin'), transaksiController.updateStatus);

module.exports = router;
