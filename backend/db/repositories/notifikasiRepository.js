import db from '../connection.js';

class NotifikasiRepository {
  static async create(pesan) {
    const [result] = await db.query(
      `INSERT INTO NOTIFIKASI (PESAN)
       VALUES (?)`,
      [pesan]
    );
    return result.insertId;
  }
}

export default NotifikasiRepository;
