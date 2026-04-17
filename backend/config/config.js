require('dotenv').config();

module.exports = {
  port:    process.env.PORT     || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase — used by auth middleware
  supabase: {
    url:        process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  // MySQL still used by jobController, examController, paymentController etc.
  db: {
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'jobnest_db',
    port:     process.env.DB_PORT     || 3306,
  },

  // JWT config kept for backward compat — not used for auth anymore
  jwt: {
    secret:    process.env.JWT_SECRET     || 'unused_now_supabase_handles_auth',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  razorpay: {
    keyId:     process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  // Prices in paise (e.g., 900 = ₹9.00)
  prices: {
    subscriptionFirstMonth: parseInt(process.env.SUBSCRIPTION_FIRST_MONTH) || 900,
    subscriptionRegular:    parseInt(process.env.SUBSCRIPTION_REGULAR)     || 9900,
    skillExam:              parseInt(process.env.SKILL_EXAM_PRICE)         || 4900,
    verifiedBadge:          parseInt(process.env.VERIFIED_BADGE_PRICE)     || 9900,
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};