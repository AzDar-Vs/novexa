const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
const fs = require('fs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create Winston logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for HTTP requests
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      level: 'http',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// HTTP request logger middleware
const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.http(`→ ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user ? req.user.id : 'guest'
  });
  
  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    
    // Log response
    logger.http(`← ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });
    
    originalSend.call(this, body);
  };
  
  next();
};

// API logger middleware
const apiLogger = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user ? req.user.id : null,
    body: req.body,
    params: req.params,
    query: req.query
  };
  
  // Don't log sensitive data
  if (logData.body && logData.body.password) {
    logData.body.password = '[REDACTED]';
  }
  if (logData.body && logData.body.confirm_password) {
    logData.body.confirm_password = '[REDACTED]';
  }
  if (logData.body && logData.body.token) {
    logData.body.token = '[REDACTED]';
  }
  
  logger.info('API Request', logData);
  next();
};

// Error logger middleware
const errorLogger = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user ? req.user.id : null,
    body: req.body,
    params: req.params
  });
  
  next(err);
};

// Database query logger
const dbLogger = {
  query: (sql, params) => {
    logger.debug('Database Query', {
      sql: sql.length > 200 ? sql.substring(0, 200) + '...' : sql,
      params: params
    });
  },
  
  error: (error, sql, params) => {
    logger.error('Database Error', {
      message: error.message,
      sql: sql.length > 200 ? sql.substring(0, 200) + '...' : sql,
      params: params,
      code: error.code
    });
  }
};

// Activity logger
const activityLogger = {
  userLogin: (userId, email, success, ip) => {
    logger.info('User Login', {
      userId,
      email,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  userRegister: (userId, email, ip) => {
    logger.info('User Register', {
      userId,
      email,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  transactionCreated: (transactionId, userId, amount) => {
    logger.info('Transaction Created', {
      transactionId,
      userId,
      amount,
      timestamp: new Date().toISOString()
    });
  },
  
  bookCreated: (bookId, userId, title) => {
    logger.info('Book Created', {
      bookId,
      userId,
      title,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  httpLogger,
  apiLogger,
  errorLogger,
  dbLogger,
  activityLogger
};