export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS KERANJANG (
      ID_KRJ INT AUTO_INCREMENT PRIMARY KEY,
      ID_BUKU INT,
      FOREIGN KEY (ID_BUKU) REFERENCES BUKU(ID_BUKU)
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS KERANJANG`);
}
