import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail, Phone, Award, CheckCircle2, Edit2, Crown, LogOut, ChevronRight } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { userService } from '../../services/userService';
import { skillService } from '../../services/skillService';
import Input from '../../components/ui/Input';
import SkillPicker from '../../components/forms/SkillPicker';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const SeekerProfile = () => {
  const { user, logout, refreshUser, isVerified, hasExamPassed, isSubscribed } = useAuth();
  const navigate = useNavigate();

  const [showEdit, setShowEdit]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', bio: '', experienceYears: 0,
    availability: 'immediate', expectedSalaryMin: '', expectedSalaryMax: '',
    selectedSkills: [],
  });

  useEffect(() => {
    if (user) {
      setForm({
        name:              user.name              || '',
        phone:             user.phone             || '',
        bio:               user.bio               || '',
        experienceYears:   user.experienceYears   || 0,
        availability:      user.availability      || 'immediate',
        expectedSalaryMin: user.expectedSalaryMin || '',
        expectedSalaryMax: user.expectedSalaryMax || '',
        selectedSkills:    user.skills?.map(s => s.id) || [],
        customSkills:     [],  // custom skills reset on edit
      });
    }
  }, [user]);


  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.updateProfile({
        name:              form.name,
        phone:             form.phone,
        bio:               form.bio,
        experienceYears:   form.experienceYears,
        availability:      form.availability,
        expectedSalaryMin: form.expectedSalaryMin || null,
        expectedSalaryMax: form.expectedSalaryMax || null,
        skills:            form.selectedSkills.map(id => ({ skillId: id })),
      });
      await refreshUser();
      toast.success('Profile updated!');
      setShowEdit(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const UPSELLS = [
    !isVerified    && { key: 'verified',  bg: '#eff6ff', fg: '#2563eb', icon: CheckCircle2, label: 'Get Verified Badge', path: '/seeker/subscription' },
    !hasExamPassed && { key: 'exam',      bg: '#fffbeb', fg: '#d97706', icon: Award,        label: 'Take Skill Exam',    path: '/seeker/exams' },
    !isSubscribed  && { key: 'premium',   bg: '#faf5ff', fg: '#7c3aed', icon: Crown,        label: 'Upgrade to Premium', path: '/seeker/subscription' },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Profile header */}
      <div className="bg-white px-4 py-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-2xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-slate-900 text-lg truncate">
                {user?.name || 'User'}
              </h2>
              {isVerified    && <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />}
              {hasExamPassed && <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />}
            </div>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            {user?.phone && <p className="text-slate-400 text-sm">{user.phone}</p>}
            <span className={`badge mt-1.5 ${isSubscribed ? 'badge-green' : 'badge-gray'}`}>
              {isSubscribed ? '⭐ Premium' : 'Free Account'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">

        {/* Edit profile */}
        <button onClick={() => setShowEdit(true)}
          className="card-elevated p-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-slate-400" />
            </div>
            <span className="font-display font-bold text-slate-800 text-sm">Edit Profile</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>

        {/* Upsell cards */}
        {UPSELLS.map(({ key, bg, fg, icon: Icon, label, path }) => (
          <button key={key} onClick={() => navigate(path)}
            className="card-elevated p-4 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color: fg }} />
              </div>
              <span className="font-display font-bold text-sm" style={{ color: fg }}>{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        ))}

        {/* Bio */}
        <div className="card-elevated p-4">
          <h3 className="font-display font-bold text-slate-800 text-sm mb-2">About</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            {user?.bio || 'No bio added. Tap Edit Profile to add one.'}
          </p>
        </div>

        {/* Details */}
        <div className="card-elevated p-4 space-y-3">
          <h3 className="font-display font-bold text-slate-800 text-sm">Details</h3>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <MapPin className="w-4 h-4 text-slate-300 flex-shrink-0" />
            {[user?.area, user?.city].filter(Boolean).join(', ') || 'Location not set'}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Mail className="w-4 h-4 text-slate-300 flex-shrink-0" />
            {user?.email || 'Email not set'}
          </div>
          {user?.phone && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Phone className="w-4 h-4 text-slate-300 flex-shrink-0" />
              {user.phone}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="card-elevated p-4">
          <h3 className="font-display font-bold text-slate-800 text-sm mb-3">Skills</h3>
          {user?.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {user.skills.map(s => <span key={s.id} className="badge badge-blue">{s.name}</span>)}
            </div>
          ) : <p className="text-slate-400 text-xs">No skills added yet</p>}
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="card-elevated p-4 w-full flex items-center gap-3 text-red-500">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-sm">Logout</span>
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile" size="lg">
        <div className="space-y-4">

          <Input label="Full Name" value={form.name} onChange={set('name')} />

          {/* Email — read only, Supabase se change nahi ho sakta */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Email <span className="font-normal text-slate-400">(cannot be changed)</span>
            </label>
            <div className="input py-3 text-slate-400 text-sm bg-slate-50 cursor-not-allowed rounded-xl">
              {user?.email}
            </div>
          </div>

          {/* Phone — editable */}
          <Input label="Phone Number" value={form.phone} onChange={set('phone')}
            placeholder="9999999999" inputMode="tel" />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>About You</label>
            <textarea value={form.bio} onChange={set('bio')} rows={4} className="textarea"
              placeholder="Tell employers about yourself..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input type="number" label="Experience (yrs)" value={form.experienceYears}
              onChange={e => setForm(p => ({ ...p, experienceYears: parseInt(e.target.value) || 0 }))} />
            <Select label="Availability" value={form.availability} onChange={set('availability')}
              options={[
                { value: 'immediate',     label: 'Immediate' },
                { value: 'within_week',   label: 'Within a week' },
                { value: 'within_month',  label: 'Within a month' },
                { value: 'not_available', label: 'Not available' },
              ]} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Skills</label>
            <SkillPicker
              selectedIds={form.selectedSkills}
              selectedCustom={form.customSkills || []}
              onChange={ids => setForm(p => ({ ...p, selectedSkills: ids }))}
              onCustomChange={custom => setForm(p => ({ ...p, customSkills: custom }))}
            />
          </div>

          <button onClick={handleSave} disabled={loading}
            className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
            {loading
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              : 'Save Changes'
            }
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SeekerProfile;