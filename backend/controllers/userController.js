const User = require('../db/models/user');
const Keranjang = require('../db/models/keranjang');
const Transaksi = require('../db/models/transaksi');
const ResponseHandler = require('../utils/response');
const Validator = require('../utils/validator');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

class UserController {
  // Get all users (admin only)
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const offset = (page - 1) * limit;
      
      let sql = `SELECT ID_USER, NAMA, EMAIL, ROLE, BIO, AVATAR, created_at FROM \`user\``;
      let countSql = `SELECT COUNT(*) as total FROM \`user\``;
      const params = [];
      const countParams = [];
      
      if (search) {
        sql += ' WHERE NAMA LIKE ? OR EMAIL LIKE ?';
        countSql += ' WHERE NAMA LIKE ? OR EMAIL LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`);
      }
      
      sql += ' ORDER BY ID_USER DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [users] = await db.query(sql, params);
      const [countResult] = await db.query(countSql, countParams);
      
      ResponseHandler.success(res, {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
      
    } catch (error) {
      console.error('Get all users error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data user');
    }
  }
  
  // Get user by ID
  static async getById(req, res) {
    try {
      const userId = parseInt(req.params.id);
      
      const user = await User.findById(userId);
      if (!user) {
        return ResponseHandler.notFound(res, 'User tidak ditemukan');
      }
      
      // Remove sensitive data
      const { PASSWORD, ...userData } = user;
      
      ResponseHandler.success(res, userData);
      
    } catch (error) {
      console.error('Get user by ID error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data user');
    }
  }
  
  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is updating their own profile or admin
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Tidak bisa mengubah profil user lain');
      }
      
      const { nama, bio } = req.body;
      const updateData = {};
      
      if (nama) updateData.nama = nama;
      if (bio !== undefined) updateData.bio = bio;
      
      // Handle avatar upload
      if (req.file) {
        updateData.avatar = `/uploads/avatars/${req.file.filename}`;
        
        // Delete old avatar if exists
        const oldUser = await User.findById(userId);
        if (oldUser.AVATAR && oldUser.AVATAR.startsWith('/uploads/avatars/')) {
          const oldAvatarPath = path.join(__dirname, '..', oldUser.AVATAR);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return ResponseHandler.badRequest(res, 'Tidak ada data yang diupdate');
      }
      
      const updatedUser = await User.update(userId, updateData);
      const { PASSWORD, ...userData } = updatedUser;
      
      ResponseHandler.success(res, userData, 'Profil berhasil diupdate');
      
    } catch (error) {
      console.error('Update profile error:', error);
      ResponseHandler.error(res, 'Gagal mengupdate profil');
    }
  }
  
  // Delete user (admin only)
  static async delete(req, res) {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent deleting yourself
      if (req.user.id === userId) {
        return ResponseHandler.badRequest(res, 'Tidak bisa menghapus akun sendiri');
      }
      
      const user = await User.findById(userId);
      if (!user) {
        return ResponseHandler.notFound(res, 'User tidak ditemukan');
      }
      
      // Delete avatar file if exists
      if (user.AVATAR && user.AVATAR.startsWith('/uploads/avatars/')) {
        const avatarPath = path.join(__dirname, '..', user.AVATAR);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
      
      await User.delete(userId);
      
      ResponseHandler.success(res, null, 'User berhasil dihapus');
      
    } catch (error) {
      console.error('Delete user error:', error);
      ResponseHandler.error(res, 'Gagal menghapus user');
    }
  }
  
  // Get user cart
  static async getCart(req, res) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is accessing their own cart or admin
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Tidak bisa mengakses keranjang user lain');
      }
      
      const cartItems = await Keranjang.findByUserId(userId);
      
      ResponseHandler.success(res, cartItems);
      
    } catch (error) {
      console.error('Get user cart error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data keranjang');
    }
  }
  
  // Get user transactions
  static async getTransactions(req, res) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is accessing their own transactions or admin
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Tidak bisa mengakses transaksi user lain');
      }
      
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;
      
      const filters = {};
      if (status) filters.status = status;
      filters.limit = parseInt(limit);
      filters.offset = offset;
      
      const transactions = await Transaksi.findByUserId(userId, filters);
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
      console.error('Get user transactions error:', error);
      ResponseHandler.error(res, 'Gagal mengambil data transaksi');
    }
  }
  
  // Change user role (admin only)
  static async changeRole(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!['user', 'author', 'admin'].includes(role)) {
        return ResponseHandler.badRequest(res, 'Role tidak valid');
      }
      
      const user = await User.findById(userId);
      if (!user) {
        return ResponseHandler.notFound(res, 'User tidak ditemukan');
      }
      
      await User.update(userId, { role });
      
      ResponseHandler.success(res, null, `Role user berhasil diubah menjadi ${role}`);
      
    } catch (error) {
      console.error('Change role error:', error);
      ResponseHandler.error(res, 'Gagal mengubah role user');
    }
  }
  
  // Get user dashboard stats
  static async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;
      
      const userStats = await User.getStats(userId);
      const transactionStats = await Transaksi.getStats(userId);
      const cartCount = await Keranjang.getCountByUserId(userId);
      
      ResponseHandler.success(res, {
        user: userStats,
        transactions: transactionStats,
        cart: { count: cartCount }
      });
      
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      ResponseHandler.error(res, 'Gagal mengambil statistik dashboard');
    }
  }
}

module.exports = UserController;