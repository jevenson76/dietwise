import React from 'react';

interface DietWiseLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const DietWiseLogo: React.FC<DietWiseLogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      <img
        src="/logo.svg"
        alt="DietWise Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default DietWiseLogo;