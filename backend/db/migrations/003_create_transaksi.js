export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS TRANSAKSI (
      ID_TRANSAKSI INT AUTO_INCREMENT PRIMARY KEY,
      ID_USER INT,
      ID_NOTIF INT,
      TOTAL_HARGA INT,
      STATUS_PEMBAYARAN VARCHAR(20),
      FOREIGN KEY (ID_USER) REFERENCES user(ID_USER),
      FOREIGN KEY (ID_NOTIF) REFERENCES NOTIFIKASI(ID_NOTIF)
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS TRANSAKSI`);
}
