const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  app: {
    name: 'NOVEXA API',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    url: process.env.APP_URL || 'http://localhost:3000'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'novexa_db',
    dialect: 'mysql'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    path: process.env.UPLOAD_PATH || './uploads',
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
    allowedFileTypes: ['application/pdf', 'application/epub+zip']
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
};