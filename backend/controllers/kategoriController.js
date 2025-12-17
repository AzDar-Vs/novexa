const Genre = require('../db/models/genre');
const Kategori = require('../db/models/kategori');
const ResponseHandler = require('../utils/response');

class KategoriController {
  // Get all genres
  static async getAllGenres(req, res) {
    try {
      const { include_book_count = 'false' } = req.query;
      
      let sql = 'SELECT * FROM GENRE ORDER BY NAMA_GENRE';
      
      if (include_book_count === 'true') {
        sql = `
          SELECT 
            g.*,
            COUNT(k.ID_BUKU) as book_count
          FROM GENRE g
          LEFT JOIN KATEGORI k ON g.ID_GENRE = k.ID_GENRE
          GROUP BY g.ID_GENRE
          ORDER BY g.NAMA_GENRE
        `;
      }
      
      const [genres] = await db.query(sql);
      
      ResponseHandler.success(res, genres);
      
    } catch (error) {
      console.error('Get all genres error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data genre');
    }
  }
  
  // Get genre by ID
  static async getGenreById(req, res) {
    try {
      const genreId = parseInt(req.params.id);
      
      const [genre] = await db.query(
        `SELECT 
          g.*,
          COUNT(k.ID_BUKU) as book_count,
          GROUP_CONCAT(DISTINCT b.JUDUL) as sample_books
        FROM GENRE g
        LEFT JOIN KATEGORI k ON g.ID_GENRE = k.ID_GENRE
        LEFT JOIN BUKU b ON k.ID_BUKU = b.ID_BUKU
        WHERE g.ID_GENRE = ?
        GROUP BY g.ID_GENRE`,
        [genreId]
      );
      
      if (genre.length === 0) {
        return ResponseHandler.notFound(res, 'Genre tidak ditemukan');
      }
      
      ResponseHandler.success(res, genre[0]);
      
    } catch (error) {
      console.error('Get genre by ID error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data genre');
    }
  }
  
  // Create new genre (admin only)
  static async createGenre(req, res) {
    try {
      const { nama_genre, deskripsi } = req.body;
      
      if (!nama_genre) {
        return ResponseHandler.badRequest(res, 'Nama genre wajib diisi');
      }
      
      // Check if genre already exists
      const [existing] = await db.query(
        'SELECT ID_GENRE FROM GENRE WHERE NAMA_GENRE = ?',
        [nama_genre.trim()]
      );
      
      if (existing.length > 0) {
        return ResponseHandler.badRequest(res, 'Genre sudah ada');
      }
      
      const [result] = await db.query(
        'INSERT INTO GENRE (NAMA_GENRE, DESKRIPSI) VALUES (?, ?)',
        [nama_genre.trim(), deskripsi || null]
      );
      
      const [newGenre] = await db.query(
        'SELECT * FROM GENRE WHERE ID_GENRE = ?',
        [result.insertId]
      );
      
      ResponseHandler.created(res, newGenre[0], 'Genre berhasil dibuat');
      
    } catch (error) {
      console.error('Create genre error:', error);
      ResponseHandler.error(res, 'Gagal membuat genre');
    }
  }
  
  // Update genre (admin only)
  static async updateGenre(req, res) {
    try {
      const genreId = parseInt(req.params.id);
      const { nama_genre, deskripsi } = req.body;
      
      // Check if genre exists
      const [existing] = await db.query(
        'SELECT ID_GENRE FROM GENRE WHERE ID_GENRE = ?',
        [genreId]
      );
      
      if (existing.length === 0) {
        return ResponseHandler.notFound(res, 'Genre tidak ditemukan');
      }
      
      const updateData = {};
      if (nama_genre !== undefined) updateData.NAMA_GENRE = nama_genre.trim();
      if (deskripsi !== undefined) updateData.DESKRIPSI = deskripsi;
      
      if (Object.keys(updateData).length === 0) {
        return ResponseHandler.badRequest(res, 'Tidak ada data yang diupdate');
      }
      
      // Check if new name already exists
      if (nama_genre) {
        const [duplicate] = await db.query(
          'SELECT ID_GENRE FROM GENRE WHERE NAMA_GENRE = ? AND ID_GENRE != ?',
          [nama_genre.trim(), genreId]
        );
        
        if (duplicate.length > 0) {
          return ResponseHandler.badRequest(res, 'Nama genre sudah digunakan');
        }
      }
      
      await db.query(
        'UPDATE GENRE SET ? WHERE ID_GENRE = ?',
        [updateData, genreId]
      );
      
      const [updatedGenre] = await db.query(
        'SELECT * FROM GENRE WHERE ID_GENRE = ?',
        [genreId]
      );
      
      ResponseHandler.success(res, updatedGenre[0], 'Genre berhasil diupdate');
      
    } catch (error) {
      console.error('Update genre error:', error);
      ResponseHandler.error(res, 'Gagal mengupdate genre');
    }
  }
  
