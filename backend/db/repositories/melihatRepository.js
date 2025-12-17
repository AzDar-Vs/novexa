import db from '../connection.js';

class MelihatRepository {
  static async exists(userId, bukuId) {
    const [rows] = await db.query(
      `SELECT 1 FROM MELIHAT WHERE ID_USER = ? AND ID_BUKU = ?`,
      [userId, bukuId]
    );
    return rows.length > 0;
  }

  static async create(userId, bukuId) {
    await db.query(
      `INSERT INTO MELIHAT (ID_USER, ID_BUKU) VALUES (?, ?)`,
      [userId, bukuId]
    );
  }

  static async findByUser(userId) {
    const [rows] = await db.query(
      `SELECT b.*
       FROM MELIHAT m
       JOIN BUKU b ON m.ID_BUKU = b.ID_BUKU
       WHERE m.ID_USER = ?`,
      [userId]
    );
    return rows;
  }

  static async countByBuku(bukuId) {
    const [[row]] = await db.query(
      `SELECT COUNT(*) AS total FROM MELIHAT WHERE ID_BUKU = ?`,
      [bukuId]
    );
    return row.total;
  }
}

export default MelihatRepository;
