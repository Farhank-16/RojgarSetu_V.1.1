import { supabase } from './supabase';

export const advertisementService = {

  // Get active ads for a placement
  getAds: async (placement) => {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('placement', placement)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    // Filter by date client-side (simpler, avoids null date issues)
    const today = new Date().toISOString().split('T')[0];
    return (data || []).filter(ad => {
      const startOk = !ad.start_date || ad.start_date <= today;
      const endOk   = !ad.end_date   || ad.end_date   >= today;
      return startOk && endOk;
    });
  },

  // Get all ads (admin)
  getAllAds: async () => {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Upload media to Supabase Storage
  uploadMedia: async (file) => {
    const ext      = file.name.split('.').pop();
    const fileName = `ad_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('advertisements')
      .upload(fileName, file, { contentType: file.type, upsert: false });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('advertisements')
      .getPublicUrl(fileName);
    return publicUrl;
  },

  // Create ad (admin)
  createAd: async (adData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('advertisements')
      .insert({ ...adData, created_by: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update ad (admin)
  updateAd: async (id, updates) => {
    const { data, error } = await supabase
      .from('advertisements')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Toggle active status
  toggleAd: async (id, isActive) => {
    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Delete ad
  deleteAd: async (id, mediaUrl) => {
    // Delete media from storage
    if (mediaUrl) {
      const fileName = mediaUrl.split('/').pop();
      await supabase.storage.from('advertisements').remove([fileName]);
    }
    const { error } = await supabase.from('advertisements').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};