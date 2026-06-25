import { supabase } from './supabase';

// Helper — distance filter (Haversine via PostGIS not available in free tier,
// so we filter client-side OR use RPC. Using client-side for simplicity.)
const toParams = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  return params;
};

// Haversine distance in km between two coordinates
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export const jobService = {
  getJobs: async (filters = {}) => {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        profiles!employer_id ( name, is_verified ),
        job_skills ( skills ( id, name ) )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters.search)  query = query.ilike('title', `%${filters.search}%`);
    if (filters.city)    query = query.ilike('city', `%${filters.city}%`);
    if (filters.jobType) query = query.eq('job_type', filters.jobType);

    const { data, error } = await query;
    if (error) throw error;

    // Normalize + add distance + filter by skill
    let jobs = (data || []).map(job => ({
      ...job,
      employer_name:     job.profiles?.name,
      employer_verified: job.profiles?.is_verified,
      skill_names:       job.job_skills?.map(js => js.skills?.name).filter(Boolean).join(','),
      skill_ids:         job.job_skills?.map(js => js.skills?.id).filter(Boolean).join(','),
      skills:            job.job_skills?.map(js => js.skills).filter(Boolean),
      distance:          (filters.userLat && filters.userLng && job.latitude && job.longitude)
        ? haversine(filters.userLat, filters.userLng, job.latitude, job.longitude)
        : null,
    }));

    // Filter by skillId
    if (filters.skillId) {
      jobs = jobs.filter(j => j.skill_ids?.split(',').includes(String(filters.skillId)));
    }

    // Filter by radius
    if (filters.radius && filters.userLat && filters.userLng) {
      jobs = jobs.filter(j => j.distance === null || j.distance <= filters.radius);
    }

    // Pagination
    const page  = filters.page  || 1;
    const limit = filters.limit || 10;
    const total = jobs.length;
    const paged = jobs.slice((page-1)*limit, page*limit);

    return { jobs: paged, total, pagination: { page, pages: Math.ceil(total/limit), total } };
  },

  getJob: async (id) => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        profiles!employer_id ( name, email, is_verified ),
        job_skills ( skills ( id, name ) )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check if current user has applied
    let hasApplied = false;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: appData } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', id)
        .eq('seeker_id', user.id)
        .maybeSingle();
      if (appData) hasApplied = true;
    }

    // Increment view count
    await supabase.from('jobs').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id);

    return {
      ...data,
      employer_name:     data.profiles?.name,
      employer_mobile:   data.profiles?.email,
      employer_verified: data.profiles?.is_verified,
      skill_names:       data.job_skills?.map(js => js.skills?.name).filter(Boolean).join(','),
      skills:            data.job_skills?.map(js => js.skills).filter(Boolean),
      hasApplied,
    };
  },

  getRecommendedJobs: async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`*, profiles!employer_id(name, is_verified), job_skills(skills(id, name))`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return {
      jobs: (data || []).map(j => ({
        ...j,
        employer_name: j.profiles?.name,
        skill_names:   j.job_skills?.map(js => js.skills?.name).filter(Boolean).join(','),
        skills:        j.job_skills?.map(js => js.skills).filter(Boolean),
      }))
    };
  },

  createJob: async (jobData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { skillIds, skillId, ...rest } = jobData;

    // Convert camelCase form fields to snake_case for Supabase
    const dbJob = {
      employer_id:           user.id,
      title:                 rest.title,
      description:           rest.description || null,
      job_type:              rest.jobType || 'full_time',
      duration:              rest.jobDuration || null,
      salary_min:            rest.salaryMin ? parseInt(rest.salaryMin) : null,
      salary_max:            rest.salaryMax ? parseInt(rest.salaryMax) : null,
      salary_type:           rest.salaryType || 'monthly',
      experience_required:   rest.experienceRequired || 0,
      vacancies:             rest.vacancies || 1,
      availability:          rest.availability || 'flexible',
      latitude:              rest.latitude || null,
      longitude:             rest.longitude || null,
      area:                  rest.area || null,
      city:                  rest.city || null,
      state:                 rest.state || null,
    };

    const { data: job, error } = await supabase
      .from('jobs')
      .insert(dbJob)
      .select()
      .single();

    if (error) { console.error('createJob error:', JSON.stringify(error)); throw error; }

    // Insert job_skills
    const ids = skillIds?.length > 0 ? skillIds : (skillId ? [skillId] : []);
    if (ids.length > 0) {
      await supabase.from('job_skills').insert(
        ids.map(sid => ({ job_id: job.id, skill_id: parseInt(sid) }))
      );
    }

    return { success: true, job };
  },

  updateJob: async (id, jobData) => {
    const { skillIds, skillId, ...rest } = jobData;

    const dbUpdate = {
      title:               rest.title,
      description:         rest.description || null,
      job_type:            rest.jobType || rest.job_type,
      duration:            rest.jobDuration || rest.duration || null,
      salary_min:          rest.salaryMin ? parseInt(rest.salaryMin) : rest.salary_min,
      salary_max:          rest.salaryMax ? parseInt(rest.salaryMax) : rest.salary_max,
      salary_type:         rest.salaryType || rest.salary_type || 'monthly',
      experience_required: rest.experienceRequired ?? rest.experience_required ?? 0,
      vacancies:           rest.vacancies || 1,
      availability:        rest.availability || rest.availability || 'flexible',
      latitude:            rest.latitude || null,
      longitude:           rest.longitude || null,
      area:                rest.area || null,
      city:                rest.city || null,
      state:               rest.state || null,
      is_active:           rest.isActive ?? rest.is_active ?? true,
    };
    // Remove undefined keys
    Object.keys(dbUpdate).forEach(k => dbUpdate[k] === undefined && delete dbUpdate[k]);

    const { error } = await supabase
      .from('jobs')
      .update(dbUpdate)
      .eq('id', id);

    if (error) throw error;

    // Update job_skills
    if (skillIds?.length > 0) {
      await supabase.from('job_skills').delete().eq('job_id', id);
      await supabase.from('job_skills').insert(
        skillIds.map(sid => ({ job_id: parseInt(id), skill_id: parseInt(sid) }))
      );
    }

    return { success: true };
  },

  deleteJob: async (id) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  applyForJob: async (id, coverLetter) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('applications').insert({
      job_id: id, seeker_id: user.id, cover_letter: coverLetter
    });
    if (error) throw error;

    // Increment applications_count
    await supabase.rpc('increment_applications', { job_id: id });
    return { success: true };
  },

  getEmployerStats: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('jobs')
      .select('id, is_active, views_count, applications(id)')
      .eq('employer_id', user.id);

    if (error) throw error;

    const activeJobs = data.filter(j => j.is_active).length;
    const totalJobs = data.length;
    const totalApplications = data.reduce((sum, j) => sum + (j.applications?.length || 0), 0);
    const totalViews = data.reduce((sum, j) => sum + (j.views_count || 0), 0);

    return { activeJobs, totalJobs, totalApplications, totalViews };
  },

  getMyJobs: async (page = 1, limit = 10) => {
    const { data: { user } } = await supabase.auth.getUser();
    const from = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('jobs')
      .select('*, job_skills(skills(id,name)), applications(id)', { count: 'exact' })
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;

    return {
      jobs: (data || []).map(j => ({
        ...j,
        skill_names: j.job_skills?.map(js => js.skills?.name).filter(Boolean).join(','),
        skills:      j.job_skills?.map(js => js.skills).filter(Boolean),
        applications_count: j.applications?.length || 0,
      })),
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) }
    };
  },

  getJobApplications: async (jobId) => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        profiles!seeker_id ( id, name, email, phone, city, area, is_verified, exam_passed )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      applications: (data || []).map(a => ({
        ...a,
        seeker_id:       a.profiles?.id,
        seeker_name:     a.profiles?.name,
        seeker_mobile:   a.profiles?.phone || a.profiles?.email,
        seeker_city:     a.profiles?.city,
        seeker_verified: a.profiles?.is_verified,
        seeker_exam_passed: a.profiles?.exam_passed,
        canContact:      true,

        // Flat mapping expected by JobApplications.jsx rendering & navigation
        applicant_id:    a.profiles?.id,
        name:            a.profiles?.name,
        mobile:          a.profiles?.phone || a.profiles?.email,
        phone:           a.profiles?.phone,
        area:            a.profiles?.area,
        city:            a.profiles?.city,
        is_verified:     a.profiles?.is_verified,
        exam_passed:     a.profiles?.exam_passed,
      }))
    };
  },

  updateApplicationStatus: async (id, status, notes) => {
    const { error } = await supabase
      .from('applications')
      .update({ status, notes })
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  searchCandidates: async (filters = {}) => {
    let query = supabase
      .from('profiles')
      .select('*, user_skills(skills(id, name))')
      .eq('role', 'job_seeker')
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (filters.availability) query = query.eq('availability', filters.availability);

    const { data, error } = await query;
    if (error) throw error;

    let candidates = (data || []).map(p => ({
      ...p,
      // user_skills returns [{skills: {id, name}}] — extract the inner skills object
      skills: p.user_skills
        ?.map(us => us.skills)
        .filter(s => s && s.id && s.name) ?? [],
      canContact: true,
    }));

    if (filters.skillId) {
      candidates = candidates.filter(c =>
        c.skills.some(s => s?.id === parseInt(filters.skillId))
      );
    }

    return { candidates, total: candidates.length };
  },
};