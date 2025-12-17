const Buku = require('../db/models/buku');
const Bab = require('../db/models/bab');
const Review = require('../db/models/review');
const Kategori = require('../db/models/kategori');
const Genre = require('../db/models/genre');
const ResponseHandler = require('../utils/response');
const slugify = require('slugify');
const path = require('path');
const fs = require('fs');

class BukuController {
  // Get all books with filters
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 12, 
        genre, 
        search, 
        minPrice, 
        maxPrice,
        sortBy = 'ID_BUKU',
        sortOrder = 'DESC'
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      const filters = {
        limit: parseInt(limit),
        offset: offset,
        sortBy,
        sortOrder
      };
      
      if (genre) filters.genre = parseInt(genre);
      if (search) filters.search = search;
      if (minPrice) filters.minPrice = parseInt(minPrice);
      if (maxPrice) filters.maxPrice = parseInt(maxPrice);
      if (req.query.status) filters.status = req.query.status;
      
      const books = await Buku.findAll(filters);
      
      // Get total count for pagination
      let countSql = `SELECT COUNT(DISTINCT b.ID_BUKU) as total FROM BUKU b`;
      const countParams = [];
      
      if (genre) {
        countSql += ` JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU WHERE k.ID_GENRE = ?`;
        countParams.push(genre);
      }
      
      if (search) {
        countSql += countParams.length > 0 ? ' AND' : ' WHERE';
        countSql += ' (b.JUDUL LIKE ? OR b.DESKRIPSI LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }
      
      if (minPrice) {
        countSql += countParams.length > 0 ? ' AND' : ' WHERE';
        countSql += ' b.HARGA >= ?';
        countParams.push(minPrice);
      }
      
      if (maxPrice) {
        countSql += countParams.length > 0 ? ' AND' : ' WHERE';
        countSql += ' b.HARGA <= ?';
        countParams.push(maxPrice);
      }
      
      const [countResult] = await db.query(countSql, countParams);
      
      // Get available genres for filter
      const [genres] = await db.query(`
        SELECT g.*, COUNT(k.ID_BUKU) as book_count 
        FROM GENRE g 
        LEFT JOIN KATEGORI k ON g.ID_GENRE = k.ID_GENRE 
        GROUP BY g.ID_GENRE
      `);
      
      ResponseHandler.success(res, {
        books,
        filters: {
          genres,
          priceRange: {
            min: await Buku.getMinPrice(),
            max: await Buku.getMaxPrice()
          }
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
      
    } catch (error) {
      console.error('Get all books error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data buku');
    }
  }
  
  // Get book by ID
  static async getById(req, res) {
    try {
      const bookId = parseInt(req.params.id);
      
      const book = await Buku.findById(bookId);
      if (!book) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      // Increment view count
      await db.query(
        'INSERT INTO MELIHAT (ID_USER, ID_BUKU) VALUES (?, ?) ON DUPLICATE KEY UPDATE viewed_at = NOW()',
        [req.user?.id || null, bookId]
      );
      
      // Get chapters
      const chapters = await Bab.findByBookId(bookId);
      
      // Get reviews
      const reviews = await Review.findByBookId(bookId);
      
      // Get related books
      const [relatedBooks] = await db.query(`
        SELECT DISTINCT b2.* 
        FROM BUKU b1
        JOIN KATEGORI k1 ON b1.ID_BUKU = k1.ID_BUKU
        JOIN KATEGORI k2 ON k1.ID_GENRE = k2.ID_GENRE
        JOIN BUKU b2 ON k2.ID_BUKU = b2.ID_BUKU
        WHERE b1.ID_BUKU = ? AND b2.ID_BUKU != ?
        LIMIT 6
      `, [bookId, bookId]);
      
      ResponseHandler.success(res, {
        ...book,
        chapters,
        reviews,
        relatedBooks
      });
      
    } catch (error) {
      console.error('Get book by ID error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data buku');
    }
  }
  
  // Get book by slug
  static async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      
      const book = await Buku.findBySlug(slug);
      if (!book) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      ResponseHandler.success(res, book);
      
    } catch (error) {
      console.error('Get book by slug error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data buku');
    }
  }
  
