import db from '../connection.js';

class UserRepository {
  static async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT * FROM user WHERE EMAIL = ?`,
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM user WHERE ID_USER = ?`,
      [id]
    );
    return rows[0];
  }

  static async create({ nama, email, password, role }) {
    const [result] = await db.query(
      `INSERT INTO user (NAMA, EMAIL, PASSWORD, ROLE)
       VALUES (?, ?, ?, ?)`,
      [nama, email, password, role]
    );
    return result.insertId;
  }

  static async updateProfile(id, { nama, bio, avatar }) {
    await db.query(
      `UPDATE user SET NAMA=?, BIO=?, AVATAR=? WHERE ID_USER=?`,
      [nama, bio, avatar, id]
    );
  }
}

export default UserRepository;
