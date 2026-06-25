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
    const t = setInterval(() => setResendTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  if (!email) {
    return (
      <div className="px-6 py-8 text-center space-y-4">
        <p className="text-slate-500 text-sm">Session expired. Please request login again.</p>
        <button onClick={() => navigate('/login')} className="btn-primary px-6 py-3 w-full justify-center" style={{ borderRadius: '12px' }}>
          Go to Login
        </button>
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
    <div className="px-6 py-8 page-enter space-y-6">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/login')}
        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold uppercase tracking-wider -ml-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
      </button>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100 shadow-sm relative group">
          {/* Heartbeat pulse glow */}
          <span className="absolute inset-0 rounded-2xl bg-blue-400/20 animate-ping opacity-75" />
          <ShieldCheck className="w-7 h-7 text-blue-600 relative z-10" />
        </div>
        
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Security Check</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            We've sent a 6-digit code to <span className="font-bold text-slate-800 break-all">{email}</span>
          </p>
        </div>
      </div>

      {/* OTP Inputs */}
      <div className="py-2">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center sm:text-left">
          Enter Verification Code
        </label>
        <div className="flex justify-center">
          <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />
        </div>
      </div>

      {/* Submit button */}
      <button 
        onClick={handleVerify} 
        disabled={otp.length !== 6 || loading}
        className="btn-primary w-full py-3.5 text-sm justify-center shadow-lg disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
        style={{ borderRadius: '12px' }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Verifying Code...
          </span>
        ) : (
          'Verify & Continue'
        )}
      </button>

      {/* Resend actions */}
      <div className="text-center pt-2 border-t border-slate-100">
        {resendTimer > 0 ? (
          <p className="text-slate-400 text-xs">
            Resend security code in <span className="font-display font-bold text-slate-600">{resendTimer}s</span>
          </p>
        ) : (
          <button 
            onClick={handleResend} 
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-display font-bold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Resend Security Code
          </button>
        )}
      </div>

    </div>
  );
};

export default VerifyOTP;