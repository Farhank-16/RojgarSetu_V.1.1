// ============================================================
// mockServices.js — All fake data, no backend needed
// Import all services from this single file
// ============================================================

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));

// ─── SKILLS DATA ─────────────────────────────────────────
const SKILLS = [
  { id: 1,  name: 'JavaScript',    category: 'Technology' },
  { id: 2,  name: 'Python',        category: 'Technology' },
  { id: 3,  name: 'Java',          category: 'Technology' },
  { id: 4,  name: 'React.js',      category: 'Technology' },
  { id: 5,  name: 'Node.js',       category: 'Technology' },
  { id: 6,  name: 'PHP',           category: 'Technology' },
  { id: 7,  name: 'MySQL',         category: 'Technology' },
  { id: 8,  name: 'MS Excel',      category: 'Technology' },
  { id: 9,  name: 'Tally ERP',     category: 'Technology' },
  { id: 10, name: 'Nursing',       category: 'Healthcare' },
  { id: 11, name: 'Pharmacy',      category: 'Healthcare' },
  { id: 12, name: 'Receptionist',  category: 'Office'     },
  { id: 13, name: 'HR Executive',  category: 'Office'     },
  { id: 14, name: 'Accountant',    category: 'Office'     },
  { id: 15, name: 'Manager',       category: 'Management' },
  { id: 16, name: 'Team Leader',   category: 'Management' },
  { id: 17, name: 'Electrician',   category: 'Trades'     },
  { id: 18, name: 'Driver',        category: 'Trades'     },
  { id: 19, name: 'Cook',          category: 'Trades'     },
  { id: 20, name: 'Graphic Design',category: 'Technology' },
];

