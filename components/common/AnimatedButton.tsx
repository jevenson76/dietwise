import React, { useState } from 'react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  animation?: 'pulse' | 'bounce' | 'shake' | 'scale' | 'slide';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  animation = 'scale',
  className = '',
  type = 'button'
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500 shadow-md hover:shadow-lg',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 shadow-md hover:shadow-lg',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

  const animationClasses = {
    pulse: 'hover:animate-pulse',
    bounce: 'hover:animate-bounce',
    shake: 'hover:animate-shake',
    scale: 'hover:scale-105 active:scale-95',
    slide: 'hover:translate-x-1'
  };

  const pressedClasses = isPressed ? 'transform scale-95' : '';

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled || loading ? disabledClasses : animationClasses[animation]}
    ${pressedClasses}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={buttonClasses}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <i className={`${icon} mr-2`}></i>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && !loading && (
        <i className={`${icon} ml-2`}></i>
      )}
    </button>
  );
};

export default AnimatedButton;