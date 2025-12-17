const db = require('../../config/database');
const bukuQueries = require('../queries/bukuQueries');

class Buku {
  static tableName = 'BUKU';
  
  // Create new book
  static async create(bukuData) {
    return await bukuQueries.createBook(bukuData);
  }
  
  // Find by ID with details
  static async findById(id) {
    return await bukuQueries.findBookById(id);
  }
  
  // Find by slug
  static async findBySlug(slug) {
    return await bukuQueries.findBookBySlug(slug);
  }
  
  // Get all books with filters
  static async findAll(filters = {}) {
    return await bukuQueries.findAllBooks(filters);
  }
  
  // Update book
  static async update(id, updateData) {
    return await bukuQueries.updateBook(id, updateData);
  }
  
  // Delete book
  static async delete(id) {
    return await bukuQueries.deleteBook(id);
  }
  
  // Get popular books
  static async getPopular(limit = 10) {
    return await bukuQueries.getPopularBooks(limit);
  }
  
  // Get books by author (user)
  static async findByAuthor(userId, filters = {}) {
    return await bukuQueries.getBooksByAuthor(userId, filters);
  }
  
  // Get new releases
  static async getNewReleases(limit = 10) {
    return await bukuQueries.getNewReleases(limit);
  }
  
  // Search books
  static async search(query, filters = {}) {
    return await bukuQueries.searchBooks(query, filters);
  }
  
  // Get user library (purchased books)
  static async getUserLibrary(userId, filters = {}) {
    return await bukuQueries.getUserLibrary(userId, filters);
  }
  
  // Get recommended books for user
  static async getRecommended(userId, limit = 10) {
    return await bukuQueries.getRecommendedBooks(userId, limit);
  }
  
  // Get similar books
  static async getSimilar(bookId, limit = 6) {
    return await bukuQueries.getSimilarBooks(bookId, limit);
  }
  
  // Update book status
  static async updateStatus(id, status) {
    return await bukuQueries.updateBookStatus(id, status);
  }
  
  // Get book statistics
  static async getStats(bookId) {
    return await bukuQueries.getBookStats(bookId);
  }
  
  // Get price range
  static async getPriceRange() {
    return await bukuQueries.getPriceRange();
  }
  
  // Check if user has access to book (has purchased)
  static async checkAccess(userId, bookId) {
    return await bukuQueries.checkBookAccess(userId, bookId);
  }
  
  // Increment view count
  static async incrementView(userId, bookId) {
    return await bukuQueries.incrementViewCount(userId, bookId);
  }
  
  // Get books for admin (with author info)
  static async getForAdmin(filters = {}) {
    return await bukuQueries.getBooksForAdmin(filters);
  }
  
  // Get admin dashboard statistics
  static async getAdminStats() {
    return await bukuQueries.getAdminDashboardStats();
  }
  
  // Get books by multiple genres
  static async getByMultipleGenres(genreIds, filters = {}) {
    return await bukuQueries.getBooksByMultipleGenres(genreIds, filters);
  }
  
  // Get books in user's cart
  static async getBooksInCart(userId) {
    const sql = `
      SELECT 
        b.*,
        k.ID_KRJ,
        k.created_at as added_to_cart_at
      FROM BUKU b
      JOIN KERANJANG k ON b.ID_BUKU = k.ID_BUKU
      WHERE k.ID_USER = ? AND b.STATUS = 'active'
      ORDER BY k.created_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  }
  
  // Get books marked as favorite by user
  static async getFavoriteBooks(userId, filters = {}) {
    let sql = `
      SELECT 
        b.*,
        f.ID_FAV,
        f.created_at as favorited_at,
        GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres
      FROM BUKU b
      JOIN FAVORITE f ON b.ID_BUKU = f.ID_BUKU
      LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
      LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
      WHERE f.ID_USER = ? AND b.STATUS = 'active'
    `;
    
    const params = [userId];
    
    if (filters.search) {
      sql += ' AND (b.JUDUL LIKE ? OR b.DESKRIPSI LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    sql += ' GROUP BY b.ID_BUKU ORDER BY f.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }
    
    const [rows] = await db.query(sql, params);
    return rows;
  }
  
  // Get recently viewed books
  static async getRecentlyViewed(userId, limit = 10) {
    const sql = `
      SELECT 
        b.*,
        m.viewed_at,
        GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres
      FROM BUKU b
      JOIN MELIHAT m ON b.ID_BUKU = m.ID_BUKU
      LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
      LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
      WHERE m.ID_USER = ? AND b.STATUS = 'active'
      GROUP BY b.ID_BUKU
      ORDER BY m.viewed_at DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [userId, limit]);
    return rows;
  }
  
  // Check if book exists
  static async exists(id) {
    const sql = 'SELECT 1 FROM BUKU WHERE ID_BUKU = ?';
    const [rows] = await db.query(sql, [id]);
    return rows.length > 0;
  }
  
  // Check if slug exists
  static async slugExists(slug, excludeId = null) {
    let sql = 'SELECT 1 FROM BUKU WHERE SLUG_BUKU = ?';
    const params = [slug];
    
    if (excludeId) {
      sql += ' AND ID_BUKU != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.query(sql, params);
    return rows.length > 0;
  }
  
  // Get books with highest ratings
  static async getTopRated(limit = 10, minReviews = 5) {
    const sql = `
      SELECT 
        b.*,
        AVG(r.RATING) as average_rating,
        COUNT(r.ID_REVIEW) as review_count,
        GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres
      FROM BUKU b
      LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
      LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
      LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
      WHERE b.STATUS = 'active'
      GROUP BY b.ID_BUKU
      HAVING review_count >= ?
      ORDER BY average_rating DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [minReviews, limit]);
    return rows;
  }
  
  // Get books on sale/discount (if you have discount field)
  static async getOnSale(limit = 10) {
    const sql = `
      SELECT 
        b.*,
        b.HARGA as original_price,
        (b.HARGA * 0.8) as sale_price, -- Example: 20% discount
        GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres
      FROM BUKU b
      LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
      LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
      WHERE b.STATUS = 'active' 
        AND b.ON_SALE = 1 -- If you have this field
      GROUP BY b.ID_BUKU
      ORDER BY b.created_at DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [limit]);
    return rows;
  }
  
  // Get total book count with filters
  static async getCount(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM BUKU b';
    const params = [];
    
    if (filters.genre) {
      sql += ' JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU WHERE k.ID_GENRE = ?';
      params.push(filters.genre);
    } else {
      sql += ' WHERE 1=1';
    }
    
    if (filters.status) {
      sql += ' AND b.STATUS = ?';
      params.push(filters.status);
    }
    
    if (filters.search) {
      sql += ' AND (b.JUDUL LIKE ? OR b.DESKRIPSI LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.author_id) {
      sql += ' AND b.ID_TRANSAKSI IN (SELECT ID_TRANSAKSI FROM TRANSAKSI WHERE ID_USER = ?)';
      params.push(filters.author_id);
    }
    
    const [rows] = await db.query(sql, params);
    return rows[0].total;
  }
  
  // Get books with pagination metadata
  static async findAllWithPagination(filters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;
    
    // Get books
    const books = await this.findAll({
      ...filters,
      limit,
      offset
    });
    
    // Get total count
    const total = await this.getCount(filters);
    
    return {
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
}

module.exports = Buku;