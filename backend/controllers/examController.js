const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

const MIN_QUESTIONS = config.nodeEnv === 'development' ? 1 : 10;
const EXAM_LENGTH   = config.nodeEnv === 'development' ? 1 : 10;
const PASS_MARK     = config.nodeEnv === 'development' ? 1 : 6;

const formatQuestion = (q) => ({
  id:      q.id,
  question: q.question,
  optionA: q.option_a,
  optionB: q.option_b,
  optionC: q.option_c,
  optionD: q.option_d,
});

// ── Get Available Exams ───────────────────────────────────────────
const getAvailableExams = async (req, res) => {
  try {
    // Get all active skills
    const { data: skills, error } = await supabase
      .from('skills')
      .select('id, name, category, description')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;

    // Get question counts per skill
    const { data: examCounts } = await supabase
      .from('exams')
      .select('skill_id')
      .eq('is_active', true);

    const countMap = {};
    (examCounts || []).forEach(e => {
      countMap[e.skill_id] = (countMap[e.skill_id] || 0) + 1;
    });

    // Filter skills with enough questions
    let filteredSkills = skills.filter(s => (countMap[s.id] || 0) >= MIN_QUESTIONS)
      .map(s => ({ ...s, question_count: countMap[s.id] || 0 }));

    // Get user's passed exams and skills if logged in
    let userSkillIds   = new Set();
    let passedSkillIds = new Set();

    if (req.user) {
      const [{ data: userSkills }, { data: passed }] = await Promise.all([
        supabase.from('user_skills').select('skill_id').eq('user_id', req.user.id),
        supabase.from('exam_attempts').select('skill_id').eq('user_id', req.user.id).eq('passed', true),
      ]);
      userSkillIds   = new Set((userSkills  || []).map(s => s.skill_id));
      passedSkillIds = new Set((passed || []).map(p => p.skill_id));
    }

    const exams = filteredSkills
      .map(s => ({ ...s, passed: passedSkillIds.has(s.id), isMySkill: userSkillIds.has(s.id) }))
      .sort((a, b) => {
        if (a.isMySkill !== b.isMySkill) return a.isMySkill ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    res.json({ exams });
  } catch (error) {
    console.error('Get Available Exams Error:', error);
    res.status(500).json({ error: 'Failed to get exams' });
  }
};

// ── Start Exam ────────────────────────────────────────────────────
const startExam = async (req, res) => {
  try {
    const skillId = parseInt(req.params.skillId);
    const userId  = req.user.id;

    if (req.user.subscription_status !== 'active') {
      return res.status(403).json({ error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' });
    }

    // Check skill exists with enough questions
    const { data: skill } = await supabase
      .from('skills').select('id, name').eq('id', skillId).eq('is_active', true).single();
    if (!skill) return res.status(404).json({ error: 'Skill not found' });

    const { count } = await supabase
      .from('exams').select('*', { count: 'exact', head: true })
      .eq('skill_id', skillId).eq('is_active', true);
    if ((count || 0) < MIN_QUESTIONS)
      return res.status(404).json({ error: 'Exam not available for this skill' });

    // Check for unpaid/incomplete attempt
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!attempts?.length)
      return res.status(403).json({ error: 'Payment required', code: 'PAYMENT_REQUIRED' });

    const attempt = attempts[0];

    // Resume if questions already loaded
    if (attempt.questions_data) {
      const questions = attempt.questions_data;
      return res.json({ attemptId: attempt.id, questions: questions.map(formatQuestion), timeLimit: 15 * 60 });
    }

    // Fetch random questions
    const { data: allQ } = await supabase
      .from('exams')
      .select('id, question, option_a, option_b, option_c, option_d, correct_option')
      .eq('skill_id', skillId)
      .eq('is_active', true);

    // Shuffle and pick EXAM_LENGTH questions
    const shuffled = (allQ || []).sort(() => Math.random() - 0.5).slice(0, EXAM_LENGTH);
    if (shuffled.length < MIN_QUESTIONS)
      return res.status(400).json({ error: 'Not enough questions available' });

    await supabase.from('exam_attempts').update({
      questions_data: shuffled,
      started_at:     new Date().toISOString(),
    }).eq('id', attempt.id);

    res.json({ attemptId: attempt.id, questions: shuffled.map(formatQuestion), timeLimit: 15 * 60 });
  } catch (error) {
    console.error('Start Exam Error:', error);
    res.status(500).json({ error: 'Failed to start exam' });
  }
};

// ── Submit Exam ───────────────────────────────────────────────────
const submitExam = async (req, res) => {
  try {
    const { skillId } = req.body;
    const { answers } = req.body;
    const userId      = req.user.id;

    if (!answers || !skillId)
      return res.status(400).json({ error: 'skillId and answers required' });

    // Find the active attempt
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!attempts?.length)
      return res.status(404).json({ error: 'No active exam attempt found' });

    const attempt   = attempts[0];
    const questions = attempt.questions_data || [];

    let score = 0;
    const results = questions.map(q => {
      const userAnswer = answers[q.id];
      const isCorrect  = userAnswer === q.correct_option;
      if (isCorrect) score++;
      return { questionId: q.id, userAnswer, correctAnswer: q.correct_option, isCorrect };
    });

    const total  = questions.length || EXAM_LENGTH;
    const passed = score >= Math.min(PASS_MARK, total);

    // Save result
    await supabase.from('exam_attempts').update({
      answers_data: answers,
      score,
      passed,
      completed_at: new Date().toISOString(),
    }).eq('id', attempt.id);

    // If passed — update profile
    if (passed) {
      await supabase.from('profiles').update({ exam_passed: true }).eq('id', userId);
    }

    res.json({
      success:        true,
      score,
      totalQuestions: total,
      passed,
      percentage:     Math.round((score / total) * 100),
      results,
      message:        passed ? 'Congratulations! You passed.' : 'You did not pass. Try again.',
    });
  } catch (error) {
    console.error('Submit Exam Error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
};

// ── Exam History ──────────────────────────────────────────────────
const getExamHistory = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('id, skill_id, score, passed, completed_at, skills(name)')
      .eq('user_id', req.user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    res.json({
      attempts: (data || []).map(a => ({
        id:             a.id,
        skillId:        a.skill_id,
        skillName:      a.skills?.name,
        score:          a.score,
        totalQuestions: EXAM_LENGTH,
        passed:         !!a.passed,
        completedAt:    a.completed_at,
        percentage:     Math.round(((a.score || 0) / EXAM_LENGTH) * 100),
      })),
    });
  } catch (error) {
    console.error('Get Exam History Error:', error);
    res.status(500).json({ error: 'Failed to get exam history' });
  }
};

module.exports = { getAvailableExams, startExam, submitExam, getExamHistory };