const bcrypt = require('bcryptjs');

(async () => {
  const plain = '123456';
  const hash = await bcrypt.hash(plain, 10);

  console.log('HASH:', hash);
  console.log(
    'COMPARE RESULT:',
    await bcrypt.compare(plain, hash)
  );
})();
