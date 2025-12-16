const ResponseHandler = require('../utils/response');

class FavoriteController {
  // Get user favorites
  static async getUserFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * limit;
      
      const [favorites] = await db.query(`
        SELECT 
          f.*,
          b.JUDUL,
          b.SLUG_BUKU,
          b.DESKRIPSI,
          b.COVER,
          b.HARGA,
          b.STATUS,
          GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres,
          AVG(r.RATING) as average_rating
        FROM FAVORITE f
        JOIN BUKU b ON f.ID_BUKU = b.ID_BUKU
        LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
        WHERE f.ID_USER = ? AND b.STATUS = 'active'
        GROUP BY f.ID_FAV
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, parseInt(limit), offset]);
      
      // Get total count
      const [countResult] = await db.query(
        'SELECT COUNT(*) as total FROM FAVORITE WHERE ID_USER = ?',
        [userId]
      );
      
      ResponseHandler.success(res, {
        favorites,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
      
    } catch (error) {
      console.error('Get user favorites error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data favorit');
    }
  }
  
  // Add to favorites
  static async addToFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { book_id } = req.body;
      
      if (!book_id) {
        return ResponseHandler.badRequest(res, 'ID buku wajib diisi');
      }
      
      // Check if book exists
      const [book] = await db.query(
        'SELECT ID_BUKU FROM BUKU WHERE ID_BUKU = ? AND STATUS = "active"',
        [book_id]
      );
      
      if (book.length === 0) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan atau tidak aktif');
      }
      
      // Check if already in favorites
      const [existing] = await db.query(
        'SELECT ID_FAV FROM FAVORITE WHERE ID_USER = ? AND ID_BUKU = ?',
        [userId, book_id]
      );
      
      if (existing.length > 0) {
        return ResponseHandler.badRequest(res, 'Buku sudah ada di favorit');
      }
      
      // Add to favorites
      const [result] = await db.query(
        'INSERT INTO FAVORITE (ID_USER, ID_BUKU) VALUES (?, ?)',
        [userId, book_id]
      );
      
      ResponseHandler.created(res, {
        id: result.insertId,
        user_id: userId,
        book_id: book_id
      }, 'Buku berhasil ditambahkan ke favorit');
      
    } catch (error) {
      console.error('Add to favorites error:', error);
      ResponseHandler.error(res, 'Gagal menambahkan ke favorit');
    }
  }
  
  // Remove from favorites
  static async removeFromFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { book_id } = req.params;
      
      if (!book_id) {
        return ResponseHandler.badRequest(res, 'ID buku wajib diisi');
      }
      
      // Check if exists in favorites
      const [existing] = await db.query(
        'SELECT ID_FAV FROM FAVORITE WHERE ID_USER = ? AND ID_BUKU = ?',
        [userId, book_id]
      );
      
      if (existing.length === 0) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan di favorit');
      }
      
      await db.query(
        'DELETE FROM FAVORITE WHERE ID_USER = ? AND ID_BUKU = ?',
        [userId, book_id]
      );
      
      ResponseHandler.success(res, null, 'Buku berhasil dihapus dari favorit');
      
    } catch (error) {
      console.error('Remove from favorites error:', error);
      ResponseHandler.error(res, 'Gagal menghapus dari favorit');
    }
  }
  
  // Check if book is in favorites
  static async checkFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { book_id } = req.params;
      
      const [favorite] = await db.query(
        'SELECT ID_FAV FROM FAVORITE WHERE ID_USER = ? AND ID_BUKU = ?',
        [userId, book_id]
      );
      
      ResponseHandler.success(res, {
        is_favorite: favorite.length > 0,
        book_id: book_id
      });
      
    } catch (error) {
      console.error('Check favorite error:', error);
      ResponseHandler.error(res, 'Gagal memeriksa status favorit');
    }
  }
  
  // Toggle favorite status
  static async toggleFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { book_id } = req.body;
      
      if (!book_id) {
        return ResponseHandler.badRequest(res, 'ID buku wajib diisi');
      }
      
      // Check if book exists
      const [book] = await db.query(
        'SELECT ID_BUKU FROM BUKU WHERE ID_BUKU = ?',
        [book_id]
      );
      
      if (book.length === 0) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      // Check current status
      const [existing] = await db.query(
        'SELECT ID_FAV FROM FAVORITE WHERE ID_USER = ? AND ID_BUKU = ?',
        [userId, book_id]
      );
      
      if (existing.length > 0) {
        // Remove from favorites
        await db.query(
          'DELETE FROM FAVORITE WHERE ID_USER = ? AND ID_BUKU = ?',
          [userId, book_id]
        );
        
        ResponseHandler.success(res, {
          action: 'removed',
          is_favorite: false,
          book_id: book_id
        }, 'Buku dihapus dari favorit');
      } else {
        // Add to favorites
        const [result] = await db.query(
          'INSERT INTO FAVORITE (ID_USER, ID_BUKU) VALUES (?, ?)',
          [userId, book_id]
        );
        
        ResponseHandler.success(res, {
          action: 'added',
          is_favorite: true,
          book_id: book_id,
          favorite_id: result.insertId
        }, 'Buku ditambahkan ke favorit');
      }
      
    } catch (error) {
      console.error('Toggle favorite error:', error);
      ResponseHandler.error(res, 'Gagal mengubah status favorit');
    }
  }
  
  // Get favorite statistics
  static async getFavoriteStats(req, res) {
    try {
      const userId = req.user.id;
      
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total_favorites,
          SUM(b.HARGA) as total_value,
          COUNT(DISTINCT g.ID_GENRE) as unique_genres,
          AVG(r.RATING) as avg_rating
        FROM FAVORITE f
        JOIN BUKU b ON f.ID_BUKU = b.ID_BUKU
        LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
        WHERE f.ID_USER = ?
      `, [userId]);
      
      ResponseHandler.success(res, stats[0]);
      
    } catch (error) {
      console.error('Get favorite stats error:', error);
      ResponseHandler.error(res, 'Gagal mengambil statistik favorit');
    }
  }
}

module.exports = FavoriteController;