const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const config = require('./config/config');
const { handleUploadError } = require('./middleware/upload');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bukuRoutes = require('./routes/bukuRoutes');
const babRoutes = require('./routes/babRoutes');
const keranjangRoutes = require('./routes/keranjangRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notifikasiRoutes = require('./routes/notifikasiRoutes');

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NOVEXA API Documentation',
      version: '1.0.0',
      description: 'API documentation for NOVEXA E-book Platform'
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak request dari IP ini, coba lagi dalam 15 menit'
  }
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan(config.app.env === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.app.env
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/buku', bukuRoutes);
app.use('/api/bab', babRoutes);
app.use('/api/keranjang', keranjangRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifikasi', notifikasiRoutes);

// Handle upload errors
app.use(handleUploadError);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.app.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server ${config.app.name} is running on port ${PORT}`);
  console.log(`📚 Environment: ${config.app.env}`);
  console.log(`📝 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

//middleware
const { httpLogger, apiLogger, errorLogger } = require('./middleware/logger');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Gunakan middleware
app.use(httpLogger);
app.use('/api/', apiLogger);
app.use('/api/auth/', authLimiter);
app.use('/api/', apiLimiter);

// Tambahkan imports baru
const kategoriRoutes = require('./routes/kategoriRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const melihatRoutes = require('./routes/melihatRoutes');

// Tambahkan route middleware
app.use('/api/categories', kategoriRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/history', melihatRoutes);

// Tambahkan di server.js setelah routes lainnya
const kategoriRoutes = require('./routes/kategoriRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const melihatRoutes = require('./routes/melihatRoutes');

// Tambahkan route middleware
app.use('/api/categories', kategoriRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/history', melihatRoutes);

module.exports = app;