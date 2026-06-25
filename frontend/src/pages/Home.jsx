import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  ShieldCheck, 
  Star, 
  ChevronRight, 
  Briefcase, 
  TrendingUp, 
  Search, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  HelpCircle, 
  Send, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { jobService } from '../services/jobService';

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Delivery Executive',
    company: 'Express Logistics',
    location: 'Sector 62, Noida',
    type: 'part',
    salary: '₹15,000 - ₹22,000/mo',
    verified: true,
    skills: ['Driving License', 'Local Navigation'],
    logoBg: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 2,
    title: 'Data Entry Operator',
    company: 'Fintech Solutions',
    location: 'Remote (Work from Home)',
    type: 'wfh',
    salary: '₹12,000 - ₹18,000/mo',
    verified: true,
    skills: ['Typing Speed 35wpm', 'MS Excel'],
    logoBg: 'bg-blue-100 text-blue-700'
  },
  {
    id: 3,
    title: 'Certified Electrician',
    company: 'Urban Fixers Ltd',
    location: 'Indirapuram, Ghaziabad',
    type: 'full',
    salary: '₹20,000 - ₹30,000/mo',
    verified: true,
    skills: ['Basic Electricity', 'Wiring Exam Pass'],
    logoBg: 'bg-amber-100 text-amber-700'
  },
  {
    id: 4,
    title: 'Retail Store Associate',
    company: 'SmartMart Retails',
    location: 'Connaught Place, New Delhi',
    type: 'full',
    salary: '₹14,000 - ₹19,000/mo',
    verified: false,
    skills: ['Customer Communication'],
    logoBg: 'bg-purple-100 text-purple-700'
  },
  {
    id: 5,
    title: 'Telecalling Representative',
    company: 'NextGen Teleservices',
    location: 'Sector 18, Noida',
    type: 'part',
    salary: '₹10,000 - ₹15,000/mo + Incentive',
    verified: true,
    skills: ['Hindi Speaking', 'Basic Computer'],
    logoBg: 'bg-indigo-100 text-indigo-700'
  },
  {
    id: 6,
    title: 'Bilingual Content Writer',
    company: 'MediaLabs Hub',
    location: 'Remote (Work from Home)',
    type: 'wfh',
    salary: '₹25,000 - ₹35,000/mo',
    verified: true,
    skills: ['Content Writing', 'English Speaking'],
    logoBg: 'bg-rose-100 text-rose-700'
  }
];

const TESTIMONIALS = [
  {
    quote: "RojgarSetu transformed our hiring process. Within 2 days of posting, we hired three verified delivery partners who already cleared the driving and location exams. Incredible platform!",
    author: "Rohan Sharma",
    role: "Operations Manager, QuickCart India",
    avatar: "RS",
    rating: 5
  },
  {
    quote: "I was looking for a typing job near me for months. After completing the free computer typing exam on RojgarSetu and earning a verified badge, a local company reached out and hired me directly!",
    author: "Kiran Devi",
    role: "Certified Data Entry Operator",
    avatar: "KD",
    rating: 5
  },
  {
    quote: "The location-based search is extremely accurate. I can filter jobs within 5km from my home. The daily wage payments and verified employer guarantee give me complete peace of mind.",
    author: "Manpreet Singh",
    role: "Electrician & General Technician",
    avatar: "MS",
    rating: 5
  }
];

const FAQS = [
  {
    question: "What is RojgarSetu and how does it work?",
    answer: "RojgarSetu is a modern job portal that connects local job seekers with verified employers. We offer location-based search and direct skill exams to verify your talents so employers can trust your credentials instantly."
  },
  {
    question: "How do I take a skill exam and earn a badge?",
    answer: "Go to the 'Exams' tab after signing in. We offer free assessments in typing, customer service, basic electricity, and more. Once passed, a verified badge is added to your profile which makes you 3x more likely to get hired."
  },
  {
    question: "Is it completely free for job seekers?",
    answer: "Yes! Creating your profile, searching for local jobs, taking exams, and getting hired is 100% free for job seekers. We also offer premium features for advanced certifications."
  },
  {
    question: "How do employers contact me?",
    answer: "Employers can view your certified profile and contact you directly via chat, phone, or email. You will receive notifications in real-time when an employer is interested in your application."
  }
];

