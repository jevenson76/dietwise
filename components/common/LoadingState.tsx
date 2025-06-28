import React, { useEffect, useState } from 'react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  progress?: number; // 0-100
  steps?: {
    current: number;
    total: number;
    currentStep?: string;
  };
  showSpinner?: boolean;
  showProgress?: boolean;
  estimatedTime?: number; // in seconds
  tips?: string[];
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  submessage,
  progress,
  steps,
  showSpinner = true,
  showProgress = true,
  estimatedTime,
  tips,
  size = 'md',
  className = '',
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Rotate tips every 3 seconds
  useEffect(() => {
    if (!tips || tips.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [tips]);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    full: 'p-12 min-h-[400px]',
  };

  const spinnerSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    full: 'w-16 h-16',
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Spinner */}
      {showSpinner && (
        <div className="mb-4 relative">
          <div
            className={`animate-spin rounded-full ${spinnerSizes[size]} border-[3px] border-teal-600 dark:border-teal-400 border-t-transparent`}
            role="status"
            aria-label={message}
          />
          {progress !== undefined && showProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main message */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
        {message}
      </h3>

      {/* Submessage */}
      {submessage && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          {submessage}
        </p>
      )}

      {/* Progress bar */}
      {progress !== undefined && showProgress && (
        <div className="w-full max-w-xs mb-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {steps && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
              Step {steps.current} of {steps.total}
              {steps.currentStep && `: ${steps.currentStep}`}
            </p>
          )}
        </div>
      )}

      {/* Time estimate */}
      {estimatedTime && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {elapsedTime < estimatedTime ? (
            <>
              Estimated time remaining: {formatTime(estimatedTime - elapsedTime)}
            </>
          ) : (
            <>
              Taking longer than expected... (elapsed: {formatTime(elapsedTime)})
            </>
          )}
        </div>
      )}

      {/* Rotating tips */}
      {tips && tips.length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 max-w-md">
          <div className="flex items-start">
            <i className="fas fa-lightbulb text-yellow-500 mr-2 mt-0.5"></i>
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {tips[currentTipIndex]}
              </p>
              {tips.length > 1 && (
                <div className="flex mt-2 space-x-1">
                  {tips.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 w-1 rounded-full transition-all ${
                        index === currentTipIndex
                          ? 'bg-teal-500 w-3'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingState;