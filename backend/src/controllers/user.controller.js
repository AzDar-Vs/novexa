const db = require('../config/database');
const response = require('../utils/response');

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT ID_USER, NAMA, EMAIL, ROLE, SALDO, CREATED_AT 
       FROM user 
       WHERE ID_USER = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return response(res, 404, 'User tidak ditemukan');
    }

    response(res, 200, 'Data user', rows[0]);
  } catch (err) {
    response(res, 500, err.message);
  }
};
