import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import useAuth from '../../context/useAuth';
import OTPInput from '../../components/forms/OTPInput';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp]                 = useState('');
  const [loading, setLoading]         = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const { verifyOTP, requestOTP }     = useAuth();
  const navigate                      = useNavigate();

  const email = sessionStorage.getItem('pendingEmail');

  useEffect(() => {
    // Don't redirect if no email — just show empty state
    // (redirecting here caused loop issues)
    const t = setInterval(() => setResendTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  // If no email, show go back button
  if (!email) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-slate-500 mb-4">Session expired. Please login again.</p>
        <button onClick={() => navigate('/login')} className="btn-primary px-6 py-3">Go to Login</button>
      </div>
    );
  }

  const handleVerify = async () => {
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const result = await verifyOTP(email, otp);
      sessionStorage.removeItem('pendingEmail');

      if (result.isNewUser) {
        sessionStorage.setItem('pendingUserId', result.userId);
        navigate('/select-role');
      } else {
        const { role, profileCompleted } = result.user;
        if (role === 'admin')         navigate('/admin');
        else if (!profileCompleted)   navigate('/complete-profile');
        else if (role === 'employer') navigate('/employer');
        else                          navigate('/seeker');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await requestOTP(email);
      setResendTimer(30);
      toast.success('OTP sent again!');
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="px-6 py-8 page-enter">
      <button onClick={() => navigate('/login')}
        className="flex items-center gap-1.5 text-slate-400 text-sm mb-8 -ml-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
          <ShieldCheck className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-slate-900">Check your email</h2>
        <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">
          We sent a 6-digit code to <span className="font-bold text-slate-800">{email}</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">Check spam folder if not received</p>
      </div>

      <div className="mb-8">
        <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />
      </div>

      <button onClick={handleVerify} disabled={otp.length !== 6 || loading}
        className="btn-primary w-full py-4 text-base mb-6 disabled:opacity-50"
        style={{ borderRadius: '12px' }}>
        {loading
          ? <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </span>
          : 'Verify & Continue'
        }
      </button>

      <div className="text-center">
        {resendTimer > 0
          ? <p className="text-slate-400 text-sm">Resend in <span className="font-display font-bold text-slate-600">{resendTimer}s</span></p>
          : <button onClick={handleResend} className="flex items-center gap-1.5 text-blue-600 font-display font-semibold text-sm mx-auto">
              <RefreshCw className="w-4 h-4" /> Resend OTP
            </button>
        }
      </div>
    </div>
  );
};

export default VerifyOTP;