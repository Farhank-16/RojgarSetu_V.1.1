import { supabase } from './supabase';

export const authService = {
  requestOTP: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return { success: true };
  },

  verifyOTP: async (email, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email, token: otp, type: 'email'
    });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from('profiles').select('*, user_skills(skill_id, skills(id, name))')
      .eq('id', user.id).single();
    return profile;
  }
};