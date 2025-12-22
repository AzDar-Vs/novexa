const db = require('../config/database');
const response = require('../utils/response');

/* ================= CHECKOUT ================= */
exports.checkout = async (req, res) => {
  const userId = req.user.id;

  // 1. Ambil keranjang
  const [[cart]] = await db.query(
    'SELECT * FROM keranjang WHERE ID_USER = ?',
    [userId]
  );
  if (!cart) {
    return response(res, 400, 'Keranjang kosong');
  }

  // 2. Ambil item keranjang
  const [items] = await db.query(
    `
    SELECT b.ID_BUKU, b.HARGA
    FROM keranjang_item ki
    JOIN buku b ON b.ID_BUKU = ki.ID_BUKU
    WHERE ki.ID_KRJ = ?
    `,
    [cart.ID_KRJ]
  );

  if (items.length === 0) {
    return response(res, 400, 'Keranjang kosong');
  }

  // 3. Hitung total
  const totalHarga = items.reduce((sum, item) => sum + item.HARGA, 0);

  // 4. Buat transaksi
  const invoice = `INV-${Date.now()}`;

  const [trxResult] = await db.query(
    `
    INSERT INTO transaksi (ID_USER, NO_INVOICE, TOTAL_HARGA, STATUS_PEMBAYARAN)
    VALUES (?, ?, ?, 'pending')
    `,
    [userId, invoice, totalHarga]
  );

  const transaksiId = trxResult.insertId;

  // 5. Simpan transaksi_item
  for (const item of items) {
    await db.query(
      `
      INSERT INTO transaksi_item (ID_TRANSAKSI, ID_BUKU, HARGA_SAAT_ITU)
      VALUES (?, ?, ?)
      `,
      [transaksiId, item.ID_BUKU, item.HARGA]
    );
  }

  // 6. Kosongkan keranjang
  await db.query(
    'DELETE FROM keranjang_item WHERE ID_KRJ = ?',
    [cart.ID_KRJ]
  );

  response(res, 201, 'Checkout berhasil', {
    invoice,
    total: totalHarga,
    status: 'pending'
  });
};

/* ================= LIST TRANSAKSI ================= */
exports.getMyTransaksi = async (req, res) => {
  const userId = req.user.id;

  const [rows] = await db.query(
    `
    SELECT *
    FROM transaksi
    WHERE ID_USER = ?
    ORDER BY CREATED_AT DESC
    `,
    [userId]
  );

  response(res, 200, 'Daftar transaksi', rows);
};

/* ================= ADMIN: LIST SEMUA TRANSAKSI ================= */
exports.getAllTransaksi = async (req, res) => {
  const [rows] = await db.query(
    `SELECT t.*, u.EMAIL
     FROM transaksi t
     JOIN user u ON u.ID_USER = t.ID_USER
     ORDER BY t.CREATED_AT DESC`
  );
  response(res, 200, 'Semua transaksi', rows);
};

/* ================= ADMIN: UPDATE STATUS ================= */
exports.updateStatus = async (req, res) => {
  const transaksiId = req.params.id;
  const { status } = req.body;

  const allowed = ['paid', 'failed', 'cancelled'];
  if (!allowed.includes(status)) {
    return response(res, 400, 'Status tidak valid');
  }

  const [rows] = await db.query(
    'SELECT * FROM transaksi WHERE ID_TRANSAKSI = ?',
    [transaksiId]
  );
  if (!rows.length) {
    return response(res, 404, 'Transaksi tidak ditemukan');
  }

  await db.query(
    'UPDATE transaksi SET STATUS_PEMBAYARAN = ? WHERE ID_TRANSAKSI = ?',
    [status, transaksiId]
  );

  response(res, 200, 'Status transaksi diperbarui', {
    id: transaksiId,
    status
  });
};
