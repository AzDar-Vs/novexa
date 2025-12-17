import fs from 'fs';
import path from 'path';
import db from '../connection.js';

const __dirname = new URL('.', import.meta.url).pathname;
const MIGRATION_DIR = path.join(__dirname, '../migrations');

async function rollbackLastMigration() {
  const [rows] = await db.query(`
    SELECT name FROM migrations
    ORDER BY id DESC
    LIMIT 1
  `);

  if (rows.length === 0) {
    console.log('⚠ No migrations to rollback');
    process.exit(0);
  }

  const file = rows[0].name;
  console.log(`⏪ Rolling back: ${file}`);

  const migration = await import(
    path.join(MIGRATION_DIR, file)
  );

  await migration.down(db);
  await db.query(
    `DELETE FROM migrations WHERE name = ?`,
    [file]
  );

  console.log(`✔ Rolled back: ${file}`);
  process.exit(0);
}

rollbackLastMigration().catch(err => {
  console.error('❌ Rollback failed:', err);
  process.exit(1);
});
