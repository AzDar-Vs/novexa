const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ==== PERHATIAN: HAPUS SEMUA ROUTE /my YANG DUPLIKAT ====

// Route GET /buku/my (HANYA SATU INI YANG BOLEH ADA)
router.get('/my', async (req, res) => {
  try {
    console.log('GET /buku/my called');
    
    // ====== SOLUSI SEMENTARA: Auth bypass ======
    // Untuk testing, hardcode seller ID dulu
    const sellerId = 2; // ID seller testing
    
    // ====== NANTI PAKAI INI ======
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) return res.status(401).json({ success: false, message: 'No token' });
    
    // Query database
    const [books] = await db.execute(`
      SELECT b.*, 
        GROUP_CONCAT(g.NAMA_GENRE) as genres 
      FROM buku b
      LEFT JOIN buku_genre bg ON b.ID_BUKU = bg.ID_BUKU
      LEFT JOIN genre g ON bg.ID_GENRE = g.ID_GENRE
      WHERE b.ID_USER = ?
      GROUP BY b.ID_BUKU
      ORDER BY b.CREATED_AT DESC
    `, [sellerId]);
    
    // Format response
    const formattedBooks = books.map(book => ({
      ...book,
      genres: book.genres ? book.genres.split(',').filter(g => g) : []
    }));
    
    console.log(`Found ${formattedBooks.length} books for seller ${sellerId}`);
    
    res.json({
      success: true,
      message: `Successfully retrieved ${formattedBooks.length} books`,
      data: formattedBooks
    });
    
  } catch (error) {
    console.error('Database error in /buku/my:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database error',
      error: error.message 
    });
  }
});

// Route lainnya TETAP ADA
router.get('/', async (req, res) => {
  // ... existing code for GET /buku
});

router.get('/:id', async (req, res) => {
  // ... existing code for GET /buku/:id
});

// PASTIKAN TIDAK ADA ROUTE /my LAINNYA DI FILE INI!

module.exports = router;