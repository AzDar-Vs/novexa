export async function seed(db) {
  await db.query(`
    INSERT INTO NOTIFIKASI (PESAN, TANDA_DIBACA)
    VALUES
      ('Selamat datang di Novexa!', NULL),
      ('Promo buku terbaru!', NULL)
  `);
}
