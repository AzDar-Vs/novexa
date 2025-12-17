import db from '../connection.js';

class BukuRepository {
  static async findAll() {
    const [rows] = await db.query(`
      SELECT ID_BUKU, JUDUL, SLUG_BUKU, HARGA, STATUS, COVER
      FROM BUKU
      WHERE STATUS = 'aktif'
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM BUKU WHERE ID_BUKU = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const { judul, slug, deskripsi, harga, status } = data;
    const [result] = await db.query(
      `INSERT INTO BUKU (JUDUL, SLUG_BUKU, DESKRIPSI, HARGA, STATUS)
       VALUES (?, ?, ?, ?, ?)`,
      [judul, slug, deskripsi, harga, status]
    );
    return result.insertId;
  }
}

export default BukuRepository;
