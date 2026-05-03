import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, ChevronRight } from 'lucide-react';
import useAuth from '../../context/useAuth';
import toast from 'react-hot-toast';

const SelectRole = () => {
  const [role, setRole]       = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const { completeRegistration } = useAuth();
  const navigate              = useNavigate();

  const userId = sessionStorage.getItem('pendingUserId');

  const handleContinue = async () => {
    if (!role)         { toast.error('Please select a role'); return; }
    if (!name.trim())  { toast.error('Please enter your name'); return; }
    if (!userId)       { navigate('/login'); return; }

    setLoading(true);
    try {
      await completeRegistration(userId, name.trim(), role);
      sessionStorage.removeItem('pendingUserId');
      navigate('/complete-profile');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'job_seeker', label: 'Job Seeker', desc: 'Find jobs near you',      icon: Search,   gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
    { id: 'employer',   label: 'Employer',   desc: 'Post jobs & hire talent', icon: Briefcase, gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
  ];

  return (
    <div className="px-6 py-8 page-enter">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Tell us about you</h2>
        <p className="text-slate-500 text-sm mt-1">Choose your role to get started</p>
      </div>

      {/* Name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Your Name *</label>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Enter your full name"
          className="input w-full py-3.5" style={{ borderRadius: '12px' }} />
      </div>

      {/* Role cards */}
      <div className="space-y-3 mb-8">
        {roles.map(r => {
          const Icon     = r.icon;
          const selected = role === r.id;
          return (
            <button key={r.id} type="button" onClick={() => setRole(r.id)}
              className="w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]"
              style={{ borderColor: selected ? '#2563eb' : '#e2e8f0', background: selected ? '#eff6ff' : 'white' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: selected ? r.gradient : '#f1f5f9' }}>
                  <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className={`font-display font-bold text-base ${selected ? 'text-blue-700' : 'text-slate-800'}`}>{r.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                </div>
                {selected && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={handleContinue} disabled={!role || !name.trim() || loading}
        className="btn-primary w-full py-4 text-base justify-between disabled:opacity-50"
        style={{ borderRadius: '12px' }}>
        {loading
          ? <span className="flex items-center gap-2 justify-center w-full">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Setting up...
            </span>
          : <><span>Continue</span><ChevronRight className="w-5 h-5" /></>
        }
      </button>
    </div>
  );
};

export default SelectRole;