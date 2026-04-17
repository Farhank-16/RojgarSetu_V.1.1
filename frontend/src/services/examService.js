import { supabase } from './supabase';

const MIN_QUESTIONS = 10;
const EXAM_LENGTH   = 10;
const PASS_MARK     = 6;

export const examService = {
  getAvailableExams: async () => {
    // Get skills with at least 10 active questions
    const { data, error } = await supabase
      .from('skills')
      .select('*, exams(id)')
      .eq('is_active', true);

    if (error) throw error;

    const { data: { user } } = await supabase.auth.getUser();

    // Get user's skills and passed exams
    let userSkillIds   = new Set();
    let passedSkillIds = new Set();

    if (user) {
      const { data: us } = await supabase.from('user_skills').select('skill_id').eq('user_id', user.id);
      userSkillIds = new Set(us?.map(s => s.skill_id));

      const { data: pa } = await supabase.from('exam_attempts')
        .select('skill_id').eq('user_id', user.id).eq('passed', true);
      passedSkillIds = new Set(pa?.map(p => p.skill_id));
    }

    const exams = (data || [])
      .filter(s => (s.exams?.length || 0) >= MIN_QUESTIONS)
      .map(s => ({
        id:             s.id,
        skill_id:       s.id,
        name:           s.name,
        category:       s.category,
        question_count: s.exams?.length || 0,
        passed:         passedSkillIds.has(s.id),
        isMySkill:      userSkillIds.has(s.id),
      }))
      .sort((a, b) => (a.isMySkill === b.isMySkill ? 0 : a.isMySkill ? -1 : 1));

    return { exams };
  },

  startExam: async (skillId) => {
    const { data: { user } } = await supabase.auth.getUser();

    // Check subscription
    const { data: profile } = await supabase.from('profiles')
      .select('subscription_status').eq('id', user.id).single();

    if (profile?.subscription_status !== 'active') {
      throw { code: 'SUBSCRIPTION_REQUIRED', error: 'Subscription required' };
    }

    // Check payment for this exam
    const { data: attempt } = await supabase.from('exam_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('skill_id', skillId)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!attempt) throw { code: 'PAYMENT_REQUIRED', error: 'Payment required' };

    // Resume if questions already loaded
    if (attempt.questions_data) {
      return {
        attemptId:  attempt.id,
        questions:  attempt.questions_data,
        timeLimit:  15 * 60,
      };
    }

    // Fetch random 10 questions
    const { data: allQs, error } = await supabase
      .from('exams')
      .select('id, question, option_a, option_b, option_c, option_d')
      .eq('skill_id', skillId)
      .eq('is_active', true);

    if (error) throw error;

    // Shuffle and take 10
    const shuffled  = allQs.sort(() => Math.random() - 0.5).slice(0, EXAM_LENGTH);
    const questions = shuffled.map(q => ({
      id: q.id, question: q.question,
      optionA: q.option_a, optionB: q.option_b,
      optionC: q.option_c, optionD: q.option_d,
    }));

    // Save questions to attempt
    await supabase.from('exam_attempts')
      .update({ questions_data: questions, started_at: new Date().toISOString() })
      .eq('id', attempt.id);

    return { attemptId: attempt.id, questions, timeLimit: 15 * 60 };
  },

  submitExam: async (attemptId, answers) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: attempt } = await supabase.from('exam_attempts')
      .select('*, exams_questions:questions_data')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .is('completed_at', null)
      .single();

    if (!attempt) throw new Error('Attempt not found');

    // Get correct answers from DB
    const qIds = attempt.questions_data.map(q => q.id);
    const { data: correctQs } = await supabase.from('exams')
      .select('id, correct_option').in('id', qIds);

    let score = 0;
    const results = attempt.questions_data.map(q => {
      const correct   = correctQs?.find(cq => cq.id === q.id)?.correct_option;
      const userAns   = answers[q.id];
      const isCorrect = userAns === correct;
      if (isCorrect) score++;
      return { questionId: q.id, userAnswer: userAns, correctAnswer: correct, isCorrect };
    });

    const passed = score >= PASS_MARK;

    await supabase.from('exam_attempts').update({
      answers_data: answers, score, passed,
      completed_at: new Date().toISOString(),
    }).eq('id', attemptId);

    if (passed) {
      await supabase.from('profiles').update({ exam_passed: true }).eq('id', user.id);
    }

    return {
      success: true, score,
      totalQuestions: attempt.questions_data.length,
      passed, percentage: Math.round((score / attempt.questions_data.length) * 100),
      results,
      message: passed ? 'Congratulations! You passed.' : 'You did not pass. Try again.',
    };
  },

  getExamHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('exam_attempts')
      .select('*, skills(name)')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return {
      attempts: (data || []).map(a => ({
        id: a.id, skillId: a.skill_id, skillName: a.skills?.name,
        score: a.score, totalQuestions: EXAM_LENGTH,
        passed: a.passed, completedAt: a.completed_at,
        percentage: Math.round((a.score / EXAM_LENGTH) * 100),
      }))
    };
  },
};