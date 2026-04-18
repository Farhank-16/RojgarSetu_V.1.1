require('dotenv').config();

module.exports = {
  port:    process.env.PORT     || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  supabase: {
    url:        process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  razorpay: {
    keyId:     process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  prices: {
    subscriptionFirstMonth: parseInt(process.env.SUBSCRIPTION_FIRST_MONTH) || 900,
    subscriptionRegular:    parseInt(process.env.SUBSCRIPTION_REGULAR)     || 9900,
    skillExam:              parseInt(process.env.SKILL_EXAM_PRICE)         || 4900,
    verifiedBadge:          parseInt(process.env.VERIFIED_BADGE_PRICE)     || 9900,
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};