import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import AuthRepository from '../db/repositories/authRepository.js';

class AuthService {
  static async register({ nama, email, password }) {
    const existing = await AuthRepository.findUserByEmail(email);
    if (existing) throw new Error('EMAIL_EXISTS');

    const hashed = await bcrypt.hash(password, 10);

    const userId = await AuthRepository.createUser({
      nama,
      email,
      password: hashed,
      role: 'user'
    });

    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return { userId, token };
  }

  static async login({ email, password }) {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new Error('INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(password, user.PASSWORD);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    const token = jwt.sign(
      { id: user.ID_USER, email: user.EMAIL, role: user.ROLE },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return { user, token };
  }
}

export default AuthService;
