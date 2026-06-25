import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, CheckCircle2, ChevronRight, Lock, Phone, MapPin, Award, Briefcase, Sparkles } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { userService }  from '../../services/userService';
import { useLocation as useGeoLocation } from '../../hooks/useLocation';
import Input from '../../components/ui/Input';
import SkillPicker from '../../components/forms/SkillPicker';
import Select from '../../components/ui/Select';
import toast from 'react-hot-toast';

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 hover:shadow-sm transition-all duration-300">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
      {Icon && <Icon className="w-4 h-4 text-blue-600" />}
      <h3 className="font-display font-bold text-slate-800 text-sm tracking-tight">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const CompleteProfile = () => {
  const { user, loading: authLoading, refreshUser }         = useAuth();
  const navigate                                            = useNavigate();
  const { getCurrentLocation, loading: locationLoading }   = useGeoLocation();

  const [loading, setLoading]   = useState(false);
  const [form, setForm] = useState({
    phone: '', area: '', city: '', state: '', pincode: '',
    latitude: null, longitude: null,
    experienceYears: 0, availability: 'immediate',
    selectedSkills: [],
    customSkills: [],
  });

  useEffect(() => {
    if (user) {
      setForm(p => ({
        ...p,
        phone: user.phone || '',
        area: user.area || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        latitude: user.latitude || null,
        longitude: user.longitude || null,
      }));
    }
  }, [user]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  // GPS coordinates capture & reverse geocoding to fill address automatically
  const handleGetLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      const lat = coords.latitude;
      const lon = coords.longitude;

      setForm(p => ({ ...p, latitude: lat, longitude: lon }));
      toast.success('GPS coordinates captured!');

      // Start address auto-fill with Nominatim
      toast.promise(
        (async () => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'RojgarSetu-Onboarding-App'
              }
            }
          );
          if (!res.ok) throw new Error('Geocoding request failed');
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const areaName = addr.suburb || addr.neighbourhood || addr.road || addr.village || addr.subdivision || '';
            const cityName = addr.city || addr.town || addr.city_district || addr.county || '';
            const stateName = addr.state || addr.region || '';
            const postcode = addr.postcode || '';

            setForm(p => ({
              ...p,
              area: areaName || p.area,
              city: cityName || p.city,
              state: stateName || p.state,
              pincode: postcode || p.pincode,
            }));
          } else {
            throw new Error('No address fields found');
          }
        })(),
        {
          loading: 'Auto-detecting address from GPS...',
          success: 'Address fields auto-filled successfully!',
          error: 'GPS captured, but address could not be auto-detected.'
        }
      );
    } catch (err) { 
      toast.error(err.message || 'Failed to capture location'); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.city.trim()) return toast.error('Please enter your city');

    setLoading(true);
    try {
      let lat = form.latitude;
      let lon = form.longitude;

      // Geocoding fallback if GPS coordinates are missing
      if (!lat || !lon) {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.city)}&limit=1`,
            { headers: { 'User-Agent': 'RojgarSetu-Onboarding-App' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              lat = parseFloat(geoData[0].lat);
              lon = parseFloat(geoData[0].lon);
            }
          }
        } catch (err) {
          console.warn('Geocoding fallback failed:', err);
        }
      }

      // Default Noida/Delhi NCR fallback coordinates if everything fails
      if (!lat || !lon) {
        lat = 28.6273;
        lon = 77.3725;
      }

      await userService.updateProfile({
        ...form,
        latitude: lat,
        longitude: lon,
        skills: [
          ...form.selectedSkills.map(skillId => ({ skillId })),
          ...form.customSkills.map(name => ({ customName: name })),
        ],
        profileCompleted: true,
      });
      await refreshUser();
      toast.success('Profile completed successfully!');
      navigate(user?.role === 'employer' ? '/employer' : '/seeker');
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] bg-slate-50">
        <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-xs font-semibold">Initializing profile form...</p>
      </div>
    );
  }

  const isSeeker = user.role === 'job_seeker';

  return (
    <div className="page-enter bg-slate-50">
      
      {/* Visual Top Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 px-6 py-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/10 blur-xl -translate-y-10 translate-x-10 pointer-events-none" />
        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Step 3 of 3: Setup Onboarding</span>
        </div>
        <h1 className="font-display text-xl font-extrabold text-white tracking-tight">Complete Your Profile</h1>
        <p className="text-blue-200 text-xs mt-0.5">Please provide your contact and location details to finalize your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Dynamic Responsive Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Contact & Location */}
          <div className={`space-y-6 ${isSeeker ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            
            {/* Contact Details Section */}
            <Section title="Contact Information" icon={Phone}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-500 text-xs font-semibold select-none cursor-not-allowed">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
                
                <Input 
                  label="Phone Number *" 
                  value={form.phone} 
                  onChange={set('phone')}
                  placeholder="+91 9999999999" 
                  inputMode="tel" 
                  required
                />
              </div>
            </Section>

            {/* Location Section */}
            <Section title="Location Coordinates & Address" icon={MapPin}>
              
              {/* Location Capture Button */}
              <button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={locationLoading}
                className="w-full py-3 rounded-xl border-2 font-display font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300"
                style={{
                  borderColor: form.latitude ? '#10b981' : '#e2e8f0',
                  background:  form.latitude ? '#ecfdf5' : 'white',
                  color:       form.latitude ? '#047857' : '#475569',
                }}
              >
                {locationLoading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : form.latitude ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-scale-up" />
                ) : (
                  <Navigation className="w-4 h-4 text-slate-500" />
                )}
                {form.latitude ? 'GPS Location Captured ✓' : 'Capture My GPS Location *'}
              </button>

              {/* Grid for Area & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Area / Village" 
                  value={form.area}  
                  onChange={set('area')}  
                  placeholder="e.g. Sector 62" 
                />
                <Input 
                  label="City / Town *"  
                  value={form.city}  
                  onChange={set('city')}  
                  placeholder="e.g. Noida" 
                  required
                />
              </div>

              {/* Grid for State & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="State"   
                  value={form.state}   
                  onChange={set('state')}   
                  placeholder="e.g. Uttar Pradesh" 
                />
                <Input 
                  label="Pincode" 
                  value={form.pincode} 
                  onChange={set('pincode')} 
                  placeholder="e.g. 201301" 
                  inputMode="numeric" 
                  maxLength={6} 
                />
              </div>

            </Section>
          </div>

          {/* Right Column: Skills & Experience (Seeker Only) */}
          {isSeeker && (
            <div className="space-y-6 lg:col-span-6">
              
              {/* Experience Info Section */}
              <Section title="Work Experience & Availability" icon={Briefcase}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    type="number" 
                    label="Years of Experience"
                    value={form.experienceYears}
                    onChange={e => setForm(p => ({ ...p, experienceYears: Math.max(0, parseInt(e.target.value) || 0) }))}
                    min={0} 
                    max={50} 
                  />
                  
                  <Select 
                    label="Availability" 
                    value={form.availability} 
                    onChange={set('availability')}
                    options={[
                      { value: 'immediate',     label: 'Immediate' },
                      { value: 'within_week',   label: 'Within a Week' },
                      { value: 'within_month',  label: 'Within a Month' },
                      { value: 'not_available', label: 'Not Available' },
                    ]} 
                  />
                </div>
              </Section>

              {/* Skills Picker Section */}
              <Section title="Skills & Talents" icon={Award}>
                <p className="text-[11px] text-slate-500 -mt-2">
                  Select key skills you hold or add custom entries to rank higher in search matches.
                </p>
                <div className="p-0.5">
                  <SkillPicker
                    selectedIds={form.selectedSkills}
                    selectedCustom={form.customSkills}
                    onChange={ids => setForm(p => ({ ...p, selectedSkills: ids }))}
                    onCustomChange={custom => setForm(p => ({ ...p, customSkills: custom }))}
                  />
                </div>
              </Section>

            </div>
          )}

        </div>

        {/* Global Submit Action Button */}
        <div className="pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm justify-between shadow-lg disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] transition-all"
            style={{ borderRadius: '12px' }}
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center w-full">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Profile & Initializing...
              </span>
            ) : (
              <>
                <span>Complete Profile & Enter Dashboard</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CompleteProfile;