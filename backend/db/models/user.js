const db = require('../../config/database');
const bcrypt = require('bcryptjs');

class User {
  static tableName = 'user';
  
  // Create new user
  static async create(userData) {
    const { nama, email, password, role = 'user', bio = '', avatar = '' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO ${this.tableName} 
      (NAMA, EMAIL, PASSWORD, ROLE, BIO, AVATAR) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [nama, email, hashedPassword, role, bio, avatar]);
    return { id: result.insertId, ...userData };
  }
  
  // Find by ID
  static async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE ID_USER = ?`;
    const rows = await db.query(sql, [id]);
    return rows[0];
  }
  
  // Find by email
  static async findByEmail(email) {
    const sql = `SELECT * FROM ${this.tableName} WHERE EMAIL = ?`;
    const rows = await db.query(sql, [email]);
    return rows[0];
  }
  
  // Update user
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key === 'password') {
        // Hash new password
        updateData[key] = bcrypt.hashSync(updateData[key], 10);
      }
      fields.push(`${key.toUpperCase()} = ?`);
      values.push(updateData[key]);
    });
    
    values.push(id);
    
    const sql = `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE ID_USER = ?`;
    await db.query(sql, values);
    
    return this.findById(id);
  }
  
  // Delete user
  static async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE ID_USER = ?`;
    await db.query(sql, [id]);
  }
  
  // Get all users (admin only)
  static async findAll(limit = 50, offset = 0) {
    const sql = `
      SELECT ID_USER, NAMA, EMAIL, ROLE, BIO, AVATAR 
      FROM ${this.tableName} 
      LIMIT ? OFFSET ?
    `;
    return await db.query(sql, [limit, offset]);
  }
  
  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Get user stats
  static async getStats(userId) {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM TRANSAKSI WHERE ID_USER = ?) as total_transactions,
        (SELECT COUNT(*) FROM REVIEW WHERE ID_USER = ?) as total_reviews,
        (SELECT COUNT(*) FROM KERANJANG WHERE ID_USER = ?) as cart_items,
        (SELECT COUNT(*) FROM FAVORITE WHERE ID_USER = ?) as favorites
    `;
    const rows = await db.query(sql, [userId, userId, userId, userId]);
    return rows[0];
  }
}

module.exports = User;