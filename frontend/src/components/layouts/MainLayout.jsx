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
      <div className='pt-14'></div>
      {showAds && (
          <TopBannerAd />
      )}
      <main className="pb-20 min-h-screen">
        <Outlet />

      </main>

       {showAds && <BottomBannerAd />}
      <BottomNav />
    </div>
  );
};

export default MainLayout;