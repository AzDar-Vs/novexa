const express = require('express');
const router = express.Router();

const readerController = require('../controllers/reader.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// BUYER ONLY
router.get('/buku/:id', auth, role('buyer'), readerController.getBuku);
router.get('/buku/:id/bab/:babId', auth, role('buyer'), readerController.getBab);
router.post('/progress', auth, role('buyer'), readerController.saveProgress);

module.exports = router;
