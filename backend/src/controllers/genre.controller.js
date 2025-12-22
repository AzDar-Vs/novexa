const db = require('../config/database');
const response = require('../utils/response');
const slugify = require('slugify');

/* ===== GET ALL ===== */
exports.getAll = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM genre ORDER BY NAMA_GENRE ASC'
  );
  response(res, 200, 'List genre', rows);
};

/* ===== CREATE ===== */
exports.create = async (req, res) => {
  const { nama } = req.body;
  if (!nama) {
    return response(res, 400, 'Nama genre wajib diisi');
  }

  const slug = slugify(nama, { lower: true });

  await db.query(
    'INSERT INTO genre (NAMA_GENRE, SLUG) VALUES (?, ?)',
    [nama, slug]
  );

  response(res, 201, 'Genre berhasil dibuat');
};

/* ===== UPDATE ===== */
exports.update = async (req, res) => {
  const { nama } = req.body;
  const slug = slugify(nama, { lower: true });

  await db.query(
    'UPDATE genre SET NAMA_GENRE = ?, SLUG = ? WHERE ID_GENRE = ?',
    [nama, slug, req.params.id]
  );

  response(res, 200, 'Genre berhasil diupdate');
};

/* ===== DELETE ===== */
exports.remove = async (req, res) => {
  await db.query(
    'DELETE FROM genre WHERE ID_GENRE = ?',
    [req.params.id]
  );
  response(res, 200, 'Genre berhasil dihapus');
};
