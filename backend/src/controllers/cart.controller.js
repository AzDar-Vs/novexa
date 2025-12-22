const db = require('../config/database');

exports.getCart = async (req, res) => {
  const userId = req.user.id;

  const [[cart]] = await db.query(
    `SELECT ID_KRJ FROM keranjang WHERE ID_USER = ?`,
    [userId]
  );

  if (!cart) {
    return res.json({ success: true, data: { items: [], total: 0 } });
  }

  const [items] = await db.query(
    `SELECT b.ID_BUKU id, b.JUDUL title, b.HARGA price
     FROM keranjang_item ki
     JOIN buku b ON b.ID_BUKU = ki.ID_BUKU
     WHERE ki.ID_KRJ = ?`,
    [cart.ID_KRJ]
  );

  const total = items.reduce((sum, i) => sum + i.price, 0);

  res.json({ success: true, data: { items, total } });
};

exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.body;

  let [[cart]] = await db.query(
    `SELECT ID_KRJ FROM keranjang WHERE ID_USER = ?`,
    [userId]
  );

  if (!cart) {
    const [result] = await db.query(
      `INSERT INTO keranjang (ID_USER) VALUES (?)`,
      [userId]
    );
    cart = { ID_KRJ: result.insertId };
  }

  await db.query(
    `INSERT IGNORE INTO keranjang_item (ID_KRJ, ID_BUKU) VALUES (?, ?)`,
    [cart.ID_KRJ, bookId]
  );

  res.json({ success: true, message: 'Added to cart' });
};

exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.params;

  await db.query(
    `DELETE ki FROM keranjang_item ki
     JOIN keranjang k ON k.ID_KRJ = ki.ID_KRJ
     WHERE k.ID_USER = ? AND ki.ID_BUKU = ?`,
    [userId, bookId]
  );

  res.json({ success: true, message: 'Removed from cart' });
};
