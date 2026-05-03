import { supabase } from './supabase';

export const skillService = {
  // Get all skills grouped by category
  getSkills: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('name');
    if (error) throw error;

    // Group by category
    const grouped = {};
    (data || []).forEach(skill => {
      const cat = skill.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(skill);
    });

    return { skills: data || [], grouped };
  },

  // Add custom skill — goes to user_skills with custom name stored
  addCustomSkill: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Skill name required');

    // Check if skill already exists
    const { data: existing } = await supabase
      .from('skills')
      .select('id, name')
      .ilike('name', trimmed)
      .single();

    if (existing) return { skill: existing, isNew: false };

    // Insert as new skill under "Other" category (pending admin approval)
    const { data, error } = await supabase
      .from('skills')
      .insert({ name: trimmed, category: 'Other', is_active: true })
      .select()
      .single();

    if (error) throw error;
    return { skill: data, isNew: true };
  },
};