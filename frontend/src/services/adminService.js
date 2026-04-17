import { supabase } from './supabase';

export const adminService = {
  getDashboardStats: async () => {
    const [
      { count: totalUsers },
      { count: seekers },
      { count: employers },
      { count: activeSubs },
      { count: verified },
      { count: totalJobs },
      { count: activeJobs },
      { data: payments },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'job_seeker'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('payments').select('amount, status').eq('status', 'completed'),
    ]);

    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      users:    { total: totalUsers, jobSeekers: seekers, employers, activeSubscriptions: activeSubs, verifiedUsers: verified },
      jobs:     { total: totalJobs, active: activeJobs },
      payments: { total: payments?.length || 0, totalRevenue },
    };
  },

  getUsers: async ({ page = 1, limit = 10, role, search } = {}) => {
    let query = supabase.from('profiles')
      .select('*', { count: 'exact' })
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
      .range((page-1)*limit, page*limit - 1);

    if (role)   query = query.eq('role', role);
    if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    return { users: data || [], pagination: { page, limit, total: count, pages: Math.ceil(count/limit) } };
  },

  updateUserStatus: async (id, { isActive, isVerified }) => {
    const updates = {};
    if (isActive   !== undefined) updates.is_active   = isActive;
    if (isVerified !== undefined) updates.is_verified = isVerified;
    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  getAllJobs: async ({ page = 1, limit = 10, status, search } = {}) => {
    let query = supabase.from('jobs')
      .select('*, profiles!employer_id(name), job_skills(skills(name))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page-1)*limit, page*limit - 1);

    if (status === 'active')   query = query.eq('is_active', true);
    if (status === 'inactive') query = query.eq('is_active', false);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      jobs: (data || []).map(j => ({
        ...j,
        employer_name: j.profiles?.name,
        skill_name:    j.job_skills?.[0]?.skills?.name,
      })),
      pagination: { page, limit, total: count, pages: Math.ceil(count/limit) }
    };
  },

  getSkills: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select(`
        *,
        user_skills(count),
        job_skills(count),
        exams(count)
      `)
      .order('name');

    if (error) throw error;
    return {
      skills: (data || []).map(s => ({
        ...s,
        users_count:     s.user_skills?.length || 0,
        jobs_count:      s.job_skills?.length  || 0,
        questions_count: s.exams?.length        || 0,
      }))
    };
  },

  createSkill: async (data) => {
    const { data: skill, error } = await supabase.from('skills').insert(data).select().single();
    if (error) throw error;
    return { success: true, skill };
  },

  updateSkill: async (id, data) => {
    const { error } = await supabase.from('skills').update(data).eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  getQuestions: async ({ skillId } = {}) => {
    let query = supabase
      .from('exams')
      .select('*, skills(name)')
      .order('created_at', { ascending: false });

    if (skillId) query = query.eq('skill_id', skillId);

    const { data, error } = await query;
    if (error) throw error;

    return {
      questions: (data || []).map(q => ({ ...q, skill_name: q.skills?.name })),
      total: data?.length || 0,
    };
  },

  createQuestion: async (data) => {
    const { skillId, optionA, optionB, optionC, optionD, correctOption, difficulty, question } = data;
    const { data: q, error } = await supabase.from('exams').insert({
      skill_id: skillId, question, option_a: optionA, option_b: optionB,
      option_c: optionC, option_d: optionD, correct_option: correctOption,
      difficulty: difficulty || 'medium',
    }).select().single();
    if (error) throw error;
    return { success: true, questionId: q.id };
  },

  updateQuestion: async (id, data) => {
    const { optionA, optionB, optionC, optionD, correctOption, ...rest } = data;
    const { error } = await supabase.from('exams').update({
      ...rest,
      option_a: optionA, option_b: optionB,
      option_c: optionC, option_d: optionD,
      correct_option: correctOption,
    }).eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  deleteQuestion: async (id) => {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  getPayments: async ({ page = 1, limit = 20, status, type } = {}) => {
    let query = supabase.from('payments')
      .select('*, profiles!user_id(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page-1)*limit, page*limit - 1);

    if (status) query = query.eq('status', status);
    if (type)   query = query.eq('payment_type', type);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      payments: (data || []).map(p => ({
        ...p,
        user_name:   p.profiles?.name,
        user_mobile: p.profiles?.email,
      })),
      pagination: { page, limit, total: count, pages: Math.ceil(count/limit) }
    };
  },
};