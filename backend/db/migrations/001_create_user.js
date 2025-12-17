export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS user (
      ID_USER INT AUTO_INCREMENT PRIMARY KEY,
      NAMA VARCHAR(50),
      EMAIL VARCHAR(100) UNIQUE,
      PASSWORD VARCHAR(255),
      ROLE VARCHAR(20),
      BIO TEXT,
      AVATAR VARCHAR(255)
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS user`);
}