  // Create new book
  static async create(req, res) {
    try {
      const { judul, deskripsi, harga, genre_ids, status = 'draft' } = req.body;
      
      // Validation
      if (!judul || !deskripsi || !harga) {
        return ResponseHandler.badRequest(res, 'Judul, deskripsi, dan harga wajib diisi');
      }
      
      // Create slug
      const slug = slugify(judul, {
        lower: true,
        strict: true,
        locale: 'id'
      }) + '-' + Date.now();
      
      // Handle cover upload
      let coverPath = null;
      if (req.file) {
        coverPath = `/uploads/book-covers/${req.file.filename}`;
      }
      
      // Create book
      const bookData = {
        judul,
        slug_buku: slug,
        deskripsi,
        harga: parseInt(harga),
        status,
        cover: coverPath
      };
      
      const book = await Buku.create(bookData);
      
      // Add genres/categories
      if (genre_ids && Array.isArray(genre_ids)) {
        for (const genreId of genre_ids) {
          await db.query(
            'INSERT INTO KATEGORI (ID_BUKU, ID_GENRE, NAMA_KTG) VALUES (?, ?, (SELECT NAMA_GENRE FROM GENRE WHERE ID_GENRE = ?))',
            [book.id, genreId, genreId]
          );
        }
      }
      
      ResponseHandler.created(res, book, 'Buku berhasil dibuat');
      
    } catch (error) {
      console.error('Create book error:', error);
      
      // Delete uploaded file if book creation failed
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', 'book-covers', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      ResponseHandler.error(res, 'Gagal membuat buku');
    }
  }
  
