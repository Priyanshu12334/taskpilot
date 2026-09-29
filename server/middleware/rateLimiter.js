const { rateLimit } = require('express-rate-limit');

// General API rate limiter for all /api endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // Max 500 requests per 15 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.originalUrl === '/api/health',
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict rate limiter for login attempts (mitigates brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 login attempts per 15 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  }
});

// Rate limiter for user registrations (prevents spam account creation)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Max 10 registrations per hour per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many accounts created from this IP, please try again after an hour.'
  }
});

// Rate limiter for AI task description generation (protects Gemini API quota)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Max 20 AI generation requests per 15 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many AI generation requests, please try again after 15 minutes.'
  }
});

// Rate limiter for contact / support message submissions (prevents form spam)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 messages per 15 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many contact messages submitted, please try again after 15 minutes.'
  }
});

// Rate limiter for password updates
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 password update attempts per 15 minutes per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many password update attempts, please try again after 15 minutes.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  registerLimiter,
  aiLimiter,
  contactLimiter,
  passwordLimiter
};
