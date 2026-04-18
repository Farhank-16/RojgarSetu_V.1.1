const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createSubscriptionOrder,
  createExamOrder,
  createBadgeOrder,
  verifyPayment,
  getPaymentHistory,
} = require('../controllers/paymentController');

router.post('/subscription/create', authenticate, createSubscriptionOrder);
router.post('/exam/create',         authenticate, createExamOrder);
router.post('/badge/create',        authenticate, createBadgeOrder);
router.post('/verify',              authenticate, verifyPayment);
router.get('/history',              authenticate, getPaymentHistory);

module.exports = router;