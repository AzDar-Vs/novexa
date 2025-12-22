const express = require('express');
const router = express.Router();

const genreController = require('../controllers/genre.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// PUBLIC
router.get('/', genreController.getAll);

// ADMIN ONLY
router.post('/', auth, role('admin'), genreController.create);
router.put('/:id', auth, role('admin'), genreController.update);
router.delete('/:id', auth, role('admin'), genreController.remove);

module.exports = router;
