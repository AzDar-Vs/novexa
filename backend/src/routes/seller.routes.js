const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const db = require('../config/database');
const sellerController = require('../controllers/seller.controller');

router.get(
  '/dashboard',
  auth,
  role('seller'),
  sellerController.dashboard
);

/* ================= SELLER BOOKS ================= */
router.get(
  '/books',
  auth,
  role('seller'),
  async (req, res) => {
    try {
      const sellerId = req.user.ID_USER;
      const { search, sort, status } = req.query;

      let query = `
        SELECT b.*, 
          u.NAMA as penulis,
          GROUP_CONCAT(g.NAMA_GENRE) as genres_list
        FROM buku b
        LEFT JOIN user u ON b.ID_USER = u.ID_USER
        LEFT JOIN buku_genre bg ON b.ID_BUKU = bg.ID_BUKU
        LEFT JOIN genre g ON bg.ID_GENRE = g.ID_GENRE
        WHERE b.ID_USER = ?
      `;

      const params = [sellerId];

      if (search) {
        query += ` AND (b.JUDUL LIKE ? OR b.DESKRIPSI LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (status) {
        query += ` AND b.STATUS = ?`;
        params.push(status);
      }

      query += ` GROUP BY b.ID_BUKU`;

      if (sort === 'title') query += ` ORDER BY b.JUDUL ASC`;
      else if (sort === 'price_low') query += ` ORDER BY b.HARGA ASC`;
      else if (sort === 'price_high') query += ` ORDER BY b.HARGA DESC`;
      else if (sort === 'popular') query += ` ORDER BY b.VIEW_COUNT DESC`;
      else query += ` ORDER BY b.CREATED_AT DESC`;

      const [books] = await db.execute(query, params);

      res.json({
        success: true,
        data: books.map(b => ({
          ...b,
          genres: b.genres_list
            ? b.genres_list.split(',').map(name => ({ name }))
            : []
        }))
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
