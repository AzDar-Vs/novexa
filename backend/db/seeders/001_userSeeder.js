import bcrypt from 'bcryptjs';

export async function seed(db) {
  const password = await bcrypt.hash('admin123', 10);

  await db.query(`
    INSERT INTO user (NAMA, EMAIL, PASSWORD, ROLE)
    VALUES (?, ?, ?, ?)
  `, [
    'Admin Novexa',
    'admin@novexa.com',
    password,
    'admin'
  ]);
}
