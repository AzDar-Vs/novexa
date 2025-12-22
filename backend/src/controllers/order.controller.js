const db = require('../config/database');

exports.list = async (req, res) => {
  const userId = req.user.id;

  const [rows] = await db.query(
    `SELECT ID_TRANSAKSI id, NO_INVOICE invoice, TOTAL_HARGA total,
            STATUS_PEMBAYARAN status, CREATED_AT createdAt
     FROM transaksi
     WHERE ID_USER = ?
     ORDER BY CREATED_AT DESC`,
    [userId]
  );

  res.json({ success: true, data: rows });
};

exports.detail = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // header transaksi
  const [[trx]] = await db.query(
    `SELECT ID_TRANSAKSI id, NO_INVOICE invoice, TOTAL_HARGA total,
            STATUS_PEMBAYARAN status, CREATED_AT createdAt
     FROM transaksi
     WHERE ID_TRANSAKSI = ? AND ID_USER = ?`,
    [id, userId]
  );

  if (!trx) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // item buku
  const [items] = await db.query(
    `SELECT b.ID_BUKU id, b.JUDUL title, ti.HARGA_SAAT_ITU price
     FROM transaksi_item ti
     JOIN buku b ON b.ID_BUKU = ti.ID_BUKU
     WHERE ti.ID_TRANSAKSI = ?`,
    [id]
  );

  res.json({
    success: true,
    data: { ...trx, items }
  });
};
