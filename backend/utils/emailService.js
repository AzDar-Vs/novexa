const db = require('../config/database');

const userQueries = {
  // User queries
  findAllUsers: async (filters = {}) => {
    let sql = `
      SELECT 
        ID_USER, 
        NAMA, 
        EMAIL, 
        ROLE, 
        BIO, 
        AVATAR, 
        created_at,
        last_login
      FROM \`user\`
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.role) {
      sql += ' AND ROLE = ?';
      params.push(filters.role);
    }
    
    if (filters.search) {
      sql += ' AND (NAMA LIKE ? OR EMAIL LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.email_verified !== undefined) {
      sql += ' AND email_verified = ?';
      params.push(filters.email_verified ? 1 : 0);
    }
    
    sql += ' ORDER BY ID_USER DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }
    
    const [rows] = await db.query(sql, params);
    return rows;
  },
  
  findUserById: async (id) => {
    const sql = 'SELECT * FROM `user` WHERE ID_USER = ?';
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },
  
  findUserByEmail: async (email) => {
    const sql = 'SELECT * FROM `user` WHERE EMAIL = ?';
    const [rows] = await db.query(sql, [email]);
    return rows[0];
  },
  
  createUser: async (userData) => {
    const { nama, email, password, role = 'buyer', bio = '', avatar = '' } = userData;
    const sql = 'INSERT INTO `user` (NAMA, EMAIL, PASSWORD, ROLE, BIO, AVATAR) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [nama, email, password, role, bio, avatar]);
    return { id: result.insertId, ...userData };
  },
  
  updateUser: async (id, updateData) => {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    const sql = `UPDATE \`user\` SET ${fields} WHERE ID_USER = ?`;
    await db.query(sql, values);
    
    return userQueries.findUserById(id);
  },
  
  deleteUser: async (id) => {
    const sql = 'DELETE FROM `user` WHERE ID_USER = ?';
    await db.query(sql, [id]);
  },
  
  updateLastLogin: async (id) => {
    const sql = 'UPDATE `user` SET last_login = NOW() WHERE ID_USER = ?';
    await db.query(sql, [id]);
  },
  
  changeUserRole: async (id, role) => {
    const sql = 'UPDATE `user` SET ROLE = ? WHERE ID_USER = ?';
    await db.query(sql, [role, id]);
  },
  
  // User statistics
  getUserStats: async (id) => {
    const sql = `
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM TRANSAKSI WHERE ID_USER = u.ID_USER AND STATUS_PEMBAYARAN = 'completed') as total_purchases,
        (SELECT SUM(TOTAL_HARGA) FROM TRANSAKSI WHERE ID_USER = u.ID_USER AND STATUS_PEMBAYARAN = 'completed') as total_spent,
        (SELECT COUNT(*) FROM REVIEW WHERE ID_USER = u.ID_USER) as total_reviews,
        (SELECT COUNT(*) FROM KERANJANG WHERE ID_USER = u.ID_USER) as cart_items,
        (SELECT COUNT(*) FROM FAVORITE WHERE ID_USER = u.ID_USER) as favorites,
        (SELECT COUNT(*) FROM BUKU b JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI WHERE t.ID_USER = u.ID_USER AND t.STATUS_PEMBAYARAN = 'completed') as books_sold,
        (SELECT SUM(t.TOTAL_HARGA) FROM BUKU b JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI WHERE t.ID_USER = u.ID_USER AND t.STATUS_PEMBAYARAN = 'completed') as sales_revenue
      FROM \`user\` u
      WHERE u.ID_USER = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },
  
  // Seller specific queries
  getSellerStats: async (sellerId) => {
    const sql = `
      SELECT 
        COUNT(DISTINCT b.ID_BUKU) as total_books,
        COUNT(DISTINCT t.ID_TRANSAKSI) as total_sales,
        SUM(t.TOTAL_HARGA) as total_revenue,
        AVG(r.RATING) as average_rating,
        COUNT(DISTINCT t2.ID_USER) as total_customers,
        MIN(t.created_at) as first_sale,
        MAX(t.created_at) as last_sale
      FROM BUKU b
      JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI
      LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
      LEFT JOIN (
        SELECT DISTINCT ID_USER 
        FROM TRANSAKSI t3 
        JOIN BUKU b3 ON t3.ID_TRANSAKSI = b3.ID_TRANSAKSI 
        WHERE b3.ID_TRANSAKSI IN (
          SELECT ID_TRANSAKSI FROM BUKU WHERE ID_TRANSAKSI IN (
            SELECT ID_TRANSAKSI FROM TRANSAKSI WHERE ID_USER = ?
          )
        )
      ) t2 ON 1=1
      WHERE t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'completed'
    `;
    const [rows] = await db.query(sql, [sellerId, sellerId]);
    return rows[0];
  },
  
  getSellerBooks: async (sellerId, filters = {}) => {
    let sql = `
      SELECT 
        b.*,
        COUNT(DISTINCT t2.ID_TRANSAKSI) as sales_count,
        SUM(t2.TOTAL_HARGA) as total_revenue,
        AVG(r.RATING) as average_rating
      FROM BUKU b
      JOIN TRANSAKSI t ON b.ID_TRANSAKSI = t.ID_TRANSAKSI
      LEFT JOIN TRANSAKSI t2 ON b.ID_TRANSAKSI = t2.ID_TRANSAKSI AND t2.STATUS_PEMBAYARAN = 'completed'
      LEFT JOIN REVIEW r ON b.ID_REVIEW = r.ID_REVIEW
      WHERE t.ID_USER = ?
    `;
    
    const params = [sellerId];
    
    if (filters.status) {
      sql += ' AND b.STATUS = ?';
      params.push(filters.status);
    }
    
    sql += ' GROUP BY b.ID_BUKU ORDER BY b.ID_BUKU DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }
    
    const [rows] = await db.query(sql, params);
    return rows;
  },
  
  // Buyer specific queries
  getBuyerStats: async (buyerId) => {
    const sql = `
      SELECT 
        COUNT(DISTINCT t.ID_TRANSAKSI) as total_purchases,
        SUM(t.TOTAL_HARGA) as total_spent,
        COUNT(DISTINCT b.ID_BUKU) as total_books,
        COUNT(DISTINCT s.ID_USER) as total_sellers,
        AVG(r.RATING) as average_rating_given,
        MIN(t.created_at) as first_purchase,
        MAX(t.created_at) as last_purchase
      FROM TRANSAKSI t
      JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
      LEFT JOIN REVIEW r ON r.ID_USER = t.ID_USER AND r.ID_BUKU = b.ID_BUKU
      LEFT JOIN (
        SELECT DISTINCT t2.ID_USER 
        FROM TRANSAKSI t2 
        JOIN BUKU b2 ON t2.ID_TRANSAKSI = b2.ID_TRANSAKSI 
        WHERE b2.ID_BUKU IN (
          SELECT b3.ID_BUKU FROM BUKU b3 JOIN TRANSAKSI t3 ON b3.ID_TRANSAKSI = t3.ID_TRANSAKSI WHERE t3.ID_USER = ?
        )
      ) s ON 1=1
      WHERE t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'completed'
    `;
    const [rows] = await db.query(sql, [buyerId, buyerId]);
    return rows[0];
  },
  
  getBuyerPurchases: async (buyerId, filters = {}) => {
    let sql = `
      SELECT 
        t.*,
        GROUP_CONCAT(DISTINCT b.JUDUL) as books,
        GROUP_CONCAT(DISTINCT b.ID_BUKU) as book_ids
      FROM TRANSAKSI t
      JOIN BUKU b ON t.ID_TRANSAKSI = b.ID_TRANSAKSI
      WHERE t.ID_USER = ? AND t.STATUS_PEMBAYARAN = 'completed'
    `;
    
    const params = [buyerId];
    
    if (filters.start_date) {
      sql += ' AND DATE(t.created_at) >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      sql += ' AND DATE(t.created_at) <= ?';
      params.push(filters.end_date);
    }
    
    sql += ' GROUP BY t.ID_TRANSAKSI ORDER BY t.ID_TRANSAKSI DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }
    
    const [rows] = await db.query(sql, params);
    return rows;
  },
  
  // Admin dashboard statistics
  getAdminDashboardStats: async () => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM \`user\`) as total_users,
        (SELECT COUNT(*) FROM \`user\` WHERE ROLE = 'admin') as admin_count,
        (SELECT COUNT(*) FROM \`user\` WHERE ROLE = 'seller') as seller_count,
        (SELECT COUNT(*) FROM \`user\` WHERE ROLE = 'buyer') as buyer_count,
        (SELECT COUNT(*) FROM BUKU) as total_books,
        (SELECT COUNT(*) FROM BUKU WHERE STATUS = 'active') as active_books,
        (SELECT COUNT(*) FROM TRANSAKSI) as total_transactions,
        (SELECT SUM(TOTAL_HARGA) FROM TRANSAKSI WHERE STATUS_PEMBAYARAN = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM REVIEW) as total_reviews,
        (SELECT AVG(RATING) FROM REVIEW) as average_rating
      FROM DUAL
    `;
    const [rows] = await db.query(sql);
    return rows[0];
  },
  
  // User activity tracking
  logUserActivity: async (userId, activity, details = {}) => {
    const sql = 'INSERT INTO user_activity_log (user_id, activity, details) VALUES (?, ?, ?)';
    await db.query(sql, [userId, activity, JSON.stringify(details)]);
  },
  
  getUserActivityLog: async (userId, limit = 50) => {
    const sql = 'SELECT * FROM user_activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?';
    const [rows] = await db.query(sql, [userId, limit]);
    return rows;
  }
};

module.exports = userQueries;