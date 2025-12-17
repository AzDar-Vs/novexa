export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS GENRE (
      ID_GENRE INT AUTO_INCREMENT PRIMARY KEY,
      NAMA_GENRE VARCHAR(50)
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS GENRE`);
}
