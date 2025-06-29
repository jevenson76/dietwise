import React from 'react';

interface DietWiseLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const DietWiseLogo: React.FC<DietWiseLogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <img 
        src="/logo.svg" 
        alt="DietWise" 
        className="w-full h-full object-contain"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default DietWiseLogo;