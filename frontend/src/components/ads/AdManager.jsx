// AdManager.jsx — Drop this inside any page to show ads for that section
// Usage: <AdManager placement="middle_section" />

import React from 'react';
import { TopBannerAd, MiddleSectionAd, BottomBannerAd } from '../components/ads/AdBanner';

const AdManager = ({ placement }) => {
  if (placement === 'top_banner')     return <TopBannerAd />;
  if (placement === 'middle_section') return <MiddleSectionAd />;
  if (placement === 'bottom_banner')  return <BottomBannerAd />;
  return null;
};

export default AdManager;