-- ============================================================
-- JobNest —  Supabase PostgreSQL Schema
-- ============================================================

-- ===================== PROFILES =====================
CREATE TABLE public.profiles (
  id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email               TEXT,
  name                TEXT,
  role                TEXT CHECK (role IN ('job_seeker','employer','admin')) DEFAULT 'job_seeker',
  phone               TEXT,
  area                TEXT,
  city                TEXT,
  state               TEXT,
  pincode             TEXT,
  latitude            DECIMAL(10,8),
  longitude           DECIMAL(11,8),
  bio                 TEXT,
  availability        TEXT,
  experience_years    INT DEFAULT 0,
  expected_salary_min INT,
  expected_salary_max INT,
  is_verified         BOOLEAN DEFAULT FALSE,
  exam_passed         BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'free',
  subscription_end    TIMESTAMPTZ,
  profile_completed   BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== SKILLS =====================
CREATE TABLE public.skills (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== USER SKILLS =====================
CREATE TABLE public.user_skills (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id INT REFERENCES public.skills(id) ON DELETE CASCADE,
  UNIQUE(user_id, skill_id)
);

-- ===================== JOBS =====================
CREATE TABLE public.jobs (
  id SERIAL PRIMARY KEY,
  employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT DEFAULT 'full_time',
  duration TEXT,
  salary_min INT,
  salary_max INT,
  salary_type TEXT DEFAULT 'monthly',
  experience_required INT DEFAULT 0,
  vacancies INT DEFAULT 1,
  availability TEXT DEFAULT 'flexible',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  area TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INT DEFAULT 0,
  applications_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== JOB SKILLS =====================
CREATE TABLE public.job_skills (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id INT REFERENCES public.skills(id) ON DELETE CASCADE,
  UNIQUE(job_id, skill_id)
);

-- ===================== APPLICATIONS =====================
CREATE TABLE public.applications (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES public.jobs(id) ON DELETE CASCADE,
  seeker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- ===================== PAYMENTS =====================
CREATE TABLE public.payments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS ENABLE
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ===================== PROFILES POLICIES =====================

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read active profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Anyone can read active profiles"
ON public.profiles FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- ===================== JOBS POLICIES =====================

DROP POLICY IF EXISTS "Anyone can read active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can delete own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can view own jobs" ON public.jobs;

CREATE POLICY "Anyone can read active jobs"
ON public.jobs FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Employers can insert jobs"
ON public.jobs FOR INSERT
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own jobs"
ON public.jobs FOR UPDATE
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs"
ON public.jobs FOR DELETE
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can view own jobs"
ON public.jobs FOR SELECT
USING (auth.uid() = employer_id);

-- ===================== APPLICATIONS =====================

CREATE POLICY "Seekers can apply"
ON public.applications FOR INSERT
WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Seekers view own"
ON public.applications FOR SELECT
USING (auth.uid() = seeker_id);

CREATE POLICY "Employers view applications"
ON public.applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id AND employer_id = auth.uid()
  )
);

-- ===================== SKILLS =====================

CREATE POLICY "Anyone can read skills"
ON public.skills FOR SELECT
USING (is_active = TRUE);

-- ===================== USER SKILLS =====================

CREATE POLICY "Users manage own skills"
ON public.user_skills FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Anyone read user skills"
ON public.user_skills FOR SELECT
USING (TRUE);

-- ===================== JOB SKILLS =====================

CREATE POLICY "Anyone read job skills"
ON public.job_skills FOR SELECT
USING (TRUE);

CREATE POLICY "Employers manage job skills"
ON public.job_skills FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id AND employer_id = auth.uid()
  )
);

-- ============================================================
-- TRIGGER (AUTO PROFILE CREATE)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();