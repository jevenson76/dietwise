import React, { useState, useEffect } from 'react';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  showValue?: boolean;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  striped?: boolean;
  pulsing?: boolean;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  showPercentage = false,
  showValue = false,
  label,
  color = 'primary',
  size = 'md',
  animated = true,
  striped = false,
  pulsing = false,
  className = ''
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (animated) {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setAnimatedValue(value);
          clearInterval(timer);
        } else {
          setAnimatedValue(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedValue(value);
    }
  }, [value, animated]);

  const percentage = Math.min((animatedValue / max) * 100, 100);

  const colorClasses = {
    primary: 'bg-teal-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const progressBarClasses = `
    ${colorClasses[color]}
    transition-all duration-300 ease-out
    ${striped ? 'bg-striped' : ''}
    ${pulsing ? 'animate-pulse' : ''}
    h-full rounded-full
  `;

  const containerClasses = `
    w-full ${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden
    ${className}
  `;

  return (
    <div className="space-y-2">
      {(label || showPercentage || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && (
            <span className="text-text-default font-medium">{label}</span>
          )}
          <div className="flex space-x-2">
            {showValue && (
              <span className="text-text-alt">
                {Math.round(animatedValue)} / {max}
              </span>
            )}
            {showPercentage && (
              <span className="text-text-alt font-medium">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className={containerClasses}>
        <div
          className={progressBarClasses}
          style={{
            width: `${percentage}%`,
            transform: animated ? 'translateX(0)' : 'translateX(-100%)',
            transition: animated ? 'width 0.3s ease-out, transform 0.3s ease-out' : 'none'
          }}
        />
      </div>
      
      {/* Striped background effect */}
      {striped && (
        <style jsx>{`
          .bg-striped {
            background-image: linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.15) 25%,
              transparent 25%,
              transparent 50%,
              rgba(255, 255, 255, 0.15) 50%,
              rgba(255, 255, 255, 0.15) 75%,
              transparent 75%,
              transparent
            );
            background-size: 1rem 1rem;
            animation: progress-bar-stripes 1s linear infinite;
          }
          
          @keyframes progress-bar-stripes {
            0% {
              background-position: 1rem 0;
            }
            100% {
              background-position: 0 0;
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default ProgressIndicator;