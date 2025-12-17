export async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS MELIHAT (
      ID_USER INT,
      ID_BUKU INT,
      PRIMARY KEY (ID_USER, ID_BUKU),
      FOREIGN KEY (ID_USER) REFERENCES user(ID_USER),
      FOREIGN KEY (ID_BUKU) REFERENCES BUKU(ID_BUKU)
    ) ENGINE=InnoDB;
  `);
}

export async function down(db) {
  await db.query(`DROP TABLE IF EXISTS MELIHAT`);
}
