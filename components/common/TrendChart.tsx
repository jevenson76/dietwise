import React, { useState, useMemo } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import EmptyState from './EmptyState';

interface TrendDataPoint {
  date: string;
  value: number;
  target?: number;
  label?: string;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  showTarget?: boolean;
  showDots?: boolean;
  showArea?: boolean;
  color?: string;
  targetColor?: string;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  unit?: string;
  className?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  subtitle,
  height = 200,
  showTarget = false,
  showDots = true,
  showArea = true,
  color = '#14b8a6',
  targetColor = '#ef4444',
  timeframe = 'week',
  unit = '',
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const chartData = useMemo(() => {
    if (data.length === 0) return { points: [], targetPoints: [], maxValue: 0, minValue: 0 };

    const values = data.map(d => d.value);
    const targetValues = data.map(d => d.target || 0).filter(v => v > 0);
    const allValues = [...values, ...targetValues];
    
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    const range = maxValue - minValue;
    const padding = range * 0.1;

    const adjustedMax = maxValue + padding;
    const adjustedMin = Math.max(0, minValue - padding);

    const width = isMobile ? 300 : 400;
    const chartPadding = 40;
    const chartWidth = width - chartPadding * 2;
    const chartHeight = height - 40;

    const points = data.map((d, i) => ({
      x: chartPadding + (i * chartWidth) / Math.max(data.length - 1, 1),
      y: chartHeight - ((d.value - adjustedMin) / (adjustedMax - adjustedMin)) * chartHeight + 20,
      value: d.value,
      date: d.date,
      label: d.label
    }));

    const targetPoints = showTarget ? data.map((d, i) => ({
      x: chartPadding + (i * chartWidth) / Math.max(data.length - 1, 1),
      y: d.target ? chartHeight - ((d.target - adjustedMin) / (adjustedMax - adjustedMin)) * chartHeight + 20 : null,
      value: d.target,
      date: d.date
    })) : [];

    return { points, targetPoints, maxValue: adjustedMax, minValue: adjustedMin, width };
  }, [data, height, isMobile, showTarget]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (timeframe) {
      case 'week':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'month':
        return date.toLocaleDateString('en-US', { day: 'numeric' });
      case 'quarter':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTrend = () => {
    if (data.length < 2) return null;
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = lastValue - firstValue;
    const changePercent = (change / firstValue) * 100;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs(changePercent),
      value: Math.abs(change)
    };
  };

  const trend = getTrend();

  if (chartData.points.length === 0) {
    return (
      <div className={`bg-bg-card rounded-xl p-6 shadow-lg border border-border-default ${className}`}>
        <EmptyState
          icon="fas fa-chart-line"
          title="No Data Available"
          description="Start tracking to see your trends here."
        />
      </div>
    );
  }

  const pathData = chartData.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = showArea ? `${pathData} L ${chartData.points[chartData.points.length - 1].x} ${height - 20} L ${chartData.points[0].x} ${height - 20} Z` : '';

  const targetPathData = showTarget && chartData.targetPoints.length > 0 
    ? chartData.targetPoints
        .filter(p => p.y !== null)
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ')
    : '';

  return (
    <div className={`bg-bg-card rounded-xl p-6 shadow-lg border border-border-default ${className}`}>
      {/* Header */}
      {(title || subtitle || trend) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-text-default">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-text-alt">{subtitle}</p>
            )}
          </div>
          
          {trend && (
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 ${
                trend.direction === 'up' ? 'text-green-500' :
                trend.direction === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}>
                <i className={`fas fa-arrow-${
                  trend.direction === 'up' ? 'up' :
                  trend.direction === 'down' ? 'down' : 'right'
                } text-xs`}></i>
                <span className="text-sm font-medium">
                  {trend.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="relative">
        <svg width={chartData.width} height={height} className="overflow-visible">
          {/* Grid lines */}
          <g className="opacity-20">
            {Array.from({ length: 4 }, (_, i) => (
              <line
                key={i}
                x1={40}
                y1={20 + (i * (height - 40)) / 3}
                x2={chartData.width - 40}
                y2={20 + (i * (height - 40)) / 3}
                stroke="currentColor"
                strokeWidth={1}
                className="text-gray-400"
              />
            ))}
          </g>

          {/* Area fill */}
          {showArea && (
            <path
              d={areaPath}
              fill={`url(#areaGradient)`}
              opacity={0.3}
            />
          )}

          {/* Target line */}
          {showTarget && targetPathData && (
            <path
              d={targetPathData}
              fill="none"
              stroke={targetColor}
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.7}
            />
          )}

          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />

          {/* Data points */}
          {showDots && chartData.points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === i ? 6 : 4}
              fill={color}
              className="cursor-pointer transition-all duration-200 drop-shadow-sm"
              onMouseEnter={() => {
                setHoveredPoint(i);
                setShowTooltip(true);
              }}
              onMouseLeave={() => {
                setHoveredPoint(null);
                setShowTooltip(false);
              }}
            />
          ))}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip */}
        {showTooltip && hoveredPoint !== null && (
          <div 
            className="absolute bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none z-10 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: chartData.points[hoveredPoint].x,
              top: chartData.points[hoveredPoint].y - 10
            }}
          >
            <div className="text-sm font-medium">
              {getDateLabel(chartData.points[hoveredPoint].date)}
            </div>
            <div className="text-xs">
              {chartData.points[hoveredPoint].value.toLocaleString()}{unit}
            </div>
            {data[hoveredPoint].target && (
              <div className="text-xs opacity-75">
                Target: {data[hoveredPoint].target?.toLocaleString()}{unit}
              </div>
            )}
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-10">
        {chartData.points.map((point, i) => (
          <span 
            key={i} 
            className="text-xs text-text-alt"
            style={{ 
              transform: isMobile && data.length > 7 ? 'rotate(-45deg)' : 'none',
              transformOrigin: 'center'
            }}
          >
            {getDateLabel(point.date)}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border-default">
        <div className="text-center">
          <p className="text-xs text-text-alt">Current</p>
          <p className="text-sm font-semibold text-text-default">
            {data[data.length - 1]?.value.toLocaleString()}{unit}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-alt">Average</p>
          <p className="text-sm font-semibold text-text-default">
            {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}{unit}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-alt">Peak</p>
          <p className="text-sm font-semibold text-text-default">
            {Math.max(...data.map(d => d.value)).toLocaleString()}{unit}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;