const Home = () => {
  const navigate = useNavigate();
  
  // State for Mobile Navigation Menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real-time Jobs States
  const [realJobs, setRealJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // States for Search Simulator
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // States for Quiz Widget
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(null); // null, true, false

  // States for Job Filter
  const [selectedJobType, setSelectedJobType] = useState('all');

  // States for Testimonials
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // States for FAQs
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // States for Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Fetch real-time jobs from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchRealJobs = async () => {
      try {
        const response = await jobService.getJobs({ limit: 12 });
        if (isMounted) {
          if (response && response.jobs && response.jobs.length > 0) {
            const mapped = response.jobs.map(job => {
              let type = 'full';
              if (job.job_type === 'part_time' || job.job_type === 'daily_wage') {
                type = 'part';
              } else if (job.job_type === 'contract') {
                type = 'full';
              }
              if (job.area?.toLowerCase().includes('remote') || job.city?.toLowerCase().includes('remote')) {
                type = 'wfh';
              }

              let salaryStr = 'Negotiable';
              if (job.salary_min && job.salary_max) {
                salaryStr = `₹${job.salary_min.toLocaleString('en-IN')} - ₹${job.salary_max.toLocaleString('en-IN')}`;
                if (job.salary_type === 'monthly') salaryStr += '/mo';
                else if (job.salary_type === 'daily') salaryStr += '/day';
                else if (job.salary_type === 'hourly') salaryStr += '/hr';
              } else if (job.salary_min) {
                salaryStr = `₹${job.salary_min.toLocaleString('en-IN')}+`;
              }

              return {
                id: job.id,
                title: job.title,
                company: job.employer_name || 'Verified Employer',
                location: [job.area, job.city].filter(Boolean).join(', ') || 'Remote',
                type: type,
                salary: salaryStr,
                verified: job.employer_verified || false,
                skills: job.skills?.map(s => s.name) || [],
              };
            });
            setRealJobs(mapped);
          } else {
            setRealJobs(MOCK_JOBS);
          }
        }
      } catch (err) {
        console.error('Error fetching jobs from DB:', err);
        if (isMounted) setRealJobs(MOCK_JOBS);
      } finally {
        if (isMounted) setLoadingJobs(false);
      }
    };
    fetchRealJobs();
    return () => { isMounted = false; };
  }, []);

  // Handle Mock Search across real-time/mock jobs
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery && !searchLocation) {
      setSearchResult("Please fill in search keyword or location.");
      return;
    }
    const query = searchQuery.toLowerCase();
    const loc = searchLocation.toLowerCase();
    
    const matched = realJobs.filter(job => 
      (job.title.toLowerCase().includes(query) || 
       job.company.toLowerCase().includes(query) ||
       job.skills.some(s => s.toLowerCase().includes(query))) &&
      (job.location.toLowerCase().includes(loc))
    );

    if (matched.length > 0) {
      setSearchResult({
        count: matched.length,
        jobs: matched
      });
    } else {
      setSearchResult({
        count: 0,
        message: `No exact matches found for "${searchQuery}" in ${searchLocation || 'any location'}. Try searching popular keywords like 'Delivery', 'Electrician', or check locations!`
      });
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    setShowSearchSuggestions(false);
    
    const matched = realJobs.filter(job => 
      job.title.toLowerCase().includes(tag.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(tag.toLowerCase()))
    );
    setSearchResult({
      count: matched.length,
      jobs: matched
    });
  };

  // Handle Mock Quiz
  const handleQuizAnswer = (optionIndex) => {
    if (quizAnswered !== null) return; // Answered already
    setQuizSelectedOption(optionIndex);
    if (optionIndex === 1) {
      setQuizAnswered(true);
    } else {
      setQuizAnswered(false);
    }
  };

  // Filter Jobs
  const filteredJobs = selectedJobType === 'all' 
    ? realJobs 
    : realJobs.filter(job => job.type === selectedJobType);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setNewsletterSuccess(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-body antialiased">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Logo size="md" />
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors">Features</a>
              <a href="#explore-jobs" className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors">Explore Jobs</a>
              <a href="#test-skills" className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors">Skills Assessment</a>
              <a href="#faqs" className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors">FAQs</a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-slate-700 hover:text-blue-600 font-semibold text-sm px-4 py-2 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/10 active:scale-95"
              >
                Register Now
              </button>
            </div>

            {/* Mobile Hamburger Trigger */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 pt-4 pb-6 space-y-3 shadow-lg animate-fade-in">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition-all"
            >
              Features
            </a>
            <a 
              href="#explore-jobs" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition-all"
            >
              Explore Jobs
            </a>
            <a 
              href="#test-skills" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition-all"
            >
              Skills Assessment
            </a>
            <a 
              href="#faqs" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition-all"
            >
              FAQs
            </a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
              >
                Register Now
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8 lg:py-28">
        
        {/* Glow Blobs */}
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-blue-600 opacity-20 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-purple-600 opacity-15 blur-[80px] pointer-events-none" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Intro */}
          <div className="lg:col-span-7 space-y-6 page-enter text-center lg:text-left">
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-400/25 mb-2 shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ Redefining Local Job Search & Verification</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Find the right job. <br />
              <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                Hire the right talent.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Connect directly with local gig opportunities, full-time jobs, and certified professionals near you. Verified by skill assessments.
            </p>

            {/* Popular tags selection */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2">
              <span className="text-xs text-slate-400">Popular Searches:</span>
              {['Delivery', 'Data Entry', 'Electrician', 'Retail'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="text-xs bg-white/5 hover:bg-white/12 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-blue-800 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
              >
                <span>Get Started Now</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              <a
                href="#features"
                className="text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-1.5 py-3 hover:translate-x-1 transition-all"
              >
                <span>Learn how it works</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>

          {/* Interactive Job Search Simulator */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-2xl relative">
              <div className="absolute top-3 right-4 flex items-center gap-1 bg-blue-500/25 px-2 py-0.5 rounded-md border border-blue-400/20">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                <span className="text-[10px] text-blue-200 font-semibold tracking-wider uppercase">Live Demo</span>
              </div>

              <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-300" />
                <span>Search Local Jobs</span>
              </h3>
              <p className="text-slate-300 text-xs mb-5">
                Type a skill and location to filter our live database.
              </p>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                
                {/* Search Term Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Search className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Job Title (e.g. Delivery, Electrician)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onFocus={() => setShowSearchSuggestions(true)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all"
                  />
                  {showSearchSuggestions && searchQuery && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-800 animate-slide-up">
                      {['Delivery Executive', 'Data Entry Operator', 'Certified Electrician', 'Telecalling'].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setSearchQuery(item);
                            setShowSearchSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <MapPin className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Location (e.g. Noida, Delhi, Remote)"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
                >
                  Find Matches
                </button>
              </form>

              {/* Dynamic Results Window */}
              {searchResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-white/10 animate-fade-in">
                  {typeof searchResult === 'string' ? (
                    <p className="text-amber-400 text-xs">{searchResult}</p>
                  ) : searchResult.count > 0 ? (
                    <div>
                      <p className="text-emerald-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Found {searchResult.count} matching jobs!</span>
                      </p>
                      <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                        {searchResult.jobs.map((job) => (
                          <div key={job.id} className="p-2 rounded bg-white/5 border border-white/5 text-[11px]">
                            <div className="flex justify-between font-bold text-white">
                              <span>{job.title}</span>
                              <span className="text-blue-300">{job.salary}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 mt-1">
                              <span>{job.company}</span>
                              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => navigate('/login')}
                        className="mt-3 w-full bg-white text-blue-900 font-bold py-1.5 px-3 rounded-lg text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Login to Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-amber-400 text-xs font-semibold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>{searchResult.message}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. Stats Section */}
      <section className="relative z-10 -mt-8 max-w-5xl mx-auto px-4 w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {[
            { value: '10K+', label: 'Active Jobs Posted', desc: 'Direct from employers', color: 'text-blue-600' },
            { value: '25K+', label: 'Verified Seekers', desc: 'Certified skill badges', color: 'text-indigo-600' },
            { value: '500+', label: 'Partner Companies', desc: 'Local & national brands', color: 'text-blue-600' },
          ].map(({ value, label, desc, color }) => (
            <div key={label} className="text-center px-4 py-4 md:py-2 group hover:scale-[1.02] transition-transform duration-300">
              <p className={`font-display text-3xl md:text-4xl font-extrabold ${color} tracking-tight`}>{value}</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold text-blue-600 tracking-wider uppercase">Why RojgarSetu</h2>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A smarter way to match skills with jobs
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We bridge the gap between candidate qualifications and employer expectations using direct verification tools and smart maps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: MapPin, 
                bg: 'bg-blue-50 text-blue-600', 
                border: 'hover:border-blue-300',
                title: 'Location-Based Search', 
                desc: 'Find jobs within walking or riding distance. Set your search radius and view postings directly on a map layout.' 
              },
              { 
                icon: Users, 
                bg: 'bg-purple-50 text-purple-600', 
                border: 'hover:border-purple-300',
                title: 'Smart Skill Matching', 
                desc: 'No more messy keyword search. Our algorithm matches your profile credentials to relevant local job openings.' 
              },
              { 
                icon: ShieldCheck, 
                bg: 'bg-emerald-50 text-emerald-600', 
                border: 'hover:border-emerald-300',
                title: 'Verified Profiles', 
                desc: 'Hire with confidence. Every employer profile is verified, and seekers complete background/OTP checkins.' 
              },
              { 
                icon: Star, 
                bg: 'bg-amber-50 text-amber-600', 
                border: 'hover:border-amber-300',
                title: 'Skill Certification', 
                desc: 'Prove your capabilities. Take custom mini-assessments to earn digital certificates that show on your job applications.' 
              },
            ].map(({ icon: Icon, bg, border, title, desc }) => (
              <div 
                key={title} 
                className={`bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${border} group`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${bg} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-slate-800 text-base mb-2">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Skill Quiz Widget Section */}
      <section id="test-skills" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-900 to-blue-950 text-white overflow-hidden relative">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600 opacity-20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500 opacity-20 blur-[120px]" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
              <Award className="w-4 h-4" />
              <span>Skill Verification Exams</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
              Test your skills. <br />
              <span className="text-cyan-300">Earn verified badges.</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              Employers are 3 times more likely to hire candidates with certified skill badges. Try our interactive sample question to see how easy it is to verify your skills on RojgarSetu.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 text-sm">Free automated mini-exams</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 text-sm">Instantly visible verified badges on your CV</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 text-sm">Preferred ranking in employer searches</span>
              </div>
            </div>
          </div>

          {/* Interactive Quiz Card */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto">
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-sm">Interactive Quiz Demo</span>
                </div>
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-md">
                  RojgarSetu Certify
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Question 1 of 1</p>
              <h4 className="font-display font-bold text-white text-base leading-relaxed mb-6">
                Which of the following is a verified way to stand out to employers on RojgarSetu?
              </h4>

              <div className="space-y-3">
                {[
                  "Paying for direct job interviews",
                  "Taking free skill exams & earning verified skill badges",
                  "Sending spam applications to every job post",
                  "Buying followers on social media"
                ].map((option, idx) => {
                  let optionClass = "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ";
                  
                  if (quizAnswered === null) {
                    optionClass += "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40 active:scale-[0.99]";
                  } else {
                    if (idx === 1) {
                      // Correct option
                      optionClass += "border-emerald-500 bg-emerald-500/10 text-emerald-300";
                    } else if (quizSelectedOption === idx && idx !== 1) {
                      // Selected incorrect option
                      optionClass += "border-rose-500 bg-rose-500/10 text-rose-300";
                    } else {
                      // Other unselected options
                      optionClass += "border-slate-800 bg-slate-900/20 text-slate-500 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={quizAnswered !== null}
                      className={optionClass}
                    >
                      <div className="flex items-center justify-between">
                        <span>{idx + 1}. {option}</span>
                        {quizAnswered !== null && idx === 1 && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                        {quizAnswered !== null && quizSelectedOption === idx && idx !== 1 && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Answer Feedback */}
              {quizAnswered !== null && (
                <div className="mt-6 p-4 rounded-xl border animate-fade-in bg-slate-800/40 border-slate-700">
                  {quizAnswered ? (
                    <div className="space-y-2">
                      <p className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct Answer! You're ready!</span>
                      </p>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Earn your official verified badge by taking an assessment. Register today to unlock free exams in typing, driving, tech skills, and retail!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-rose-400 font-bold text-sm flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>Incorrect. The correct answer was #2.</span>
                      </p>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        RojgarSetu values real skills verified through assessments. Sign up now, practice with sample tests, and pass to earn your badge!
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Register & Start Learning
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* 6. Explore Live Mock Jobs (Filterable Tabs) */}
      <section id="explore-jobs" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2">Opportunities Nearby</h2>
              <h3 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured job listings
              </h3>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
              {[
                { id: 'all', label: 'All Jobs' },
                { id: 'full', label: 'Full Time' },
                { id: 'part', label: 'Part Time' },
                { id: 'wfh', label: 'Work from Home' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedJobType(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedJobType === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                      job.type === 'full' ? 'bg-blue-50 text-blue-600' :
                      job.type === 'part' ? 'bg-amber-50 text-amber-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {job.type === 'full' ? 'Full Time' : job.type === 'part' ? 'Part Time' : 'Remote'}
                    </span>
                    {job.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-blue-600 font-bold bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors mb-1">
                    {job.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mb-4">{job.company}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-800">{job.salary}</span>
                    </div>
                  </div>

                  {/* Skills required tags */}
                  <div className="flex flex-wrap gap-1 mb-6">
                    {job.skills.map((skill) => (
                      <span key={skill} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all active:scale-[0.98]"
                >
                  Quick Apply
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 text-sm rounded-xl transition-colors shadow-sm active:scale-95"
            >
              <span>Explore All 10,000+ Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Interactive Testimonial Slider */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
            <span>User Reviews</span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Loved by local seekers and employers alike
          </h3>

          <div className="min-h-[160px] flex items-center justify-center transition-all duration-300">
            <div className="space-y-6 animate-fade-in">
              <p className="text-lg sm:text-xl font-light italic leading-relaxed text-slate-200">
                "{TESTIMONIALS[currentTestimonial].quote}"
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm border border-white/10 shadow-lg">
                  {TESTIMONIALS[currentTestimonial].avatar}
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-white">{TESTIMONIALS[currentTestimonial].author}</p>
                  <p className="text-xs text-slate-400">{TESTIMONIALS[currentTestimonial].role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Selectors */}
          <div className="flex items-center justify-center gap-2.5">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentTestimonial === idx ? 'w-8 bg-blue-500' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Interactive FAQ Accordion */}
      <section id="faqs" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold text-blue-600 tracking-wider uppercase">Got Questions?</h2>
            <h3 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Everything you need to know about setting up your profile, taking exams, and connecting with local companies.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-display font-bold text-slate-800 text-sm sm:text-base hover:bg-slate-50/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`} />
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 animate-slide-down">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Dual CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Seeker Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-8 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl">Are you looking for work?</h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Build a professional profile, take free skill exams to earn verification badges, search and apply to local vacancies.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] shadow-md hover:shadow-lg shadow-blue-500/10"
            >
              Create Seeker Account
            </button>
          </div>

          {/* Employer Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-8 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl">Are you hiring workers?</h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Post full-time or gig roles, screen local candidates, filter applicants by verified exam credentials, and recruit verified talent fast.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] shadow-md hover:shadow-lg shadow-indigo-500/10"
            >
              Post a Job Now
            </button>
          </div>

        </div>
      </section>

      {/* 10. Footer Section */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
            
            {/* Branding Column */}
            <div className="md:col-span-5 space-y-6">
              <Logo size="md" light />
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                RojgarSetu is a smart, direct-verification career bridge for local jobs. Connect verified candidates with trusted, hyper-local opportunities.
              </p>
              <div className="flex gap-4">
                {/* Social media icons */}
                {['Twitter', 'Facebook', 'LinkedIn', 'Instagram'].map(social => (
                  <span key={social} className="text-xs text-slate-500 hover:text-white cursor-pointer transition-colors">
                    {social}
                  </span>
                ))}
              </div>
            </div>

            {/* Links Column */}
            <div className="md:col-span-3 space-y-4">
              <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider">Quick Links</h5>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#explore-jobs" className="hover:text-white transition-colors">Browse Jobs</a></li>
                <li><a href="#test-skills" className="hover:text-white transition-colors">Skill Exams</a></li>
                <li><a href="#faqs" className="hover:text-white transition-colors">Help & FAQ</a></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="md:col-span-4 space-y-4">
              <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider">Stay Updated</h5>
              <p className="text-xs text-slate-500">
                Subscribe to get notify about new jobs and exams in your region.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 w-full"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3.5 py-2 text-xs font-bold transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              
              {newsletterSuccess && (
                <p className="text-emerald-400 text-[11px] font-medium animate-fade-in">
                  ✓ Successfully subscribed to newsletter!
                </p>
              )}
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-4">
            <p>© {new Date().getFullYear()} RojgarSetu. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Cookie Settings</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;