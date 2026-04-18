const config         = require('../config/config');
const razorpayService = require('../services/razorpay');
const { createClient } = require('@supabase/supabase-js');

// Supabase admin client — bypasses RLS
const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

const createSubscriptionOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if first subscription
    const { data: payments } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', userId)
      .eq('payment_type', 'subscription')
      .eq('status', 'completed');

    const isFirstMonth = !payments?.length;
    const amount = isFirstMonth ? config.prices.subscriptionFirstMonth : config.prices.subscriptionRegular;

    const order = await razorpayService.createOrder(amount, `SUB_${Date.now()}`, {
      user_id: userId, type: 'subscription',
    });

    await supabase.from('payments').insert({
      user_id:           userId,
      payment_type:      'subscription',
      amount,
      razorpay_order_id: order.id,
      status:            'created',
    });

    res.json({
      success: true,
      order:   { id: order.id, amount: order.amount, currency: order.currency },
      key:     config.razorpay.keyId,
      isFirstMonth,
      displayAmount: `₹${amount / 100}`,
    });
  } catch (error) {
    console.error('Create Subscription Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const createExamOrder = async (req, res) => {
  try {
    const userId  = req.user.id;
    const skillId = req.body.skillId;
    if (!skillId) return res.status(400).json({ error: 'Skill ID required' });

    const { data: skill } = await supabase
      .from('skills').select('id, name').eq('id', skillId).single();
    if (!skill) return res.status(404).json({ error: 'Skill not found' });

    const amount = config.prices.skillExam;
    const order  = await razorpayService.createOrder(amount, `EXAM_${Date.now()}`, {
      user_id: userId, type: 'skill_exam', skill_id: skillId,
    });

    await supabase.from('payments').insert({
      user_id:           userId,
      payment_type:      'skill_exam',
      amount,
      razorpay_order_id: order.id,
      status:            'created',
    });

    res.json({
      success: true,
      order:   { id: order.id, amount: order.amount, currency: order.currency },
      key:     config.razorpay.keyId,
      skill,
      displayAmount: `₹${amount / 100}`,
    });
  } catch (error) {
    console.error('Create Exam Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const createBadgeOrder = async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from('profiles').select('is_verified').eq('id', req.user.id).single();
    if (profile?.is_verified) return res.status(400).json({ error: 'Already verified' });

    const amount = config.prices.verifiedBadge;
    const order  = await razorpayService.createOrder(amount, `BADGE_${Date.now()}`, {
      user_id: req.user.id, type: 'verified_badge',
    });

    await supabase.from('payments').insert({
      user_id:           req.user.id,
      payment_type:      'verified_badge',
      amount,
      razorpay_order_id: order.id,
      status:            'created',
    });

    res.json({
      success: true,
      order:   { id: order.id, amount: order.amount, currency: order.currency },
      key:     config.razorpay.keyId,
      displayAmount: `₹${amount / 100}`,
    });
  } catch (error) {
    console.error('Create Badge Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentType } = req.body;
    const userId = req.user.id;

    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    );
    if (!isValid) {
      await supabase.from('payments').update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment record
    await supabase.from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'completed',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', userId);

    // Update profile based on payment type
    if (paymentType === 'subscription') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      await supabase.from('profiles').update({
        subscription_status: 'active',
        subscription_end:    endDate.toISOString(),
        is_verified:         true,
      }).eq('id', userId);
    }

    if (paymentType === 'verified_badge') {
      await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
    }

    res.json({ success: true, message: 'Payment verified', paymentType });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from  = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;
    res.json({ payments: data, pagination: { page, limit, total: count, pages: Math.ceil(count / limit) } });
  } catch (error) {
    console.error('Get Payment History Error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};


const getSubscriptionStatus = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_end')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({
      status:  data?.subscription_status || 'free',
      endDate: data?.subscription_end    || null,
      prices: {
        firstMonth: config.prices.subscriptionFirstMonth / 100,
        regular:    config.prices.subscriptionRegular    / 100,
        exam:       config.prices.skillExam              / 100,
        badge:      config.prices.verifiedBadge          / 100,
      },
    });
  } catch (error) {
    console.error('Get Subscription Status Error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

module.exports = { createSubscriptionOrder, createExamOrder, createBadgeOrder, verifyPayment, getPaymentHistory, getSubscriptionStatus };