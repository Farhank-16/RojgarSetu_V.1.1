// import { supabase } from './supabase';

// export const userService = {
//   updateProfile: async (data) => {
//     const { data: { session } } = await supabase.auth.getSession();
//     const user = session?.user;
//     if (!user) throw new Error('Not authenticated');
//     const { skills, ...rest } = data;

//     // Update profile
//     // Build update object — only include defined fields
//     const updates = {};
//     if (rest.name              !== undefined) updates.name               = rest.name;
//     if (rest.phone             !== undefined) updates.phone              = rest.phone || null;
//     if (rest.bio               !== undefined) updates.bio                = rest.bio;
//     if (rest.area              !== undefined) updates.area               = rest.area;
//     if (rest.city              !== undefined) updates.city               = rest.city;
//     if (rest.state             !== undefined) updates.state              = rest.state;
//     if (rest.pincode           !== undefined) updates.pincode            = rest.pincode;
//     if (rest.latitude          !== undefined) updates.latitude           = rest.latitude;
//     if (rest.longitude         !== undefined) updates.longitude          = rest.longitude;
//     if (rest.availability      !== undefined) updates.availability       = rest.availability;
//     if (rest.experienceYears   !== undefined) updates.experience_years   = rest.experienceYears;
//     if (rest.expectedSalaryMin !== undefined) updates.expected_salary_min = rest.expectedSalaryMin || null;
//     if (rest.expectedSalaryMax !== undefined) updates.expected_salary_max = rest.expectedSalaryMax || null;
//     if (rest.profileCompleted  !== undefined) updates.profile_completed  = rest.profileCompleted;
//     else updates.profile_completed = true;

//     const { error } = await supabase
//       .from('profiles')
//       .update(updates)
//       .eq('id', user.id);

//     if (error) throw error;

//     // Update skills if provided
//     if (skills?.length > 0) {
//       // Delete existing
//       await supabase.from('user_skills').delete().eq('user_id', user.id);
//       // Insert new
//       await supabase.from('user_skills').insert(
//         skills.map(s => ({ user_id: user.id, skill_id: s.skillId || s.id }))
//       );
//     }

//     return { success: true };
//   },

//   getProfile: async (id) => {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*, user_skills(skills(id, name))')
//       .eq('id', id)
//       .single();

//     if (error) throw error;

//     return {
//       ...data,
//       skills:   data.user_skills?.map(us => us.skills).filter(Boolean) ?? [],
//       canContact: true,
//     };
//   },

//   getAppliedJobs: async (page = 1, limit = 10) => {
//     const { data: { session } } = await supabase.auth.getSession();
//     const user = session?.user;
//     if (!user) throw new Error('Not authenticated');
//     const from = (page - 1) * limit;

//     const { data, error, count } = await supabase
//       .from('applications')
//       .select(`
//         *,
//         jobs (
//           id, title, city, created_at,
//           profiles!employer_id ( name ),
//           job_skills ( skills ( id, name ) )
//         )
//       `, { count: 'exact' })
//       .eq('seeker_id', user.id)
//       .order('created_at', { ascending: false })
//       .range(from, from + limit - 1);

//     if (error) throw error;

//     return {
//       applications: (data || []).map(a => ({
//         id:            a.id,
//         job_id:        a.job_id,
//         job_title:     a.jobs?.title,
//         employer_name: a.jobs?.profiles?.name,
//         skill_name:    a.jobs?.job_skills?.[0]?.skills?.name,
//         city:          a.jobs?.city,
//         status:        a.status,
//         applied_at:    a.created_at,
//       })),
//       pagination: {
//         page, limit, total: count,
//         pages: Math.ceil(count / limit)
//       }
//     };
//   },

