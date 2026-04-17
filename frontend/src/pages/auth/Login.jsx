import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
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
    if (!isValid) { toast.error('Please enter a valid email address'); return; }
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
    <div className="px-6 py-8 page-enter">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Welcome</h2>
        <p className="text-slate-500 text-sm mt-1">Sign in or create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
          <div className="flex rounded-xl overflow-hidden transition-all"
            style={{
              border: `2px solid ${email.length > 0 ? '#2563eb' : '#e2e8f0'}`,
              boxShadow: email.length > 0 ? '0 0 0 3px rgba(37,99,235,0.10)' : 'none',
            }}>
            <div className="flex items-center px-4 bg-slate-50 border-r border-slate-200">
              <Mail className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 px-4 py-3.5 text-sm bg-white outline-none font-medium text-slate-800 placeholder-slate-300"
              autoComplete="email"
              inputMode="email"
            />
          </div>
        </div>

        <button type="submit" disabled={!isValid || loading}
          className="btn-primary w-full py-4 text-base justify-between disabled:opacity-50"
          style={{ borderRadius: '12px' }}>
          {loading
            ? <span className="flex items-center gap-2 justify-center w-full">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending OTP...
              </span>
            : <><span>Send OTP</span><ArrowRight className="w-5 h-5" /></>
          }
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-6">
        We'll send a 6-digit code to your email
      </p>
    </div>
  );
};

export default Login;