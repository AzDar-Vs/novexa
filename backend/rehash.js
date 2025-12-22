const bcrypt = require('bcryptjs');

(async () => {
  const hash = await bcrypt.hash('Admint123', 10);
  console.log(hash);
})();
