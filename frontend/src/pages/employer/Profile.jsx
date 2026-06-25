import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, LogOut, Phone } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { userService } from '../../services/userService';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EmployerProfile = () => {
  const { user, logout, refreshUser, isSubscribed, isVerified } = useAuth();
  const navigate = useNavigate();

  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving]     = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', bio: '',
    area: '', city: '', state: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name:  user.name  || '',
        phone: user.phone || '',
        bio:   user.bio   || '',
        area:  user.area  || '',
        city:  user.city  || '',
        state: user.state || '',
      });
    }
  }, [user]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await userService.updateProfile(form);
      await refreshUser();
      setShowEdit(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-2xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              {user.name?.charAt(0).toUpperCase() || '?'}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center ring-1 ring-white">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-extrabold text-slate-900 text-lg">{user.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            {user.phone && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {user.phone}
              </p>
            )}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {isVerified && <span className="badge badge-blue text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Verified</span>}
              {isSubscribed && <span className="badge text-xs" style={{ background: '#faf5ff', color: '#7c3aed' }}>⭐ Premium</span>}
            </div>
          </div>
        </div>

        <button onClick={() => setShowEdit(true)}
          className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 active:bg-slate-100 transition-colors">
          <span className="font-display font-semibold text-slate-700 text-sm">Edit Profile</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* About */}
        <div className="card-elevated p-4">
          <p className="font-display font-bold text-slate-800 text-sm mb-2">About</p>
          <p className="text-slate-500 text-sm leading-relaxed">{user.bio || 'No bio added yet.'}</p>
        </div>

        {/* Details */}
        <div className="card-elevated p-4 divide-y divide-slate-50">
          <p className="font-display font-bold text-slate-800 text-sm pb-3">Contact Details</p>
          {[
            ['Location', [user.area, user.city, user.state].filter(Boolean).join(', ') || '—'],
            ['Email',    user.email || '—'],
            ['Phone',    user.phone || '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2.5">
              <span className="text-xs text-slate-400">{label}</span>
              <span className="font-semibold text-slate-800 text-sm truncate max-w-[180px]">{value}</span>
            </div>
          ))}
        </div>

        {/* Upsell */}
        {!isSubscribed && (
          <button onClick={() => navigate('/employer/subscription')}
            className="card-elevated p-4 w-full text-left flex items-center justify-between"
            style={{ borderLeft: '4px solid #7c3aed' }}>
            <div>
              <p className="font-display font-bold text-slate-800 text-sm">Upgrade to Premium</p>
              <p className="text-xs text-slate-500 mt-0.5">View contacts, 100 km search — ₹9/month</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>
        )}

        {/* Logout */}
        <button onClick={logout}
          className="w-full py-3.5 rounded-xl font-display font-bold text-sm transition-all active:scale-[0.98]"
          style={{ background: '#fff1f2', color: '#be123c' }}>
          <span className="flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />Logout</span>
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input label="Company / Name *" value={form.name} onChange={set('name')} placeholder="Your company or name" />

          {/* Email — read only */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Email (cannot be changed)</label>
            <div className="input py-3 text-slate-400 text-sm bg-slate-50 cursor-not-allowed">
              {user.email}
            </div>
          </div>

          {/* Phone */}
          <Input label="Phone Number" value={form.phone} onChange={set('phone')}
            placeholder="+91 9999999999" inputMode="tel" />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>About / Bio</label>
            <textarea value={form.bio} onChange={set('bio')} rows={4} className="textarea"
              placeholder="Tell seekers about your company..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Area"  value={form.area}  onChange={set('area')}  placeholder="Area" />
            <Input label="City"  value={form.city}  onChange={set('city')}  placeholder="City" />
          </div>
          <Input label="State" value={form.state} onChange={set('state')} placeholder="State" />

          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
            {saving
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

export default EmployerProfile;