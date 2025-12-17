import fs from 'fs';
import path from 'path';
import db from '../connection.js';

const __dirname = new URL('.', import.meta.url).pathname;
const MIGRATION_DIR = path.join(__dirname, '../migrations');

async function ensureMigrationTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations() {
  const [rows] = await db.query(`SELECT name FROM migrations`);
  return rows.map(r => r.name);
}

async function runMigrations() {
  await ensureMigrationTable();

  const executed = await getExecutedMigrations();
  const files = fs.readdirSync(MIGRATION_DIR).sort();

  for (const file of files) {
    if (!executed.includes(file)) {
      console.log(`▶ Running migration: ${file}`);
      const migration = await import(
        path.join(MIGRATION_DIR, file)
      );

      await migration.up(db);
      await db.query(
        `INSERT INTO migrations (name) VALUES (?)`,
        [file]
      );

      console.log(`✔ Migration completed: ${file}`);
    }
  }

  console.log('🎉 All migrations are up to date');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
