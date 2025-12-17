const Transaksi = require('../db/models/transaksi');
const Buku = require('../db/models/buku');
const Keranjang = require('../db/models/keranjang');
const Notifikasi = require('../db/models/notifikasi');
const ResponseHandler = require('../utils/response');
const midtransClient = require('midtrans-client'); // Payment gateway

class TransaksiController {
  // Get user transactions
  static async getTransactions(req, res) {
    try {
      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 10, 
        status,
        start_date,
        end_date 
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      const filters = {
        limit: parseInt(limit),
        offset: offset
      };
      
      if (status) filters.status = status;
      if (start_date) filters.startDate = start_date;
      if (end_date) filters.endDate = end_date;
      
      const transactions = await Transaksi.findByUserId(userId, filters);
      
      // Get transaction stats
      const stats = await Transaksi.getStats(userId);
      
      ResponseHandler.success(res, {
        transactions,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
      
    } catch (error) {
      console.error('Get transactions error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data transaksi');
    }
  }
  
  // Get transaction by ID
  static async getById(req, res) {
    try {
      const transactionId = parseInt(req.params.id);
      
      const transaction = await Transaksi.findByIdWithDetails(transactionId);
      if (!transaction) {
        return ResponseHandler.notFound(res, 'Transaksi tidak ditemukan');
      }
      
      // Check if user owns this transaction or is admin
      if (req.user.id !== transaction.ID_USER && req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Tidak memiliki akses ke transaksi ini');
      }
      
      // Get transaction items
      const [items] = await db.query(`
        SELECT b.*, di.HARGA_ITEM
        FROM DETAIL_ITEM di
        JOIN BUKU b ON di.ID_BUKU = b.ID_BUKU
        WHERE di.ID_KRJ IN (
          SELECT ID_KRJ FROM KERANJANG WHERE ID_TRANSAKSI = ?
        )
      `, [transactionId]);
      
      ResponseHandler.success(res, {
        ...transaction,
        items
      });
      
    } catch (error) {
      console.error('Get transaction error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data transaksi');
    }
  }
  
  // Create transaction (checkout)
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const { items, payment_method } = req.body;
      
      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return ResponseHandler.badRequest(res, 'Item transaksi tidak valid');
      }
      
      // Calculate total and validate books
      let totalHarga = 0;
      const bookIds = items.map(item => item.book_id);
      
      // Get book details and calculate total
      const [books] = await db.query(
        'SELECT ID_BUKU, JUDUL, HARGA, STATUS FROM BUKU WHERE ID_BUKU IN (?)',
        [bookIds]
      );
      
      if (books.length !== items.length) {
        return ResponseHandler.badRequest(res, 'Beberapa buku tidak ditemukan');
      }
      
      // Check if books are active
      const inactiveBooks = books.filter(b => b.STATUS !== 'active');
      if (inactiveBooks.length > 0) {
        const names = inactiveBooks.map(b => b.JUDUL).join(', ');
        return ResponseHandler.badRequest(res, `Buku tidak tersedia: ${names}`);
      }
      
      // Check if user already owns any books
      const [ownedBooks] = await db.query(`
        SELECT b.ID_BUKU, b.JUDUL 
        FROM TRANSAKSI t
        JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
        WHERE b.ID_BUKU IN (?) AND t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'completed'
      `, [bookIds, userId]);
      
      if (ownedBooks.length > 0) {
        const bookNames = ownedBooks.map(b => b.JUDUL).join(', ');
        return ResponseHandler.badRequest(res, `Anda sudah memiliki: ${bookNames}`);
      }
      
      // Calculate total
      books.forEach(book => {
        totalHarga += book.HARGA;
      });
      
      // Create transaction
      const transaction = await Transaksi.create({
        id_user: userId,
        total_harga: totalHarga,
        status_pembayaran: 'pending',
        payment_method: payment_method || 'transfer'
      });
      
      // Create cart entries and link books
      for (const book of books) {
        // Add to cart
        const [cartResult] = await db.query(
          'INSERT INTO KERANJANG (ID_USER, ID_BUKU, ID_TRANSAKSI) VALUES (?, ?, ?)',
          [userId, book.ID_BUKU, transaction.id]
        );
        
        // Create detail item
        await db.query(
          'INSERT INTO DETAIL_ITEM (ID_KRJ, ID_BUKU, HARGA_ITEM) VALUES (?, ?, ?)',
          [cartResult.insertId, book.ID_BUKU, book.HARGA]
        );
        
        // Link book to transaction
        await db.query(
          'UPDATE BUKU SET ID_TRANSAKSI = ? WHERE ID_BUKU = ?',
          [transaction.id, book.ID_BUKU]
        );
      }
      
      // Initialize payment
      const paymentData = await TransaksiController.initiatePayment(transaction, books);
      
      ResponseHandler.created(res, {
        transaction_id: transaction.id,
        total_harga: totalHarga,
        items_count: books.length,
        payment_data: paymentData,
        books: books.map(book => ({
          id: book.ID_BUKU,
          judul: book.JUDUL,
          harga: book.HARGA
        }))
      }, 'Transaksi berhasil dibuat');
      
    } catch (error) {
      console.error('Create transaction error:', error);
      ResponseHandler.error(res, 'Gagal membuat transaksi');
    }
  }
  
  // Update transaction status (admin only)
  static async updateStatus(req, res) {
    try {
      const transactionId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(status)) {
        return ResponseHandler.badRequest(res, 'Status transaksi tidak valid');
      }
      
      const transaction = await Transaksi.findById(transactionId);
      if (!transaction) {
        return ResponseHandler.notFound(res, 'Transaksi tidak ditemukan');
      }
      
      const updatedTransaction = await Transaksi.updateStatus(transactionId, status);
      
      // If completed, create notification for user
      if (status === 'completed') {
        await Notifikasi.create(
          `Transaksi #${transactionId} telah selesai. Buku sekarang tersedia di library Anda.`,
          transaction.ID_USER
        );
      }
      
      ResponseHandler.success(res, updatedTransaction, `Status transaksi berhasil diubah menjadi ${status}`);
      
    } catch (error) {
      console.error('Update transaction status error:', error);
      ResponseHandler.error(res, 'Gagal mengupdate status transaksi');
    }
  }
  
  // Process payment callback (from payment gateway)
  static async paymentCallback(req, res) {
    try {
      const { order_id, transaction_status, fraud_status } = req.body;
      
      if (!order_id) {
        return ResponseHandler.badRequest(res, 'Order ID tidak ditemukan');
      }
      
      // Extract transaction ID from order_id
      const transactionId = parseInt(order_id.split('-')[1]);
      
      let status = 'pending';
      
      // Map payment gateway status to our status
      switch (transaction_status) {
        case 'capture':
          if (fraud_status === 'accept') {
            status = 'completed';
          } else {
            status = 'failed';
          }
          break;
        case 'settlement':
          status = 'completed';
          break;
        case 'pending':
          status = 'pending';
          break;
        case 'deny':
        case 'cancel':
        case 'expire':
          status = 'failed';
          break;
        default:
          status = 'pending';
      }
      
      // Update transaction status
      const transaction = await Transaksi.updateStatus(transactionId, status);
      
      // Send success response to payment gateway
      res.status(200).json({ status: 'OK' });
      
    } catch (error) {
      console.error('Payment callback error:', error);
      res.status(500).json({ status: 'ERROR', message: error.message });
    }
  }
  
  // Get payment methods
  static async getPaymentMethods(req, res) {
    try {
      const paymentMethods = [
        {
          id: 'bank_transfer',
          name: 'Transfer Bank',
          banks: ['BCA', 'BNI', 'BRI', 'Mandiri'],
          fees: 0
        },
        {
          id: 'ewallet',
          name: 'E-Wallet',
          wallets: ['Gopay', 'OVO', 'Dana', 'LinkAja'],
          fees: 0
        },
        {
          id: 'credit_card',
          name: 'Kartu Kredit',
          cards: ['Visa', 'Mastercard'],
          fees: 2500
        },
        {
          id: 'qris',
          name: 'QRIS',
          fees: 0
        }
      ];
      
      ResponseHandler.success(res, paymentMethods);
      
    } catch (error) {
      console.error('Get payment methods error:', error);
      ResponseHandler.error(res, 'Gagal mengambil metode pembayaran');
    }
  }
  
  // Get transaction stats (admin only)
  static async getStatsAdmin(req, res) {
    try {
      const { period = 'month', start_date, end_date } = req.query;
      
      let dateFilter = '';
      const params = [];
      
      if (start_date && end_date) {
        dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
        params.push(start_date, end_date);
      } else {
        // Default to current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString().split('T')[0];
        
        dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
        params.push(firstDay, lastDay);
      }
      
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(TOTAL_HARGA) as total_revenue,
          AVG(TOTAL_HARGA) as average_transaction,
          COUNT(CASE WHEN STATUS_PEMBAYARAN = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN STATUS_PEMBAYARAN = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN STATUS_PEMBAYARAN = 'failed' THEN 1 END) as failed_count,
          DATE(created_at) as date,
          COUNT(*) as daily_count
        FROM TRANSAKSI
        ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `, params);
      
      // Get top selling books
      const [topBooks] = await db.query(`
        SELECT 
          b.JUDUL,
          COUNT(t.ID_TRANSAKSI) as sales_count,
          SUM(t.TOTAL_HARGA) as total_revenue
        FROM TRANSAKSI t
        JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
        ${dateFilter.replace('created_at', 't.created_at')}
        GROUP BY b.ID_BUKU
        ORDER BY sales_count DESC
        LIMIT 10
      `, params);
      
      ResponseHandler.success(res, {
        overview: stats.reduce((acc, day) => ({
          total_transactions: acc.total_transactions + day.total_transactions,
          total_revenue: acc.total_revenue + (day.total_revenue || 0),
          completed_count: acc.completed_count + day.completed_count,
          pending_count: acc.pending_count + day.pending_count,
          failed_count: acc.failed_count + day.failed_count
        }), {
          total_transactions: 0,
          total_revenue: 0,
          completed_count: 0,
          pending_count: 0,
          failed_count: 0
        }),
        daily_stats: stats,
        top_books: topBooks
      });
      
    } catch (error) {
      console.error('Get admin stats error:', error);
      ResponseHandler.error(res, 'Gagal mengambil statistik');
    }
  }
  
  // Helper: Initiate payment with Midtrans
  static async initiatePayment(transaction, books) {
    // Initialize Midtrans
    const snap = new midtransClient.Snap({
      isProduction: process.env.NODE_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });
    
    const parameter = {
      transaction_details: {
        order_id: `TRX-${transaction.id}-${Date.now()}`,
        gross_amount: transaction.total_harga
      },
      item_details: books.map(book => ({
        id: book.ID_BUKU,
        price: book.HARGA,
        quantity: 1,
        name: book.JUDUL
      })),
      customer_details: {
        user_id: transaction.id_user
      }
    };
    
    try {
      const payment = await snap.createTransaction(parameter);
      return {
        token: payment.token,
        redirect_url: payment.redirect_url
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw new Error('Gagal memproses pembayaran');
    }
  }
}

module.exports = TransaksiController;