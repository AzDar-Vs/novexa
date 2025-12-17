const Keranjang = require('../db/models/keranjang');
const Buku = require('../db/models/buku');
const ResponseHandler = require('../utils/response');

class KeranjangController {
  // Get user's cart
  static async getCart(req, res) {
    try {
      const userId = req.user.id;
      
      const cartItems = await Keranjang.findByUserId(userId);
      
      // Calculate total
      let total = 0;
      const items = cartItems.map(item => {
        const itemTotal = item.HARGA || 0;
        total += itemTotal;
        
        return {
          id: item.ID_KRJ,
          book_id: item.ID_BUKU,
          judul: item.JUDUL,
          harga: item.HARGA,
          cover: item.COVER,
          slug: item.SLUG_BUKU
        };
      });
      
      ResponseHandler.success(res, {
        items,
        summary: {
          total_items: items.length,
          total_harga: total
        }
      });
      
    } catch (error) {
      console.error('Get cart error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data keranjang');
    }
  }
  
  // Add item to cart
  static async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { book_id } = req.body;
      
      if (!book_id) {
        return ResponseHandler.badRequest(res, 'ID buku wajib diisi');
      }
      
      // Check if book exists and is active
      const book = await Buku.findById(book_id);
      if (!book) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan');
      }
      
      if (book.STATUS !== 'active') {
        return ResponseHandler.badRequest(res, 'Buku tidak tersedia untuk dibeli');
      }
      
      // Check if user already owns the book
      const [ownership] = await db.query(`
        SELECT 1 FROM TRANSAKSI t
        JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
        WHERE b.ID_BUKU = ? AND t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'completed'
      `, [book_id, userId]);
      
      if (ownership.length > 0) {
        return ResponseHandler.badRequest(res, 'Anda sudah memiliki buku ini');
      }
      
      // Check if already in cart
      const [existing] = await db.query(
        'SELECT ID_KRJ FROM KERANJANG WHERE ID_USER = ? AND ID_BUKU = ?',
        [userId, book_id]
      );
      
      if (existing.length > 0) {
        return ResponseHandler.badRequest(res, 'Buku sudah ada di keranjang');
      }
      
      // Add to cart
      const cartItem = await Keranjang.addToCart(userId, book_id);
      
      ResponseHandler.created(res, cartItem, 'Buku berhasil ditambahkan ke keranjang');
      
    } catch (error) {
      console.error('Add to cart error:', error);
      ResponseHandler.error(res, 'Gagal menambahkan buku ke keranjang');
    }
  }
  
  // Remove item from cart
  static async removeFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { book_id } = req.params;
      
      if (!book_id) {
        return ResponseHandler.badRequest(res, 'ID buku wajib diisi');
      }
      
      // Check if item exists in cart
      const [existing] = await db.query(
        'SELECT ID_KRJ FROM KERANJANG WHERE ID_USER = ? AND ID_BUKU = ?',
        [userId, book_id]
      );
      
      if (existing.length === 0) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan di keranjang');
      }
      
      await Keranjang.removeFromCart(userId, book_id);
      
      ResponseHandler.success(res, null, 'Buku berhasil dihapus dari keranjang');
      
    } catch (error) {
      console.error('Remove from cart error:', error);
      ResponseHandler.error(res, 'Gagal menghapus buku dari keranjang');
    }
  }
  
  // Update cart item quantity (if applicable)
  static async updateQuantity(req, res) {
    try {
      const userId = req.user.id;
      const { book_id } = req.params;
      const { quantity } = req.body;
      
      if (!book_id || !quantity || quantity < 1) {
        return ResponseHandler.badRequest(res, 'Data tidak valid');
      }
      
      // Check if item exists in cart
      const [existing] = await db.query(
        'SELECT ID_KRJ FROM KERANJANG WHERE ID_USER = ? AND ID_BUKU = ?',
        [userId, book_id]
      );
      
      if (existing.length === 0) {
        return ResponseHandler.notFound(res, 'Buku tidak ditemukan di keranjang');
      }
      
      // For ebook platform, quantity is usually 1
      // This method is for future expansion (e.g., physical books)
      
      ResponseHandler.success(res, { book_id, quantity }, 'Jumlah berhasil diupdate');
      
    } catch (error) {
      console.error('Update quantity error:', error);
      ResponseHandler.error(res, 'Gagal mengupdate jumlah');
    }
  }
  
  // Clear cart
  static async clearCart(req, res) {
    try {
      const userId = req.user.id;
      
      await Keranjang.clearCart(userId);
      
      ResponseHandler.success(res, null, 'Keranjang berhasil dikosongkan');
      
    } catch (error) {
      console.error('Clear cart error:', error);
      ResponseHandler.error(res, 'Gagal mengosongkan keranjang');
    }
  }
  
  // Checkout from cart (create transaction)
  static async checkout(req, res) {
    try {
      const userId = req.user.id;
      
      // Get cart items
      const cartItems = await Keranjang.findByUserId(userId);
      
      if (cartItems.length === 0) {
        return ResponseHandler.badRequest(res, 'Keranjang kosong');
      }
      
      // Calculate total
      let totalHarga = 0;
      const bookIds = [];
      
      cartItems.forEach(item => {
        totalHarga += item.HARGA || 0;
        bookIds.push(item.ID_BUKU);
      });
      
      // Check if user already owns any of the books
      const [ownedBooks] = await db.query(`
        SELECT b.ID_BUKU, b.JUDUL 
        FROM TRANSAKSI t
        JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
        WHERE b.ID_BUKU IN (?) AND t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'completed'
      `, [bookIds, userId]);
      
      if (ownedBooks.length > 0) {
        const bookNames = ownedBooks.map(b => b.JUDUL).join(', ');
        return ResponseHandler.badRequest(res, `Anda sudah memiliki buku: ${bookNames}`);
      }
      
      // Create transaction
      const Transaksi = require('../db/models/transaksi');
      const transaction = await Transaksi.create({
        id_user: userId,
        total_harga: totalHarga,
        status_pembayaran: 'pending'
      });
      
      // Link books to transaction
      for (const bookId of bookIds) {
        await db.query(
          'UPDATE BUKU SET ID_TRANSAKSI = ? WHERE ID_BUKU = ?',
          [transaction.id, bookId]
        );
      }
      
      // Clear cart
      await Keranjang.clearCart(userId);
      
      // Create detail items
      for (const item of cartItems) {
        await db.query(
          'INSERT INTO DETAIL_ITEM (ID_KRJ, ID_BUKU, HARGA_ITEM) VALUES (?, ?, ?)',
          [item.ID_KRJ, item.ID_BUKU, item.HARGA]
        );
      }
      
      ResponseHandler.created(res, {
        transaction_id: transaction.id,
        total_harga: totalHarga,
        items_count: cartItems.length,
        books: cartItems.map(item => ({
          id: item.ID_BUKU,
          judul: item.JUDUL,
          harga: item.HARGA
        }))
      }, 'Checkout berhasil. Silakan lanjutkan pembayaran.');
      
    } catch (error) {
      console.error('Checkout error:', error);
      ResponseHandler.error(res, 'Gagal melakukan checkout');
    }
  }
  
  // Get cart summary (item count and total)
  static async getSummary(req, res) {
    try {
      const userId = req.user.id;
      
      const [summary] = await db.query(`
        SELECT 
          COUNT(*) as item_count,
          SUM(b.HARGA) as total_harga
        FROM KERANJANG k
        JOIN BUKU b ON k.ID_BUKU = b.ID_BUKU
        WHERE k.ID_USER = ? AND b.STATUS = 'active'
      `, [userId]);
      
      ResponseHandler.success(res, {
        item_count: summary[0].item_count || 0,
        total_harga: summary[0].total_harga || 0
      });
      
    } catch (error) {
      console.error('Get cart summary error:', error);
      ResponseHandler.error(res, 'Gagal mengambil ringkasan keranjang');
    }
  }
}

module.exports = KeranjangController;