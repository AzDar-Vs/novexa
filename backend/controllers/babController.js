const Bab = require('../db/models/bab');
const Buku = require('../db/models/buku');
const ResponseHandler = require('../utils/response');

class BabController {
  // Get all chapters for a book
  static async getByBook(req, res) {
    try {
      const bookId = parseInt(req.params.bookId);
      
      // Check if book exists
      const book = await Buku.findById(bookId);
      if (!book) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      // Check if user has access to the book
      const hasAccess = await BabController.checkBookAccess(req.user, bookId);
      if (!hasAccess) {
        return ResponseHandler.forbidden(res, 'Tidak memiliki akses ke buku ini');
      }
      
      const chapters = await Bab.findByBookId(bookId);
      
      ResponseHandler.success(res, {
        book: {
          id: book.ID_BUKU,
          judul: book.JUDUL,
          slug: book.SLUG_BUKU
        },
        chapters
      });
      
    } catch (error) {
      console.error('Get chapters error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data bab');
    }
  }
  
  // Get specific chapter
  static async getById(req, res) {
    try {
      const chapterId = parseInt(req.params.id);
      
      const chapter = await Bab.findById(chapterId);
      if (!chapter) {
        return ResponseHandler.notFound(res, 'Bab tidak ditemukan');
      }
      
      // Check if user has access to the book
      const hasAccess = await BabController.checkBookAccess(req.user, chapter.ID_BUKU);
      if (!hasAccess) {
        return ResponseHandler.forbidden(res, 'Tidak memiliki akses ke bab ini');
      }
      
      // Get previous and next chapter
      const [adjacentChapters] = await db.query(`
        SELECT 
          (SELECT ID_BAB FROM BAB_BUKU WHERE ID_BUKU = ? AND NOMER_BAB < ? ORDER BY NOMER_BAB DESC LIMIT 1) as prev_id,
          (SELECT ID_BAB FROM BAB_BUKU WHERE ID_BUKU = ? AND NOMER_BAB > ? ORDER BY NOMER_BAB ASC LIMIT 1) as next_id
      `, [chapter.ID_BUKU, chapter.NOMER_BAB, chapter.ID_BUKU, chapter.NOMER_BAB]);
      
      ResponseHandler.success(res, {
        chapter,
        navigation: adjacentChapters[0]
      });
      
    } catch (error) {
      console.error('Get chapter error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data bab');
    }
  }
  
  // Create new chapter
  static async create(req, res) {
    try {
      const bookId = parseInt(req.params.bookId);
      const { judul_bab, isi, nomer_bab } = req.body;
      
      // Validation
      if (!judul_bab || !isi || !nomer_bab) {
        return ResponseHandler.badRequest(res, 'Judul, isi, dan nomor bab wajib diisi');
      }
      
      // Check if book exists
      const book = await Buku.findById(bookId);
      if (!book) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      // Check if user is author of this book
      const isAuthorized = await BabController.checkBookOwnership(req.user, bookId);
      if (!isAuthorized) {
        return ResponseHandler.forbidden(res, 'Tidak memiliki izin untuk menambah bab pada buku ini');
      }
      
      // Check if chapter number already exists
      const [existingChapter] = await db.query(
        'SELECT ID_BAB FROM BAB_BUKU WHERE ID_BUKU = ? AND NOMER_BAB = ?',
        [bookId, nomer_bab]
      );
      
      if (existingChapter.length > 0) {
        return ResponseHandler.badRequest(res, 'Nomor bab sudah digunakan');
      }
      
      // Create chapter
      const chapterData = {
        id_buku: bookId,
        judul_bab,
        isi,
        nomer_bab: parseInt(nomer_bab)
      };
      
      const chapter = await Bab.create(chapterData);
      
      ResponseHandler.created(res, chapter, 'Bab berhasil dibuat');
      
    } catch (error) {
      console.error('Create chapter error:', error);
      ResponseHandler.error(res, 'Gagal membuat bab');
    }
  }
  
