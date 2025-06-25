import React from 'react';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'loading' | 'idle';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showIcon?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  size = 'md',
  animated = true,
  showIcon = true,
  className = ''
}) => {
  const statusConfig = {
    success: {
      color: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-400',
      icon: 'fas fa-check-circle',
      animation: animated ? 'animate-bounce-in' : ''
    },
    warning: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      icon: 'fas fa-exclamation-triangle',
      animation: animated ? 'animate-pulse' : ''
    },
    error: {
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-400',
      icon: 'fas fa-times-circle',
      animation: animated ? 'animate-shake' : ''
    },
    info: {
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      icon: 'fas fa-info-circle',
      animation: animated ? 'animate-fade-in' : ''
    },
    loading: {
      color: 'bg-gray-500',
      textColor: 'text-gray-700 dark:text-gray-400',
      icon: 'fas fa-spinner',
      animation: 'animate-spin'
    },
    idle: {
      color: 'bg-gray-300 dark:bg-gray-600',
      textColor: 'text-gray-500 dark:text-gray-400',
      icon: 'fas fa-circle',
      animation: ''
    }
  };

  const sizeConfig = {
    sm: {
      dot: 'w-2 h-2',
      icon: 'text-sm',
      text: 'text-sm'
    },
    md: {
      dot: 'w-3 h-3',
      icon: 'text-base',
      text: 'text-base'
    },
    lg: {
      dot: 'w-4 h-4',
      icon: 'text-lg',
      text: 'text-lg'
    }
  };

  const config = statusConfig[status];
  const sizes = sizeConfig[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status Dot */}
      <div className="relative flex items-center">
        <div 
          className={`
            ${sizes.dot} 
            ${config.color} 
            rounded-full 
            ${config.animation}
          `}
        />
        {/* Pulsing ring for active states */}
        {(status === 'loading' || status === 'warning') && animated && (
          <div 
            className={`
              absolute inset-0 
              ${config.color} 
              rounded-full 
              animate-ping 
              opacity-75
            `}
          />
        )}
      </div>

      {/* Icon (optional) */}
      {showIcon && (
        <i 
          className={`
            ${config.icon} 
            ${config.textColor} 
            ${sizes.icon}
            ${status === 'loading' ? 'animate-spin' : config.animation}
          `}
        />
      )}

      {/* Message */}
      {message && (
        <span 
          className={`
            ${config.textColor} 
            ${sizes.text}
            font-medium
          `}
        >
          {message}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;