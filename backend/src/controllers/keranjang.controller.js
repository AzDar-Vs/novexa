const db = require('../config/database');
const response = require('../utils/response');

/* ================= GET KERANJANG ================= */
exports.getKeranjang = async (req, res) => {
  const userId = req.user.id;

  // pastikan keranjang ada
  const [[cart]] = await db.query(
    'SELECT * FROM keranjang WHERE ID_USER = ?',
    [userId]
  );

  if (!cart) {
    return response(res, 200, 'Isi keranjang', []);
  }

  const [rows] = await db.query(
    `
    SELECT b.*
    FROM keranjang_item ki
    JOIN buku b ON b.ID_BUKU = ki.ID_BUKU
    WHERE ki.ID_KRJ = ?
    `,
    [cart.ID_KRJ]
  );

  response(res, 200, 'Isi keranjang', rows);
};

/* ================= ADD ITEM ================= */
exports.addItem = async (req, res) => {
  const userId = req.user.id;
  const bukuId = req.params.id_buku;

  // pastikan buku ada & published
  const [[buku]] = await db.query(
    "SELECT * FROM buku WHERE ID_BUKU = ? AND STATUS = 'published'",
    [bukuId]
  );
  if (!buku) {
    return response(res, 404, 'Buku tidak ditemukan / belum dipublish');
  }

  // cari / buat keranjang
  let [[cart]] = await db.query(
    'SELECT * FROM keranjang WHERE ID_USER = ?',
    [userId]
  );
  if (!cart) {
    const [result] = await db.query(
      'INSERT INTO keranjang (ID_USER) VALUES (?)',
      [userId]
    );
    cart = { ID_KRJ: result.insertId };
  }

  // cegah duplikasi
  const [[exist]] = await db.query(
    'SELECT * FROM keranjang_item WHERE ID_KRJ = ? AND ID_BUKU = ?',
    [cart.ID_KRJ, bukuId]
  );
  if (exist) {
    return response(res, 409, 'Buku sudah ada di keranjang');
  }

  await db.query(
    'INSERT INTO keranjang_item (ID_KRJ, ID_BUKU) VALUES (?, ?)',
    [cart.ID_KRJ, bukuId]
  );

  response(res, 201, 'Buku berhasil ditambahkan ke keranjang');
};

/* ================= REMOVE ITEM ================= */
exports.removeItem = async (req, res) => {
  const userId = req.user.id;
  const bukuId = req.params.id_buku;

  const [[cart]] = await db.query(
    'SELECT * FROM keranjang WHERE ID_USER = ?',
    [userId]
  );
  if (!cart) {
    return response(res, 404, 'Keranjang tidak ditemukan');
  }

  const [result] = await db.query(
    'DELETE FROM keranjang_item WHERE ID_KRJ = ? AND ID_BUKU = ?',
    [cart.ID_KRJ, bukuId]
  );

  if (result.affectedRows === 0) {
    return response(res, 404, 'Buku tidak ada di keranjang');
  }

  response(res, 200, 'Buku berhasil dihapus dari keranjang');
};
