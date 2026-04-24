import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../navigation/BottomNav';
import Header from '../navigation/Header';
import { BottomBannerAd, TopBannerAd , MiddleSectionAd} from '../ads/AdBanner';
import useAuth from '../../context/useAuth';

const MainLayout = () => {
  const { user } = useAuth();
  const showAds = user?.role !== 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-14 pb-20 min-h-screen">
        <Outlet />
      </main>

      {showAds && (
        <div className="fixed left-0 right-0 z-30" style={{ top: '56px' }}>
          <TopBannerAd />
        </div>
      )}

      {showAds && <MiddleSectionAd />}

      {showAds && <BottomBannerAd />}
      <BottomNav />
    </div>
  );
};

export default MainLayout;