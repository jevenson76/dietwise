import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface MobileCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  showDivider?: boolean;
}

const MobileCard: React.FC<MobileCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  iconColor = 'text-teal-500',
  className = '',
  onClick,
  isClickable = false,
  padding = 'md',
  showDivider = true
}) => {
  const { isMobile, isTablet } = useResponsive();

  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6',
    lg: isMobile ? 'p-5' : isTablet ? 'p-6' : 'p-8'
  };

  const cardClasses = `
    bg-bg-card rounded-xl shadow-lg border border-border-default
    ${paddingClasses[padding]}
    ${isClickable ? 'cursor-pointer hover:shadow-xl transition-shadow duration-200' : ''}
    ${className}
  `;

  const titleSize = isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl';
  const subtitleSize = isMobile ? 'text-sm' : 'text-base';

  const CardContent = () => (
    <>
      {(title || subtitle) && (
        <div className={`${showDivider ? 'mb-4 pb-4 border-b border-border-default' : 'mb-4'}`}>
          {title && (
            <h3 className={`${titleSize} font-semibold text-text-default flex items-center`}>
              {icon && (
                <i className={`${icon} mr-2.5 ${iconColor} ${isMobile ? 'text-lg' : 'text-xl'}`}></i>
              )}
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`${subtitleSize} text-text-alt mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </>
  );

  if (isClickable && onClick) {
    return (
      <button 
        onClick={onClick}
        className={`${cardClasses} text-left w-full`}
        type="button"
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );
};

export default MobileCard;