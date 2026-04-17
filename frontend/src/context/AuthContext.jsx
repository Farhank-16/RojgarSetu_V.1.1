import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

const normalizeUser = (profile) => {
  if (!profile) return null;
  return {
    id:                  profile.id,
    email:               profile.email,
    phone:               profile.phone              ?? null,
    name:                profile.name,
    role:                profile.role,
    area:                profile.area               ?? null,
    city:                profile.city               ?? null,
    state:               profile.state              ?? null,
    pincode:             profile.pincode            ?? null,
    latitude:            profile.latitude           ?? null,
    longitude:           profile.longitude          ?? null,
    bio:                 profile.bio                ?? null,
    availability:        profile.availability       ?? null,
    experienceYears:     profile.experience_years   ?? 0,
    expectedSalaryMin:   profile.expected_salary_min ?? null,
    expectedSalaryMax:   profile.expected_salary_max ?? null,
    isVerified:          profile.is_verified         ?? false,
    examPassed:          profile.exam_passed         ?? false,
    subscriptionStatus:  profile.subscription_status ?? 'free',
    subscriptionEndDate: profile.subscription_end    ?? null,
    profileCompleted:    profile.profile_completed   ?? false,
    isActive:            profile.is_active           ?? true,
    skills:              profile.user_skills?.map(us => us.skills).filter(Boolean) ?? [],
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Only load profile if NOT mid-registration
        const isPending = !!sessionStorage.getItem('pendingUserId');
        if (!isPending) loadProfile(session.user.id);
        else setLoading(false);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
      // Do NOT handle SIGNED_IN here — verifyOTP handles it manually
      // This prevents race condition overwriting navigation
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_skills(skills(id, name))')
        .eq('id', userId)
        .maybeSingle();

      if (error) { console.error('Profile error:', error.message); setUser(null); }
      else if (!data) setUser(null);
      else setUser(normalizeUser(data));
    } catch (err) {
      console.error('loadProfile exception:', err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
    return { success: true };
  };

  const verifyOTP = async (email, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email, token: otp, type: 'email',
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) throw new Error('Auth failed');

    // Fetch profile to decide routing
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, profile_completed')
      .eq('id', userId)
      .maybeSingle();

    // New user = no profile OR profile exists but role is null
    if (!profile || !profile.role) {
      // Don't set user state — SelectRole will call completeRegistration
      setLoading(false);
      return { isNewUser: true, userId };
    }

    // Existing user — load full profile into state
    await loadProfile(userId);
    return {
      isNewUser: false,
      user: { profileCompleted: profile.profile_completed, role: profile.role }
    };
  };

  // Called from SelectRole after user picks name + role
  const completeRegistration = async (userId, name, role) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({
      id:                userId,
      email:             authUser?.email,
      name,
      role,
      profile_completed: false,
    });
    if (error) throw error;
    // Now load profile into state — user is fully registered
    await loadProfile(userId);
  };

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadProfile(session.user.id);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      requestOTP, verifyOTP, completeRegistration,
      logout, updateUser, refreshUser,
      isAuthenticated: !!user,
      isSubscribed:    user?.subscriptionStatus === 'active',
      isVerified:      !!user?.isVerified,
      hasExamPassed:   !!user?.examPassed,
    }}>
      {children}
    </AuthContext.Provider>
  );
};