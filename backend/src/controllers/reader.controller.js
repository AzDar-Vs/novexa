const db = require('../config/database');
const response = require('../utils/response');

/* ====== HELPER: CEK AKSES ====== */
async function canAccessBook(userId, bukuId) {
  // gratis?
  const [[buku]] = await db.query(
    'SELECT IS_FREE FROM buku WHERE ID_BUKU = ?',
    [bukuId]
  );
  if (!buku) return false;
  if (buku.IS_FREE === 1) return true;

  // pernah beli & paid?
  const [[trx]] = await db.query(
    `
    SELECT t.ID_TRANSAKSI
    FROM transaksi t
    JOIN transaksi_item ti ON ti.ID_TRANSAKSI = t.ID_TRANSAKSI
    WHERE t.ID_USER = ?
      AND ti.ID_BUKU = ?
      AND t.STATUS_PEMBAYARAN = 'paid'
    `,
    [userId, bukuId]
  );

  return !!trx;
}

/* ====== GET BUKU (META) ====== */
exports.getBuku = async (req, res) => {
  const userId = req.user.id;
  const bukuId = req.params.id;

  const allowed = await canAccessBook(userId, bukuId);
  if (!allowed) {
    return response(res, 403, 'Akses ditolak. Buku belum dibeli');
  }

  const [[buku]] = await db.query(
    'SELECT ID_BUKU, JUDUL, DESKRIPSI FROM buku WHERE ID_BUKU = ?',
    [bukuId]
  );
  if (!buku) {
    return response(res, 404, 'Buku tidak ditemukan');
  }

  // daftar bab (tanpa isi)
  const [bab] = await db.query(
    `
    SELECT ID_BAB, JUDUL_BAB, NOMER_BAB, IS_FREE
    FROM bab_buku
    WHERE ID_BUKU = ?
    ORDER BY NOMER_BAB ASC
    `,
    [bukuId]
  );

  response(res, 200, 'Buku siap dibaca', { buku, bab });
};

/* ====== GET BAB ====== */
exports.getBab = async (req, res) => {
  const userId = req.user.id;
  const { id: bukuId, babId } = req.params;

  // ambil bab
  const [[bab]] = await db.query(
    `
    SELECT *
    FROM bab_buku
    WHERE ID_BAB = ? AND ID_BUKU = ?
    `,
    [babId, bukuId]
  );
  if (!bab) {
    return response(res, 404, 'Bab tidak ditemukan');
  }

  // bab gratis?
  if (bab.IS_FREE === 1) {
    return response(res, 200, 'Bab gratis', bab);
  }

  // cek akses buku
  const allowed = await canAccessBook(userId, bukuId);
  if (!allowed) {
    return response(res, 403, 'Akses ditolak. Buku belum dibeli');
  }

  response(res, 200, 'Bab berhasil dimuat', bab);
};

/* ====== SAVE PROGRESS ====== */
exports.saveProgress = async (req, res) => {
  const userId = req.user.id;
  const { bukuId, babId, progress } = req.body;

  await db.query(
    `
    INSERT INTO melihat (ID_USER, ID_BUKU, ID_BAB, PROGRESS)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      ID_BAB = VALUES(ID_BAB),
      PROGRESS = VALUES(PROGRESS),
      LAST_READ_AT = CURRENT_TIMESTAMP
    `,
    [userId, bukuId, babId, progress || 0]
  );

  response(res, 200, 'Progress tersimpan');
};
