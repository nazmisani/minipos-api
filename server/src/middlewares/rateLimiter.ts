import rateLimit from "express-rate-limit";

// General rate limiter untuk semua endpoint
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: {
    error: "Too Many Requests",
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth rate limiter - lebih strict untuk login/auth
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    error: "Too Many Login Attempts",
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});

// Create/POST operations rate limiter
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 create operations per hour
  message: {
    error: "Too Many Create Requests",
    message:
      "Too many create requests from this IP, please try again after 1 hour.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin users (optional)
    return req.loginInfo?.role === "admin";
  },
});

// Transaction rate limiter - untuk endpoint transaksi
export const transactionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 transactions per 10 minutes
  message: {
    error: "Too Many Transaction Requests",
    message:
      "Too many transaction requests from this IP, please try again after 10 minutes.",
    retryAfter: 10 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// User management rate limiter - untuk operasi user
export const userManagementLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 user operations per hour
  message: {
    error: "Too Many User Management Requests",
    message:
      "Too many user management requests from this IP, please try again after 1 hour.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password change rate limiter - sangat strict
export const passwordChangeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Only 3 password changes per day
  message: {
    error: "Too Many Password Change Attempts",
    message:
      "Too many password change attempts from this IP, please try again after 24 hours.",
    retryAfter: 24 * 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
