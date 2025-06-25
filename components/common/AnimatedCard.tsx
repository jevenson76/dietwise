import React, { useState } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  animation?: 'lift' | 'glow' | 'tilt' | 'fade' | 'scale';
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  iconColor = 'text-teal-500',
  className = '',
  onClick,
  hover = true,
  animation = 'lift',
  delay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const baseClasses = `
    bg-bg-card rounded-xl shadow-lg border border-border-default p-6
    transition-all duration-300 ease-out transform
    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
  `;

  const animationClasses = {
    lift: hover ? 'hover:shadow-xl hover:-translate-y-1' : '',
    glow: hover ? 'hover:shadow-2xl hover:shadow-teal-500/20' : '',
    tilt: hover ? 'hover:rotate-1 hover:scale-105' : '',
    fade: hover ? 'hover:opacity-90' : '',
    scale: hover ? 'hover:scale-105' : ''
  };

  const hoverClasses = isHovered && animation === 'glow' 
    ? 'shadow-2xl shadow-teal-500/20' 
    : '';

  const cardClasses = `
    ${baseClasses}
    ${animationClasses[animation]}
    ${hoverClasses}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const CardContent = () => (
    <>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-semibold text-text-default flex items-center mb-2">
              {icon && (
                <span className={`inline-block transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
                  <i className={`${icon} mr-3 ${iconColor} text-xl`}></i>
                </span>
              )}
              <span className={`transition-colors duration-300 ${isHovered ? 'text-teal-600 dark:text-teal-400' : ''}`}>
                {title}
              </span>
            </h3>
          )}
          {subtitle && (
            <p className="text-text-alt">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={`transition-transform duration-300 ${isHovered && animation === 'scale' ? 'scale-[1.02]' : ''}`}>
        {children}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${cardClasses} text-left w-full`}
        type="button"
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cardClasses}
    >
      <CardContent />
    </div>
  );
};

export default AnimatedCard;