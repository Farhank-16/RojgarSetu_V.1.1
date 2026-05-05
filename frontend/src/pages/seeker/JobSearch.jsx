import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, X, Navigation } from 'lucide-react';
import { jobService }   from '../../services/jobService';
import { skillService } from '../../services/skillService';
import useAuth          from '../../context/useAuth';
import useDebounce      from '../../hooks/useDebounce';
import JobCard          from '../../components/cards/JobCard';
import Select           from '../../components/ui/Select';
import Input            from '../../components/ui/Input';
import Modal            from '../../components/ui/Modal';
import EmptyState       from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { TopBannerAd, MiddleSectionAd } from '../../components/ads/AdBanner';

const FREE_RADIUS = 10;
const MAX_RADIUS  = 100;

const JobSearch = () => {
  const { user, isSubscribed } = useAuth();

  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills]           = useState([]);
  const [pagination, setPagination]   = useState({ page: 1, pages: 1, total: 0 });
  const [userLat, setUserLat]         = useState(user?.latitude  || null);
  const [userLng, setUserLng]         = useState(user?.longitude || null);
  const [locLoading, setLocLoading]   = useState(false);

  const maxRadius = isSubscribed ? MAX_RADIUS : FREE_RADIUS;

  const [filters, setFilters] = useState({
    search: '', skillId: '', city: '', jobType: '',
    salaryMin: '', salaryMax: '',
    radius: isSubscribed ? 50 : FREE_RADIUS,
    sortBy: 'recent',   // recent | salary_high | salary_low | nearest
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    skillService.getSkills().then(({ skills }) => setSkills(skills)).catch(console.error);
    // Use profile location on mount
    if (user?.latitude)  setUserLat(user.latitude);
    if (user?.longitude) setUserLng(user.longitude);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [debouncedSearch, filters.skillId, filters.city, filters.jobType,
      filters.radius, filters.salaryMin, filters.salaryMax, filters.sortBy,
      pagination.page, userLat, userLng]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Enforce free plan radius
      const enforcedRadius = isSubscribed
        ? filters.radius
        : Math.min(filters.radius, FREE_RADIUS);

      const res = await jobService.getJobs({
        ...filters,
        search:    debouncedSearch,
        page:      pagination.page,
        limit:     10,
        radius:    enforcedRadius,
        userLat,
        userLng,
        salaryMin: filters.salaryMin ? parseInt(filters.salaryMin) : null,
        salaryMax: filters.salaryMax ? parseInt(filters.salaryMax) : null,
        sortBy:    filters.sortBy,
      });

      // Sort client-side if needed
      let sorted = res.jobs || [];
      if (filters.sortBy === 'salary_high') {
        sorted = sorted.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
      } else if (filters.sortBy === 'salary_low') {
        sorted = sorted.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
      } else if (filters.sortBy === 'nearest' && userLat) {
        sorted = sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }

      setJobs(sorted);
      setPagination(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const setF = key => e => {
    setPagination(p => ({ ...p, page: 1 }));
    setFilters(p => ({ ...p, [key]: e.target.value }));
  };

  const clearFilters = () => {
    setPagination(p => ({ ...p, page: 1 }));
    setFilters({
      search: '', skillId: '', city: '', jobType: '',
      salaryMin: '', salaryMax: '',
      radius: isSubscribed ? 50 : FREE_RADIUS,
      sortBy: 'recent',
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocLoading(false);
      },
      () => setLocLoading(false)
    );
  };

  const activeChips = [
    filters.skillId  && { key: 'skillId',  label: skills.find(s => s.id === parseInt(filters.skillId))?.name },
    filters.city     && { key: 'city',      label: filters.city },
    filters.jobType  && { key: 'jobType',   label: filters.jobType.replace('_', ' ') },
    filters.salaryMin && { key: 'salaryMin', label: `Min ₹${parseInt(filters.salaryMin).toLocaleString('en-IN')}` },
    filters.salaryMax && { key: 'salaryMax', label: `Max ₹${parseInt(filters.salaryMax).toLocaleString('en-IN')}` },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">


      {/* Search + filter bar */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 space-y-2.5">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={filters.search} onChange={setF('search')} placeholder="Search jobs..."
              className="input py-2.5 text-sm w-full" style={{ borderRadius: '10px', paddingLeft: '2.5rem' }} />
          </div>
          <button onClick={() => setShowFilters(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-colors flex-shrink-0"
            style={{
              borderColor: activeChips.length ? '#2563eb' : '#e2e8f0',
              background:  activeChips.length ? '#eff6ff' : 'white',
              color:       activeChips.length ? '#2563eb' : '#64748b',
            }}>
            <Filter className="w-4 h-4" />
            {activeChips.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                {activeChips.length}
              </span>
            )}
          </button>
        </div>

        {/* Sort pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { v: 'recent',      l: '🕐 Recent' },
            { v: 'nearest',     l: '📍 Nearest' },
            { v: 'salary_high', l: '💰 High Salary' },
            { v: 'salary_low',  l: '💸 Low Salary' },
          ].map(({ v, l }) => (
            <button key={v}
              onClick={() => setFilters(p => ({ ...p, sortBy: v }))}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: filters.sortBy === v ? '#2563eb' : '#f1f5f9',
                color:      filters.sortBy === v ? 'white'   : '#475569',
              }}>
              {l}
            </button>
          ))}
        </div>

        {activeChips.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {activeChips.map(chip => (
              <span key={chip.key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap capitalize">
                {chip.label}
                <button onClick={() => setF(chip.key)({ target: { value: '' } })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs text-slate-400 whitespace-nowrap">Clear all</button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 py-4 pb-20">
        {!loading && (
          <p className="text-xs text-slate-500 font-medium mb-3">
            {pagination.total} jobs found
            {userLat && ` · within ${isSubscribed ? filters.radius : FREE_RADIUS} km`}
            {!isSubscribed && <span className="text-amber-500"> · upgrade for 100 km</span>}
          </p>
        )}

        {loading ? <SkeletonList count={5} /> : jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <React.Fragment key={job.id}>
                <JobCard job={job} />
                {index === 3 && <MiddleSectionAd />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <EmptyState title="No jobs found"
            description="Try adjusting your filters or increasing the radius"
            action={clearFilters} actionLabel="Clear Filters" />
        )}

        {!loading && pagination.page < pagination.pages && (
          <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="w-full mt-4 py-3.5 text-center text-blue-600 font-display font-semibold text-sm">
            Load More
          </button>
        )}
      </div>

      {/* Filters Modal */}
      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filter Jobs">
        <div className="space-y-4">

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              📍 Your Location
            </label>
            <button type="button" onClick={getLocation} disabled={locLoading}
              className="w-full py-2.5 rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                borderColor: userLat ? '#22c55e' : '#e2e8f0',
                color:       userLat ? '#15803d' : '#475569',
                background:  userLat ? '#f0fdf4' : 'white',
              }}>
              {locLoading
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Navigation className="w-4 h-4" />
              }
              {userLat ? '✓ Location Captured' : 'Use My Location'}
            </button>
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Distance: <span className="text-blue-600">{isSubscribed ? filters.radius : FREE_RADIUS} km</span>
              {!isSubscribed && <span className="text-amber-500 font-normal text-xs ml-1">(free plan max 10 km)</span>}
            </label>
            <input type="range" min="1" max={maxRadius}
              value={isSubscribed ? filters.radius : FREE_RADIUS}
              disabled={!isSubscribed}
              onChange={e => setFilters(p => ({ ...p, radius: parseInt(e.target.value) }))}
              className="w-full accent-blue-600"
              style={{ opacity: isSubscribed ? 1 : 0.5 }} />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1 km</span>
              <span>{maxRadius} km</span>
            </div>
            {!isSubscribed && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                🔒 Upgrade to Premium to search up to 100 km
              </p>
            )}
          </div>

          <Select label="Skill" value={filters.skillId} onChange={setF('skillId')}
            options={skills.map(s => ({ value: s.id, label: s.name }))} placeholder="All Skills" />

          <Input label="City" value={filters.city} onChange={setF('city')} placeholder="Enter city name" />

          <Select label="Job Type" value={filters.jobType} onChange={setF('jobType')}
            options={[
              { value: 'full_time',  label: 'Full Time' },
              { value: 'part_time',  label: 'Part Time' },
              { value: 'contract',   label: 'Contract' },
              { value: 'daily_wage', label: 'Daily Wage' },
              { value: 'freelance',  label: 'Freelance' },
            ]} placeholder="All Types" />

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              💰 Salary Range (₹/month)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Min Salary" type="number" value={filters.salaryMin}
                onChange={setF('salaryMin')} placeholder="e.g. 5000" inputMode="numeric" />
              <Input label="Max Salary" type="number" value={filters.salaryMax}
                onChange={setF('salaryMax')} placeholder="e.g. 50000" inputMode="numeric" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => { clearFilters(); setShowFilters(false); }}
              className="btn-secondary flex-1 py-3 text-sm" style={{ borderRadius: '10px' }}>
              Clear
            </button>
            <button onClick={() => setShowFilters(false)}
              className="btn-primary flex-1 py-3 text-sm" style={{ borderRadius: '10px' }}>
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobSearch;