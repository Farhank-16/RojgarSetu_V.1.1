const express = require('express');
const router  = express.Router();
const { authenticate }  = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimit');
const {
  createSubscriptionOrder,
  createExamOrder,
  createBadgeOrder,
  verifyPayment,
  getPaymentHistory,
  getSubscriptionStatus,
} = require('../controllers/paymentController');

router.post('/subscription/create', authenticate, paymentLimiter, createSubscriptionOrder);
router.post('/exam/create',         authenticate, paymentLimiter, createExamOrder);
router.post('/badge/create',        authenticate, paymentLimiter, createBadgeOrder);
router.post('/verify',              authenticate, verifyPayment);
router.get('/history',              authenticate, getPaymentHistory);
router.get('/subscription/status',  authenticate, getSubscriptionStatus);

module.exports = router;