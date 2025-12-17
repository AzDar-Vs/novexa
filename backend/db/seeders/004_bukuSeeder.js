export async function seed(db) {
  await db.query(`
    INSERT INTO BUKU
      (JUDUL, SLUG_BUKU, DESKRIPSI, HARGA, STATUS)
    VALUES
      ('Belajar JavaScript', 'belajar-javascript', 'Panduan JS untuk pemula', 50000, 'aktif'),
      ('Node.js Dasar', 'nodejs-dasar', 'Backend dengan Node.js', 65000, 'aktif'),
      ('Fantasi Dunia Lain', 'fantasi-dunia-lain', 'Novel fantasi seru', 40000, 'aktif')
  `);
}
