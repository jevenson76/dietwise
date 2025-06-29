import React from 'react';

interface DietWiseLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const DietWiseLogo: React.FC<DietWiseLogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img 
        src="/logo.svg" 
        alt="DietWise" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default DietWiseLogo;