import React from 'react';
import { useBreakpointValue } from '../../hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number | string;
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = ''
}) => {
  const columns = useBreakpointValue(cols) || 1;
  
  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  const gapValue = typeof gap === 'number' ? `${gap * 0.25}rem` : gap;
  
  return (
    <div 
      className={`grid ${className}`}
      style={{
        gridTemplateColumns,
        gap: gapValue
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;