// ─── JOBS DATA ────────────────────────────────────────────
const JOBS = [
  {
    id: 1, title: 'React Developer',
    employer_id: 2, employer_name: 'TechCorp Solutions', employer_verified: true,
    skill_id: 4, skill_name: 'React.js',
    description: 'We are looking for an experienced React Developer to join our growing team. You will work on building modern web applications with React, hooks, and REST APIs.\n\nResponsibilities:\n• Build reusable React components\n• Integrate REST APIs\n• Write clean, maintainable code',
    salary_min: 25000, salary_max: 45000, salary_type: 'monthly',
    job_type: 'full_time', duration: 'permanent',
    experience_required: 2, vacancies: 3, availability: 'immediate',
    latitude: 28.5494, longitude: 77.2510,
    area: 'Nehru Place', city: 'Delhi', state: 'Delhi',
    distance: 8.4, is_active: true,
    views_count: 142, applications_count: 18,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    employer_mobile: '8888888888',
  },
  {
    id: 2, title: 'Office Receptionist',
    employer_id: 3, employer_name: 'Sharma & Associates', employer_verified: false,
    skill_id: 12, skill_name: 'Receptionist',
    description: 'Looking for a confident and presentable receptionist for our law firm. Must have good communication skills and basic computer knowledge.',
    salary_min: 12000, salary_max: 18000, salary_type: 'monthly',
    job_type: 'full_time', duration: 'permanent',
    experience_required: 0, vacancies: 1, availability: 'immediate',
    latitude: 28.6279, longitude: 77.2090,
    area: 'Karol Bagh', city: 'Delhi', state: 'Delhi',
    distance: 3.2, is_active: true,
    views_count: 87, applications_count: 24,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    employer_mobile: '9876543210',
  },
  {
    id: 3, title: 'Node.js Backend Developer',
    employer_id: 2, employer_name: 'TechCorp Solutions', employer_verified: true,
    skill_id: 5, skill_name: 'Node.js',
    description: 'Backend developer needed for our SaaS platform. Experience with Express, MySQL, and REST API design required.',
    salary_min: 30000, salary_max: 55000, salary_type: 'monthly',
    job_type: 'full_time', duration: 'permanent',
    experience_required: 2, vacancies: 2, availability: 'within_week',
    latitude: 28.5494, longitude: 77.2510,
    area: 'Nehru Place', city: 'Delhi', state: 'Delhi',
    distance: 8.4, is_active: true,
    views_count: 96, applications_count: 11,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    employer_mobile: '8888888888',
  },
  {
    id: 4, title: 'Staff Nurse',
    employer_id: 4, employer_name: 'Apollo Clinic', employer_verified: true,
    skill_id: 10, skill_name: 'Nursing',
    description: 'Registered nurse required for day shift. B.Sc Nursing or GNM required. Experience in ICU preferred.',
    salary_min: 20000, salary_max: 30000, salary_type: 'monthly',
    job_type: 'full_time', duration: 'permanent',
    experience_required: 1, vacancies: 4, availability: 'immediate',
    latitude: 28.6100, longitude: 77.2300,
    area: 'Lajpat Nagar', city: 'Delhi', state: 'Delhi',
    distance: 5.1, is_active: true,
    views_count: 203, applications_count: 35,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    employer_mobile: '9811234567',
  },
  {
    id: 5, title: 'Accountant (Tally)',
    employer_id: 5, employer_name: 'Gupta Traders', employer_verified: false,
    skill_id: 14, skill_name: 'Accountant',
    description: 'Accountant needed for retail business. Must know Tally ERP, GST filing, and basic bookkeeping.',
    salary_min: 15000, salary_max: 22000, salary_type: 'monthly',
    job_type: 'full_time', duration: 'permanent',
    experience_required: 1, vacancies: 1, availability: 'immediate',
    latitude: 28.6500, longitude: 77.1800,
    area: 'Janakpuri', city: 'Delhi', state: 'Delhi',
    distance: 12.7, is_active: true,
    views_count: 54, applications_count: 9,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    employer_mobile: '9910001234',
  },
  {
    id: 6, title: 'Senior HR Executive',
    employer_id: 6, employer_name: 'GlobalMart India', employer_verified: true,
    skill_id: 13, skill_name: 'HR Executive',
    description: 'HR Executive for managing recruitment, onboarding, and employee relations for our 200+ staff retail chain.',
    salary_min: 28000, salary_max: 40000, salary_type: 'monthly',
    job_type: 'full_time', duration: 'permanent',
    experience_required: 3, vacancies: 1, availability: 'within_month',
    latitude: 28.5921, longitude: 77.2241,
    area: 'Saket', city: 'Delhi', state: 'Delhi',
    distance: 7.8, is_active: true,
    views_count: 118, applications_count: 21,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    employer_mobile: '9845000123',
  },
  {
    id: 7, title: 'Delivery Executive',
    employer_id: 7, employer_name: 'QuickDeliver Co.', employer_verified: false,
    skill_id: 18, skill_name: 'Driver',
    description: 'Delivery boy needed for food delivery. Must have own bike and valid driving license. Daily payout available.',
    salary_min: 500, salary_max: 800, salary_type: 'daily',
    job_type: 'part_time', duration: '3_months',
    experience_required: 0, vacancies: 10, availability: 'immediate',
    latitude: 28.6300, longitude: 77.2200,
    area: 'Rajouri Garden', city: 'Delhi', state: 'Delhi',
    distance: 6.3, is_active: true,
    views_count: 445, applications_count: 67,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    employer_mobile: '9700001111',
  },
  {
    id: 8, title: 'Cook / Chef',
    employer_id: 8, employer_name: 'Biryani House', employer_verified: true,
    skill_id: 19, skill_name: 'Cook',
    description: 'Experienced cook for North Indian cuisine. Hotel management diploma preferred but not mandatory.',
    salary_min: 18000, salary_max: 25000, salary_type: 'monthly',
    job_type: 'full_time', duration: 'permanent',
    experience_required: 2, vacancies: 2, availability: 'immediate',
    latitude: 28.6700, longitude: 77.2400,
    area: 'Pitampura', city: 'Delhi', state: 'Delhi',
    distance: 9.2, is_active: true,
    views_count: 76, applications_count: 14,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    employer_mobile: '9999111222',
  },
];

