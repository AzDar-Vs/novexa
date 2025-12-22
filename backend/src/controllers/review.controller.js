const db = require('../config/database');

exports.create = async (req, res) => {
  const userId = req.user.id;
  const { bookId, rating, comment } = req.body;

  // cek apakah user pernah beli buku
  const [[owned]] = await db.query(
    `SELECT 1
     FROM transaksi_item ti
     JOIN transaksi t ON t.ID_TRANSAKSI = ti.ID_TRANSAKSI
     WHERE t.ID_USER = ?
       AND ti.ID_BUKU = ?
       AND t.STATUS_PEMBAYARAN = 'paid'`,
    [userId, bookId]
  );

  if (!owned) {
    return res.status(403).json({ message: 'You must buy this book first' });
  }

  // insert / update review
  await db.query(
    `INSERT INTO review (ID_USER, ID_BUKU, RATING, KOMENTAR)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       RATING = VALUES(RATING),
       KOMENTAR = VALUES(KOMENTAR),
       UPDATED_AT = NOW()`,
    [userId, bookId, rating, comment]
  );

  res.json({ success: true, message: 'Review saved' });
};

exports.listByBook = async (req, res) => {
  const { bookId } = req.params;

  const [rows] = await db.query(
    `SELECT r.RATING, r.KOMENTAR, r.CREATED_AT,
            u.NAMA userName
     FROM review r
     JOIN user u ON u.ID_USER = r.ID_USER
     WHERE r.ID_BUKU = ?
     ORDER BY r.CREATED_AT DESC`,
    [bookId]
  );

  res.json({ success: true, data: rows });
};
