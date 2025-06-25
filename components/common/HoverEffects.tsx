import React, { useState } from 'react';

interface HoverEffectsProps {
  children: React.ReactNode;
  effect?: 'glow' | 'lift' | 'tilt' | 'scale' | 'ripple' | 'border-glow';
  intensity?: 'subtle' | 'medium' | 'strong';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  className?: string;
}

const HoverEffects: React.FC<HoverEffectsProps> = ({
  children,
  effect = 'lift',
  intensity = 'medium',
  color = 'primary',
  disabled = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const [showRipple, setShowRipple] = useState(false);

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowRipple(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (effect === 'ripple' && !disabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipplePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 600);
    }
  };

  const intensityValues = {
    subtle: {
      lift: 'hover:-translate-y-1',
      scale: 'hover:scale-[1.02]',
      tilt: 'hover:rotate-1',
      glow: 'hover:shadow-lg',
      'border-glow': 'hover:border-opacity-80'
    },
    medium: {
      lift: 'hover:-translate-y-2',
      scale: 'hover:scale-105',
      tilt: 'hover:rotate-2',
      glow: 'hover:shadow-xl',
      'border-glow': 'hover:border-opacity-100'
    },
    strong: {
      lift: 'hover:-translate-y-3',
      scale: 'hover:scale-110',
      tilt: 'hover:rotate-3',
      glow: 'hover:shadow-2xl',
      'border-glow': 'hover:border-opacity-100'
    }
  };

  const colorValues = {
    primary: {
      glow: 'hover:shadow-teal-500/25',
      'border-glow': 'hover:border-teal-500'
    },
    secondary: {
      glow: 'hover:shadow-gray-500/25',
      'border-glow': 'hover:border-gray-500'
    },
    success: {
      glow: 'hover:shadow-green-500/25',
      'border-glow': 'hover:border-green-500'
    },
    warning: {
      glow: 'hover:shadow-yellow-500/25',
      'border-glow': 'hover:border-yellow-500'
    },
    danger: {
      glow: 'hover:shadow-red-500/25',
      'border-glow': 'hover:border-red-500'
    }
  };

  const getEffectClasses = () => {
    if (disabled) return '';

    const baseTransition = 'transition-all duration-300 ease-out';
    const effectClass = intensityValues[intensity][effect] || '';
    const colorClass = colorValues[color][effect] || '';

    switch (effect) {
      case 'glow':
        return `${baseTransition} ${effectClass} ${colorClass}`;
      case 'border-glow':
        return `${baseTransition} border ${effectClass} ${colorClass}`;
      case 'ripple':
        return `${baseTransition} relative overflow-hidden`;
      default:
        return `${baseTransition} ${effectClass}`;
    }
  };

  const containerClasses = `
    ${getEffectClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <div
      className={containerClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* Ripple Effect */}
      {effect === 'ripple' && showRipple && (
        <span
          className="absolute rounded-full bg-white bg-opacity-30 pointer-events-none animate-ping"
          style={{
            left: ripplePosition.x - 10,
            top: ripplePosition.y - 10,
            width: 20,
            height: 20,
            animation: 'ripple 0.6s ease-out'
          }}
        />
      )}
      
      {/* Custom Ripple Animation */}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default HoverEffects;