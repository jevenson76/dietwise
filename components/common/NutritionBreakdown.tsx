import React, { useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface NutritionData {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface NutritionBreakdownProps {
  data: NutritionData;
  targets?: Partial<NutritionData>;
  showPercentages?: boolean;
  showMacroRings?: boolean;
  showMicronutrients?: boolean;
  variant?: 'compact' | 'detailed' | 'visual';
  className?: string;
}

const NutritionBreakdown: React.FC<NutritionBreakdownProps> = ({
  data,
  targets,
  showPercentages = true,
  showMacroRings = true,
  showMicronutrients = false,
  variant = 'detailed',
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const [hoveredMacro, setHoveredMacro] = useState<string | null>(null);

  // Calculate macro percentages
  const proteinCals = data.protein * 4;
  const carbsCals = data.carbs * 4;
  const fatCals = data.fat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

  const macroPercentages = {
    protein: totalMacroCals > 0 ? (proteinCals / totalMacroCals) * 100 : 0,
    carbs: totalMacroCals > 0 ? (carbsCals / totalMacroCals) * 100 : 0,
    fat: totalMacroCals > 0 ? (fatCals / totalMacroCals) * 100 : 0
  };

  const macroColors = {
    protein: '#ef4444', // red
    carbs: '#3b82f6',   // blue
    fat: '#f59e0b'      // amber
  };

  const renderMacroRing = () => {
    const size = isMobile ? 120 : 150;
    const center = size / 2;
    const radius = (size / 2) - 20;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;

    let currentOffset = 0;

    const createDashArray = (percentage: number) => {
      const length = (percentage / 100) * circumference;
      return `${length} ${circumference - length}`;
    };

    const createDashOffset = (offset: number) => {
      return -offset;
    };

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Protein arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={macroColors.protein}
            strokeWidth={strokeWidth}
            strokeDasharray={createDashArray(macroPercentages.protein)}
            strokeDashoffset={createDashOffset(currentOffset)}
            strokeLinecap="round"
            className={`transition-all duration-500 ${
              hoveredMacro === 'protein' ? 'filter brightness-110' : ''
            }`}
            onMouseEnter={() => setHoveredMacro('protein')}
            onMouseLeave={() => setHoveredMacro(null)}
          />
          
          {/* Carbs arc */}
          {(() => {
            currentOffset += (macroPercentages.protein / 100) * circumference;
            return (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={macroColors.carbs}
                strokeWidth={strokeWidth}
                strokeDasharray={createDashArray(macroPercentages.carbs)}
                strokeDashoffset={createDashOffset(currentOffset)}
                strokeLinecap="round"
                className={`transition-all duration-500 ${
                  hoveredMacro === 'carbs' ? 'filter brightness-110' : ''
                }`}
                onMouseEnter={() => setHoveredMacro('carbs')}
                onMouseLeave={() => setHoveredMacro(null)}
              />
            );
          })()}
          
          {/* Fat arc */}
          {(() => {
            currentOffset += (macroPercentages.carbs / 100) * circumference;
            return (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={macroColors.fat}
                strokeWidth={strokeWidth}
                strokeDasharray={createDashArray(macroPercentages.fat)}
                strokeDashoffset={createDashOffset(currentOffset)}
                strokeLinecap="round"
                className={`transition-all duration-500 ${
                  hoveredMacro === 'fat' ? 'filter brightness-110' : ''
                }`}
                onMouseEnter={() => setHoveredMacro('fat')}
                onMouseLeave={() => setHoveredMacro(null)}
              />
            );
          })()}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-text-default">
            {data.calories.toLocaleString()}
          </span>
          <span className="text-xs text-text-alt">calories</span>
        </div>
      </div>
    );
  };

  const renderMacroBar = (label: string, value: number, calories: number, color: string, target?: number) => {
    const percentage = target ? Math.min((value / target) * 100, 100) : 0;
    const isHovered = hoveredMacro === label.toLowerCase();

    return (
      <div
        key={label}
        className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${
          isHovered ? 'bg-gray-50 dark:bg-gray-800 scale-105' : ''
        }`}
        onMouseEnter={() => setHoveredMacro(label.toLowerCase())}
        onMouseLeave={() => setHoveredMacro(null)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-medium text-text-default">{label}</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-text-default">{value}g</div>
            <div className="text-xs text-text-alt">{calories} cal</div>
          </div>
        </div>
        
        {showPercentages && (
          <div className="text-xs text-text-alt mb-1">
            {macroPercentages[label.toLowerCase() as keyof typeof macroPercentages].toFixed(1)}% of macros
          </div>
        )}
        
        {target && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-alt">Target: {target}g</span>
              <span className="text-text-alt">{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: color
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMicronutrients = () => {
    if (!showMicronutrients) return null;

    const microData = [
      { label: 'Fiber', value: data.fiber || 0, unit: 'g', target: targets?.fiber, color: '#10b981' },
      { label: 'Sugar', value: data.sugar || 0, unit: 'g', target: targets?.sugar, color: '#f59e0b' },
      { label: 'Sodium', value: data.sodium || 0, unit: 'mg', target: targets?.sodium, color: '#8b5cf6' }
    ];

    return (
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-text-default mb-3">Micronutrients</h4>
        <div className="grid grid-cols-3 gap-3">
          {microData.map((micro) => {
            const percentage = micro.target ? Math.min((micro.value / micro.target) * 100, 100) : 0;
            
            return (
              <div key={micro.label} className="text-center">
                <div className="relative mb-2">
                  <div className="w-12 h-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: micro.color }}
                    >
                      {micro.value}
                    </div>
                  </div>
                  {micro.target && (
                    <div
                      className="absolute inset-0 rounded-full border-2 border-transparent"
                      style={{
                        background: `conic-gradient(${micro.color} ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`
                      }}
                    />
                  )}
                </div>
                <div className="text-xs text-text-default font-medium">{micro.label}</div>
                <div className="text-xs text-text-alt">{micro.value}{micro.unit}</div>
                {micro.target && (
                  <div className="text-xs text-text-alt">/ {micro.target}{micro.unit}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-bg-card rounded-lg p-4 shadow-md border border-border-default ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-alt">Protein</span>
              <span className="font-medium text-text-default">{data.protein}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-alt">Carbs</span>
              <span className="font-medium text-text-default">{data.carbs}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-alt">Fat</span>
              <span className="font-medium text-text-default">{data.fat}g</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-text-default">{data.calories}</div>
            <div className="text-xs text-text-alt">calories</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-bg-card rounded-xl p-6 shadow-lg border border-border-default ${className}`}>
      <h3 className="text-lg font-semibold text-text-default mb-4">Nutrition Breakdown</h3>
      
      {variant === 'visual' && showMacroRings ? (
        <div className="flex flex-col items-center space-y-6">
          {renderMacroRing()}
          
          {/* Legend */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {Object.entries(macroColors).map(([macro, color]) => (
              <div key={macro} className="text-center">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: color }}
                />
                <div className="text-xs text-text-alt capitalize">{macro}</div>
                <div className="text-sm font-medium text-text-default">
                  {data[macro as keyof NutritionData]}g
                </div>
                <div className="text-xs text-text-alt">
                  {macroPercentages[macro as keyof typeof macroPercentages].toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {renderMacroBar('Protein', data.protein, proteinCals, macroColors.protein, targets?.protein)}
          {renderMacroBar('Carbs', data.carbs, carbsCals, macroColors.carbs, targets?.carbs)}
          {renderMacroBar('Fat', data.fat, fatCals, macroColors.fat, targets?.fat)}
        </div>
      )}
      
      {renderMicronutrients()}
    </div>
  );
};

export default NutritionBreakdown;