//   updateLocation: async (data) => {
//     const { data: { session } } = await supabase.auth.getSession();
//     const user = session?.user;
//     if (!user) throw new Error('Not authenticated');
//     const { error } = await supabase
//       .from('profiles')
//       .update({ latitude: data.latitude, longitude: data.longitude })
//       .eq('id', user.id);
//     if (error) throw error;
//     return { success: true };
//   },
// };

import { supabase } from './supabase';

export const userService = {
  updateProfile: async (data) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');
    const { skills, ...rest } = data;

    // Update profile
    // Build update object — only include defined fields
    const updates = {};
    if (rest.name              !== undefined) updates.name               = rest.name;
    if (rest.phone             !== undefined) updates.phone              = rest.phone || null;
    if (rest.bio               !== undefined) updates.bio                = rest.bio;
    if (rest.area              !== undefined) updates.area               = rest.area;
    if (rest.city              !== undefined) updates.city               = rest.city;
    if (rest.state             !== undefined) updates.state              = rest.state;
    if (rest.pincode           !== undefined) updates.pincode            = rest.pincode;
    if (rest.latitude          !== undefined) updates.latitude           = rest.latitude;
    if (rest.longitude         !== undefined) updates.longitude          = rest.longitude;
    if (rest.availability      !== undefined) updates.availability       = rest.availability;
    if (rest.experienceYears   !== undefined) updates.experience_years   = rest.experienceYears;
    if (rest.expectedSalaryMin !== undefined) updates.expected_salary_min = rest.expectedSalaryMin || null;
    if (rest.expectedSalaryMax !== undefined) updates.expected_salary_max = rest.expectedSalaryMax || null;
    if (rest.profileCompleted  !== undefined) updates.profile_completed  = rest.profileCompleted;
    else updates.profile_completed = true;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    // Update skills if provided
    if (skills?.length > 0) {
      // Separate regular and custom skills
      const regularSkills = skills.filter(s => s.skillId || s.id);
      const customSkills  = skills.filter(s => s.customName);

      // For custom skills — first create them in skills table
      const customIds = [];
      for (const s of customSkills) {
        const { data: existing } = await supabase
          .from('skills').select('id').ilike('name', s.customName).single();
        if (existing) {
          customIds.push(existing.id);
        } else {
          const { data: created } = await supabase
            .from('skills')
            .insert({ name: s.customName, category: 'Other', is_active: true })
            .select().single();
          if (created) customIds.push(created.id);
        }
      }

      // Delete existing user_skills
      await supabase.from('user_skills').delete().eq('user_id', user.id);

      // Insert all skills
      const allSkillIds = [
        ...regularSkills.map(s => s.skillId || s.id),
        ...customIds,
      ].filter(Boolean);

      if (allSkillIds.length > 0) {
        await supabase.from('user_skills').insert(
          allSkillIds.map(skill_id => ({ user_id: user.id, skill_id }))
        );
      }
    }

    return { success: true };
  },

  getProfile: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_skills(skills(id, name))')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      skills:   data.user_skills?.map(us => us.skills).filter(Boolean) ?? [],
      canContact: true,
    };
  },

  getAppliedJobs: async (page = 1, limit = 10) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');
    const from = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          id, title, city, created_at,
          profiles!employer_id ( name ),
          job_skills ( skills ( id, name ) )
        )
      `, { count: 'exact' })
      .eq('seeker_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;

    return {
      applications: (data || []).map(a => ({
        id:            a.id,
        job_id:        a.job_id,
        job_title:     a.jobs?.title,
        employer_name: a.jobs?.profiles?.name,
        skill_name:    a.jobs?.job_skills?.[0]?.skills?.name,
        city:          a.jobs?.city,
        status:        a.status,
        applied_at:    a.created_at,
      })),
      pagination: {
        page, limit, total: count,
        pages: Math.ceil(count / limit)
      }
    };
  },

  updateLocation: async (data) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('profiles')
      .update({ latitude: data.latitude, longitude: data.longitude })
      .eq('id', user.id);
    if (error) throw error;
    return { success: true };
  },
};