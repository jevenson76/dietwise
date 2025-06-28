import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // e.g. 'text-blue-500'
  label?: string; // Optional accessible label
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-teal-600', label = "Loading content" }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex justify-center items-center" aria-live="polite" aria-busy="true">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${color} border-t-transparent`}
        style={{ borderTopColor: 'transparent' }}
        role="status"
        aria-label={label}
      >
        <span className="sr-only">{label}...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;