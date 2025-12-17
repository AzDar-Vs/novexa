export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS FAVORITE (
      ID_FAV INT AUTO_INCREMENT PRIMARY KEY
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS FAVORITE`);
}
