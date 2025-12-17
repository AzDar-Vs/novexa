const db = require('../../config/database');

class Transaksi {
  static tableName = 'TRANSAKSI';
  
  // Create transaction
  static async create(transaksiData) {
    const { id_user, total_harga, status_pembayaran = 'pending' } = transaksiData;
    
    // Create notification first
    const [notifResult] = await db.query(
      'INSERT INTO NOTIFIKASI (PESAN) VALUES (?)',
      [`Transaksi baru sebesar Rp${total_harga.toLocaleString('id-ID')} sedang diproses`]
    );
    
    const sql = `
      INSERT INTO ${this.tableName} 
      (ID_USER, ID_NOTIF, TOTAL_HARGA, STATUS_PEMBAYARAN) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [id_user, notifResult.insertId, total_harga, status_pembayaran]);
    
    return { 
      id: result.insertId, 
      ...transaksiData,
      id_notif: notifResult.insertId 
    };
  }
  
  // Find transaction with details
  static async findByIdWithDetails(id) {
    const sql = `
      SELECT 
        t.*,
        u.NAMA as user_nama,
        u.EMAIL as user_email,
        n.PESAN as notifikasi_pesan,
        n.TANDA_DIBACA as notifikasi_dibaca,
        GROUP_CONCAT(DISTINCT CONCAT(b.JUDUL, ' (Rp', b.HARGA, ')')) as items
      FROM ${this.tableName} t
      JOIN \`user\` u ON t.ID_USER = u.ID_USER
      LEFT JOIN NOTIFIKASI n ON t.ID_NOTIF = n.ID_NOTIF
      LEFT JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
      WHERE t.ID_TRANSAKSI = ?
      GROUP BY t.ID_TRANSAKSI
    `;
    
    const rows = await db.query(sql, [id]);
    return rows[0];
  }
  
  // Get user transactions
  static async findByUserId(userId, filters = {}) {
    let sql = `
      SELECT 
        t.*,
        GROUP_CONCAT(DISTINCT b.JUDUL) as items,
        n.PESAN as notif_pesan
      FROM ${this.tableName} t
      LEFT JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
      LEFT JOIN NOTIFIKASI n ON t.ID_NOTIF = n.ID_NOTIF
      WHERE t.ID_USER = ?
    `;
    
    const params = [userId];
    
    // Apply filters
    if (filters.status) {
      sql += ' AND t.STATUS_PEMBAYARAN = ?';
      params.push(filters.status);
    }
    
    if (filters.startDate) {
      sql += ' AND DATE(t.created_at) >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      sql += ' AND DATE(t.created_at) <= ?';
      params.push(filters.endDate);
    }
    
    sql += ' GROUP BY t.ID_TRANSAKSI ORDER BY t.ID_TRANSAKSI DESC';
    
    // Pagination
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }
    
    return await db.query(sql, params);
  }
  
  // Update transaction status
  static async updateStatus(id, status) {
    return await db.transaction(async (connection) => {
      // Update transaction
      await connection.execute(
        `UPDATE ${this.tableName} SET STATUS_PEMBAYARAN = ? WHERE ID_TRANSAKSI = ?`,
        [status, id]
      );
      
      // Get transaction for notification
      const [transaksi] = await connection.execute(
        `SELECT * FROM ${this.tableName} WHERE ID_TRANSAKSI = ?`,
        [id]
      );
      
      if (transaksi[0]) {
        // Update notification
        await connection.execute(
          'UPDATE NOTIFIKASI SET PESAN = ?, TANDA_DIBACA = NULL WHERE ID_NOTIF = ?',
          [`Status transaksi #${id} berubah menjadi: ${status}`, transaksi[0].ID_NOTIF]
        );
      }
      
      return this.findByIdWithDetails(id);
    });
  }
  
  // Get transaction stats
  static async getStats(userId = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(TOTAL_HARGA) as total_revenue,
        AVG(TOTAL_HARGA) as average_transaction,
        SUM(CASE WHEN STATUS_PEMBAYARAN = 'completed' THEN TOTAL_HARGA ELSE 0 END) as completed_revenue,
        COUNT(CASE WHEN STATUS_PEMBAYARAN = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN STATUS_PEMBAYARAN = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN STATUS_PEMBAYARAN = 'failed' THEN 1 END) as failed_count
      FROM ${this.tableName}
    `;
    
    const params = [];
    
    if (userId) {
      sql += ' WHERE ID_USER = ?';
      params.push(userId);
    }
    
    const rows = await db.query(sql, params);
    return rows[0];
  }
}