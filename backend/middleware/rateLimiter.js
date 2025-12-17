const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const ResponseHandler = require('../utils/response');

// Initialize Redis client if available
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
}

// Rate limit store
const store = redisClient 
  ? new RedisStore({
      client: redisClient,
      prefix: 'rl:'
    })
  : new rateLimit.MemoryStore();

// General API rate limiter
const apiLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    ResponseHandler.error(
      res, 
      'Terlalu banyak request dari IP ini. Silakan coba lagi dalam 15 menit.',
      429
    );
  },
  keyGenerator: (req) => {
    return req.ip; // Use IP address as key
  }
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    ResponseHandler.error(
      res, 
      'Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.',
      429
    );
  },
  keyGenerator: (req) => {
    return `${req.ip}:${req.body.email || req.ip}`;
  }
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    ResponseHandler.error(
      res, 
      'Terlalu banyak upload. Silakan coba lagi dalam 1 jam.',
      429
    );
  }
});

// API key rate limiter (for third-party integrations)
const apiKeyLimiter = (maxRequests = 100) => {
  return rateLimit({
    store,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: maxRequests,
    skipSuccessfulRequests: false,
    keyGenerator: (req) => {
      const apiKey = req.headers['x-api-key'] || req.query.api_key;
      return apiKey || req.ip;
    },
    handler: (req, res) => {
      ResponseHandler.error(
        res, 
        `API key rate limit exceeded. Max ${maxRequests} requests per hour.`,
        429
      );
    }
  });
};

// User-specific rate limiter
const userLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour per user
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.user ? `user:${req.user.id}` : req.ip;
  },
  handler: (req, res) => {
    ResponseHandler.error(
      res, 
      'Terlalu banyak request. Silakan coba lagi dalam 1 jam.',
      429
    );
  }
});

// Dynamic rate limiter based on user role
const dynamicLimiter = (req, res, next) => {
  let limiter;
  
  if (!req.user) {
    // Guest users: strict limits
    limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
      keyGenerator: () => req.ip
    });
  } else if (req.user.role === 'admin') {
    // Admin: high limits
    limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      keyGenerator: () => `admin:${req.user.id}`
    });
  } else if (req.user.role === 'author') {
    // Authors: medium limits
    limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      keyGenerator: () => `author:${req.user.id}`
    });
  } else {
    // Regular users: normal limits
    limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      keyGenerator: () => `user:${req.user.id}`
    });
  }
  
  return limiter(req, res, next);
};

// Rate limit reset endpoint (admin only)
const resetRateLimit = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return ResponseHandler.forbidden(res, 'Hanya admin yang dapat mereset rate limit');
    }
    
    const { key } = req.body;
    
    if (!key) {
      return ResponseHandler.badRequest(res, 'Key diperlukan');
    }
    
    if (redisClient) {
      await redisClient.del(`rl:${key}`);
      await redisClient.del(`rl:${key}:count`);
      await redisClient.del(`rl:${key}:reset`);
    }
    
    ResponseHandler.success(res, null, 'Rate limit berhasil direset');
    
  } catch (error) {
    console.error('Reset rate limit error:', error);
    ResponseHandler.error(res, 'Gagal mereset rate limit');
  }
};

// Get rate limit info
const getRateLimitInfo = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return ResponseHandler.forbidden(res, 'Hanya admin yang dapat melihat info rate limit');
    }
    
    const { key } = req.query;
    
    if (!key) {
      return ResponseHandler.badRequest(res, 'Key diperlukan');
    }
    
    let info = {};
    
    if (redisClient) {
      const count = await redisClient.get(`rl:${key}:count`);
      const reset = await redisClient.get(`rl:${key}:reset`);
      
      info = {
        key,
        count: parseInt(count) || 0,
        reset: reset ? new Date(parseInt(reset)) : null,
        remaining: 100 - (parseInt(count) || 0) // assuming max 100
      };
    }
    
    ResponseHandler.success(res, info);
    
  } catch (error) {
    console.error('Get rate limit info error:', error);
    ResponseHandler.error(res, 'Gagal mengambil info rate limit');
  }
};

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  apiKeyLimiter,
  userLimiter,
  dynamicLimiter,
  resetRateLimit,
  getRateLimitInfo
};