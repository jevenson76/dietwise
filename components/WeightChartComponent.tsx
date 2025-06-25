
import React, { useEffect, useRef, useMemo } from 'react';
import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import { UserProfile, WeightEntry, AppTheme } from '../types';
import { LBS_PER_WEEK_TARGET_CHANGE } from '../constants';
import { format, addWeeks, differenceInWeeks, addDays, differenceInCalendarDays } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { startOfDay } from 'date-fns/startOfDay';
import EmptyState from './common/EmptyState';
import TrendChart from './common/TrendChart';
import MetricsCard from './common/MetricsCard';
import InteractiveChart from './common/InteractiveChart';

interface WeightChartComponentProps {
  userProfile: UserProfile | null;
  actualWeightLog: WeightEntry[];
  currentTheme: AppTheme;
}

const WeightChartComponent: React.FC<WeightChartComponentProps> = ({ userProfile, actualWeightLog, currentTheme }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Prepare data for new chart components
  const chartData = useMemo(() => {
    if (!actualWeightLog.length || !userProfile) return [];
    
    return actualWeightLog.map(entry => ({
      date: format(new Date(entry.date), 'yyyy-MM-dd'),
      value: entry.weight,
      target: userProfile.targetWeight || undefined,
      label: format(new Date(entry.date), 'MMM dd')
    }));
  }, [actualWeightLog, userProfile]);

  const weightMetrics = useMemo(() => {
    if (!actualWeightLog.length || !userProfile) return [];

    const currentWeight = actualWeightLog[actualWeightLog.length - 1]?.weight || 0;
    const startWeight = userProfile.startWeight || userProfile.weight || currentWeight;
    const targetWeight = userProfile.targetWeight || currentWeight;
    const previousWeight = actualWeightLog.length > 1 ? actualWeightLog[actualWeightLog.length - 2]?.weight : startWeight;

    const totalLoss = startWeight - currentWeight;
    const remainingLoss = currentWeight - targetWeight;
    const progressPercentage = Math.abs(startWeight - targetWeight) > 0 
      ? Math.min(Math.abs(totalLoss) / Math.abs(startWeight - targetWeight) * 100, 100)
      : 0;

    return [
      {
        label: 'Current Weight',
        value: currentWeight,
        previousValue: previousWeight,
        format: 'decimal' as const,
        unit: 'lbs',
        color: 'bg-teal-500'
      },
      {
        label: 'Weight Lost',
        value: Math.max(0, totalLoss),
        format: 'decimal' as const,
        unit: 'lbs',
        color: 'bg-green-500'
      },
      {
        label: 'Progress',
        value: progressPercentage,
        target: 100,
        format: 'percentage' as const,
        color: 'bg-blue-500'
      },
      {
        label: 'To Goal',
        value: Math.abs(remainingLoss),
        format: 'decimal' as const,
        unit: 'lbs',
        color: 'bg-orange-500'
      }
    ];
  }, [actualWeightLog, userProfile]);

  // Early return for empty state
  if (!userProfile || userProfile.targetWeight === null) {
    return (
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl min-h-[350px] sm:min-h-[450px]">
        <h3 className="text-xl font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
          <i className="fas fa-chart-line mr-2.5 text-teal-600 dark:text-teal-400"></i>Weight Progress
        </h3>
        <EmptyState
          icon="fas fa-weight"
          iconColor="text-teal-500 dark:text-teal-400"
          title="Set Your Target Weight"
          description="Define your weight goal to see your progress visualized on this chart."
          actionLabel="Go to Settings"
          onAction={() => window.dispatchEvent(new CustomEvent('navigate-to-settings'))}
          tips={[
            "Track your weight regularly for best results",
            "See your projected path to your goal",
            "Monitor your progress over time"
          ]}
        />
      </div>
    );
  }

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const isDark = currentTheme === 'dark';
    const textColor = isDark ? 'rgb(203, 213, 225)' : 'rgb(71, 85, 105)'; 
    const gridColor = isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)';
    const titleColor = isDark ? 'rgb(241, 245, 249)' : 'rgb(51, 65, 85)';
    const legendColor = titleColor;

    // This check is no longer needed as we handle it above
    // if (!userProfile || userProfile.targetWeight === null) {
    //     return;
    // }

    const sortedActualWeights = [...actualWeightLog].sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    const actualWeightData = sortedActualWeights.map(entry => ({
      x: startOfDay(parseISO(entry.date)).getTime(),
      y: entry.weight,
    }));

    let expectedWeightData: { x: number; y: number }[] = [];
    const targetWeight = userProfile.targetWeight;
    let projectionStartDateObj: Date;
    let projectionStartWeight: number | null = userProfile.startWeight ?? null;

    if (!projectionStartWeight && sortedActualWeights.length > 0) {
        projectionStartWeight = sortedActualWeights[0].weight;
    } else if (!projectionStartWeight && userProfile.weight) {
        projectionStartWeight = userProfile.weight;
    }

    if (sortedActualWeights.length > 0) {
        projectionStartDateObj = startOfDay(parseISO(sortedActualWeights[0].date));
    } else if (userProfile.profileCreationDate) {
        projectionStartDateObj = startOfDay(parseISO(userProfile.profileCreationDate));
    } else {
        projectionStartDateObj = startOfDay(new Date());
    }

    if (targetWeight !== null && projectionStartWeight !== null) {
      let ratePerWeek: number;
      let weeksToTargetCalc: number;

      if (userProfile.targetDate) {
        const targetDateObj = startOfDay(parseISO(userProfile.targetDate));
        const daysToTarget = differenceInCalendarDays(targetDateObj, projectionStartDateObj);

        if (daysToTarget > 0) {
          weeksToTargetCalc = daysToTarget / 7;
          ratePerWeek = (targetWeight - projectionStartWeight) / weeksToTargetCalc;
        } else { 
          weeksToTargetCalc = Math.abs(targetWeight - projectionStartWeight) / LBS_PER_WEEK_TARGET_CHANGE;
          ratePerWeek = projectionStartWeight > targetWeight ? -LBS_PER_WEEK_TARGET_CHANGE : LBS_PER_WEEK_TARGET_CHANGE;
          if (projectionStartWeight === targetWeight) ratePerWeek = 0;
        }
      } else {
        weeksToTargetCalc = Math.abs(targetWeight - projectionStartWeight) / LBS_PER_WEEK_TARGET_CHANGE;
        ratePerWeek = projectionStartWeight > targetWeight ? -LBS_PER_WEEK_TARGET_CHANGE : LBS_PER_WEEK_TARGET_CHANGE;
        if (projectionStartWeight === targetWeight) ratePerWeek = 0;
      }

      if (Math.abs(ratePerWeek) === Infinity || isNaN(ratePerWeek)) { 
          ratePerWeek = 0; 
      }

      const maxProjectionWeeks = userProfile.targetDate ? Math.max(weeksToTargetCalc + 1, 4) : Math.max(weeksToTargetCalc + 4, 8);

      for (let i = 0; i <= Math.ceil(maxProjectionWeeks); i++) {
        const currentDate = addWeeks(projectionStartDateObj, i);
        let currentExpectedWeight = projectionStartWeight + (i * ratePerWeek);

        if (ratePerWeek > 0 && currentExpectedWeight > targetWeight) currentExpectedWeight = targetWeight;
        if (ratePerWeek < 0 && currentExpectedWeight < targetWeight) currentExpectedWeight = targetWeight;

        expectedWeightData.push({ x: currentDate.getTime(), y: parseFloat(currentExpectedWeight.toFixed(1)) });

        if (userProfile.targetDate && currentExpectedWeight === targetWeight && i >= weeksToTargetCalc && weeksToTargetCalc > 0) break;
        if (i > weeksToTargetCalc + 12 && !userProfile.targetDate) break; 
      }

      if (userProfile.targetDate && expectedWeightData.length > 0) {
          const targetDateTime = startOfDay(parseISO(userProfile.targetDate)).getTime();
          const lastExpectedPoint = expectedWeightData[expectedWeightData.length-1];
          if (lastExpectedPoint.x < targetDateTime) {
            expectedWeightData.push({x: targetDateTime, y: targetWeight});
          } else { 
             expectedWeightData = expectedWeightData.filter(p => p.x <= targetDateTime);
             if (expectedWeightData.length === 0 || expectedWeightData[expectedWeightData.length-1].x < targetDateTime) {
                 expectedWeightData.push({x: targetDateTime, y: targetWeight});
             }
          }
           expectedWeightData = expectedWeightData.sort((a,b) => a.x - b.x); 
      } else if (expectedWeightData.length === 0 && projectionStartWeight !== null && targetWeight !== null) {
          expectedWeightData.push({ x: projectionStartDateObj.getTime(), y: projectionStartWeight });
          if (projectionStartWeight !== targetWeight) {
              const endDate = userProfile.targetDate ? startOfDay(parseISO(userProfile.targetDate)) : addWeeks(projectionStartDateObj, Math.ceil(weeksToTargetCalc) || 1);
              expectedWeightData.push({ x: endDate.getTime(), y: targetWeight });
          }
      }
    }

    // Optimize: Calculate min/max dates in single iteration instead of multiple spread operations
    let minDate = startOfDay(new Date()).getTime();
    let maxDateActual = minDate;
    let maxDateExpected = minDate;
    let allDatesExist = false;

    if (actualWeightData.length > 0) {
      const actualDates = actualWeightData.map(d => d.x);
      minDate = Math.min(minDate, ...actualDates);
      maxDateActual = Math.max(...actualDates);
      allDatesExist = true;
    }

    if (expectedWeightData.length > 0) {
      const expectedDates = expectedWeightData.map(d => d.x);
      minDate = allDatesExist ? Math.min(minDate, ...expectedDates) : Math.min(minDate, ...expectedDates);
      maxDateExpected = Math.max(...expectedDates);
      allDatesExist = true;
    }

    if (!allDatesExist) { 
        const todayTime = startOfDay(new Date()).getTime();
        minDate = todayTime;
        maxDateActual = addWeeks(new Date(todayTime), 4).getTime();
        maxDateExpected = maxDateActual;
        if (targetWeight !== null) {
           if (projectionStartWeight !== null) expectedWeightData.push({x: todayTime, y: projectionStartWeight});
           expectedWeightData.push({x: addWeeks(new Date(todayTime), 4).getTime(), y: targetWeight}); 
        }
    }

    let maxDate = Math.max(minDate, maxDateActual, maxDateExpected, addWeeks(startOfDay(new Date()), 1).getTime()); 

    if (differenceInWeeks(new Date(maxDate), new Date(minDate)) < 4) { 
        maxDate = addWeeks(new Date(minDate), 4).getTime();
    }

    const config: ChartConfiguration<keyof ChartTypeRegistry, {x: number, y:number}[], unknown> = {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Actual Weight',
            data: actualWeightData,
            borderColor: isDark ? 'rgb(20, 184, 166)' : 'rgb(13, 148, 136)', 
            backgroundColor: isDark ? 'rgba(20, 184, 166, 0.2)' :'rgba(13, 148, 136, 0.1)',
            tension: 0.2,
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: isDark ? 'rgb(20, 184, 166)' : 'rgb(13, 148, 136)',
          },
          {
            label: 'Projected Path',
            data: expectedWeightData,
            borderColor: isDark ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)', 
            borderDash: [6, 3],
            tension: 0.2,
            fill: false,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: isDark ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)',
          },
          { 
            label: 'Target Weight',
            data: (targetWeight !== null && allDatesExist) ? [
                    { x: minDate, y: targetWeight },
                    { x: maxDate, y: targetWeight }
                ] : [],
            borderColor: isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)', 
            borderDash: [10,5],
            borderWidth: 2.5,
            pointRadius: 0,
            fill: false,
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'MMM d, yyyy',
              displayFormats: {
                day: 'MMM d' 
              }
            },
            title: {
              display: true,
              text: 'Date',
              font: { size: 14, family: 'Inter, sans-serif' },
              color: titleColor
            },
            min: minDate,
            max: maxDate,
            grid: {
              color: gridColor 
            },
            ticks: { 
                color: textColor,
                maxTicksLimit: 7, // Limit number of ticks for better spacing
                padding: 10,       // Add padding to labels
                autoSkip: true,
            } 
          },
          y: {
            title: {
              display: true,
              text: 'Weight (lbs)',
              font: { size: 14, family: 'Inter, sans-serif' },
              color: titleColor
            },
            beginAtZero: false,
            grid: {
              color: gridColor
            },
            ticks: { color: textColor }
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
                font: { family: 'Inter, sans-serif' },
                color: legendColor,
                usePointStyle: true,
                boxWidth: 8,
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.85)', 
            titleFont: { size: 14, family: 'Inter, sans-serif', weight: 'bold' },
            bodyFont: { family: 'Inter, sans-serif' },
            titleColor: isDark ? '#f1f5f9' : '#ffffff', 
            bodyColor: isDark ? '#e2e8f0' : '#f1f5f9', 
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              title: function(tooltipItems) {
                if (tooltipItems.length > 0) {
                  const date = new Date(tooltipItems[0].parsed.x);
                  return format(date, 'EEEE, MMM d, yyyy');
                }
                return '';
              },
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(1) + ' lbs';
                }
                return label;
              }
            }
          },
        },
      },
    };

    chartInstanceRef.current = new Chart(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [userProfile, actualWeightLog, currentTheme]);

  // Show enhanced visualizations if we have data
  if (actualWeightLog.length > 0 && chartData.length > 0) {
    return (
      <div className="space-y-6">
        {/* Metrics Overview */}
        <MetricsCard
          title="Weight Progress Overview"
          metrics={weightMetrics}
          icon="fas fa-weight"
          variant="default"
          showTrends={true}
          showProgress={true}
          animated={true}
        />

        {/* Trend Chart */}
        <TrendChart
          data={chartData}
          title="Weight Trend"
          subtitle="Track your progress over time"
          showTarget={true}
          showDots={true}
          showArea={true}
          color="#14b8a6"
          targetColor="#ef4444"
          timeframe="month"
          unit=" lbs"
          height={300}
        />

        {/* Fallback to original chart */}
        <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl min-h-[350px] sm:min-h-[450px]">
          <h3 className="text-xl font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
            <i className="fas fa-chart-line mr-2.5 text-teal-600 dark:text-teal-400"></i>Detailed Weight Chart
          </h3>
          <div className="relative h-[280px] sm:h-[380px]"> 
            <canvas ref={chartRef} aria-label="Weight progress chart" role="img"></canvas>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl min-h-[350px] sm:min-h-[450px]">
      <h3 className="text-xl font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
        <i className="fas fa-chart-line mr-2.5 text-teal-600 dark:text-teal-400"></i>Weight Progress
      </h3>
      <div className="relative h-[280px] sm:h-[380px]"> 
        <canvas ref={chartRef} aria-label="Weight progress chart" role="img"></canvas>
      </div>
    </div>
  );
};

export default WeightChartComponent;
