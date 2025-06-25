import React, { useState, useEffect, useRef } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  date?: string;
  target?: number;
}

interface InteractiveChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'area' | 'donut' | 'progress';
  title?: string;
  subtitle?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  animated?: boolean;
  height?: number;
  colors?: string[];
  unit?: string;
  showTarget?: boolean;
  targetValue?: number;
  className?: string;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  type,
  title,
  subtitle,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  animated = true,
  height = 300,
  colors = ['#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'],
  unit = '',
  showTarget = false,
  targetValue,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 2;
        });
      }, 20);
      return () => clearInterval(timer);
    } else {
      setAnimationProgress(100);
    }
  }, [animated]);

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.target || 0)));
  const chartHeight = height - (title ? 60 : 20);

  const getColor = (index: number) => {
    return data[index]?.color || colors[index % colors.length];
  };

  const renderLineChart = () => {
    if (data.length === 0) return null;

    const width = isMobile ? 300 : 400;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const points = data.map((d, i) => ({
      x: padding + (i * chartWidth) / (data.length - 1),
      y: chartHeight - (d.value / maxValue) * (chartHeight - padding) + 20,
      value: d.value,
      label: d.label
    }));

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const animatedPathData = points.slice(0, Math.ceil((data.length * animationProgress) / 100));
    const currentPath = animatedPathData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg width={width} height={chartHeight} className="overflow-visible">
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1={padding}
                y1={20 + (i * (chartHeight - padding)) / 4}
                x2={width - padding}
                y2={20 + (i * (chartHeight - padding)) / 4}
                stroke="currentColor"
                strokeWidth={1}
                className="text-gray-400"
              />
            ))}
          </g>
        )}

        {/* Target line */}
        {showTarget && targetValue && (
          <line
            x1={padding}
            y1={chartHeight - (targetValue / maxValue) * (chartHeight - padding) + 20}
            x2={width - padding}
            y2={chartHeight - (targetValue / maxValue) * (chartHeight - padding) + 20}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5,5"
            className="opacity-70"
          />
        )}

        {/* Area fill */}
        {type === 'area' && (
          <path
            d={`${currentPath} L ${points[animatedPathData.length - 1]?.x || padding} ${chartHeight - 20} L ${padding} ${chartHeight - 20} Z`}
            fill={`url(#gradient-${0})`}
            opacity={0.3}
          />
        )}

        {/* Line */}
        <path
          d={currentPath}
          fill="none"
          stroke={getColor(0)}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {animatedPathData.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={hoveredPoint === i ? 6 : 4}
            fill={getColor(0)}
            className="cursor-pointer transition-all duration-200 drop-shadow-sm"
            onMouseEnter={() => setHoveredPoint(i)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}

        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`gradient-0`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={getColor(0)} stopOpacity={0.8} />
            <stop offset="100%" stopColor={getColor(0)} stopOpacity={0.1} />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const renderBarChart = () => {
    const width = isMobile ? 300 : 400;
    const padding = 40;
    const barWidth = (width - padding * 2) / data.length * 0.8;
    const barSpacing = (width - padding * 2) / data.length * 0.2;

    return (
      <svg width={width} height={chartHeight}>
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1={padding}
                y1={20 + (i * (chartHeight - padding)) / 4}
                x2={width - padding}
                y2={20 + (i * (chartHeight - padding)) / 4}
                stroke="currentColor"
                strokeWidth={1}
                className="text-gray-400"
              />
            ))}
          </g>
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (chartHeight - padding) * (animationProgress / 100);
          const x = padding + i * (barWidth + barSpacing);
          const y = chartHeight - barHeight - 20;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#barGradient-${i})`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{
                  filter: hoveredPoint === i ? 'brightness(1.1)' : 'none'
                }}
              />
              {/* Value labels */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs font-medium fill-current text-gray-700 dark:text-gray-300"
              >
                {d.value}{unit}
              </text>
            </g>
          );
        })}

        {/* Gradient definitions */}
        <defs>
          {data.map((_, i) => (
            <linearGradient key={i} id={`barGradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={getColor(i)} stopOpacity={0.9} />
              <stop offset="100%" stopColor={getColor(i)} stopOpacity={0.6} />
            </linearGradient>
          ))}
        </defs>
      </svg>
    );
  };

  const renderDonutChart = () => {
    const size = isMobile ? 200 : 250;
    const center = size / 2;
    const radius = (size / 2) - 30;
    const innerRadius = radius * 0.6;
    
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -90;

    const createArc = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
      const start = polarToCartesian(center, center, outerRadius, endAngle);
      const end = polarToCartesian(center, center, outerRadius, startAngle);
      const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
      const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);
      
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
      return `M ${start.x} ${start.y} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y} Z`;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    };

    return (
      <div className="flex items-center justify-center">
        <svg width={size} height={size}>
          {data.map((d, i) => {
            const percentage = (d.value / total) * 100;
            const angle = (d.value / total) * 360 * (animationProgress / 100);
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle += (d.value / total) * 360;

            if (angle < 1) return null;

            return (
              <path
                key={i}
                d={createArc(startAngle, endAngle, radius, innerRadius)}
                fill={getColor(i)}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{
                  filter: hoveredPoint === i ? 'brightness(1.1)' : 'none',
                  transform: hoveredPoint === i ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center'
                }}
              />
            );
          })}
          
          {/* Center text */}
          <text x={center} y={center - 5} textAnchor="middle" className="text-lg font-bold fill-current">
            {total.toLocaleString()}
          </text>
          <text x={center} y={center + 15} textAnchor="middle" className="text-sm fill-current opacity-70">
            Total {unit}
          </text>
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
      case 'area':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'donut':
        return renderDonutChart();
      default:
        return null;
    }
  };

  return (
    <div className={`bg-bg-card rounded-xl p-6 shadow-lg border border-border-default ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-text-default mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-alt">{subtitle}</p>
          )}
        </div>
      )}

      {/* Chart */}
      <div ref={chartRef} className="flex justify-center mb-4">
        {renderChart()}
      </div>

      {/* Legend */}
      {showLegend && type !== 'line' && type !== 'area' && (
        <div className="flex flex-wrap gap-3 justify-center">
          {data.map((d, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getColor(i) }}
              />
              <span className="text-sm text-text-default">{d.label}</span>
              <span className="text-sm text-text-alt">({d.value}{unit})</span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredPoint !== null && (
        <div className="absolute bg-gray-900 text-white p-2 rounded-lg shadow-lg pointer-events-none z-10 transform -translate-x-1/2 -translate-y-full">
          <div className="text-sm font-medium">{data[hoveredPoint]?.label}</div>
          <div className="text-xs">{data[hoveredPoint]?.value}{unit}</div>
        </div>
      )}
    </div>
  );
};

export default InteractiveChart;