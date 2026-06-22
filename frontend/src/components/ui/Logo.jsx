import React from 'react';

const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-12',
    md: 'h-14',
    lg: 'h-16',
  };

  return (
    <img
      src="/logoWOBG.jpeg"   
      alt="RojgarSetu Logo"
      className={`${sizes[size]} width-auto object-contain brightness-0`}
    />
  );
};

export default Logo;