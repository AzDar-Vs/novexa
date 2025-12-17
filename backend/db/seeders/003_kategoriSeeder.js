export async function seed(db) {
  await db.query(`
    INSERT INTO KATEGORI (ID_BUKU, ID_GENRE, NAMA_KTG)
    VALUES
      (NULL, 1, 'Bacaan Ringan'),
      (NULL, 2, 'Ilustrasi'),
      (NULL, 3, 'Pelajaran'),
      (NULL, 4, 'Pemrograman')
  `);
}