// ─── APPLICATIONS DATA ────────────────────────────────────
const APPLICATIONS = [
  { id: 1, job_id: 1, job_title: 'React Developer',         employer_name: 'TechCorp Solutions',  skill_name: 'React.js',      city: 'Delhi', status: 'shortlisted', applied_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 2, job_id: 2, job_title: 'Office Receptionist',     employer_name: 'Sharma & Associates', skill_name: 'Receptionist',  city: 'Delhi', status: 'reviewed',    applied_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 3, job_id: 3, job_title: 'Node.js Backend Developer',employer_name: 'TechCorp Solutions', skill_name: 'Node.js',       city: 'Delhi', status: 'pending',     applied_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 4, job_id: 6, job_title: 'Senior HR Executive',     employer_name: 'GlobalMart India',    skill_name: 'HR Executive',  city: 'Delhi', status: 'rejected',    applied_at: new Date(Date.now() - 86400000 * 7).toISOString() },
];

// ─── CANDIDATES DATA ──────────────────────────────────────
const CANDIDATES = [
  { id: 10, name: 'Priya Sharma',  mobile: '9811111111', city: 'Delhi',   area: 'Dwarka',     latitude: 28.5921, longitude: 77.0460, is_verified: true,  exam_passed: true,  availability: 'immediate',    experience_years: 2, bio: 'Frontend developer with React expertise',                  skills: [{ id: 4, name: 'React.js' }, { id: 1, name: 'JavaScript' }], canContact: true  },
  { id: 11, name: 'Amit Singh',    mobile: '9822222222', city: 'Noida',   area: 'Sector 62',  latitude: 28.6270, longitude: 77.3716, is_verified: false, exam_passed: false, availability: 'within_week',  experience_years: 4, bio: 'Backend developer specializing in Node.js and MySQL',       skills: [{ id: 5, name: 'Node.js' }, { id: 7, name: 'MySQL' }],      canContact: true  },
  { id: 12, name: 'Sunita Yadav',  mobile: '9833333333', city: 'Delhi',   area: 'Rohini',     latitude: 28.7040, longitude: 77.1301, is_verified: true,  exam_passed: true,  availability: 'immediate',    experience_years: 1, bio: 'Registered nurse with ICU experience',                      skills: [{ id: 10, name: 'Nursing' }],                               canContact: true  },
  { id: 13, name: 'Rahul Verma',   mobile: '9844444444', city: 'Gurgaon', area: 'Sector 14',  latitude: 28.4595, longitude: 77.0266, is_verified: false, exam_passed: false, availability: 'within_month', experience_years: 6, bio: 'Experienced accountant with GST and Tally knowledge',        skills: [{ id: 14, name: 'Accountant' }, { id: 9, name: 'Tally ERP' }], canContact: false },
  { id: 14, name: 'Neha Gupta',    mobile: '9855555555', city: 'Delhi',   area: 'Lajpat Nagar',latitude:28.5700, longitude: 77.2400, is_verified: true,  exam_passed: false, availability: 'immediate',    experience_years: 3, bio: 'HR professional with recruitment and payroll experience',     skills: [{ id: 13, name: 'HR Executive' }],                          canContact: true  },
];

