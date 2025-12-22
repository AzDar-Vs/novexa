const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */
const authRoutes = require('./routes/auth.routes');
const keranjangRoutes = require('./routes/keranjang.routes');
const transaksiRoutes = require('./routes/transaksi.routes');
const bukuRoutes = require('./routes/buku.routes');
const genreRoutes = require('./routes/genre.routes');
const userRoutes = require('./routes/user.routes');
const buyerRoutes = require('./routes/buyer.routes');
const cartRoutes = require('./routes/cart.api.route');
const checkoutRoutes = require('./routes/checkout.routes');
const orderRoutes = require('./routes/order.routes');
const readerRoutes = require('./routes/reader.routes');
const reviewRoutes = require('./routes/review.routes');
const sellerRoutes = require('./routes/seller.routes');

/* ================= API ================= */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/buku', bukuRoutes);
app.use('/api/genre', genreRoutes);

app.use('/api/keranjang', keranjangRoutes);
app.use('/api/transaksi', transaksiRoutes);

app.use('/api/buyer', buyerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reader', readerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seller', sellerRoutes);

/* ================= STATIC ================= */
app.use(
  '/uploads/covers',
  express.static(path.join(__dirname, 'uploads/covers'))
);

/* ================= 404 HANDLER (PENTING) ================= */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

app.get('/', (req, res) => {
  res.send('API NOVEXA jalan di Railway 🚄');
});

module.exports = app;





