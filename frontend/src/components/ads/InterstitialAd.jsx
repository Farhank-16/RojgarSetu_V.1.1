import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { advertisementService } from '../../services/advertisementService';

const FREQUENCY  = 3;
const MIN_GAP_MS = 30 * 1000;
const STORE_KEY  = 'jn_iad_idx';
const STORE_CNT  = 'jn_iad_cnt';

const InterstitialAd = () => {
  const [ads, setAds]         = useState([]);
  const [ad, setAd]           = useState(null);
  const [show, setShow]       = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const resumeCount = useRef(0);
  const lastShown   = useRef(0);
  const adIndex     = useRef(0);
  const timerRef    = useRef(null);

  useEffect(() => {
    // Skip on admin
    if (window.location.pathname.startsWith('/admin')) return;

    advertisementService.getAds('interstitial')
      .then(list => { if (list.length) setAds(list); })
      .catch(() => {});

    const cnt = sessionStorage.getItem(STORE_CNT);
    const idx = sessionStorage.getItem(STORE_KEY);
    if (cnt) resumeCount.current = parseInt(cnt) || 0;
    if (idx) adIndex.current     = parseInt(idx) || 0;
  }, []);

  useEffect(() => {
    if (!ads.length) return;
    if (window.location.pathname.startsWith('/admin')) return;

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      resumeCount.current += 1;
      sessionStorage.setItem(STORE_CNT, resumeCount.current);
      const elapsed = Date.now() - lastShown.current;
      if (resumeCount.current % FREQUENCY === 0 && elapsed > MIN_GAP_MS) {
        triggerAd();
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [ads]);

  const triggerAd = () => {
    // Pick next ad in rotation
    const nextIdx = adIndex.current % ads.length;
    adIndex.current = (nextIdx + 1) % ads.length;
    sessionStorage.setItem(STORE_KEY, adIndex.current);

    setAd(ads[nextIdx]);
    lastShown.current = Date.now();
    setCanClose(false);
    setCountdown(5);
    setShow(true);

    let c = 5;
    timerRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) { clearInterval(timerRef.current); setCanClose(true); }
    }, 1000);
  };

  const close = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    clearInterval(timerRef.current);
    setShow(false);
  };

  if (!show || !ad) return null;

  return (
    // Full page clickable anchor
    <a
      href={ad.redirect_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 9999, background: '#ffffff', textDecoration: 'none' }}
      onClick={e => !ad.redirect_url && e.preventDefault()}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #f1f5f9' }}
        onClick={e => e.stopPropagation()}>
        <span className="text-xs font-semibold px-2 py-1 rounded"
          style={{ background: '#f1f5f9', color: '#64748b' }}>
          Advertisement
        </span>
        <div className="flex items-center gap-3">
          {ad.redirect_url && (
            <a href={ad.redirect_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#2563eb' }}
              onClick={e => e.stopPropagation()}>
              Continue to app <ChevronRight className="w-3.5 h-3.5" />
            </a>
          )}
          {/* Close / countdown button */}
          <button
            onClick={close}
            disabled={!canClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            style={{
              background: canClose ? '#1a1a2e' : '#e2e8f0',
              color:      canClose ? '#ffffff'  : '#94a3b8',
              cursor:     canClose ? 'pointer'  : 'default',
            }}>
            {canClose ? <X className="w-4 h-4" /> : countdown}
          </button>
        </div>
      </div>

      {/* ── Media — full remaining height ── */}
      <div className="flex-1 overflow-hidden relative">
        {ad.media_type === 'video' ? (
          <video
            src={ad.media_url}
            autoPlay muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img
            src={ad.media_url}
            alt={ad.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* ── Bottom bar — title + CTA ── */}
      <div className="flex-shrink-0 px-5 py-5"
        style={{ background: '#ffffff', borderTop: '1px solid #f1f5f9' }}
        onClick={e => e.stopPropagation()}>
        <p className="font-display font-bold text-slate-900 text-lg text-center mb-4"
          style={{ lineHeight: 1.3 }}>
          {ad.title}
        </p>
        {ad.subtitle && (
          <p className="text-slate-500 text-sm text-center mb-4">{ad.subtitle}</p>
        )}
        <a
          href={ad.redirect_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 rounded-full text-center font-display font-bold text-base text-white"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          onClick={e => e.stopPropagation()}>
          {ad.cta_text || 'Install'}
        </a>
      </div>

      {/* ── Info icon bottom right ── */}
      <div className="absolute bottom-2 right-3 opacity-30"
        onClick={e => e.stopPropagation()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      {/* ── Ad rotation dots (if multiple ads) ── */}
      {ads.length > 1 && (
        <div className="absolute top-14 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {ads.map((_, i) => (
            <span key={i}
              className="rounded-full transition-all"
              style={{
                width:      i === (adIndex.current === 0 ? ads.length - 1 : adIndex.current - 1) ? '16px' : '6px',
                height:     '6px',
                background: i === (adIndex.current === 0 ? ads.length - 1 : adIndex.current - 1) ? '#2563eb' : '#cbd5e1',
              }} />
          ))}
        </div>
      )}
    </a>
  );
};

export default InterstitialAd;