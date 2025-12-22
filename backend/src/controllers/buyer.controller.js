const db = require('../config/database');

// ==================== DASHBOARD ====================
exports.getDashboard = async (req, res) => {
  try {
    const buyerId = req.user.id;

    // 1. STATS: Library count
    const [[libraryStats]] = await db.query(`
      SELECT COUNT(DISTINCT ti.ID_BUKU) as libraryCount
      FROM transaksi t
      JOIN transaksi_item ti ON t.ID_TRANSAKSI = ti.ID_TRANSAKSI
      WHERE t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'paid'
    `, [buyerId]);

    // 2. STATS: Reading progress
    const [[readingStats]] = await db.query(`
      SELECT 
        COALESCE(AVG(PROGRESS), 0) as readingProgress,
        COUNT(DISTINCT ID_BUKU) as booksInProgress,
        COUNT(DISTINCT CASE WHEN PROGRESS = 100 THEN ID_BUKU END) as booksCompleted
      FROM melihat
      WHERE ID_USER = ?
    `, [buyerId]);

    // 3. STATS: Cart
    const [[cartStats]] = await db.query(`
      SELECT 
        COUNT(ki.ID_ITEM) as cartItems,
        COALESCE(SUM(b.HARGA), 0) as cartTotal
      FROM keranjang k
      JOIN keranjang_item ki ON k.ID_KRJ = ki.ID_KRJ
      JOIN buku b ON ki.ID_BUKU = b.ID_BUKU
      WHERE k.ID_USER = ?
    `, [buyerId]);

    // 4. STATS: Reviews
    const [[reviewStats]] = await db.query(`
      SELECT 
        COUNT(ID_REVIEW) as reviewCount,
        COALESCE(AVG(RATING), 0) as avgRating
      FROM review
      WHERE ID_USER = ?
    `, [buyerId]);

    // 5. RECENT BOOKS
    const [recentBooks] = await db.query(`
      SELECT 
        b.ID_BUKU as id,
        b.JUDUL as title,
        u.NAMA as author,
        COALESCE(m.PROGRESS, 0) as progress,
        b.COVER,
        b.SLUG_BUKU as slug
      FROM transaksi t
      JOIN transaksi_item ti ON t.ID_TRANSAKSI = ti.ID_TRANSAKSI
      JOIN buku b ON ti.ID_BUKU = b.ID_BUKU
      JOIN user u ON b.ID_USER = u.ID_USER
      LEFT JOIN melihat m ON b.ID_BUKU = m.ID_BUKU AND m.ID_USER = t.ID_USER
      WHERE t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'paid'
      ORDER BY t.CREATED_AT DESC
      LIMIT 4
    `, [buyerId]);

    // 6. RECENT ACTIVITIES
    const [recentActivities] = await db.query(`
      (SELECT 
        'reading' as type,
        b.JUDUL as bookTitle,
        m.LAST_READ_AT as time,
        m.PROGRESS as value,
        b.ID_BUKU as bookId
      FROM melihat m
      JOIN buku b ON m.ID_BUKU = b.ID_BUKU
      WHERE m.ID_USER = ?
      ORDER BY m.LAST_READ_AT DESC
      LIMIT 2)
      
      UNION ALL
      
      (SELECT 
        'review' as type,
        b.JUDUL as bookTitle,
        r.CREATED_AT as time,
        r.RATING as value,
        r.ID_BUKU as bookId
      FROM review r
      JOIN buku b ON r.ID_BUKU = b.ID_BUKU
      WHERE r.ID_USER = ?
      ORDER BY r.CREATED_AT DESC
      LIMIT 2)
      
      ORDER BY time DESC
      LIMIT 4
    `, [buyerId, buyerId]);

    // 7. NOTIFICATIONS
    const [notifications] = await db.query(`
      SELECT 
        ID_NOTIF as id,
        JUDUL as title,
        PESAN as message,
        CREATED_AT as time,
        TANDA_DIBACA as isRead
      FROM notifikasi
      WHERE ID_USER = ?
      ORDER BY CREATED_AT DESC
      LIMIT 5
    `, [buyerId]);

    res.json({
      success: true,
      data: {
        stats: {
          libraryCount: libraryStats.libraryCount || 0,
          purchasedCount: libraryStats.libraryCount || 0,
          readingProgress: Math.round(readingStats.readingProgress) || 0,
          booksInProgress: readingStats.booksInProgress || 0,
          booksCompleted: readingStats.booksCompleted || 0,
          cartItems: cartStats.cartItems || 0,
          cartTotal: cartStats.cartTotal || 0,
          reviewCount: reviewStats.reviewCount || 0,
          avgRating: parseFloat(reviewStats.avgRating || 0).toFixed(1),
          readingTime: Math.round((readingStats.booksCompleted || 0) * 3), // estimasi
          libraryGrowth: 0,
          readingGrowth: 0
        },
        recentBooks: recentBooks,
        recentActivities: recentActivities.map(act => ({
          action: act.type === 'reading' ? 'membaca' : 'review',
          bookTitle: act.bookTitle,
          time: new Date(act.time).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          }),
          progress: act.value,
          bookId: act.bookId
        })),
        notifications: notifications.map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          time: new Date(notif.time).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
          }),
          isRead: notif.isRead === 1
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== LIBRARY ====================
exports.getLibrary = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { search, genre, sort = 'recent' } = req.query;

    let query = `
      SELECT 
        b.ID_BUKU as id,
        b.JUDUL as title,
        b.DESKRIPSI as description,
        b.COVER,
        b.HARGA as price,
        b.IS_FREE,
        b.VIEW_COUNT,
        u.NAMA as author,
        u.ID_USER as authorId,
        COALESCE(m.PROGRESS, 0) as readingProgress,
        m.LAST_READ_AT as lastRead,
        t.CREATED_AT as purchasedDate,
        COALESCE(r.avg_rating, 0) as rating,
        COALESCE(r.review_count, 0) as reviewCount
      FROM transaksi t
      JOIN transaksi_item ti ON t.ID_TRANSAKSI = ti.ID_TRANSAKSI
      JOIN buku b ON ti.ID_BUKU = b.ID_BUKU
      JOIN user u ON b.ID_USER = u.ID_USER
      LEFT JOIN melihat m ON b.ID_BUKU = m.ID_BUKU AND m.ID_USER = ?
      LEFT JOIN (
        SELECT ID_BUKU, 
               AVG(RATING) as avg_rating,
               COUNT(*) as review_count
        FROM review
        GROUP BY ID_BUKU
      ) r ON b.ID_BUKU = r.ID_BUKU
      WHERE t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'paid'
    `;

    const params = [buyerId, buyerId];

    // Filter by search
    if (search) {
      query += ` AND (b.JUDUL LIKE ? OR b.DESKRIPSI LIKE ? OR u.NAMA LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filter by genre
    if (genre) {
      query += ` AND b.ID_BUKU IN (
        SELECT ID_BUKU FROM buku_genre WHERE ID_GENRE = ?
      )`;
      params.push(genre);
    }

    // Sorting
    switch(sort) {
      case 'title':
        query += ` ORDER BY b.JUDUL ASC`;
        break;
      case 'progress':
        query += ` ORDER BY m.PROGRESS DESC, b.JUDUL ASC`;
        break;
      case 'rating':
        query += ` ORDER BY r.avg_rating DESC, b.JUDUL ASC`;
        break;
      case 'recent':
      default:
        query += ` ORDER BY t.CREATED_AT DESC`;
    }

    const [books] = await db.query(query, params);

    // Get genres for each book
    for (let book of books) {
      const [genres] = await db.query(`
        SELECT g.ID_GENRE as id, g.NAMA_GENRE as name
        FROM buku_genre bg
        JOIN genre g ON bg.ID_GENRE = g.ID_GENRE
        WHERE bg.ID_BUKU = ?
      `, [book.id]);
      book.genres = genres;
    }

    res.json({
      success: true,
      data: books
    });

  } catch (error) {
    console.error('Library error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== READING HISTORY ====================
exports.getReadingHistory = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    // Total count
    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) as total
      FROM melihat m
      JOIN buku b ON m.ID_BUKU = b.ID_BUKU
      WHERE m.ID_USER = ?
    `, [buyerId]);

    // Reading history
    const [history] = await db.query(`
      SELECT 
        m.ID_BUKU as bookId,
        b.JUDUL as bookTitle,
        b.COVER,
        u.NAMA as author,
        m.PROGRESS,
        m.LAST_READ_AT as lastRead,
        m.ID_BAB as lastChapterId,
        bb.JUDUL_BAB as lastChapterTitle,
        bb.NOMER_BAB as chapterNumber,
        TIMESTAMPDIFF(MINUTE, m.LAST_READ_AT, NOW()) as minutesAgo
      FROM melihat m
      JOIN buku b ON m.ID_BUKU = b.ID_BUKU
      JOIN user u ON b.ID_USER = u.ID_USER
      LEFT JOIN bab_buku bb ON m.ID_BAB = bb.ID_BAB
      WHERE m.ID_USER = ?
      ORDER BY m.LAST_READ_AT DESC
      LIMIT ? OFFSET ?
    `, [buyerId, parseInt(limit), offset]);

    // Format time ago
    const formattedHistory = history.map(item => {
      let timeAgo = '';
      const minutes = item.minutesAgo;
      
      if (minutes < 60) {
        timeAgo = `${minutes} menit lalu`;
      } else if (minutes < 1440) {
        timeAgo = `${Math.floor(minutes / 60)} jam lalu`;
      } else {
        timeAgo = `${Math.floor(minutes / 1440)} hari lalu`;
      }

      return {
        ...item,
        timeAgo,
        lastRead: new Date(item.lastRead).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });

    res.json({
      success: true,
      data: {
        history: formattedHistory,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Reading history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== MY REVIEWS ====================
exports.getMyReviews = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { bookId, sort = 'recent' } = req.query;

    let query = `
      SELECT 
        r.ID_REVIEW as id,
        r.ID_BUKU as bookId,
        b.JUDUL as bookTitle,
        b.COVER as bookCover,
        u.NAMA as author,
        r.RATING,
        r.KOMENTAR as comment,
        r.CREATED_AT as createdAt,
        r.UPDATED_AT as updatedAt
      FROM review r
      JOIN buku b ON r.ID_BUKU = b.ID_BUKU
      JOIN user u ON b.ID_USER = u.ID_USER
      WHERE r.ID_USER = ?
    `;

    const params = [buyerId];

    if (bookId) {
      query += ` AND r.ID_BUKU = ?`;
      params.push(bookId);
    }

    // Sorting
    switch(sort) {
      case 'rating_high':
        query += ` ORDER BY r.RATING DESC, r.CREATED_AT DESC`;
        break;
      case 'rating_low':
        query += ` ORDER BY r.RATING ASC, r.CREATED_AT DESC`;
        break;
      case 'recent':
      default:
        query += ` ORDER BY r.CREATED_AT DESC`;
    }

    const [reviews] = await db.query(query, params);

    // Get book details for each review
    for (let review of reviews) {
      // Get average rating for the book
      const [[bookStats]] = await db.query(`
        SELECT 
          AVG(RATING) as avgRating,
          COUNT(*) as totalReviews
        FROM review
        WHERE ID_BUKU = ?
      `, [review.bookId]);
      
      review.bookStats = {
        avgRating: parseFloat(bookStats.avgRating || 0).toFixed(1),
        totalReviews: bookStats.totalReviews || 0
      };
    }

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error('My reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== ADD REVIEW ====================
exports.addReview = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { bookId, rating, comment } = req.body;

    // Check if user has purchased the book
    const [[hasPurchased]] = await db.query(`
      SELECT 1
      FROM transaksi t
      JOIN transaksi_item ti ON t.ID_TRANSAKSI = ti.ID_TRANSAKSI
      WHERE t.ID_USER = ? AND ti.ID_BUKU = ? AND t.STATUS_PEMBAYARAN = 'paid'
      LIMIT 1
    `, [buyerId, bookId]);

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'Anda harus membeli buku terlebih dahulu sebelum memberikan review'
      });
    }

    // Check if already reviewed
    const [[existingReview]] = await db.query(`
      SELECT ID_REVIEW FROM review WHERE ID_USER = ? AND ID_BUKU = ?
    `, [buyerId, bookId]);

    if (existingReview) {
      // Update existing review
      await db.query(`
        UPDATE review 
        SET RATING = ?, KOMENTAR = ?, UPDATED_AT = NOW()
        WHERE ID_USER = ? AND ID_BUKU = ?
      `, [rating, comment, buyerId, bookId]);

      return res.json({
        success: true,
        message: 'Review berhasil diperbarui'
      });
    }

    // Add new review
    await db.query(`
      INSERT INTO review (ID_USER, ID_BUKU, RATING, KOMENTAR, CREATED_AT, UPDATED_AT)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [buyerId, bookId, rating, comment]);

    res.json({
      success: true,
      message: 'Review berhasil ditambahkan'
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== DELETE REVIEW ====================
exports.deleteReview = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { reviewId } = req.params;

    // Check if review belongs to user
    const [[review]] = await db.query(`
      SELECT ID_REVIEW FROM review WHERE ID_REVIEW = ? AND ID_USER = ?
    `, [reviewId, buyerId]);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan atau tidak memiliki akses'
      });
    }

    await db.query(`DELETE FROM review WHERE ID_REVIEW = ?`, [reviewId]);

    res.json({
      success: true,
      message: 'Review berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== UPDATE READING PROGRESS ====================
exports.updateReadingProgress = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { bookId, chapterId, progress } = req.body;

    // Check if user has purchased the book
    const [[hasPurchased]] = await db.query(`
      SELECT 1
      FROM transaksi t
      JOIN transaksi_item ti ON t.ID_TRANSAKSI = ti.ID_TRANSAKSI
      WHERE t.ID_USER = ? AND ti.ID_BUKU = ? AND t.STATUS_PEMBAYARAN = 'paid'
      LIMIT 1
    `, [buyerId, bookId]);

    if (!hasPurchased) {
      // Check if book is free
      const [[isFree]] = await db.query(`
        SELECT IS_FREE FROM buku WHERE ID_BUKU = ?
      `, [bookId]);

      if (!isFree || isFree.IS_FREE !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Anda belum membeli buku ini'
        });
      }
    }

    // Update or insert reading progress
    const [[existing]] = await db.query(`
      SELECT 1 FROM melihat WHERE ID_USER = ? AND ID_BUKU = ?
    `, [buyerId, bookId]);

    if (existing) {
      await db.query(`
        UPDATE melihat 
        SET ID_BAB = ?, PROGRESS = ?, LAST_READ_AT = NOW()
        WHERE ID_USER = ? AND ID_BUKU = ?
      `, [chapterId, progress, buyerId, bookId]);
    } else {
      await db.query(`
        INSERT INTO melihat (ID_USER, ID_BUKU, ID_BAB, PROGRESS, LAST_READ_AT)
        VALUES (?, ?, ?, ?, NOW())
      `, [buyerId, bookId, chapterId, progress]);
    }

    res.json({
      success: true,
      message: 'Progress membaca diperbarui'
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};