const ResponseHandler = require('../utils/response');

class MelihatController {
  // Get user's viewing history
  static async getViewHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      const [history] = await db.query(`
        SELECT 
          m.*,
          b.JUDUL,
          b.SLUG_BUKU,
          b.COVER,
          b.HARGA,
          b.STATUS,
          GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres,
          AVG(r.RATING) as average_rating
        FROM MELIHAT m
        JOIN BUKU b ON m.ID_BUKU = b.ID_BUKU
        LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
        WHERE m.ID_USER = ?
        GROUP BY m.ID_BUKU
        ORDER BY m.viewed_at DESC
        LIMIT ? OFFSET ?
      `, [userId, parseInt(limit), offset]);
      
      // Get total count
      const [countResult] = await db.query(
        'SELECT COUNT(DISTINCT ID_BUKU) as total FROM MELIHAT WHERE ID_USER = ?',
        [userId]
      );
      
      ResponseHandler.success(res, {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
      
    } catch (error) {
      console.error('Get view history error:', error);
      ResponseHandler.error(res, 'Gagal mengambil riwayat melihat');
    }
  }
  
  // Clear view history
  static async clearViewHistory(req, res) {
    try {
      const userId = req.user.id;
      
      await db.query('DELETE FROM MELIHAT WHERE ID_USER = ?', [userId]);
      
      ResponseHandler.success(res, null, 'Riwayat melihat berhasil dihapus');
      
    } catch (error) {
      console.error('Clear view history error:', error);
      ResponseHandler.error(res, 'Gagal menghapus riwayat melihat');
    }
  }
  
  // Remove specific item from view history
  static async removeFromHistory(req, res) {
    try {
      const userId = req.user.id;
      const { book_id } = req.params;
      
      await db.query(
        'DELETE FROM MELIHAT WHERE ID_USER = ? AND ID_BUKU = ?',
        [userId, book_id]
      );
      
      ResponseHandler.success(res, null, 'Item berhasil dihapus dari riwayat');
      
    } catch (error) {
      console.error('Remove from history error:', error);
      ResponseHandler.error(res, 'Gagal menghapus dari riwayat');
    }
  }
  
  // Get most viewed books (for recommendations)
  static async getMostViewed(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;
      
      const [mostViewed] = await db.query(`
        SELECT 
          b.ID_BUKU,
          b.JUDUL,
          b.SLUG_BUKU,
          b.COVER,
          b.HARGA,
          COUNT(m.ID_USER) as view_count,
          GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres
        FROM BUKU b
        LEFT JOIN MELIHAT m ON b.ID_BUKU = m.ID_BUKU
        LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        WHERE b.STATUS = 'active'
        GROUP BY b.ID_BUKU
        ORDER BY view_count DESC
        LIMIT ?
      `, [parseInt(limit)]);
      
      ResponseHandler.success(res, mostViewed);
      
    } catch (error) {
      console.error('Get most viewed error:', error);
      ResponseHandler.error(res, 'Gagal mengambil buku yang paling banyak dilihat');
    }
  }
  
  // Get viewing statistics
  static async getViewStats(req, res) {
    try {
      const userId = req.user.id;
      
      const [stats] = await db.query(`
        SELECT 
          COUNT(DISTINCT ID_BUKU) as total_books_viewed,
          COUNT(*) as total_views,
          DATE(viewed_at) as date,
          COUNT(*) as daily_views
        FROM MELIHAT
        WHERE ID_USER = ?
        GROUP BY DATE(viewed_at)
        ORDER BY DATE(viewed_at) DESC
        LIMIT 30
      `, [userId]);
      
      ResponseHandler.success(res, {
        total_books_viewed: stats.reduce((sum, day) => sum + day.total_books_viewed, 0),
        total_views: stats.reduce((sum, day) => sum + day.total_views, 0),
        daily_stats: stats
      });
      
    } catch (error) {
      console.error('Get view stats error:', error);
      ResponseHandler.error(res, 'Gagal mengambil statistik melihat');
    }
  }
}

module.exports = MelihatController;