  // Update chapter
  static async update(req, res) {
    try {
      const chapterId = parseInt(req.params.id);
      const { judul_bab, isi, nomer_bab } = req.body;
      
      // Get existing chapter
      const existingChapter = await Bab.findById(chapterId);
      if (!existingChapter) {
        return ResponseHandler.notFound(res, 'Bab tidak ditemukan');
      }
      
      // Check if user is author of this book
      const isAuthorized = await BabController.checkBookOwnership(req.user, existingChapter.ID_BUKU);
      if (!isAuthorized) {
        return ResponseHandler.forbidden(res, 'Tidak memiliki izin untuk mengedit bab ini');
      }
      
      const updateData = {};
      if (judul_bab) updateData.judul_bab = judul_bab;
      if (isi) updateData.isi = isi;
      
      // Handle chapter number change
      if (nomer_bab && nomer_bab !== existingChapter.NOMER_BAB) {
        // Check if new number already exists
        const [existingNumber] = await db.query(
          'SELECT ID_BAB FROM BAB_BUKU WHERE ID_BUKU = ? AND NOMER_BAB = ? AND ID_BAB != ?',
          [existingChapter.ID_BUKU, nomer_bab, chapterId]
        );
        
        if (existingNumber.length > 0) {
          return ResponseHandler.badRequest(res, 'Nomor bab sudah digunakan');
        }
        
        updateData.nomer_bab = parseInt(nomer_bab);
      }
      
      if (Object.keys(updateData).length > 0) {
        await Bab.update(chapterId, updateData);
      }
      
      const updatedChapter = await Bab.findById(chapterId);
      
      ResponseHandler.success(res, updatedChapter, 'Bab berhasil diupdate');
      
    } catch (error) {
      console.error('Update chapter error:', error);
      ResponseHandler.error(res, 'Gagal mengupdate bab');
    }
  }
  
  // Delete chapter
  static async delete(req, res) {
    try {
      const chapterId = parseInt(req.params.id);
      
      const chapter = await Bab.findById(chapterId);
      if (!chapter) {
        return ResponseHandler.notFound(res, 'Bab tidak ditemukan');
      }
      
      // Check if user is author of this book
      const isAuthorized = await BabController.checkBookOwnership(req.user, chapter.ID_BUKU);
      if (!isAuthorized) {
        return ResponseHandler.forbidden(res, 'Tidak memiliki izin untuk menghapus bab ini');
      }
      
      await Bab.delete(chapterId);
      
      ResponseHandler.success(res, null, 'Bab berhasil dihapus');
      
    } catch (error) {
      console.error('Delete chapter error:', error);
      ResponseHandler.error(res, 'Gagal menghapus bab');
    }
  }
  
  // Reorder chapters
  static async reorder(req, res) {
    try {
      const bookId = parseInt(req.params.bookId);
      const { chapters } = req.body; // Array of { id, order }
      
      if (!Array.isArray(chapters)) {
        return ResponseHandler.badRequest(res, 'Data bab tidak valid');
      }
      
      // Check if user is author of this book
      const isAuthorized = await BabController.checkBookOwnership(req.user, bookId);
      if (!isAuthorized) {
        return ResponseHandler.forbidden(res, 'Tidak memiliki izin untuk mengurutkan bab');
      }
      
      // Update chapter orders in transaction
      await db.transaction(async (connection) => {
        for (const chapter of chapters) {
          await connection.execute(
            'UPDATE BAB_BUKU SET NOMER_BAB = ? WHERE ID_BAB = ? AND ID_BUKU = ?',
            [chapter.order, chapter.id, bookId]
          );
        }
      });
      
      // Get updated chapters
      const updatedChapters = await Bab.findByBookId(bookId);
      
      ResponseHandler.success(res, updatedChapters, 'Urutan bab berhasil diupdate');
      
    } catch (error) {
      console.error('Reorder chapters error:', error);
      ResponseHandler.error(res, 'Gagal mengurutkan bab');
    }
  }
  
  // Helper: Check book access (purchased or author)
  static async checkBookAccess(user, bookId) {
    if (!user) return false;
    
    // Admin has full access
    if (user.role === 'admin') return true;
    
    // Check if user purchased the book
    const [purchase] = await db.query(`
      SELECT 1 FROM TRANSAKSI t
      JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
      WHERE b.ID_BUKU = ? AND t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'completed'
    `, [bookId, user.id]);
    
    if (purchase.length > 0) return true;
    
    // Check if user is the author
    const [ownership] = await db.query(`
      SELECT 1 FROM TRANSAKSI t
      JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
      WHERE b.ID_BUKU = ? AND t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'completed'
    `, [bookId, user.id]);
    
    return ownership.length > 0;
  }
  
  // Helper: Check book ownership (author only)
  static async checkBookOwnership(user, bookId) {
    if (!user) return false;
    
    // Admin can edit any book
    if (user.role === 'admin') return true;
    
    // Check if user is the author of this book
    const [ownership] = await db.query(`
      SELECT 1 FROM TRANSAKSI t
      JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
      WHERE b.ID_BUKU = ? AND t.ID_USER = ?
    `, [bookId, user.id]);
    
    return ownership.length > 0;
  }
}

module.exports = BabController;