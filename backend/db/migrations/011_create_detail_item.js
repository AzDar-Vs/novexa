export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS DETAIL_ITEM (
      ID_ITEM INT AUTO_INCREMENT PRIMARY KEY,
      ID_KRJ INT,
      ID_BUKU INT,
      HARGA_ITEM INT,
      FOREIGN KEY (ID_KRJ) REFERENCES KERANJANG(ID_KRJ),
      FOREIGN KEY (ID_BUKU) REFERENCES BUKU(ID_BUKU)
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS DETAIL_ITEM`);
}
