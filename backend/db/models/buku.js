const db = require('../../config/database');

class Buku {
  static tableName = 'BUKU';
  
  // Create new book
  static async create(bukuData) {
    const { judul, slug_buku, deskripsi, cover, harga, status = 'active' } = bukuData;
    
    const sql = `
      INSERT INTO ${this.tableName} 
      (JUDUL, SLUG_BUKU, DESKRIPSI, COVER, HARGA, STATUS) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [judul, slug_buku, deskripsi, cover, harga, status]);
    return { id: result.insertId, ...bukuData };
  }
  
  // Find by ID with details
  static async findById(id) {
    const sql = `
      SELECT 
        b.*,
        GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres,
        GROUP_CONCAT(DISTINCT g.ID_GENRE) as genre_ids,
        AVG(r.RATING) as average_rating,
        COUNT(DISTINCT r.ID_REVIEW) as total_reviews,
        COUNT(DISTINCT f.ID_FAV) as total_favorites
      FROM ${this.tableName} b
      LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
      LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
      LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
      LEFT JOIN FAVORITE f ON b.ID_FAV = f.ID_FAV
      WHERE b.ID_BUKU = ?
      GROUP BY b.ID_BUKU
    `;
    
    const rows = await db.query(sql, [id]);
    return rows[0];
  }
  
  // Find by slug
  static async findBySlug(slug) {
    const sql = `
      SELECT 
        b.*,
        GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres
      FROM ${this.tableName} b
      LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
      LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
      WHERE b.SLUG_BUKU = ?
      GROUP BY b.ID_BUKU
    `;
    
    const rows = await db.query(sql, [slug]);
    return rows[0];
  }
  
  // Get all books with filters
  static async findAll(filters = {}) {
    let sql = `
      SELECT 
        b.*,
        GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres,
        AVG(r.RATING) as average_rating
      FROM ${this.tableName} b
      LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
      LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
      LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
    `;
    
    const whereConditions = [];
    const params = [];
    
    // Apply filters
    if (filters.genre) {
      whereConditions.push('g.ID_GENRE = ?');
      params.push(filters.genre);
    }
    
    if (filters.status) {
      whereConditions.push('b.STATUS = ?');
      params.push(filters.status);
    }
    
    if (filters.search) {
      whereConditions.push('(b.JUDUL LIKE ? OR b.DESKRIPSI LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.minPrice) {
      whereConditions.push('b.HARGA >= ?');
      params.push(filters.minPrice);
    }
    
    if (filters.maxPrice) {
      whereConditions.push('b.HARGA <= ?');
      params.push(filters.maxPrice);
    }
    
    // Add WHERE clause if filters exist
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    sql += ' GROUP BY b.ID_BUKU ';
    
    // Sorting
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
      sql += ` ORDER BY ${filters.sortBy} ${order}`;
    } else {
      sql += ' ORDER BY b.ID_BUKU DESC';
    }
    
    // Pagination
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }
    
    return await db.query(sql, params);
  }
  
  // Update book
  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key.toUpperCase()} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    const sql = `UPDATE ${this.tableName} SET ${fields} WHERE ID_BUKU = ?`;
    await db.query(sql, values);
    
    return this.findById(id);
  }
  
  // Delete book
  static async delete(id) {
    // Start transaction
    return await db.transaction(async (connection) => {
      // Delete related records first
      await connection.execute('DELETE FROM KATEGORI WHERE ID_BUKU = ?', [id]);
      await connection.execute('DELETE FROM BAB_BUKU WHERE ID_BUKU = ?', [id]);
      await connection.execute('DELETE FROM KERANJANG WHERE ID_BUKU = ?', [id]);
      
      // Delete book
      await connection.execute(`DELETE FROM ${this.tableName} WHERE ID_BUKU = ?`, [id]);
    });
  }
  
  // Get popular books
  static async getPopular(limit = 10) {
    const sql = `
      SELECT 
        b.*,
        COUNT(DISTINCT t.ID_TRANSAKSI) as purchase_count,
        AVG(r.RATING) as average_rating
      FROM ${this.tableName} b
      LEFT JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI
      LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
      GROUP BY b.ID_BUKU
      ORDER BY purchase_count DESC, average_rating DESC
      LIMIT ?
    `;
    
    return await db.query(sql, [limit]);
  }
  
  // Get books by author (user)
  static async findByAuthor(userId) {
    const sql = `
      SELECT b.*
      FROM ${this.tableName} b
      INNER JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI
      WHERE t.ID_USER = ? AND b.STATUS = 'active'
      ORDER BY b.ID_BUKU DESC
    `;
    
    return await db.query(sql, [userId]);
  }
}