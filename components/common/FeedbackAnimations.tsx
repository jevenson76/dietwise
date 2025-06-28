import React, { useState, useEffect } from 'react';

interface FeedbackAnimationsProps {
  children: React.ReactNode;
  trigger?: boolean;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  animation?: 'bounce' | 'shake' | 'pulse' | 'flash' | 'tada';
  duration?: number;
  onAnimationComplete?: () => void;
}

const FeedbackAnimations: React.FC<FeedbackAnimationsProps> = ({
  children,
  trigger = false,
  type = 'success',
  animation = 'bounce',
  duration = 1000,
  onAnimationComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      setShowFeedback(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setShowFeedback(false);
          onAnimationComplete?.();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, onAnimationComplete]);

  const animationClasses = {
    bounce: 'animate-bounce',
    shake: 'animate-shake',
    pulse: 'animate-pulse',
    flash: 'animate-flash',
    tada: 'animate-tada'
  };

  const feedbackColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    loading: 'text-gray-500'
  };

  const feedbackIcons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
    loading: 'fas fa-spinner fa-spin'
  };

  return (
    <div className="relative">
      <div className={`transition-all duration-300 ${isAnimating ? animationClasses[animation] : ''}`}>
        {children}
      </div>
      
      {showFeedback && (
        <div className={`absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 rounded-lg transition-opacity duration-300 ${showFeedback ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`flex items-center space-x-2 ${feedbackColors[type]}`}>
            <i className={`${feedbackIcons[type]} text-2xl`}></i>
            <span className="font-medium">
              {type === 'success' && 'Success!'}
              {type === 'error' && 'Error!'}
              {type === 'warning' && 'Warning!'}
              {type === 'info' && 'Info'}
              {type === 'loading' && 'Loading...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackAnimations;