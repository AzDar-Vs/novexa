const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middlewares/auth.middleware');

/* ================= GET PROFILE ================= */
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.ID_USER;

    const [rows] = await db.execute(
      `SELECT ID_USER, NAMA, EMAIL, ROLE, BIO, SALDO, CREATED_AT
       FROM user WHERE ID_USER = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const u = rows[0];

    res.json({
      success: true,
      data: {
        id: u.ID_USER,
        name: u.NAMA,
        email: u.EMAIL,
        role: u.ROLE,
        bio: u.BIO || '',
        saldo: u.SALDO || 0,
        joined: u.CREATED_AT
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ================= UPDATE PROFILE ================= */
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.ID_USER;
    const { name, bio } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama wajib diisi' });
    }

    await db.execute(
      `UPDATE user SET NAMA = ?, BIO = ?, UPDATED_AT = NOW()
       WHERE ID_USER = ?`,
      [name.trim(), bio || null, userId]
    );

    res.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal update profil' });
  }
});

module.exports = router;
