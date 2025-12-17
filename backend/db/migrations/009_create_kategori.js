export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS KATEGORI (
      ID_KATEGORI INT AUTO_INCREMENT PRIMARY KEY,
      ID_BUKU INT,
      ID_GENRE INT,
      NAMA_KTG VARCHAR(50),
      FOREIGN KEY (ID_BUKU) REFERENCES BUKU(ID_BUKU),
      FOREIGN KEY (ID_GENRE) REFERENCES GENRE(ID_GENRE)
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS KATEGORI`);
}
