const express = require('express');
const router = express.Router();

const keranjangController = require('../controllers/keranjang.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// hanya BUYER
router.get('/', auth, role('buyer'), keranjangController.getKeranjang);
router.get('/', auth, role('buyer'), keranjangController.getKeranjang);
router.post('/:id_buku', auth, role('buyer'), keranjangController.addItem);
router.delete('/:id_buku', auth, role('buyer'), keranjangController.removeItem);

module.exports = router;
