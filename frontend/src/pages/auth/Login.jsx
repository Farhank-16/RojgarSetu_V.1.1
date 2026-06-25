import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ChevronRight, CheckCircle2, ShieldCheck, FileCheck, ArrowRightLeft } from 'lucide-react';
import useAuth from '../../context/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOTP }        = useAuth();
  const navigate              = useNavigate();

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) { 
      toast.error('Please enter a valid email address'); 
      return; 
    }
    setLoading(true);
    try {
      await requestOTP(email);
      sessionStorage.setItem('pendingEmail', email);
      toast.success('OTP sent to your email!');
      navigate('/verify-otp');
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 page-enter space-y-6">
      
      {/* Welcome Title */}
      <div className="text-center md:text-left space-y-1">
        <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-slate-500 text-xs sm:text-sm">Sign in to search jobs and test your skills</p>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
          <div 
            className="flex items-center rounded-xl border-2 transition-all duration-300 bg-slate-50"
            style={{
              borderColor: email.length === 0 
                ? '#e2e8f0' 
                : isValid 
                  ? '#10b981' 
                  : '#f59e0b',
              boxShadow: email.length > 0 
                ? isValid 
                  ? '0 0 0 3px rgba(16,185,129,0.1)' 
                  : '0 0 0 3px rgba(245,158,11,0.1)' 
                : 'none',
            }}
          >
            <div className="pl-4 pr-2 py-3.5 flex items-center justify-center">
              <Mail className={`w-4 h-4 transition-colors ${
                email.length === 0 
                  ? 'text-slate-400' 
                  : isValid 
                    ? 'text-emerald-500' 
                    : 'text-amber-500'
              }`} />
            </div>
            
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="flex-1 px-2 py-3.5 text-sm bg-transparent outline-none font-medium text-slate-800 placeholder-slate-400"
              autoComplete="email"
              inputMode="email"
            />
            
            {/* Dynamic Status Icons */}
            {email.length > 0 && (
              <div className="pr-4 py-3 flex items-center">
                {isValid ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 animate-scale-up" />
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold animate-pulse">
                    Invalid
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Verification Helper Tip */}
          <p className="text-[11px] text-slate-500 transition-colors leading-relaxed">
            {email.length === 0 ? (
              "Enter your personal or business email to receive an access token."
            ) : isValid ? (
              <span className="text-emerald-600 font-medium">✓ Ready! We will email a secure 6-digit code.</span>
            ) : (
              <span className="text-amber-600 font-medium">Please enter a valid format (e.g., mail@domain.com)</span>
            )}
          </p>
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          disabled={!isValid || loading}
          className="btn-primary w-full py-3.5 text-sm justify-between shadow-lg disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          style={{ borderRadius: '12px' }}
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center w-full">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending Verification OTP...
            </span>
          ) : (
            <>
              <span>Get OTP Verification Code</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-[10px] text-slate-400">
        By continuing, you agree to our Terms of Service & Privacy Policy.
      </p>

    </div>
  );
};

export default Login;