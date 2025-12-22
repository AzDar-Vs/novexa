require('dotenv').config();
const app = require('./app');

const PORT = 5000;

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
