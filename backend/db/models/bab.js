// db/models/bab.js
const pool = require('../config/database');

class Bab {
    static async findByBookId(bookId) {
        const [rows] = await pool.execute(
            'SELECT * FROM BAB_BUKU WHERE ID_BUKU = ? ORDER BY NOMER_BAB',
            [bookId]
        );
        return rows;
    }

    static async findById(babId) {
        const [rows] = await pool.execute(
            'SELECT * FROM BAB_BUKU WHERE ID_BAB = ?',
            [babId]
        );
        return rows[0];
    }

    static async create(babData) {
        const { id_buku, judul_bab, isi, nomer_bab } = babData;
        const [result] = await pool.execute(
            'INSERT INTO BAB_BUKU (ID_BUKU, JUDUL_BAB, ISI, NOMER_BAB) VALUES (?, ?, ?, ?)',
            [id_buku, judul_bab, isi, nomer_bab]
        );
        return { id: result.insertId, ...babData };
    }

    static async update(id, updateData) {
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);
        
        await pool.execute(
            `UPDATE BAB_BUKU SET ${fields} WHERE ID_BAB = ?`,
            values
        );
        return this.findById(id);
    }

    static async delete(id) {
        await pool.execute('DELETE FROM BAB_BUKU WHERE ID_BAB = ?', [id]);
    }
}

module.exports = Bab;