// ─── EXAMS DATA ───────────────────────────────────────────
const EXAMS = [
  { id: 1,  skill_id: 1,  name: 'JavaScript',   category: 'Technology', question_count: 12, passed: false, isMySkill: true  },
  { id: 4,  skill_id: 4,  name: 'React.js',     category: 'Technology', question_count: 10, passed: false, isMySkill: true  },
  { id: 5,  skill_id: 5,  name: 'Node.js',      category: 'Technology', question_count: 10, passed: true,  isMySkill: true  },
  { id: 2,  skill_id: 2,  name: 'Python',       category: 'Technology', question_count: 10, passed: false, isMySkill: false },
  { id: 10, skill_id: 10, name: 'Nursing',      category: 'Healthcare', question_count: 10, passed: false, isMySkill: false },
  { id: 12, skill_id: 12, name: 'Receptionist', category: 'Office',     question_count: 10, passed: false, isMySkill: false },
  { id: 8,  skill_id: 8,  name: 'MS Excel',     category: 'Technology', question_count: 10, passed: false, isMySkill: false },
  { id: 14, skill_id: 14, name: 'Accountant',   category: 'Office',     question_count: 10, passed: false, isMySkill: false },
];

// ─── EXAM QUESTIONS ───────────────────────────────────────
const QUESTIONS = [
  { id: 1,  question: 'What does "typeof null" return in JavaScript?',           optionA: 'null',          optionB: 'undefined',   optionC: 'object',                                                      optionD: 'string',           correctAnswer: 'c' },
  { id: 2,  question: 'Which method adds an element at the END of an array?',    optionA: 'push()',        optionB: 'pop()',        optionC: 'shift()',                                                      optionD: 'unshift()',         correctAnswer: 'a' },
  { id: 3,  question: 'What is the output of: 0.1 + 0.2 === 0.3?',              optionA: 'true',          optionB: 'false',       optionC: 'undefined',                                                   optionD: 'NaN',               correctAnswer: 'b' },
  { id: 4,  question: 'Which keyword declares a block-scoped variable?',          optionA: 'var',           optionB: 'let',         optionC: 'def',                                                         optionD: 'dim',               correctAnswer: 'b' },
  { id: 5,  question: 'What does === operator check?',                            optionA: 'Value only',   optionB: 'Type only',   optionC: 'Value and type both',                                         optionD: 'Neither',           correctAnswer: 'c' },
  { id: 6,  question: 'Which of these is NOT a JavaScript data type?',            optionA: 'Boolean',      optionB: 'Symbol',      optionC: 'Float',                                                       optionD: 'BigInt',            correctAnswer: 'c' },
  { id: 7,  question: 'What does Promise.all() do?',                              optionA: 'Runs one by one', optionB: 'Runs all in parallel and waits', optionC: 'Returns first resolved',           optionD: 'Ignores rejected',  correctAnswer: 'b' },
  { id: 8,  question: 'Which method converts JSON string to JS object?',          optionA: 'JSON.stringify()', optionB: 'JSON.parse()', optionC: 'JSON.convert()',                                        optionD: 'JSON.decode()',     correctAnswer: 'b' },
  { id: 9,  question: 'What is a closure in JavaScript?',                         optionA: 'Returns a string', optionB: 'Access to outer scope after outer function returns', optionC: 'Closes browser', optionD: 'Ends a loop',       correctAnswer: 'b' },
  { id: 10, question: 'What does Array.prototype.map() return?',                  optionA: 'Original modified', optionB: 'New array with results of function on every element', optionC: 'First match', optionD: 'Array length',     correctAnswer: 'b' },
];

// ─── ADMIN MOCK DATA ──────────────────────────────────────
const ADMIN_QUESTIONS = Array.from({ length: 151 }, (_, i) => ({
  id: i + 1,
  skill_id:   SKILLS[i % SKILLS.length].id,
  skill_name: SKILLS[i % SKILLS.length].name,
  question:   `Sample question #${i + 1} for ${SKILLS[i % SKILLS.length].name}?`,
  option_a: 'Option A', option_b: 'Option B',
  option_c: 'Option C', option_d: 'Option D',
  correct_option: ['a','b','c','d'][i % 4],
  difficulty:     ['easy','medium','hard'][i % 3],
  is_active: true,
  created_at: new Date(Date.now() - 86400000 * i).toISOString(),
}));

