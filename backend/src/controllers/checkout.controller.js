const db = require('../config/database');
const { nanoid } = require('nanoid');

exports.checkout = async (req, res) => {
  const userId = req.user.id;

  const [[cart]] = await db.query(
    `SELECT ID_KRJ FROM keranjang WHERE ID_USER = ?`,
    [userId]
  );

  if (!cart) {
    return res.status(400).json({ message: 'Cart empty' });
  }

  const [items] = await db.query(
    `SELECT b.ID_BUKU, b.HARGA
     FROM keranjang_item ki
     JOIN buku b ON b.ID_BUKU = ki.ID_BUKU
     WHERE ki.ID_KRJ = ?`,
    [cart.ID_KRJ]
  );

  if (!items.length) {
    return res.status(400).json({ message: 'Cart empty' });
  }

  const total = items.reduce((s, i) => s + i.HARGA, 0);

  const [trx] = await db.query(
    `INSERT INTO transaksi (ID_USER, NO_INVOICE, TOTAL_HARGA)
     VALUES (?, ?, ?)`,
    [userId, `INV-${nanoid(8)}`, total]
  );

  for (const item of items) {
    await db.query(
      `INSERT INTO transaksi_item (ID_TRANSAKSI, ID_BUKU, HARGA_SAAT_ITU)
       VALUES (?, ?, ?)`,
      [trx.insertId, item.ID_BUKU, item.HARGA]
    );
  }

  await db.query(`DELETE FROM keranjang_item WHERE ID_KRJ = ?`, [cart.ID_KRJ]);

  res.json({ success: true, message: 'Checkout success', invoice: trx.insertId });
};
