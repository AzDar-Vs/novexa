const db = require('../../config/database');

class Kategori {
  static tableName = 'KATEGORI';
  
  // Add category to book
  static async addToBook(bookId, genreId) {
    // Get genre name
    const [genre] = await db.query(
      'SELECT NAMA_GENRE FROM GENRE WHERE ID_GENRE = ?',
      [genreId]
    );
    
    if (!genre[0]) {
      throw new Error('Genre not found');
    }
    
    // Check if already exists
    const [existing] = await db.query(
      `SELECT ID_KATEGORI FROM ${this.tableName} WHERE ID_BUKU = ? AND ID_GENRE = ?`,
      [bookId, genreId]
    );
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const sql = `INSERT INTO ${this.tableName} (ID_BUKU, ID_GENRE, NAMA_KTG) VALUES (?, ?, ?)`;
    const [result] = await db.query(sql, [bookId, genreId, genre[0].NAMA_GENRE]);
    
    return { id: result.insertId, id_buku: bookId, id_genre: genreId };
  }
  
  // Remove category from book
  static async removeFromBook(bookId, genreId) {
    const sql = `DELETE FROM ${this.tableName} WHERE ID_BUKU = ? AND ID_GENRE = ?`;
    await db.query(sql, [bookId, genreId]);
  }
  
  // Get categories by book
  static async getByBookId(bookId) {
    const sql = `
      SELECT k.*, g.NAMA_GENRE, g.DESKRIPSI as genre_description
      FROM ${this.tableName} k
      JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
      WHERE k.ID_BUKU = ?
    `;
    return await db.query(sql, [bookId]);
  }
  
  // Get books by genre
  static async getBooksByGenre(genreId, filters = {}) {
    let sql = `
      SELECT 
        b.*,
        GROUP_CONCAT(DISTINCT g2.NAMA_GENRE) as all_genres,
        AVG(r.RATING) as average_rating
      FROM BUKU b
      JOIN ${this.tableName} k ON b.ID_BUKU = k.ID_BUKU
      JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
      LEFT JOIN ${this.tableName} k2 ON b.ID_BUKU = k2.ID_BUKU
      LEFT JOIN GENRE g2 ON k2.ID_GENRE = g2.ID_GENRE
      LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
      WHERE g.ID_GENRE = ?
    `;
    
    const params = [genreId];
    
    if (filters.status) {
      sql += ' AND b.STATUS = ?';
      params.push(filters.status);
    }
    
    sql += ' GROUP BY b.ID_BUKU ORDER BY b.ID_BUKU DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }
    
    return await db.query(sql, params);
  }
  
  // Update book categories (replace all)
  static async updateBookCategories(bookId, genreIds) {
    return await db.transaction(async (connection) => {
      // Delete existing categories
      await connection.query(
        `DELETE FROM ${this.tableName} WHERE ID_BUKU = ?`,
        [bookId]
      );
      
      // Get genre names
      if (genreIds.length > 0) {
        const [genres] = await connection.query(
          'SELECT ID_GENRE, NAMA_GENRE FROM GENRE WHERE ID_GENRE IN (?)',
          [genreIds]
        );
        
        // Create genre map
        const genreMap = {};
        genres.forEach(g => {
          genreMap[g.ID_GENRE] = g.NAMA_GENRE;
        });
        
        // Insert new categories
        for (const genreId of genreIds) {
          if (genreMap[genreId]) {
            await connection.query(
              `INSERT INTO ${this.tableName} (ID_BUKU, ID_GENRE, NAMA_KTG) VALUES (?, ?, ?)`,
              [bookId, genreId, genreMap[genreId]]
            );
          }
        }
      }
    });
  }
  
  // Get category count by genre
  static async getCountByGenre(genreId) {
    const sql = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ID_GENRE = ?`;
    const [result] = await db.query(sql, [genreId]);
    return result[0].count;
  }
}

module.exports = Kategori;