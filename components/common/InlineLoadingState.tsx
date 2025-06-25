import React from 'react';

interface InlineLoadingStateProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  showIcon?: boolean;
  className?: string;
}

const InlineLoadingState: React.FC<InlineLoadingStateProps> = ({
  message = 'Loading...',
  size = 'sm',
  color = 'text-teal-600 dark:text-teal-400',
  showIcon = true,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${sizeClasses[size]} ${className}`}>
      {showIcon && (
        <div
          className={`animate-spin rounded-full ${spinnerSizes[size]} border-2 ${color} border-t-transparent`}
          role="status"
          aria-label={message}
        />
      )}
      <span className={color}>{message}</span>
    </div>
  );
};

// Button Loading State Component
export const ButtonLoadingState: React.FC<{
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}> = ({ message = 'Processing...', size = 'sm' }) => {
  const iconSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <>
      <i className={`fas fa-spinner fa-spin mr-2 ${iconSizes[size]}`}></i>
      {message}
    </>
  );
};

// Progress Button Component
interface ProgressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingMessage?: string;
  progress?: number;
  children: React.ReactNode;
}

export const ProgressButton: React.FC<ProgressButtonProps> = ({
  isLoading = false,
  loadingMessage = 'Processing...',
  progress,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Progress bar background */}
      {isLoading && progress !== undefined && (
        <div
          className="absolute inset-0 bg-black/10 dark:bg-white/10 transition-all duration-300"
          style={{
            transform: `translateX(-${100 - progress}%)`,
          }}
        />
      )}
      
      {/* Button content */}
      <span className="relative z-10">
        {isLoading ? (
          <ButtonLoadingState message={loadingMessage} />
        ) : (
          children
        )}
      </span>
    </button>
  );
};

export default InlineLoadingState;