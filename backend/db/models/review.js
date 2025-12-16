// db/models/review.js
const pool = require('../config/database');

class Review {
    static async findByBookId(bookId) {
        const [rows] = await pool.execute(
            `SELECT r.*, u.NAMA as user_nama, u.AVATAR as user_avatar
            FROM REVIEW r
            JOIN BUKU b ON r.ID_REVIEW = b.ID_REVIEW
            JOIN \`user\` u ON r.ID_USER = u.ID_USER
            WHERE b.ID_BUKU = ?
            ORDER BY r.ID_REVIEW DESC`,
            [bookId]
        );
        return rows;
    }

    static async create(reviewData) {
        const { id_user, id_buku, rating, komentar } = reviewData;
        
        // Create review
        const [reviewResult] = await pool.execute(
            'INSERT INTO REVIEW (ID_USER, RATING, KOMENTAR) VALUES (?, ?, ?)',
            [id_user, rating, komentar]
        );
        
        // Link review to buku
        await pool.execute(
            'UPDATE BUKU SET ID_REVIEW = ? WHERE ID_BUKU = ?',
            [reviewResult.insertId, id_buku]
        );
        
        return { id: reviewResult.insertId, ...reviewData };
    }

    static async getAverageRating(bookId) {
        const [rows] = await pool.execute(
            `SELECT AVG(r.RATING) as avg_rating, COUNT(*) as total_reviews
            FROM REVIEW r
            JOIN BUKU b ON r.ID_REVIEW = b.ID_REVIEW
            WHERE b.ID_BUKU = ?`,
            [bookId]
        );
        return rows[0];
    }
}

module.exports = Review;