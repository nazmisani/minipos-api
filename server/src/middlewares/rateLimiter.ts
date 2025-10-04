import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too Many Requests",
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too Many Login Attempts",
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    error: "Too Many Create Requests",
    message:
      "Too many create requests from this IP, please try again after 1 hour.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.loginInfo?.role === "admin";
  },
});

export const transactionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: {
    error: "Too Many Transaction Requests",
    message:
      "Too many transaction requests from this IP, please try again after 10 minutes.",
    retryAfter: 10 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const userManagementLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: "Too Many User Management Requests",
    message:
      "Too many user management requests from this IP, please try again after 1 hour.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordChangeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: {
    error: "Too Many Password Change Attempts",
    message:
      "Too many password change attempts from this IP, please try again after 24 hours.",
    retryAfter: 24 * 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