  // Delete genre (admin only)
  static async deleteGenre(req, res) {
    try {
      const genreId = parseInt(req.params.id);
      
      // Check if genre exists
      const [existing] = await db.query(
        'SELECT * FROM GENRE WHERE ID_GENRE = ?',
        [genreId]
      );
      
      if (existing.length === 0) {
        return ResponseHandler.notFound(res, 'Genre tidak ditemukan');
      }
      
      // Check if genre has books
      const [hasBooks] = await db.query(
        'SELECT COUNT(*) as count FROM KATEGORI WHERE ID_GENRE = ?',
        [genreId]
      );
      
      if (hasBooks[0].count > 0) {
        return ResponseHandler.badRequest(res, 
          'Tidak bisa menghapus genre yang masih memiliki buku. Hapus kategori terlebih dahulu.'
        );
      }
      
      await db.query('DELETE FROM GENRE WHERE ID_GENRE = ?', [genreId]);
      
      ResponseHandler.success(res, null, 'Genre berhasil dihapus');
      
    } catch (error) {
      console.error('Delete genre error:', error);
      ResponseHandler.error(res, 'Gagal menghapus genre');
    }
  }
  
  // Get books by genre
  static async getBooksByGenre(req, res) {
    try {
      const genreId = parseInt(req.params.id);
      const { page = 1, limit = 12, status = 'active' } = req.query;
      const offset = (page - 1) * limit;
      
      // Check if genre exists
      const [genre] = await db.query(
        'SELECT * FROM GENRE WHERE ID_GENRE = ?',
        [genreId]
      );
      
      if (genre.length === 0) {
        return ResponseHandler.notFound(res, 'Genre tidak ditemukan');
      }
      
      // Get books
      const [books] = await db.query(`
        SELECT 
          b.*,
          GROUP_CONCAT(DISTINCT g2.NAMA_GENRE) as all_genres,
          AVG(r.RATING) as average_rating
        FROM BUKU b
        JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        LEFT JOIN KATEGORI k2 ON b.ID_BUKU = k2.ID_BUKU
        LEFT JOIN GENRE g2 ON k2.ID_GENRE = g2.ID_GENRE
        LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
        WHERE g.ID_GENRE = ? AND b.STATUS = ?
        GROUP BY b.ID_BUKU
        ORDER BY b.ID_BUKU DESC
        LIMIT ? OFFSET ?
      `, [genreId, status, parseInt(limit), offset]);
      
      // Get total count
      const [countResult] = await db.query(`
        SELECT COUNT(DISTINCT b.ID_BUKU) as total
        FROM BUKU b
        JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        WHERE k.ID_GENRE = ? AND b.STATUS = ?
      `, [genreId, status]);
      
      ResponseHandler.success(res, {
        genre: genre[0],
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
      
    } catch (error) {
      console.error('Get books by genre error:', error);
      ResponseHandler.error(res, 'Gagal mengambil buku berdasarkan genre');
    }
  }
  
  // Add category to book (assign genre to book)
  static async addCategoryToBook(req, res) {
    try {
      const { book_id, genre_id } = req.body;
      
      if (!book_id || !genre_id) {
        return ResponseHandler.badRequest(res, 'ID buku dan genre wajib diisi');
      }
      
      // Check if book exists
      const [book] = await db.query(
        'SELECT ID_BUKU FROM BUKU WHERE ID_BUKU = ?',
        [book_id]
      );
      
      if (book.length === 0) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      // Check if genre exists
      const [genre] = await db.query(
        'SELECT ID_GENRE, NAMA_GENRE FROM GENRE WHERE ID_GENRE = ?',
        [genre_id]
      );
      
      if (genre.length === 0) {
        return ResponseHandler.notFound(res, 'Genre tidak ditemukan');
      }
      
      // Check if category already exists
      const [existing] = await db.query(
        'SELECT ID_KATEGORI FROM KATEGORI WHERE ID_BUKU = ? AND ID_GENRE = ?',
        [book_id, genre_id]
      );
      
      if (existing.length > 0) {
        return ResponseHandler.badRequest(res, 'Buku sudah memiliki genre ini');
      }
      
      // Add category
      const [result] = await db.query(
        'INSERT INTO KATEGORI (ID_BUKU, ID_GENRE, NAMA_KTG) VALUES (?, ?, ?)',
        [book_id, genre_id, genre[0].NAMA_GENRE]
      );
      
      const [newCategory] = await db.query(`
        SELECT k.*, g.NAMA_GENRE, b.JUDUL
        FROM KATEGORI k
        JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        JOIN BUKU b ON k.ID_BUKU = b.ID_BUKU
        WHERE k.ID_KATEGORI = ?
      `, [result.insertId]);
      
      ResponseHandler.created(res, newCategory[0], 'Kategori berhasil ditambahkan ke buku');
      
    } catch (error) {
      console.error('Add category to book error:', error);
      ResponseHandler.error(res, 'Gagal menambahkan kategori');
    }
  }
  
  // Remove category from book
  static async removeCategoryFromBook(req, res) {
    try {
      const { book_id, genre_id } = req.params;
      
      if (!book_id || !genre_id) {
        return ResponseHandler.badRequest(res, 'ID buku dan genre wajib diisi');
      }
      
      // Check if category exists
      const [category] = await db.query(
        'SELECT ID_KATEGORI FROM KATEGORI WHERE ID_BUKU = ? AND ID_GENRE = ?',
        [book_id, genre_id]
      );
      
      if (category.length === 0) {
        return ResponseHandler.notFound(res, 'Kategori tidak ditemukan');
      }
      
      await db.query(
        'DELETE FROM KATEGORI WHERE ID_BUKU = ? AND ID_GENRE = ?',
        [book_id, genre_id]
      );
      
      ResponseHandler.success(res, null, 'Kategori berhasil dihapus dari buku');
      
    } catch (error) {
      console.error('Remove category from book error:', error);
      ResponseHandler.error(res, 'Gagal menghapus kategori');
    }
  }
  
  // Update book categories (replace all)
  static async updateBookCategories(req, res) {
    try {
      const bookId = parseInt(req.params.bookId);
      const { genre_ids } = req.body;
      
      if (!Array.isArray(genre_ids)) {
        return ResponseHandler.badRequest(res, 'Genre IDs harus berupa array');
      }
      
      // Check if book exists
      const [book] = await db.query(
        'SELECT ID_BUKU FROM BUKU WHERE ID_BUKU = ?',
        [bookId]
      );
      
      if (book.length === 0) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      // Check if all genres exist
      if (genre_ids.length > 0) {
        const [genres] = await db.query(
          'SELECT ID_GENRE, NAMA_GENRE FROM GENRE WHERE ID_GENRE IN (?)',
          [genre_ids]
        );
        
        if (genres.length !== genre_ids.length) {
          return ResponseHandler.badRequest(res, 'Beberapa genre tidak ditemukan');
        }
      }
      
      // Start transaction
      await db.transaction(async (connection) => {
        // Delete existing categories
        await connection.query(
          'DELETE FROM KATEGORI WHERE ID_BUKU = ?',
          [bookId]
        );
        
        // Add new categories
        if (genre_ids.length > 0) {
          const genreMap = {};
          genres.forEach(g => {
            genreMap[g.ID_GENRE] = g.NAMA_GENRE;
          });
          
          for (const genreId of genre_ids) {
            await connection.query(
              'INSERT INTO KATEGORI (ID_BUKU, ID_GENRE, NAMA_KTG) VALUES (?, ?, ?)',
              [bookId, genreId, genreMap[genreId]]
            );
          }
        }
      });
      
      // Get updated book with categories
      const [updatedBook] = await db.query(`
        SELECT 
          b.*,
          GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres,
          GROUP_CONCAT(DISTINCT g.ID_GENRE) as genre_ids
        FROM BUKU b
        LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        WHERE b.ID_BUKU = ?
        GROUP BY b.ID_BUKU
      `, [bookId]);
      
      ResponseHandler.success(res, updatedBook[0], 'Kategori buku berhasil diupdate');
      
    } catch (error) {
      console.error('Update book categories error:', error);
      ResponseHandler.error(res, 'Gagal mengupdate kategori buku');
    }
  }
  
  // Get popular genres (with most books)
  static async getPopularGenres(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const [genres] = await db.query(`
        SELECT 
          g.*,
          COUNT(k.ID_BUKU) as book_count,
          COUNT(DISTINCT t.ID_TRANSAKSI) as transaction_count
        FROM GENRE g
        LEFT JOIN KATEGORI k ON g.ID_GENRE = k.ID_GENRE
        LEFT JOIN BUKU b ON k.ID_BUKU = b.ID_BUKU
        LEFT JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI
        GROUP BY g.ID_GENRE
        ORDER BY book_count DESC, transaction_count DESC
        LIMIT ?
      `, [parseInt(limit)]);
      
      ResponseHandler.success(res, genres);
      
    } catch (error) {
      console.error('Get popular genres error:', error);
      ResponseHandler.error(res, 'Gagal mengambil genre populer');
    }
  }
  
  // Search genres
  static async searchGenres(req, res) {
    try {
      const { q, limit = 20 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return ResponseHandler.badRequest(res, 'Kata kunci pencarian minimal 2 karakter');
      }
      
      const [genres] = await db.query(`
        SELECT 
          g.*,
          COUNT(k.ID_BUKU) as book_count
        FROM GENRE g
        LEFT JOIN KATEGORI k ON g.ID_GENRE = k.ID_GENRE
        WHERE g.NAMA_GENRE LIKE ?
        GROUP BY g.ID_GENRE
        ORDER BY g.NAMA_GENRE
        LIMIT ?
      `, [`%${q}%`, parseInt(limit)]);
      
      ResponseHandler.success(res, {
        query: q,
        results: genres,
        count: genres.length
      });
      
    } catch (error) {
      console.error('Search genres error:', error);
      ResponseHandler.error(res, 'Gagal mencari genre');
    }
  }
  
  // Get books by multiple genres
  static async getBooksByMultipleGenres(req, res) {
    try {
      const { genre_ids } = req.query;
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * limit;
      
      if (!genre_ids) {
        return ResponseHandler.badRequest(res, 'Genre IDs diperlukan');
      }
      
      const ids = genre_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      
      if (ids.length === 0) {
        return ResponseHandler.badRequest(res, 'Genre IDs tidak valid');
      }
      
      // Validate genres exist
      const [genres] = await db.query(
        'SELECT ID_GENRE, NAMA_GENRE FROM GENRE WHERE ID_GENRE IN (?)',
        [ids]
      );
      
      if (genres.length !== ids.length) {
        return ResponseHandler.badRequest(res, 'Beberapa genre tidak ditemukan');
      }
      
      // Get books that have ALL specified genres
      const [books] = await db.query(`
        SELECT 
          b.*,
          GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres,
          AVG(r.RATING) as average_rating
        FROM BUKU b
        JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
        WHERE b.ID_BUKU IN (
          SELECT k2.ID_BUKU
          FROM KATEGORI k2
          WHERE k2.ID_GENRE IN (?)
          GROUP BY k2.ID_BUKU
          HAVING COUNT(DISTINCT k2.ID_GENRE) = ?
        )
        AND b.STATUS = 'active'
        GROUP BY b.ID_BUKU
        ORDER BY b.ID_BUKU DESC
        LIMIT ? OFFSET ?
      `, [ids, ids.length, parseInt(limit), offset]);
      
      // Get total count
      const [countResult] = await db.query(`
        SELECT COUNT(DISTINCT k.ID_BUKU) as total
        FROM KATEGORI k
        WHERE k.ID_BUKU IN (
          SELECT k2.ID_BUKU
          FROM KATEGORI k2
          WHERE k2.ID_GENRE IN (?)
          GROUP BY k2.ID_BUKU
          HAVING COUNT(DISTINCT k2.ID_GENRE) = ?
        )
      `, [ids, ids.length]);
      
      ResponseHandler.success(res, {
        genres: genres.map(g => g.NAMA_GENRE),
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
      
    } catch (error) {
      console.error('Get books by multiple genres error:', error);
      ResponseHandler.error(res, 'Gagal mengambil buku berdasarkan genre');
    }
  }
}

module.exports = KategoriController;