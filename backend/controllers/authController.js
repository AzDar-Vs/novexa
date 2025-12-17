import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import config from '../config/config.js';
import AuthRepository from '../db/repositories/authRepository.js';
import UserRepository from '../db/repositories/userRepository.js';

class AuthController {
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { nama, email, password } = req.body;

      const existingUser = await AuthRepository.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userId = await AuthRepository.createUser({
        nama,
        email,
        password: hashedPassword,
        role: 'user'
      });

      const token = jwt.sign(
        { id: userId, email, role: 'user' },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          token,
          user: { id: userId, nama, email, role: 'user' }
        }
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await AuthRepository.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const isValid = await bcrypt.compare(password, user.PASSWORD);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const token = jwt.sign(
        { id: user.ID_USER, email: user.EMAIL, role: user.ROLE },
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

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async profile(req, res) {
    try {
      const user = await UserRepository.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

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
          }
        }
      });

    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static logout(req, res) {
    res.json({ success: true, message: 'Logout berhasil' });
  }
}

export default AuthController;
