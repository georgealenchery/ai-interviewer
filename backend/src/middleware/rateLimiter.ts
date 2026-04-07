import rateLimit from "express-rate-limit";

// Global: 200 requests per minute per IP
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Auth routes: 20 requests per minute per IP (login/signup brute force protection)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later" },
});

// AI routes (evaluate, questions): 10 requests per minute per IP
// These call OpenAI and are expensive
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests, please try again later" },
});

// Code execution: 15 requests per minute per IP
export const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many execution requests, please try again later" },
});
