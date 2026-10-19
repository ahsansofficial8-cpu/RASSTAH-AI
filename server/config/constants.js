/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: constants.js
 * PATH: server/config/constants.js
 * PURPOSE: Central backend configuration constants, branding tokens, API codes,
 *          security parameters, and rate-limiting limits.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

const BRAND = {
  NAME: 'RAASTAH',
  URDU_NAME: 'راستہ',
  TAGLINE: 'THE INTELLIGENT WAY',
  COMPANY: 'Apex Wireframe Pvt Ltd',
  LEAD: 'Ahsan Warraich',
  VERSION: '2.4.0',
  SUPPORT_EMAIL: 'support@raastah.pk',
  CONTACT_PHONE: '+92 300 1234567'
};

const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUIDE: 'guide'
};

const SECURITY = {
  SALT_ROUNDS: 10,
  TOKEN_EXPIRY_DAYS: 7,
  COOKIE_NAME: 'token',
  RATE_LIMIT_API_WINDOW_MS: 60 * 1000,
  RATE_LIMIT_API_MAX: 120,
  RATE_LIMIT_AUTH_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_AUTH_MAX: 15
};

const CORS_WHITELIST = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://raastah.vercel.app'
];

const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

module.exports = {
  BRAND,
  ROLES,
  SECURITY,
  CORS_WHITELIST,
  BOOKING_STATUS
};
