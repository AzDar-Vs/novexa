import db from '../connection.js';

class KeranjangRepository {
  static async create() {
    const [result] = await db.query(
      `INSERT INTO KERANJANG () VALUES ()`
    );
    return result.insertId;
  }

  static async addItem(idKeranjang, idBuku, harga) {
    await db.query(
      `INSERT INTO DETAIL_ITEM (ID_KRJ, ID_BUKU, HARGA_ITEM)
       VALUES (?, ?, ?)`,
      [idKeranjang, idBuku, harga]
    );
  }

  static async getItems(idKeranjang) {
    const [rows] = await db.query(
      `SELECT d.*, b.JUDUL
       FROM DETAIL_ITEM d
       JOIN BUKU b ON d.ID_BUKU = b.ID_BUKU
       WHERE d.ID_KRJ = ?`,
      [idKeranjang]
    );
    return rows;
  }
}

export default KeranjangRepository;
