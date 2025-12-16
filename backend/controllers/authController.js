const User = require('../db/models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { validationResult } = require('express-validator');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const { nama, email, password } = req.body;
      
      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }
      
      // Create user
      const user = await User.create({
        nama,
        email,
        password,
        role: 'user' // Default role
      });
      
      // Generate token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          token,
          user: {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role
          }
        }
      });
      
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }
  
  // Login user
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }
      
      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.PASSWORD);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }
      
      // Generate token
      const token = jwt.sign(
        {
          id: user.ID_USER,
          email: user.EMAIL,
          role: user.ROLE
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          user: {
            id: user.ID_USER,
            nama: user.NAMA,
            email: user.EMAIL,
            role: user.ROLE,
            bio: user.BIO,
            avatar: user.AVATAR
          }
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }
  
  // Get current user profile
  static async profile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      
      // Get user stats
      const stats = await User.getStats(req.user.id);
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.ID_USER,
            nama: user.NAMA,
            email: user.EMAIL,
            role: user.ROLE,
            bio: user.BIO,
            avatar: user.AVATAR
          },
          stats
        }
      });
      
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }
  
  // Logout (client-side)
  static async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout berhasil'
    });
  }
  
  // Refresh token (optional)
  static async refreshToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak ditemukan'
        });
      }
      
      // Verify old token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Generate new token
      const newToken = jwt.sign(
        {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.json({
        success: true,
        data: {
          token: newToken
        }
      });
      
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      });
    }
  }
}

module.exports = AuthController;