import { supabase } from './supabase';

export const skillService = {
  getSkills: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return { skills: data || [] };
  },
};