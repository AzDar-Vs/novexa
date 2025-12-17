import db from '../connection.js';

class ReviewRepository {
  static async create({ rating, komentar }) {
    const [result] = await db.query(
      `INSERT INTO REVIEW (RATING, KOMENTAR)
       VALUES (?, ?)`,
      [rating, komentar]
    );
    return result.insertId;
  }
}

export default ReviewRepository;
