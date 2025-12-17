const Notifikasi = require('../db/models/notifikasi');
const ResponseHandler = require('../utils/response');

class NotifikasiController {
  // Get user notifications
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, unread_only } = req.query;
      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT 
          n.*,
          t.ID_TRANSAKSI,
          t.STATUS_PEMBAYARAN,
          u.NAMA as sender_name
        FROM NOTIFIKASI n
        LEFT JOIN TRANSAKSI t ON n.ID_NOTIF = t.ID_NOTIF
        LEFT JOIN \`user\` u ON n.SENDER_ID = u.ID_USER
        WHERE n.ID_USER = ? OR n.ID_USER IS NULL
      `;
      
      const params = [userId];
      
      if (unread_only === 'true') {
        sql += ' AND n.TANDA_DIBACA IS NULL';
      }
      
      sql += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [notifications] = await db.query(sql, params);
      
      // Get counts
      const [unreadCount] = await db.query(
        'SELECT COUNT(*) as count FROM NOTIFIKASI WHERE (ID_USER = ? OR ID_USER IS NULL) AND TANDA_DIBACA IS NULL',
        [userId]
      );
      
      const [totalCount] = await db.query(
        'SELECT COUNT(*) as count FROM NOTIFIKASI WHERE ID_USER = ? OR ID_USER IS NULL',
        [userId]
      );
      
      ResponseHandler.success(res, {
        notifications,
        counts: {
          unread: unreadCount[0].count,
          total: totalCount[0].total
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
      
    } catch (error) {
      console.error('Get notifications error:', error);
      ResponseHandler.error(res, 'Gagal mengambil notifikasi');
    }
  }
  
  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const notificationId = parseInt(req.params.id);
      
      // Check if notification exists and belongs to user
      const [notification] = await db.query(
        'SELECT * FROM NOTIFIKASI WHERE ID_NOTIF = ? AND (ID_USER = ? OR ID_USER IS NULL)',
        [notificationId, req.user.id]
      );
      
      if (notification.length === 0) {
        return ResponseHandler.notFound(res, 'Notifikasi tidak ditemukan');
      }
      
      await Notifikasi.markAsRead(notificationId);
      
      ResponseHandler.success(res, null, 'Notifikasi ditandai sebagai sudah dibaca');
      
    } catch (error) {
      console.error('Mark as read error:', error);
      ResponseHandler.error(res, 'Gagal menandai notifikasi');
    }
  }
  
  // Mark all notifications as read
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      
      await db.query(
        'UPDATE NOTIFIKASI SET TANDA_DIBACA = NOW() WHERE (ID_USER = ? OR ID_USER IS NULL) AND TANDA_DIBACA IS NULL',
        [userId]
      );
      
      ResponseHandler.success(res, null, 'Semua notifikasi ditandai sebagai sudah dibaca');
      
    } catch (error) {
      console.error('Mark all as read error:', error);
      ResponseHandler.error(res, 'Gagal menandai notifikasi');
    }
  }
  
  // Delete notification
  static async delete(req, res) {
    try {
      const notificationId = parseInt(req.params.id);
      
      // Check if notification exists and belongs to user
      const [notification] = await db.query(
        'SELECT ID_NOTIF FROM NOTIFIKASI WHERE ID_NOTIF = ? AND (ID_USER = ? OR ID_USER IS NULL)',
        [notificationId, req.user.id]
      );
      
      if (notification.length === 0) {
        return ResponseHandler.notFound(res, 'Notifikasi tidak ditemukan');
      }
      
      await db.query('DELETE FROM NOTIFIKASI WHERE ID_NOTIF = ?', [notificationId]);
      
      ResponseHandler.success(res, null, 'Notifikasi berhasil dihapus');
      
    } catch (error) {
      console.error('Delete notification error:', error);
      ResponseHandler.error(res, 'Gagal menghapus notifikasi');
    }
  }
  
  // Clear all notifications
  static async clearAll(req, res) {
    try {
      const userId = req.user.id;
      
      await db.query(
        'DELETE FROM NOTIFIKASI WHERE ID_USER = ?',
        [userId]
      );
      
      ResponseHandler.success(res, null, 'Semua notifikasi berhasil dihapus');
      
    } catch (error) {
      console.error('Clear all notifications error:', error);
      ResponseHandler.error(res, 'Gagal menghapus notifikasi');
    }
  }
  
  // Create notification (admin only)
  static async create(req, res) {
    try {
      const { user_id, pesan, type = 'info' } = req.body;
      
      if (!pesan) {
        return ResponseHandler.badRequest(res, 'Pesan tidak boleh kosong');
      }
      
      // Validate notification type
      const validTypes = ['info', 'success', 'warning', 'error', 'transaction'];
      if (!validTypes.includes(type)) {
        return ResponseHandler.badRequest(res, 'Tipe notifikasi tidak valid');
      }
      
      const notificationData = {
        id_user: user_id || null, // null = broadcast to all users
        pesan,
        type,
        created_at: new Date()
      };
      
      await db.query('INSERT INTO NOTIFIKASI SET ?', notificationData);
      
      ResponseHandler.created(res, notificationData, 'Notifikasi berhasil dibuat');
      
    } catch (error) {
      console.error('Create notification error:', error);
      ResponseHandler.error(res, 'Gagal membuat notifikasi');
    }
  }
  
  // Get notification statistics
  static async getStats(req, res) {
    try {
      const userId = req.user.id;
      
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN TANDA_DIBACA IS NULL THEN 1 END) as unread,
          COUNT(CASE WHEN TYPE = 'transaction' THEN 1 END) as transaction_notifs,
          COUNT(CASE WHEN TYPE = 'info' THEN 1 END) as info_notifs,
          COUNT(CASE WHEN TYPE = 'warning' THEN 1 END) as warning_notifs,
          DATE(created_at) as date,
          COUNT(*) as daily_count
        FROM NOTIFIKASI
        WHERE ID_USER = ? OR ID_USER IS NULL
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
        LIMIT 30
      `, [userId]);
      
      ResponseHandler.success(res, {
        total: stats.reduce((sum, day) => sum + day.total, 0),
        unread: stats.reduce((sum, day) => sum + day.unread, 0),
        by_type: {
          transaction: stats.reduce((sum, day) => sum + day.transaction_notifs, 0),
          info: stats.reduce((sum, day) => sum + day.info_notifs, 0),
          warning: stats.reduce((sum, day) => sum + day.warning_notifs, 0)
        },
        daily_stats: stats
      });
      
    } catch (error) {
      console.error('Get notification stats error:', error);
      ResponseHandler.error(res, 'Gagal mengambil statistik notifikasi');
    }
  }
}

module.exports = NotifikasiController;