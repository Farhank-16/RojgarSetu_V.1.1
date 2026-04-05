// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
// } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api";
// import toast from "react-hot-toast";

// export const AuthContext = createContext(null);

// // Backend returns both snake_case (DB) and camelCase (auth response)
// // Normalize both to consistent camelCase for all components
// export const normalizeUser = (raw) => {
//   if (!raw) return null;
//   return {
//     id: raw.id,
//     mobile: raw.mobile,
//     name: raw.name,
//     email: raw.email ?? null,
//     role: raw.role,
//     area: raw.area ?? null,
//     city: raw.city ?? null,
//     state: raw.state ?? null,
//     pincode: raw.pincode ?? null,
//     latitude: raw.latitude ?? null,
//     longitude: raw.longitude ?? null,
//     bio: raw.bio ?? null,
//     availability: raw.availability ?? null,
//     experienceYears: raw.experienceYears ?? raw.experience_years ?? null,
//     expectedSalaryMin: raw.expectedSalaryMin ?? raw.expected_salary_min ?? null,
//     expectedSalaryMax: raw.expectedSalaryMax ?? raw.expected_salary_max ?? null,
//     isVerified: raw.isVerified ?? raw.is_verified ?? false,
//     examPassed: raw.examPassed ?? raw.exam_passed ?? false,
//     subscriptionStatus:
//       raw.subscriptionStatus ?? raw.subscription_status ?? "free",
//     subscriptionEndDate:
//       raw.subscriptionEndDate ?? raw.subscription_end_date ?? null,
//     profileCompleted: raw.profileCompleted ?? raw.profile_completed ?? false,
//     isActive: raw.isActive ?? raw.is_active ?? true,
//     skills: raw.skills ?? [],
//   };
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return;
//       const response = await api.get("/auth/me");
//       setUser(normalizeUser(response.data));
//     } catch (error) {
//       const status = error.response?.status;
//       if (status === 401 || status === 403) {
//         localStorage.removeItem("token");
//         setUser(null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const requestOTP = async (mobile) => {
//     try {
//       const response = await api.post("/auth/request-otp", { mobile });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || { error: "Failed to send OTP" };
//     }
//   };

//   const verifyOTP = async (mobile, otp, name, role) => {
//     try {
//       const response = await api.post("/auth/verify-otp", {
//         mobile,
//         otp,
//         name,
//         role,
//       });
//       localStorage.setItem("token", response.data.token);

//       // Fetch full user data — verify-otp returns partial data only
//       const meResponse = await api.get("/auth/me");
//       const fullUser = normalizeUser(meResponse.data);
//       setUser(fullUser);
//       setLoading(false);

//       return { ...response.data, user: fullUser };
//     } catch (error) {
//       throw error.response?.data || { error: "Verification failed" };
//     }
//   };

//   const logout = useCallback(async () => {
//     try {
//       await api.post("/auth/logout");
//     } catch {
//     } finally {
//       localStorage.removeItem("token");
//       setUser(null);
//       navigate("/login");
//       toast.success("Logged out successfully");
//     }
//   }, [navigate]);

//   const updateUser = useCallback((updates) => {
//     setUser((prev) => normalizeUser({ ...prev, ...updates }));
//   }, []);

//   const refreshUser = useCallback(async () => {
//     try {
//       const response = await api.get("/auth/me");
//       const normalized = normalizeUser(response.data);
//       setUser(normalized);
//       return normalized;
//     } catch (error) {
//       console.error("Failed to refresh user:", error);
//     }
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         requestOTP,
//         verifyOTP,
//         logout,
//         updateUser,
//         refreshUser,
//         isAuthenticated: !!user,
//         isSubscribed: user?.subscriptionStatus === "active",
//         isVerified: !!user?.isVerified,
//         hasExamPassed: !!user?.examPassed,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };


import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

// ─── MOCK USERS ───────────────────────────────────────────
// Any mobile + OTP 123456 = Seeker
// 8888888888 + 123456   = Employer  
// 7777777777 + 123456   = Admin
// ──────────────────────────────────────────────────────────

const MOCK_SEEKER = {
  id: 1, mobile: '9999999999', name: 'Ravi Kumar',
  email: 'ravi@example.com', role: 'job_seeker',
  area: 'Connaught Place', city: 'Delhi', state: 'Delhi',
  bio: 'Experienced JavaScript developer with 3 years in React and Node.js.',
  latitude: 28.6139, longitude: 77.2090,
  isVerified: true, examPassed: true,
  subscriptionStatus: 'active', profileCompleted: true, isActive: true,
  experienceYears: 3, availability: 'immediate',
  skills: [
    { id: 1, name: 'JavaScript' }, { id: 4, name: 'React.js' },
    { id: 5, name: 'Node.js' },   { id: 7, name: 'MySQL' },
  ],
};

const MOCK_EMPLOYER = {
  id: 2, mobile: '8888888888', name: 'TechCorp Solutions',
  email: 'hr@techcorp.in', role: 'employer',
  area: 'Nehru Place', city: 'Delhi', state: 'Delhi',
  bio: 'Leading IT company hiring top talent in Delhi NCR.',
  latitude: 28.5494, longitude: 77.2510,
  isVerified: true, examPassed: false,
  subscriptionStatus: 'active', profileCompleted: true, isActive: true,
  skills: [],
};

const MOCK_ADMIN = {
  id: 99, mobile: '7777777777', name: 'Admin',
  email: 'admin@jobnest.in', role: 'admin',
  city: 'Delhi', isVerified: true,
  subscriptionStatus: 'active', profileCompleted: true, isActive: true,
  skills: [],
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Load from localStorage on first render
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mock_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const saveUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem('mock_user', JSON.stringify(u));
    else   localStorage.removeItem('mock_user');
  };

  // Simulate OTP request — always succeeds
  const requestOTP = async (mobile) => {
    await new Promise(r => setTimeout(r, 700));
    return { success: true, message: 'OTP sent! Use 123456 for preview.' };
  };

  // OTP must be "123456"
  const verifyOTP = async (mobile, otp, name, role) => {
    await new Promise(r => setTimeout(r, 600));
    if (otp !== '123456') throw { error: 'Invalid OTP. Use 123456 for preview.' };

    let mockUser;
    if      (mobile === '7777777777') mockUser = { ...MOCK_ADMIN };
    else if (mobile === '8888888888') mockUser = { ...MOCK_EMPLOYER };
    else mockUser = { ...MOCK_SEEKER, mobile, name: name || MOCK_SEEKER.name };

    localStorage.setItem('token', 'mock_preview_token');
    saveUser(mockUser);
    return { token: 'mock_preview_token', user: mockUser };
  };

  const logout = useCallback(() => {
    localStorage.removeItem('mock_user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    toast.success('Logged out');
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('mock_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const stored = localStorage.getItem('mock_user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        return u;
      }
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading: false,
      requestOTP,
      verifyOTP,
      logout,
      updateUser,
      refreshUser,
      isAuthenticated: !!user,
      isSubscribed:    user?.subscriptionStatus === 'active',
      isVerified:      !!user?.isVerified,
      hasExamPassed:   !!user?.examPassed,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;