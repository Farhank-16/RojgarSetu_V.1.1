const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

const getPagination = (queryPage, queryLimit) => {
  const page  = Math.max(1, parseInt(queryPage) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryLimit) || 20));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;
  return { page, limit, from, to };
};

// ── Dashboard Stats ───────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: seekers },
      { count: employers },
      { count: activeSubs },
      { count: verified },
      { count: totalJobs },
      { count: activeJobs },
      { count: totalApplications },
      { count: totalPayments },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'job_seeker'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ]);

    // Calculate new users this week (created_at >= 7 days ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: newThisWeek } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'admin')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Calculate monthly revenue (completed payments in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: monthlyPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString());
    const monthlyRevenue = (monthlyPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0) / 100;

    // Total Revenue calc (in Rupees)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');
    const revenue = (payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0) / 100;

    res.json({
      totalUsers, seekers, employers, activeSubs,
      verifiedUsers: verified, totalJobs, activeJobs,
      totalApplications, totalPayments, revenue,
      newThisWeek: newThisWeek || 0,
      monthlyRevenue: monthlyRevenue || 0,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

// ── Get Users ─────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { page, limit, from, to } = getPagination(req.query.page, req.query.limit);
    const { search, role } = req.query;

    let query = supabase
      .from('profiles')
      .select('id, name, email, phone, role, city, area, is_active, is_verified, subscription_status, subscription_end, profile_completed, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (role)   query = query.eq('role', role);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      users: data || [],
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// ── Update User Status ────────────────────────────────────────────
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isVerified } = req.body;

    const updates = {};
    if (isActive   !== undefined) updates.is_active   = isActive;
    if (isVerified !== undefined) updates.is_verified = isVerified;

    if (!Object.keys(updates).length)
      return res.status(400).json({ error: 'No fields to update' });

    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: `User updated` });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// ── Get All Jobs ──────────────────────────────────────────────────
const getJobs = async (req, res) => {
  try {
    const { page, limit, from, to } = getPagination(req.query.page, req.query.limit);
    const { status } = req.query;

    let query = supabase
      .from('jobs')
      .select('id, title, city, area, job_type, is_active, views_count, applications_count, created_at, profiles!employer_id(name), job_skills(skills(name))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status === 'active')   query = query.eq('is_active', true);
    if (status === 'inactive') query = query.eq('is_active', false);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      jobs: (data || []).map(j => ({
        ...j,
        employer_name: j.profiles?.name,
        skill_name:    j.job_skills?.[0]?.skills?.name,
      })),
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

const getSkills = async (req, res) => {
  try {
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

    const skills = (data || []).map(s => {
      const users_count     = s.user_skills?.[0]?.count || 0;
      const jobs_count      = s.job_skills?.[0]?.count  || 0;
      const questions_count = s.exams?.[0]?.count        || 0;

      const { user_skills, job_skills, exams, ...rest } = s;
      return {
        ...rest,
        users_count,
        jobs_count,
        questions_count,
      };
    });

    res.json({ skills });
  } catch (error) {
    console.error('Get Skills Error:', error);
    res.status(500).json({ error: 'Failed to get skills' });
  }
};

const createSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const { data, error } = await supabase
      .from('skills')
      .insert({ name, category, description })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, skill: data });
  } catch (error) {
    console.error('Create Skill Error:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
};

const updateSkill = async (req, res) => {
  try {
    const { name, category, description, isActive } = req.body;
    const updates = {};
    if (name        !== undefined) updates.name        = name;
    if (category    !== undefined) updates.category    = category;
    if (description !== undefined) updates.description = description;
    if (isActive    !== undefined) updates.is_active   = isActive;

    const { error } = await supabase.from('skills').update(updates).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Update Skill Error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const { error } = await supabase.from('skills').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    console.error('Delete Skill Error:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
};

// ── Questions ─────────────────────────────────────────────────────
const getQuestions = async (req, res) => {
  try {
    const { skillId } = req.query;
    let query = supabase
      .from('exams')
      .select('*, skills(name)')
      .order('id');

    if (skillId) {
      query = query.eq('skill_id', skillId);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      questions: (data || []).map(q => ({ ...q, skill_name: q.skills?.name })),
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('Get Questions Error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { skillId, question, optionA, optionB, optionC, optionD, correctOption, difficulty } = req.body;
    if (!skillId || !question || !correctOption)
      return res.status(400).json({ error: 'skillId, question, correctOption required' });

    const { data, error } = await supabase.from('exams').insert({
      skill_id:       parseInt(skillId),
      question,
      option_a:       optionA,
      option_b:       optionB,
      option_c:       optionC,
      option_d:       optionD,
      correct_option: correctOption,
      difficulty:     difficulty || 'medium',
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, question: data });
  } catch (error) {
    console.error('Create Question Error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { question, optionA, optionB, optionC, optionD, correctOption, difficulty } = req.body;
    const updates = {};
    if (question      !== undefined) updates.question       = question;
    if (optionA       !== undefined) updates.option_a       = optionA;
    if (optionB       !== undefined) updates.option_b       = optionB;
    if (optionC       !== undefined) updates.option_c       = optionC;
    if (optionD       !== undefined) updates.option_d       = optionD;
    if (correctOption !== undefined) updates.correct_option = correctOption;
    if (difficulty    !== undefined) updates.difficulty     = difficulty;

    const { error } = await supabase.from('exams').update(updates).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Update Question Error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { error } = await supabase.from('exams').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete Question Error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// ── Payments (Admin view) ─────────────────────────────────────────
const getPayments = async (req, res) => {
  try {
    const { page, limit, from, to } = getPagination(req.query.page, req.query.limit);
    const { status, type } = req.query;

    let query = supabase
      .from('payments')
      .select('*, profiles!user_id(name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);
    if (type)   query = query.eq('payment_type', type);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      payments: (data || []).map(p => ({
        ...p,
        amount:      Number(p.amount) / 100,
        user_name:   p.profiles?.name,
        user_email:  p.profiles?.email,
        user_mobile: p.profiles?.phone,
      })),
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
};

module.exports = {
  getDashboardStats, getUsers, updateUserStatus,
  getJobs, getSkills, createSkill, updateSkill, deleteSkill,
  getQuestions, createQuestion, updateQuestion, deleteQuestion,
  getPayments,
};