// db/models/notifikasi.js
const pool = require('../config/database');

class Notifikasi {
    static async findByUserId(userId) {
        const [rows] = await pool.execute(
            `SELECT n.*
            FROM NOTIFIKASI n
            JOIN TRANSAKSI t ON n.ID_NOTIF = t.ID_NOTIF
            WHERE t.ID_USER = ?
            ORDER BY n.ID_NOTIF DESC`,
            [userId]
        );
        return rows;
    }

    static async markAsRead(notifId) {
        await pool.execute(
            'UPDATE NOTIFIKASI SET TANDA_DIBACA = NOW() WHERE ID_NOTIF = ?',
            [notifId]
        );
    }

    static async create(pesan, userId = null) {
        const [result] = await pool.execute(
            'INSERT INTO NOTIFIKASI (PESAN) VALUES (?)',
            [pesan]
        );
        return { id: result.insertId, pesan };
    }
}

module.exports = Notifikasi;