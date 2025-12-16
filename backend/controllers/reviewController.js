const Review = require('../db/models/review');
const Buku = require('../db/models/buku');
const Transaksi = require('../db/models/transaksi');
const ResponseHandler = require('../utils/response');

class ReviewController {
  // Get reviews for a book
  static async getByBook(req, res) {
    try {
      const bookId = parseInt(req.params.bookId);
      
      // Check if book exists
      const book = await Buku.findById(bookId);
      if (!book) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      const { page = 1, limit = 10, rating } = req.query;
      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT 
          r.*,
          u.NAMA as user_nama,
          u.AVATAR as user_avatar,
          u.ROLE as user_role
        FROM REVIEW r
        JOIN \`user\` u ON r.ID_USER = u.ID_USER
        WHERE r.ID_BUKU = ?
      `;
      
      const params = [bookId];
      
      if (rating) {
        sql += ' AND r.RATING = ?';
        params.push(parseInt(rating));
      }
      
      sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [reviews] = await db.query(sql, params);
      
      // Get rating statistics
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(RATING) as average_rating,
          COUNT(CASE WHEN RATING = 5 THEN 1 END) as rating_5,
          COUNT(CASE WHEN RATING = 4 THEN 1 END) as rating_4,
          COUNT(CASE WHEN RATING = 3 THEN 1 END) as rating_3,
          COUNT(CASE WHEN RATING = 2 THEN 1 END) as rating_2,
          COUNT(CASE WHEN RATING = 1 THEN 1 END) as rating_1
        FROM REVIEW 
        WHERE ID_BUKU = ?
      `, [bookId]);
      
      // Get user's review if logged in
      let userReview = null;
      if (req.user) {
        const [userReviewData] = await db.query(
          'SELECT * FROM REVIEW WHERE ID_BUKU = ? AND ID_USER = ?',
          [bookId, req.user.id]
        );
        
        if (userReviewData.length > 0) {
          userReview = userReviewData[0];
        }
      }
      
      ResponseHandler.success(res, {
        book: {
          id: book.ID_BUKU,
          judul: book.JUDUL,
          slug: book.SLUG_BUKU
        },
        reviews,
        statistics: {
          ...stats[0],
          average_rating: parseFloat(stats[0].average_rating || 0).toFixed(1)
        },
        user_review: userReview,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
      
    } catch (error) {
      console.error('Get reviews error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data review');
    }
  }
  
  // Create review
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const { book_id, rating, komentar } = req.body;
      
      // Validation
      if (!book_id || !rating) {
        return ResponseHandler.badRequest(res, 'ID buku dan rating wajib diisi');
      }
      
      if (rating < 1 || rating > 5) {
        return ResponseHandler.badRequest(res, 'Rating harus antara 1-5');
      }
      
      // Check if book exists
      const book = await Buku.findById(book_id);
      if (!book) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      // Check if user has purchased the book
      const [purchase] = await db.query(`
        SELECT 1 FROM TRANSAKSI t
        JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
        WHERE b.ID_BUKU = ? AND t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'completed'
      `, [book_id, userId]);
      
      if (purchase.length === 0) {
        return ResponseHandler.forbidden(res, 'Hanya bisa memberikan review untuk buku yang telah dibeli');
      }
      
      // Check if user already reviewed this book
      const [existingReview] = await db.query(
        'SELECT ID_REVIEW FROM REVIEW WHERE ID_BUKU = ? AND ID_USER = ?',
        [book_id, userId]
      );
      
      if (existingReview.length > 0) {
        return ResponseHandler.badRequest(res, 'Anda sudah memberikan review untuk buku ini');
      }
      
      // Create review
      const reviewData = {
        id_user: userId,
        id_buku: book_id,
        rating: parseInt(rating),
        komentar: komentar || ''
      };
      
      const review = await Review.create(reviewData);
      
      ResponseHandler.created(res, review, 'Review berhasil ditambahkan');
      
    } catch (error) {
      console.error('Create review error:', error);
      ResponseHandler.error(res, 'Gagal menambahkan review');
    }
  }
  
  // Update review
  static async update(req, res) {
    try {
      const reviewId = parseInt(req.params.id);
      const userId = req.user.id;
      const { rating, komentar } = req.body;
      
      // Get existing review
      const [existingReview] = await db.query(
        'SELECT * FROM REVIEW WHERE ID_REVIEW = ?',
        [reviewId]
      );
      
      if (existingReview.length === 0) {
        return ResponseHandler.notFound(res, 'Review tidak ditemukan');
      }
      
      const review = existingReview[0];
      
      // Check if user owns this review
      if (review.ID_USER !== userId && req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Tidak memiliki izin untuk mengedit review ini');
      }
      
      const updateData = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return ResponseHandler.badRequest(res, 'Rating harus antara 1-5');
        }
        updateData.rating = parseInt(rating);
      }
      
      if (komentar !== undefined) {
        updateData.komentar = komentar;
      }
      
      if (Object.keys(updateData).length === 0) {
        return ResponseHandler.badRequest(res, 'Tidak ada data yang diupdate');
      }
      
      await db.query(
        'UPDATE REVIEW SET ? WHERE ID_REVIEW = ?',
        [updateData, reviewId]
      );
      
      const [updatedReview] = await db.query(
        'SELECT * FROM REVIEW WHERE ID_REVIEW = ?',
        [reviewId]
      );
      
      ResponseHandler.success(res, updatedReview[0], 'Review berhasil diupdate');
      
    } catch (error) {
      console.error('Update review error:', error);
      ResponseHandler.error(res, 'Gagal mengupdate review');
    }
  }
  
  // Delete review
  static async delete(req, res) {
    try {
      const reviewId = parseInt(req.params.id);
      
      // Get existing review
      const [existingReview] = await db.query(
        'SELECT * FROM REVIEW WHERE ID_REVIEW = ?',
        [reviewId]
      );
      
      if (existingReview.length === 0) {
        return ResponseHandler.notFound(res, 'Review tidak ditemukan');
      }
      
      const review = existingReview[0];
      
      // Check if user owns this review or is admin
      if (review.ID_USER !== req.user.id && req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Tidak memiliki izin untuk menghapus review ini');
      }
      
      await db.query('DELETE FROM REVIEW WHERE ID_REVIEW = ?', [reviewId]);
      
      ResponseHandler.success(res, null, 'Review berhasil dihapus');
      
    } catch (error) {
      console.error('Delete review error:', error);
      ResponseHandler.error(res, 'Gagal menghapus review');
    }
  }
  
  // Get user's reviews
  static async getUserReviews(req, res) {
    try {
      const userId = req.params.userId ? parseInt(req.params.userId) : req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const [reviews] = await db.query(`
        SELECT 
          r.*,
          b.JUDUL as book_title,
          b.SLUG_BUKU as book_slug,
          b.COVER as book_cover
        FROM REVIEW r
        JOIN BUKU b ON r.ID_BUKU = b.ID_BUKU
        WHERE r.ID_USER = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, parseInt(limit), offset]);
      
