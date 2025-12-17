import db from '../connection.js';

class TransaksiRepository {
  static async create({ idUser, totalHarga, status }) {
    const [result] = await db.query(
      `INSERT INTO TRANSAKSI
       (ID_USER, TOTAL_HARGA, STATUS_PEMBAYARAN)
       VALUES (?, ?, ?)`,
      [idUser, totalHarga, status]
    );
    return result.insertId;
  }

  static async findByUser(idUser) {
    const [rows] = await db.query(
      `SELECT * FROM TRANSAKSI WHERE ID_USER = ?`,
      [idUser]
    );
    return rows;
  }
}

export default TransaksiRepository;
