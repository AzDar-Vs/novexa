export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS BAB_BUKU (
      ID_BAB INT AUTO_INCREMENT PRIMARY KEY,
      ID_BUKU INT,
      JUDUL_BAB VARCHAR(100),
      ISI TEXT,
      NOMER_BAB INT,
      FOREIGN KEY (ID_BUKU) REFERENCES BUKU(ID_BUKU)
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS BAB_BUKU`);
}
