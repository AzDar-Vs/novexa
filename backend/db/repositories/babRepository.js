import db from '../connection.js';

class BabRepository {
  static async findByBuku(idBuku) {
    const [rows] = await db.query(
      `SELECT * FROM BAB_BUKU
       WHERE ID_BUKU = ?
       ORDER BY NOMER_BAB ASC`,
      [idBuku]
    );
    return rows;
  }

  static async create({ idBuku, judulBab, isi, nomor }) {
    const [result] = await db.query(
      `INSERT INTO BAB_BUKU (ID_BUKU, JUDUL_BAB, ISI, NOMER_BAB)
       VALUES (?, ?, ?, ?)`,
      [idBuku, judulBab, isi, nomor]
    );
    return result.insertId;
  }
}

export default BabRepository;
