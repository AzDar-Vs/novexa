export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS NOTIFIKASI (
      ID_NOTIF INT AUTO_INCREMENT PRIMARY KEY,
      PESAN TEXT,
      TANDA_DIBACA DATETIME
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS NOTIFIKASI`);
}
