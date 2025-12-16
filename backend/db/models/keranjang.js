// db/models/keranjang.js
const pool = require('../config/database');

class Keranjang {
    static async findByUserId(userId) {
        const [rows] = await pool.execute(
            `SELECT k.*, b.JUDUL, b.HARGA, b.COVER, b.SLUG_BUKU
            FROM KERANJANG k
            JOIN BUKU b ON k.ID_BUKU = b.ID_BUKU
            WHERE k.ID_USER = ?`,
            [userId]
        );
        return rows;
    }

    static async addToCart(userId, bookId) {
        // Check if already in cart
        const [existing] = await pool.execute(
            'SELECT * FROM KERANJANG WHERE ID_USER = ? AND ID_BUKU = ?',
            [userId, bookId]
        );
        
        if (existing.length > 0) {
            return existing[0];
        }
        
        const [result] = await pool.execute(
            'INSERT INTO KERANJANG (ID_USER, ID_BUKU) VALUES (?, ?)',
            [userId, bookId]
        );
        return { id: result.insertId, id_user: userId, id_buku: bookId };
    }

    static async removeFromCart(userId, bookId) {
        await pool.execute(
            'DELETE FROM KERANJANG WHERE ID_USER = ? AND ID_BUKU = ?',
            [userId, bookId]
        );
    }

    static async clearCart(userId) {
        await pool.execute('DELETE FROM KERANJANG WHERE ID_USER = ?', [userId]);
    }
}

module.exports = Keranjang;