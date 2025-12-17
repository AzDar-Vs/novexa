export async function seed(db) {
  const genres = [
    'Novel',
    'Komik',
    'Edukasi',
    'Teknologi',
    'Fantasi'
  ];

  for (const genre of genres) {
    await db.query(
      `INSERT INTO GENRE (NAMA_GENRE) VALUES (?)`,
      [genre]
    );
  }
}
