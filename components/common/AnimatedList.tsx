import React, { useState, useEffect } from 'react';

interface AnimatedListProps {
  children: React.ReactNode[];
  animation?: 'stagger' | 'cascade' | 'wave' | 'fade';
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  animation = 'stagger',
  delay = 100,
  direction = 'up',
  className = ''
}) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const animateItems = () => {
      children.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => [...prev, index]);
        }, index * delay);
      });
    };

    // Reset and start animation
    setVisibleItems([]);
    animateItems();
  }, [children, delay]);

  const getAnimationClasses = (index: number, isVisible: boolean) => {
    const baseClasses = 'transition-all duration-500 ease-out';
    
    if (!isVisible) {
      const hiddenClasses = {
        up: 'opacity-0 translate-y-8',
        down: 'opacity-0 -translate-y-8',
        left: 'opacity-0 translate-x-8',
        right: 'opacity-0 -translate-x-8'
      };
      return `${baseClasses} ${hiddenClasses[direction]}`;
    }

    const visibleClasses = 'opacity-100 translate-x-0 translate-y-0';
    
    switch (animation) {
      case 'cascade':
        return `${baseClasses} ${visibleClasses} transform scale-100`;
      case 'wave':
        return `${baseClasses} ${visibleClasses} animate-wave`;
      case 'fade':
        return `${baseClasses} ${visibleClasses}`;
      default: // stagger
        return `${baseClasses} ${visibleClasses}`;
    }
  };

  const getItemDelay = (index: number) => {
    switch (animation) {
      case 'wave':
        return `${Math.sin(index * 0.5) * 200}ms`;
      case 'cascade':
        return `${index * (delay / 2)}ms`;
      default:
        return '0ms';
    }
  };

  return (
    <div className={className}>
      {children.map((child, index) => {
        const isVisible = visibleItems.includes(index);
        return (
          <div
            key={index}
            className={getAnimationClasses(index, isVisible)}
            style={{
              transitionDelay: getItemDelay(index)
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default AnimatedList;