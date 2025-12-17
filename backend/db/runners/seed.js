import fs from 'fs';
import path from 'path';
import db from '../connection.js';

const __dirname = new URL('.', import.meta.url).pathname;
const SEEDER_DIR = path.join(__dirname, '../seeders');

async function ensureSeederTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS seeders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedSeeders() {
  const [rows] = await db.query(`SELECT name FROM seeders`);
  return rows.map(r => r.name);
}

async function runSeeders() {
  await ensureSeederTable();

  const executed = await getExecutedSeeders();
  const files = fs.readdirSync(SEEDER_DIR).sort();

  for (const file of files) {
    if (!executed.includes(file)) {
      console.log(`🌱 Seeding: ${file}`);

      const seeder = await import(
        path.join(SEEDER_DIR, file)
      );

      await seeder.seed(db);
      await db.query(
        `INSERT INTO seeders (name) VALUES (?)`,
        [file]
      );

      console.log(`✔ Seeded: ${file}`);
    }
  }

  console.log('🎉 All seeders executed');
  process.exit(0);
}

runSeeders().catch(err => {
  console.error('❌ Seeder failed:', err);
  process.exit(1);
});
