export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS REVIEW (
      ID_REVIEW INT AUTO_INCREMENT PRIMARY KEY,
      RATING INT,
      KOMENTAR TEXT
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS REVIEW`);
}