// ════════════════════════════════════════════════════════════
// SERVICES
// ════════════════════════════════════════════════════════════

export const skillService = {
  getSkills: async () => { await delay(); return { skills: SKILLS }; },
};

export const jobService = {
  getJobs: async (filters = {}) => {
    await delay();
    let jobs = [...JOBS];
    if (filters.search)  jobs = jobs.filter(j => j.title.toLowerCase().includes(filters.search.toLowerCase()) || j.skill_name.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.skillId) jobs = jobs.filter(j => j.skill_id === Number(filters.skillId));
    if (filters.city)    jobs = jobs.filter(j => j.city.toLowerCase().includes(filters.city.toLowerCase()));
    return { jobs, total: jobs.length };
  },
  getJob:             async (id)  => { await delay(); return JOBS.find(j => j.id === Number(id)) || JOBS[0]; },
  getRecommendedJobs: async ()    => { await delay(); return { jobs: JOBS.slice(0, 4) }; },
  createJob:          async (d)   => { await delay(600); return { success: true, job: { id: Date.now(), ...d } }; },
  updateJob:          async ()    => { await delay(500); return { success: true }; },
  deleteJob:          async ()    => { await delay(400); return { success: true }; },
  applyForJob:        async ()    => { await delay(700); return { success: true, message: 'Application submitted!' }; },
  getMyJobs: async () => {
    await delay();
    return { jobs: JOBS.slice(0, 3).map(j => ({ ...j, employer_id: 2 })), pagination: { total: 3, pages: 1, page: 1 } };
  },
  getJobApplications: async (jobId) => {
    await delay();
    return {
      applications: CANDIDATES.map((c, i) => ({
        id: i + 1, job_id: jobId,
        seeker_id: c.id, seeker_name: c.name, seeker_mobile: c.mobile,
        seeker_city: c.city, seeker_verified: c.is_verified, seeker_exam_passed: c.exam_passed,
        status: ['pending','reviewed','shortlisted','hired'][i % 4],
        applied_at: new Date(Date.now() - 86400000 * (i + 1)).toISOString(),
        cover_letter: 'I am very interested in this position and believe my skills are a great match.',
        canContact: true,
      }))
    };
  },
  updateApplicationStatus: async () => { await delay(400); return { success: true }; },
  searchCandidates: async (filters = {}) => {
    await delay();
    let candidates = [...CANDIDATES];
    if (filters.skillId)      candidates = candidates.filter(c => c.skills.some(s => s.id === Number(filters.skillId)));
    if (filters.availability) candidates = candidates.filter(c => c.availability === filters.availability);
    return { candidates, total: candidates.length };
  },
};

export const userService = {
  updateProfile: async () => { await delay(600); return { success: true }; },
  getProfile:    async (id) => { await delay(); return CANDIDATES.find(c => c.id === Number(id)) || CANDIDATES[0]; },
  getAppliedJobs: async (page = 1, limit = 10) => { await delay(); const start = (page-1)*limit; const slice = APPLICATIONS.slice(start, start+limit); return { applications: slice, total: APPLICATIONS.length, pagination: { page, pages: Math.ceil(APPLICATIONS.length/limit), total: APPLICATIONS.length } }; },
};

export const examService = {
  getAvailableExams: async ()        => { await delay(); return { exams: EXAMS }; },
  startExam:         async (skillId) => { await delay(600); return { attemptId: Date.now(), questions: QUESTIONS, timeLimit: 15 * 60 }; },
  submitExam: async (attemptId, answers) => {
    await delay(800);
    let score = 0;
    const results = QUESTIONS.map(q => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) score++;
      return { questionId: q.id, userAnswer: answers[q.id], correctAnswer: q.correctAnswer, isCorrect };
    });
    const passed = score >= 6;
    return { success: true, score, totalQuestions: 10, passed, percentage: score * 10, results,
             message: passed ? 'Congratulations! You passed.' : 'You did not pass. Try again.' };
  },
  getExamHistory:      async () => { await delay(); return { attempts: [] }; },
  initiateExamPayment: async () => { await delay(500); return { success: true }; },
};

