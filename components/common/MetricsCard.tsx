import React, { useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface MetricData {
  label: string;
  value: number;
  previousValue?: number;
  target?: number;
  format?: 'number' | 'percentage' | 'decimal' | 'currency';
  unit?: string;
  color?: string;
}

interface MetricsCardProps {
  title: string;
  metrics: MetricData[];
  icon?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showTrends?: boolean;
  showProgress?: boolean;
  animated?: boolean;
  className?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  metrics,
  icon,
  variant = 'default',
  showTrends = true,
  showProgress = true,
  animated = true,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);

  const formatValue = (value: number, format?: string, unit?: string) => {
    let formatted;
    
    switch (format) {
      case 'percentage':
        formatted = `${value.toFixed(1)}%`;
        break;
      case 'decimal':
        formatted = value.toFixed(2);
        break;
      case 'currency':
        formatted = `$${value.toFixed(2)}`;
        break;
      default:
        formatted = value.toLocaleString();
    }
    
    return unit ? `${formatted} ${unit}` : formatted;
  };

  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return null;
    
    if (current > previous) {
      return <i className="fas fa-arrow-up text-green-500 text-xs"></i>;
    } else if (current < previous) {
      return <i className="fas fa-arrow-down text-red-500 text-xs"></i>;
    } else {
      return <i className="fas fa-minus text-gray-400 text-xs"></i>;
    }
  };

  const getTrendPercentage = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    
    const change = ((current - previous) / previous) * 100;
    return Math.abs(change).toFixed(1);
  };

  const getProgressPercentage = (value: number, target?: number) => {
    if (!target || target === 0) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const renderMetric = (metric: MetricData, index: number) => {
    const isHovered = hoveredMetric === index;
    const trendPercentage = getTrendPercentage(metric.value, metric.previousValue);
    const progressPercentage = getProgressPercentage(metric.value, metric.target);

    if (variant === 'compact') {
      return (
        <div
          key={index}
          className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${
            isHovered ? 'bg-gray-50 dark:bg-gray-800 scale-105' : 'bg-transparent'
          }`}
          onMouseEnter={() => setHoveredMetric(index)}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-alt">{metric.label}</p>
              <p className="text-lg font-bold text-text-default">
                {formatValue(metric.value, metric.format, metric.unit)}
              </p>
            </div>
            {showTrends && trendPercentage && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.value, metric.previousValue)}
                <span className="text-xs text-text-alt">{trendPercentage}%</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`p-4 border border-border-default rounded-lg transition-all duration-300 cursor-pointer ${
          isHovered ? 'shadow-lg border-teal-300 dark:border-teal-600 transform scale-105' : 'shadow-sm'
        } ${animated ? 'animate-fade-in' : ''}`}
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseEnter={() => setHoveredMetric(index)}
        onMouseLeave={() => setHoveredMetric(null)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-text-alt">{metric.label}</h4>
          {showTrends && trendPercentage && (
            <div className="flex items-center space-x-1">
              {getTrendIcon(metric.value, metric.previousValue)}
              <span className="text-xs text-text-alt">{trendPercentage}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-3">
          <p className={`font-bold text-text-default ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {formatValue(metric.value, metric.format, metric.unit)}
          </p>
          {metric.target && (
            <p className="text-xs text-text-alt mt-1">
              Target: {formatValue(metric.target, metric.format, metric.unit)}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && metric.target && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-alt">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                  metric.color || 'bg-teal-500'
                }`}
                style={{
                  width: `${animated ? progressPercentage : 0}%`,
                  transition: animated ? 'width 1s ease-out' : 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Previous Value Comparison */}
        {variant === 'detailed' && metric.previousValue !== undefined && (
          <div className="mt-3 pt-3 border-t border-border-default">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-alt">Previous:</span>
              <span className="text-text-default">
                {formatValue(metric.previousValue, metric.format, metric.unit)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-bg-card rounded-xl shadow-lg border border-border-default p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center mb-4">
        {icon && (
          <div className="mr-3">
            <i className={`${icon} text-xl text-teal-500`}></i>
          </div>
        )}
        <h3 className="text-lg font-semibold text-text-default">{title}</h3>
      </div>

      {/* Metrics Grid */}
      <div className={`grid gap-4 ${
        variant === 'compact' 
          ? 'grid-cols-1' 
          : metrics.length === 1 
            ? 'grid-cols-1' 
            : metrics.length === 2 
              ? 'grid-cols-1 sm:grid-cols-2' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {metrics.map((metric, index) => renderMetric(metric, index))}
      </div>

      {/* Summary Stats */}
      {variant === 'detailed' && metrics.length > 1 && (
        <div className="mt-6 pt-4 border-t border-border-default">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-text-alt">Average</p>
              <p className="text-sm font-semibold text-text-default">
                {(metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-alt">Total</p>
              <p className="text-sm font-semibold text-text-default">
                {metrics.reduce((sum, m) => sum + m.value, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;