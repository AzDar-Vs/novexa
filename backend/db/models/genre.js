const db = require('../../config/database');

class Genre {
  static tableName = 'GENRE';
  
  // Create new genre
  static async create(genreData) {
    const { nama_genre, deskripsi = '' } = genreData;
    
    const sql = `INSERT INTO ${this.tableName} (NAMA_GENRE, DESKRIPSI) VALUES (?, ?)`;
    const [result] = await db.query(sql, [nama_genre, deskripsi]);
    
    return { id: result.insertId, ...genreData };
  }
  
  // Find by ID
  static async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE ID_GENRE = ?`;
    const rows = await db.query(sql, [id]);
    return rows[0];
  }
  
  // Find by name
  static async findByName(name) {
    const sql = `SELECT * FROM ${this.tableName} WHERE NAMA_GENRE = ?`;
    const rows = await db.query(sql, [name]);
    return rows[0];
  }
  
  // Get all genres
  static async findAll() {
    const sql = `
      SELECT g.*, COUNT(k.ID_BUKU) as total_books 
      FROM ${this.tableName} g
      LEFT JOIN KATEGORI k ON g.ID_GENRE = k.ID_GENRE
      GROUP BY g.ID_GENRE
      ORDER BY g.NAMA_GENRE
    `;
    return await db.query(sql);
  }
  
  // Update genre
  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    const sql = `UPDATE ${this.tableName} SET ${fields} WHERE ID_GENRE = ?`;
    await db.query(sql, values);
    
    return this.findById(id);
  }
  
  // Delete genre
  static async delete(id) {
    // Check if genre has books
    const [hasBooks] = await db.query(
      'SELECT COUNT(*) as count FROM KATEGORI WHERE ID_GENRE = ?',
      [id]
    );
    
    if (hasBooks[0].count > 0) {
      throw new Error('Cannot delete genre with books');
    }
    
    const sql = `DELETE FROM ${this.tableName} WHERE ID_GENRE = ?`;
    await db.query(sql, [id]);
  }
  
  // Get popular genres
  static async getPopular(limit = 10) {
    const sql = `
      SELECT 
        g.*,
        COUNT(k.ID_BUKU) as book_count,
        COUNT(DISTINCT t.ID_TRANSAKSI) as transaction_count
      FROM ${this.tableName} g
      LEFT JOIN KATEGORI k ON g.ID_GENRE = k.ID_GENRE
      LEFT JOIN BUKU b ON k.ID_BUKU = b.ID_BUKU
      LEFT JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI
      GROUP BY g.ID_GENRE
      ORDER BY book_count DESC, transaction_count DESC
      LIMIT ?
    `;
    return await db.query(sql, [limit]);
  }
  
  // Search genres
  static async search(query, limit = 20) {
    const sql = `
      SELECT 
        g.*,
        COUNT(k.ID_BUKU) as book_count
      FROM ${this.tableName} g
      LEFT JOIN KATEGORI k ON g.ID_GENRE = k.ID_GENRE
      WHERE g.NAMA_GENRE LIKE ?
      GROUP BY g.ID_GENRE
      ORDER BY g.NAMA_GENRE
      LIMIT ?
    `;
    return await db.query(sql, [`%${query}%`, limit]);
  }
}

module.exports = Genre;