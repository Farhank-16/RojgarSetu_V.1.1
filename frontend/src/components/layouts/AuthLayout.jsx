import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';

const AuthLayout = () => {
  const location = useLocation();
  const isCompleteProfile = location.pathname === '/complete-profile';

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-950 py-6 px-4 sm:px-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Center Card with dynamic width */}
      <div 
        className={`w-full mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden relative z-10 animate-fade-in transition-all duration-300 ${
          isCompleteProfile ? 'max-w-4xl' : 'max-w-md'
        }`}
      >
        
        {/* Branding Header inside the card */}
        <div className="flex flex-col items-center gap-1.5 pt-6 pb-4 px-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative border-b border-slate-800">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
          <Logo size="lg" light />
          <p className="text-blue-300 text-[10px] font-bold tracking-widest uppercase mt-0.5">Direct Skill Verification</p>
        </div>
        
        {/* Page Content */}
        <div className="bg-white">
          <Outlet />
        </div>
        
      </div>
    </div>
  );
};

export default AuthLayout;