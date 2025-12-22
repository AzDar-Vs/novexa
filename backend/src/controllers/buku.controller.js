const db = require('../config/database');
const response = require('../utils/response');

/* ================= GET ALL ================= */
exports.getAll = async (req, res) => {
  const { genre } = req.query;

  let sql = `
    SELECT DISTINCT b.*
    FROM buku b
    LEFT JOIN buku_genre bg ON bg.ID_BUKU = b.ID_BUKU
    WHERE b.STATUS = 'published'
  `;
  const params = [];

  if (genre) {
    sql += ' AND bg.ID_GENRE = ?';
    params.push(genre);
  }

  const [rows] = await db.query(sql, params);
  response(res, 200, 'List buku', rows);
};

/* ================= MY BOOKS (SELLER) ================= */
exports.myBooks = async (req, res) => {
  const [rows] = await db.query(
    `SELECT ID_BUKU id, JUDUL judul, STATUS status, HARGA harga, COVER cover
     FROM buku
     WHERE ID_USER = ?
     ORDER BY CREATED_AT DESC`,
    [req.user.id]
  );

  response(res, 200, 'Buku saya', rows);
};

/* ================= GET BY ID ================= */
exports.getById = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM buku WHERE ID_BUKU = ?',
    [req.params.id]
  );

  if (!rows.length) {
    return response(res, 404, 'Buku tidak ditemukan');
  }

  response(res, 200, 'Detail buku', rows[0]);
};

/* ================= CREATE ================= */
exports.create = async (req, res) => {
  const { judul, deskripsi, harga, is_free } = req.body;

  if (!judul || harga === undefined) {
    return response(res, 400, 'Judul dan harga wajib diisi');
  }

  const [result] = await db.query(
    `INSERT INTO buku (ID_USER, JUDUL, HARGA, IS_FREE, STATUS)
     VALUES (?, ?, ?, ?, 'draft')`,
    [
      req.user.id,
      judul,
      harga,
      is_free ? 1 : 0
    ]
  );

  response(res, 201, 'Buku berhasil dibuat', {
    id: result.insertId
  });
};

/* ================= UPDATE ================= */
exports.update = async (req, res) => {
  const bukuId = req.params.id;

  const [rows] = await db.query(
    'SELECT * FROM buku WHERE ID_BUKU = ?',
    [bukuId]
  );

  if (!rows.length) {
    return response(res, 404, 'Buku tidak ditemukan');
  }

  const buku = rows[0];

  // seller hanya boleh edit bukunya sendiri
  if (req.user.role === 'seller' && buku.ID_USER !== req.user.id) {
    return response(res, 403, 'Tidak boleh mengedit buku orang lain');
  }

  const { judul, deskripsi, harga, status } = req.body;

  await db.query(
    `UPDATE buku
     SET JUDUL = ?, DESKRIPSI = ?, HARGA = ?, STATUS = ?
     WHERE ID_BUKU = ?`,
    [
      judul || buku.JUDUL,
      deskripsi || buku.DESKRIPSI,
      harga ?? buku.HARGA,
      status || buku.STATUS,
      bukuId
    ]
  );

  response(res, 200, 'Buku berhasil diupdate');
};

/* ===== SET GENRE ===== */
exports.setGenre = async (req, res) => {
  const bukuId = req.params.id;
  const { genres } = req.body; // array ID_GENRE

  if (!Array.isArray(genres)) {
    return response(res, 400, 'Genres harus berupa array');
  }

  // hapus genre lama
  await db.query(
    'DELETE FROM buku_genre WHERE ID_BUKU = ?',
    [bukuId]
  );

  // insert ulang
  for (const genreId of genres) {
    await db.query(
      'INSERT INTO buku_genre (ID_BUKU, ID_GENRE) VALUES (?, ?)',
      [bukuId, genreId]
    );
  }

  response(res, 200, 'Genre buku berhasil diperbarui');
};

/* ================= UPLOAD COVER ================= */
exports.uploadCover = async (req, res) => {
  const bukuId = req.params.id;

  if (!req.file) {
    return response(res, 400, 'File cover wajib diupload');
  }

  const [rows] = await db.query(
    'SELECT * FROM buku WHERE ID_BUKU = ?',
    [bukuId]
  );

  if (!rows.length) {
    return response(res, 404, 'Buku tidak ditemukan');
  }

  const buku = rows[0];

  // seller hanya boleh upload cover bukunya sendiri
  if (req.user.role === 'seller' && buku.ID_USER !== req.user.id) {
    return response(res, 403, 'Tidak boleh upload cover buku orang lain');
  }

  await db.query(
    'UPDATE buku SET COVER = ? WHERE ID_BUKU = ?',
    [req.file.filename, bukuId]
  );

  response(res, 200, 'Cover berhasil diupload', {
    cover: req.file.filename
  });
};

/* ================= DELETE ================= */
exports.remove = async (req, res) => {
  const bukuId = req.params.id;

  const [rows] = await db.query(
    'SELECT * FROM buku WHERE ID_BUKU = ?',
    [bukuId]
  );

  if (!rows.length) {
    return response(res, 404, 'Buku tidak ditemukan');
  }

  const buku = rows[0];

  if (req.user.role === 'seller' && buku.ID_USER !== req.user.id) {
    return response(res, 403, 'Tidak boleh menghapus buku orang lain');
  }

  await db.query(
    'DELETE FROM buku WHERE ID_BUKU = ?',
    [bukuId]
  );

  response(res, 200, 'Buku berhasil dihapus');
};

/* ================= DETAIL + RATING =================*/
exports.detail = async (req, res) => {
  const { id } = req.params;

  const [[book]] = await db.query(
    `SELECT b.ID_BUKU id, b.JUDUL title, b.DESKRIPSI description, b.COVER cover
     FROM buku b
     WHERE b.ID_BUKU = ?`,
    [id]
  );

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const [[rating]] = await db.query(
    `SELECT COUNT(*) totalReview, COALESCE(AVG(RATING),0) avgRating
     FROM review
     WHERE ID_BUKU = ?`,
    [id]
  );

  res.json({
    success: true,
    data: {
      ...book,
      avgRating: Number(rating.avgRating).toFixed(1),
      totalReview: rating.totalReview
    }
  });
};