      // Get total count
      const [countResult] = await db.query(
        'SELECT COUNT(*) as total FROM REVIEW WHERE ID_USER = ?',
        [userId]
      );
      
      ResponseHandler.success(res, {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
      
    } catch (error) {
      console.error('Get user reviews error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data review');
    }
  }
  
  // Get recent reviews
  static async getRecent(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const [reviews] = await db.query(`
        SELECT 
          r.*,
          b.JUDUL as book_title,
          b.SLUG_BUKU as book_slug,
          b.COVER as book_cover,
          u.NAMA as user_name,
          u.AVATAR as user_avatar
        FROM REVIEW r
        JOIN BUKU b ON r.ID_BUKU = b.ID_BUKU
        JOIN \`user\` u ON r.ID_USER = u.ID_USER
        ORDER BY r.created_at DESC
        LIMIT ?
      `, [parseInt(limit)]);
      
      ResponseHandler.success(res, reviews);
      
    } catch (error) {
      console.error('Get recent reviews error:', error);
      ResponseHandler.error(res, 'Gagal mengambil review terbaru');
    }
  }
  
  // Get helpful reviews (most liked)
  static async getHelpful(req, res) {
    try {
      const { limit = 10, book_id } = req.query;
      
      let sql = `
        SELECT 
          r.*,
          b.JUDUL as book_title,
          b.SLUG_BUKU as book_slug,
          u.NAMA as user_name,
          u.AVATAR as user_avatar,
          COUNT(l.ID_USER) as helpful_count
        FROM REVIEW r
        JOIN BUKU b ON r.ID_BUKU = b.ID_BUKU
        JOIN \`user\` u ON r.ID_USER = u.ID_USER
        LEFT JOIN REVIEW_LIKE l ON r.ID_REVIEW = l.ID_REVIEW
      `;
      
      const params = [];
      
      if (book_id) {
        sql += ' WHERE r.ID_BUKU = ?';
        params.push(book_id);
      }
      
      sql += ' GROUP BY r.ID_REVIEW ORDER BY helpful_count DESC LIMIT ?';
      params.push(parseInt(limit));
      
      const [reviews] = await db.query(sql, params);
      
      ResponseHandler.success(res, reviews);
      
    } catch (error) {
      console.error('Get helpful reviews error:', error);
      ResponseHandler.error(res, 'Gagal mengambil review terpopuler');
    }
  }
  
  // Mark review as helpful
  static async markHelpful(req, res) {
    try {
      const reviewId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if review exists
      const [review] = await db.query(
        'SELECT ID_REVIEW FROM REVIEW WHERE ID_REVIEW = ?',
        [reviewId]
      );
      
      if (review.length === 0) {
        return ResponseHandler.notFound(res, 'Review tidak ditemukan');
      }
      
      // Check if already marked as helpful
      const [existing] = await db.query(
        'SELECT 1 FROM REVIEW_LIKE WHERE ID_REVIEW = ? AND ID_USER = ?',
        [reviewId, userId]
      );
      
      if (existing.length > 0) {
        // Unlike
        await db.query(
          'DELETE FROM REVIEW_LIKE WHERE ID_REVIEW = ? AND ID_USER = ?',
          [reviewId, userId]
        );
        
        const [newCount] = await db.query(
          'SELECT COUNT(*) as count FROM REVIEW_LIKE WHERE ID_REVIEW = ?',
          [reviewId]
        );
        
        ResponseHandler.success(res, {
          helpful: false,
          count: newCount[0].count
        }, 'Review tidak lagi ditandai sebagai membantu');
      } else {
        // Like
        await db.query(
          'INSERT INTO REVIEW_LIKE (ID_REVIEW, ID_USER) VALUES (?, ?)',
          [reviewId, userId]
        );
        
        const [newCount] = await db.query(
          'SELECT COUNT(*) as count FROM REVIEW_LIKE WHERE ID_REVIEW = ?',
          [reviewId]
        );
        
        ResponseHandler.success(res, {
          helpful: true,
          count: newCount[0].count
        }, 'Review ditandai sebagai membantu');
      }
      
    } catch (error) {
      console.error('Mark helpful error:', error);
      ResponseHandler.error(res, 'Gagal menandai review');
    }
  }
}

module.exports = ReviewController;