export const paymentService = {
  createSubscriptionOrder: async () => { await delay(500); return { preview: true }; },
  createExamOrder:         async () => { await delay(500); return { preview: true }; },
  createBadgeOrder:        async () => { await delay(500); return { preview: true }; },
  verifyPayment:           async () => { await delay(400); return { success: true }; },
  getPaymentHistory:       async () => { await delay(); return { payments: [] }; },
  getSubscriptionStatus:   async () => { await delay(); return { status: 'active' }; },
  openRazorpay:            async () => { await delay(1200); return { razorpay_payment_id: 'mock_' + Date.now(), razorpay_order_id: 'mock_order', razorpay_signature: 'mock_sig' }; },
};

export const adminService = {
  getDashboardStats: async () => {
    await delay();
    return {
      users:    { total: 1248, jobSeekers: 892, employers: 356, activeSubscriptions: 423, verifiedUsers: 187, newThisWeek: 64 },
      jobs:     { total: 342, active: 218, totalApplications: 4891 },
      payments: { total: 523, totalRevenue: 28450, monthlyRevenue: 5220 },
    };
  },
  getUsers: async ({ page = 1, limit = 10 } = {}) => {
    await delay();
    const all = [...CANDIDATES, { id: 2, name: 'TechCorp Solutions', mobile: '8888888888', role: 'employer', city: 'Delhi', is_verified: true, subscription_status: 'active', is_active: true, created_at: new Date().toISOString() }];
    const start = (page - 1) * limit;
    return { users: all.slice(start, start + limit), pagination: { page, limit, total: all.length, pages: Math.ceil(all.length / limit) } };
  },
  updateUserStatus: async () => { await delay(400); return { success: true }; },
  getAllJobs: async ({ page = 1, limit = 10 } = {}) => {
    await delay();
    const start = (page - 1) * limit;
    return { jobs: JOBS.slice(start, start + limit), pagination: { page, limit, total: JOBS.length, pages: Math.ceil(JOBS.length / limit) } };
  },
  getSkills: async () => {
    await delay();
    return { skills: SKILLS.map(s => ({ ...s, users_count: Math.floor(Math.random() * 50 + 5), jobs_count: Math.floor(Math.random() * 20 + 1), questions_count: 10, is_active: true })) };
  },
  createSkill:    async (d) => { await delay(500); return { success: true, skill: { id: Date.now(), ...d } }; },
  updateSkill:    async ()  => { await delay(400); return { success: true }; },
  getQuestions: async ({ skillId } = {}) => {
    await delay();
    let questions = [...ADMIN_QUESTIONS];
    if (skillId) questions = questions.filter(q => q.skill_id === Number(skillId));
    return { questions, total: questions.length };
  },
  createQuestion: async (d) => { await delay(500); return { success: true, questionId: Date.now() }; },
  updateQuestion: async ()  => { await delay(400); return { success: true }; },
  deleteQuestion: async ()  => { await delay(400); return { success: true }; },
  getPayments: async () => {
    await delay();
    const payments = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      user_name:    CANDIDATES[i % CANDIDATES.length].name,
      user_mobile:  CANDIDATES[i % CANDIDATES.length].mobile,
      amount:       [9, 99, 49][i % 3],
      payment_type: ['subscription', 'verified_badge', 'skill_exam'][i % 3],
      status:       ['completed','completed','completed','failed','pending'][i % 5],
      razorpay_payment_id: `pay_mock${i + 1}`,
      created_at:   new Date(Date.now() - 86400000 * i).toISOString(),
    }));
    return { payments, pagination: { total: 20, pages: 1 } };
  },
};