  // Update book
  static async update(req, res) {
    try {
      const bookId = parseInt(req.params.id);
      
      // Check if book exists
      const existingBook = await Buku.findById(bookId);
      if (!existingBook) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      // Check permission (admin or author who owns the book)
      const isAdmin = req.user.role === 'admin';
      const isAuthor = req.user.role === 'author';
      
      if (!isAdmin) {
        // Check if author owns this book
        const [ownership] = await db.query(
          'SELECT 1 FROM TRANSAKSI t JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI WHERE b.ID_BUKU = ? AND t.ID_USER = ?',
          [bookId, req.user.id]
        );
        
        if (!ownership.length && !isAdmin) {
          return ResponseHandler.forbidden(res, 'Tidak memiliki izin untuk mengedit buku ini');
        }
      }
      
      const updateData = {};
      
      // Update fields
      if (req.body.judul) {
        updateData.judul = req.body.judul;
        updateData.slug_buku = slugify(req.body.judul, {
          lower: true,
          strict: true,
          locale: 'id'
        }) + '-' + Date.now();
      }
      
      if (req.body.deskripsi) updateData.deskripsi = req.body.deskripsi;
      if (req.body.harga) updateData.harga = parseInt(req.body.harga);
      if (req.body.status) updateData.status = req.body.status;
      
      // Handle cover update
      if (req.file) {
        updateData.cover = `/uploads/book-covers/${req.file.filename}`;
        
        // Delete old cover if exists
        if (existingBook.COVER && existingBook.COVER.startsWith('/uploads/book-covers/')) {
          const oldCoverPath = path.join(__dirname, '..', existingBook.COVER);
          if (fs.existsSync(oldCoverPath)) {
            fs.unlinkSync(oldCoverPath);
          }
        }
      }
      
      // Update genres if provided
      if (req.body.genre_ids && Array.isArray(req.body.genre_ids)) {
        // Delete existing categories
        await db.query('DELETE FROM KATEGORI WHERE ID_BUKU = ?', [bookId]);
        
        // Add new categories
        for (const genreId of req.body.genre_ids) {
          await db.query(
            'INSERT INTO KATEGORI (ID_BUKU, ID_GENRE, NAMA_KTG) VALUES (?, ?, (SELECT NAMA_GENRE FROM GENRE WHERE ID_GENRE = ?))',
            [bookId, genreId, genreId]
          );
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        await Buku.update(bookId, updateData);
      }
      
      const updatedBook = await Buku.findById(bookId);
      
      ResponseHandler.success(res, updatedBook, 'Buku berhasil diupdate');
      
    } catch (error) {
      console.error('Update book error:', error);
      ResponseHandler.error(res, 'Gagal mengupdate buku');
    }
  }
  
  // Delete book
  static async delete(req, res) {
    try {
      const bookId = parseInt(req.params.id);
      
      const book = await Buku.findById(bookId);
      if (!book) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      // Check if book has transactions (prevent deletion if already purchased)
      const [transactions] = await db.query(
        'SELECT COUNT(*) as count FROM TRANSAKSI WHERE ID_BUKU = ?',
        [bookId]
      );
      
      if (transactions[0].count > 0) {
        return ResponseHandler.badRequest(res, 'Tidak bisa menghapus buku yang sudah memiliki transaksi');
      }
      
      // Delete cover file if exists
      if (book.COVER && book.COVER.startsWith('/uploads/book-covers/')) {
        const coverPath = path.join(__dirname, '..', book.COVER);
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath);
        }
      }
      
      await Buku.delete(bookId);
      
      ResponseHandler.success(res, null, 'Buku berhasil dihapus');
      
    } catch (error) {
      console.error('Delete book error:', error);
      ResponseHandler.error(res, 'Gagal menghapus buku');
    }
  }
  
  // Search books
  static async search(req, res) {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return ResponseHandler.badRequest(res, 'Kata kunci pencarian minimal 2 karakter');
      }
      
      const [books] = await db.query(`
        SELECT b.*, 
          GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres
        FROM BUKU b
        LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        WHERE b.JUDUL LIKE ? OR b.DESKRIPSI LIKE ? OR g.NAMA_GENRE LIKE ?
        GROUP BY b.ID_BUKU
        LIMIT ?
      `, [`%${q}%`, `%${q}%`, `%${q}%`, parseInt(limit)]);
      
      ResponseHandler.success(res, {
        query: q,
        results: books,
        count: books.length
      });
      
    } catch (error) {
      console.error('Search books error:', error);
      ResponseHandler.error(res, 'Gagal mencari buku');
    }
  }
  
  // Get popular books
  static async getPopular(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const popularBooks = await Buku.getPopular(parseInt(limit));
      
      ResponseHandler.success(res, popularBooks);
      
    } catch (error) {
      console.error('Get popular books error:', error);
      ResponseHandler.error(res, 'Gagal mengambil buku populer');
    }
  }
  
  // Get books by current author
  static async getMyBooks(req, res) {
    try {
      const authorId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT b.*, 
          GROUP_CONCAT(DISTINCT g.NAMA_GENRE) as genres,
          COUNT(DISTINCT t.ID_TRANSAKSI) as sales_count,
          SUM(t.TOTAL_HARGA) as total_revenue
        FROM BUKU b
        LEFT JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI
        LEFT JOIN KATEGORI k ON b.ID_BUKU = k.ID_BUKU
        LEFT JOIN GENRE g ON k.ID_GENRE = g.ID_GENRE
        WHERE t.ID_USER = ?
      `;
      
      const params = [authorId];
      
      if (status) {
        sql += ' AND b.STATUS = ?';
        params.push(status);
      }
      
      sql += ' GROUP BY b.ID_BUKU ORDER BY b.ID_BUKU DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [books] = await db.query(sql, params);
      
      // Get total count
      let countSql = `
        SELECT COUNT(DISTINCT b.ID_BUKU) as total 
        FROM BUKU b
        JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI
        WHERE t.ID_USER = ?
      `;
      const countParams = [authorId];
      
      if (status) {
        countSql += ' AND b.STATUS = ?';
        countParams.push(status);
      }
      
      const [countResult] = await db.query(countSql, countParams);
      
      ResponseHandler.success(res, {
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
      
    } catch (error) {
      console.error('Get my books error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data buku');
    }
  }
  
  // Update book status (admin only)
  static async updateStatus(req, res) {
    try {
      const bookId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['active', 'inactive', 'draft'].includes(status)) {
        return ResponseHandler.badRequest(res, 'Status tidak valid');
      }
      
      const book = await Buku.findById(bookId);
      if (!book) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      await Buku.update(bookId, { status });
      
      ResponseHandler.success(res, null, `Status buku berhasil diubah menjadi ${status}`);
      
    } catch (error) {
      console.error('Update book status error:', error);
      ResponseHandler.error(res, 'Gagal mengubah status buku');
    }
  }
}

module.exports = BukuController;