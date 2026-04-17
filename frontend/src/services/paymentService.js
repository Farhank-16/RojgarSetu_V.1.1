import { supabase } from './supabase';
import api from './api';

export const paymentService = {
  createSubscriptionOrder: () => api.post('/payments/subscription/create').then(r => r.data),
  createExamOrder:         (skillId) => api.post('/payments/exam/create', { skillId }).then(r => r.data),
  createBadgeOrder:        () => api.post('/payments/badge/create').then(r => r.data),

  // After payment verify — auto update profile based on payment type
  verifyPayment: async (data) => {
    const result = await api.post('/payments/verify', data);
    if (!result.data?.success) return result.data;

    const { paymentType } = data;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return result.data;

    const updates = {};

    if (paymentType === 'subscription') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      updates.subscription_status = 'active';
      updates.subscription_end    = endDate.toISOString();
      updates.is_verified         = true; // subscription = auto verified badge
    }

    if (paymentType === 'verified_badge') {
      updates.is_verified = true;
    }

    if (paymentType === 'skill_exam') {
      // exam pass/fail handled separately in examService
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }

    return result.data;
  },

  getPaymentHistory: (page = 1, limit = 10) =>
    api.get(`/payments/history?page=${page}&limit=${limit}`).then(r => r.data),

  getSubscriptionStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 'free' };
    const { data } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_end')
      .eq('id', user.id)
      .single();
    return { status: data?.subscription_status || 'free', endDate: data?.subscription_end };
  },

  openRazorpay: (options) => new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...options,
      handler: (response) => resolve(response),
      modal:   { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.open();
  }),
};