import React, { useEffect, useState, useRef } from 'react';
import { X, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { advertisementService } from '../../services/advertisementService';

// ── Ad Media with audio toggle ────────────────────────────────────
const AdMedia = ({ ad, fullHeight = false }) => {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMuted(p => {
      if (videoRef.current) videoRef.current.muted = !p;
      return !p;
    });
  };

  if (ad.media_type === 'video') {
    return (
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          src={ad.media_url}
          autoPlay={ad.auto_play}
          muted={muted}
          loop
          playsInline
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
        {/* Audio toggle button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 5 }}>
          {muted
            ? <VolumeX className="w-3.5 h-3.5 text-white" />
            : <Volume2 className="w-3.5 h-3.5 text-white" />
          }
        </button>
      </div>
    );
  }

  return (
    <img
      src={ad.media_url}
      alt={ad.title}
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
    />
  );
};

// ── Top Banner Ad — transparent overlay, overlaps page content ────
export const TopBannerAd = () => {
  const [ad, setAd]     = useState(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    advertisementService.getAds('top_banner')
      .then(ads => { if (ads.length) setAd(ads[0]); })
      .catch(() => {});
  }, []);

  if (!ad || !show) return null;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '72px' }}>
      <a href={ad.redirect_url || '#'} target="_blank" rel="noopener noreferrer"
        className="block w-full h-full">
        {/* Ad image/video with 75% opacity — content visible underneath */}
        <div className="w-full h-full" style={{ opacity: 0.72 }}>
          <AdMedia ad={ad} />
        </div>
        {/* Extra semi-transparent dark layer for readability */}
        <div className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.18)' }} />
        {/* Ad title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center justify-between"
          style={{ background: 'rgba(0,0,0,0.25)' }}>
          <p className="text-white text-xs font-semibold truncate pr-2"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{ad.title}</p>
          <span className="text-white/60 flex-shrink-0" style={{ fontSize: '9px' }}>Ad</span>
        </div>
      </a>
      {/* Close button */}
      <button onClick={(e) => { e.preventDefault(); setShow(false); }}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.45)', zIndex: 10 }}>
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
};

// ── Middle Section Ad — full width card, 140px tall ───────────────
export const MiddleSectionAd = () => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    advertisementService.getAds('middle_section')
      .then(ads => { if (ads.length) setAd(ads[0]); })
      .catch(() => {});
  }, []);

  if (!ad) return null;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '140px' }}>
      <a href={ad.redirect_url || '#'} target="_blank" rel="noopener noreferrer"
        className="block w-full h-full">
        <AdMedia ad={ad} />
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
          <div className="flex items-center justify-between">
            <p className="text-white font-bold text-xs truncate pr-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{ad.title}</p>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <ExternalLink className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-semibold">Open</span>
            </div>
          </div>
        </div>
      </a>
      <span className="absolute top-1.5 left-2 text-white/60 font-medium"
        style={{ fontSize: '9px', zIndex: 10 }}>Sponsored</span>
    </div>
  );
};

// ── Bottom Banner Ad — full width sticky, 64px tall ───────────────
export const BottomBannerAd = () => {
  const [ad, setAd]     = useState(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    advertisementService.getAds('bottom_banner')
      .then(ads => { if (ads.length) setAd(ads[0]); })
      .catch(() => {});
  }, []);

  if (!ad || !show) return null;

  return (
    <div className="fixed left-0 right-0 z-40"
      style={{ bottom: '64px' }}> {/* sits above bottom nav */}
      <div className="relative w-full overflow-hidden" style={{ height: '64px' }}>
        <a href={ad.redirect_url || '#'} target="_blank" rel="noopener noreferrer"
          className="block w-full h-full">
          <AdMedia ad={ad} />
          {/* Title overlay */}
          <div className="absolute inset-0 flex items-center px-4"
            style={{ background: 'rgba(0,0,0,0.2)' }}>
            <p className="text-white font-bold text-sm flex-1 truncate pr-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{ad.title}</p>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.9)' }}>
              <ExternalLink className="w-3 h-3 text-slate-700" />
              <span className="text-slate-700 text-xs font-bold">Open</span>
            </div>
          </div>
        </a>
        <button onClick={() => setShow(false)}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', zIndex: 10 }}>
          <X className="w-3 h-3 text-white" />
        </button>
        <span className="absolute bottom-1 left-2 text-white/50"
          style={{ fontSize: '9px', zIndex: 10 }}>Ad</span>
      </div>
    </div>
  );
};