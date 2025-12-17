const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // HTTP request log file
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      level: 'http',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    }),
    
    // Audit log file
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      maxsize: 5242880,
      maxFiles: 3,
      tailable: true
    })
  ]
});

// Add custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    audit: 5
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
    audit: 'cyan'
  }
};

winston.addColors(customLevels.colors);

// Logging utility functions
const log = {
  // Error logging
  error: (message, meta = {}) => {
    logger.error(message, meta);
  },
  
  // Warning logging
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },
  
  // Info logging
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },
  
  // Debug logging
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },
  
  // HTTP request logging
  http: (message, meta = {}) => {
    logger.log('http', message, meta);
  },
  
  // Audit logging (for security-sensitive operations)
  audit: (message, meta = {}) => {
    logger.log('audit', message, meta);
  },
  
  // Database query logging
  db: {
    query: (sql, params, duration) => {
      logger.debug('Database Query', {
        sql: sql.length > 200 ? sql.substring(0, 200) + '...' : sql,
        params: params,
        duration: `${duration}ms`
      });
    },
    
    error: (error, sql, params) => {
      logger.error('Database Error', {
        message: error.message,
        sql: sql.length > 200 ? sql.substring(0, 200) + '...' : sql,
        params: params,
        code: error.code,
        stack: error.stack
      });
    }
  },
  
  // User activity logging
  user: {
    login: (userId, email, success, ip) => {
      const level = success ? 'info' : 'warn';
      logger.log(level, 'User Login', {
        userId,
        email,
        success,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    
    register: (userId, email, ip) => {
      logger.info('User Register', {
        userId,
        email,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    
    passwordChange: (userId) => {
      logger.audit('Password Change', {
        userId,
        timestamp: new Date().toISOString()
      });
    },
    
    roleChange: (userId, oldRole, newRole, changedBy) => {
      logger.audit('Role Change', {
        userId,
        oldRole,
        newRole,
        changedBy,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Transaction logging
  transaction: {
    created: (transactionId, userId, amount) => {
      logger.info('Transaction Created', {
        transactionId,
        userId,
        amount,
        timestamp: new Date().toISOString()
      });
    },
    
    completed: (transactionId, userId, amount) => {
      logger.info('Transaction Completed', {
        transactionId,
        userId,
        amount,
        timestamp: new Date().toISOString()
      });
    },
    
    failed: (transactionId, userId, amount, reason) => {
      logger.warn('Transaction Failed', {
        transactionId,
        userId,
        amount,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Book logging
  book: {
    created: (bookId, userId, title) => {
      logger.info('Book Created', {
        bookId,
        userId,
        title,
        timestamp: new Date().toISOString()
      });
    },
    
    updated: (bookId, userId, title) => {
      logger.info('Book Updated', {
        bookId,
        userId,
        title,
        timestamp: new Date().toISOString()
      });
    },
    
    deleted: (bookId, userId, title) => {
      logger.warn('Book Deleted', {
        bookId,
        userId,
        title,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // File upload logging
  upload: {
    success: (filename, size, userId) => {
      logger.info('File Upload Success', {
        filename,
        size,
        userId,
        timestamp: new Date().toISOString()
      });
    },
    
    failed: (filename, error, userId) => {
      logger.error('File Upload Failed', {
        filename,
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // API request logging middleware
  middleware: (req, res, next) => {
    const start = Date.now();
    
    // Log request
    logger.http(`→ ${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user ? req.user.id : 'guest',
      params: req.params,
      query: req.query
    });
    
    // Capture response
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - start;
      
      // Log response
      logger.http(`← ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length'),
        userId: req.user ? req.user.id : 'guest'
      });
      
      originalSend.call(this, body);
    };
    
    next();
  },
  
  // Error logging middleware
  errorMiddleware: (err, req, res, next) => {
    logger.error(err.message, {
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: req.user ? req.user.id : null,
      body: req.body,
      params: req.params,
      query: req.query
    });
    
    next(err);
  },
  
  // Create log stream for Morgan
  stream: {
    write: (message) => {
      logger.http(message.trim());
    }
  }
};

// Export logger and utility functions
module.exports = log;