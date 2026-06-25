import React from 'react';

const Logo = ({ size = 'md', className = '', light = false }) => {
  const sizes = {
    sm: 'h-12',
    md: 'h-14',
    lg: 'h-16',
  };

  return (
    <img
      src="/logoWOBG.jpeg"   
      alt="RojgarSetu Logo"
      className={`${sizes[size]} w-auto object-contain ${light ? 'brightness-0 invert' : 'brightness-0'} ${className}`}
    />
  );
};

export default Logo;