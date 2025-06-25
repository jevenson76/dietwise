import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'title' | 'card' | 'list' | 'chart' | 'custom';
  lines?: number;
  className?: string;
  animate?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  lines = 1,
  className = '',
  animate = true,
}) => {
  const animationClass = animate ? 'animate-pulse' : '';

  const renderSkeleton = () => {
    switch (type) {
      case 'title':
        return (
          <div className={`${animationClass} ${className}`}>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        );

      case 'card':
        return (
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow ${animationClass} ${className}`}>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }, (_, i) => (
              <div key={i} className={`flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg ${animationClass}`}>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow ${animationClass} ${className}`}>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        );

      case 'text':
      default:
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }, (_, i) => (
              <div
                key={i}
                className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${animationClass}`}
                style={{ width: i === lines - 1 ? '75%' : '100%' }}
              ></div>
            ))}
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

// Food Log Item Skeleton
export const FoodLogItemSkeleton: React.FC = () => (
  <div className="animate-pulse flex justify-between items-start p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
    <div className="flex-grow">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-1"></div>
      <div className="flex space-x-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
  </div>
);

// Weight Entry Skeleton
export const WeightEntrySkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center mb-6">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SkeletonLoader;