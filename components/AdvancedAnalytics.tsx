import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import LoadingSpinner from './common/LoadingSpinner';
import EmptyState from './common/EmptyState';
import InteractiveChart from './common/InteractiveChart';
import TrendChart from './common/TrendChart';
import MetricsCard from './common/MetricsCard';
import NutritionBreakdown from './common/NutritionBreakdown';
import AnimatedCard from './common/AnimatedCard';

Chart.register(...registerables);

interface AdvancedAnalyticsProps {
  foodLog: any[];
  isPremiumUser: boolean;
  onUpgradeClick: () => void;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ 
  foodLog, 
  isPremiumUser,
  onUpgradeClick 
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');

  // Enhanced data processing for new components
  const analyticsData = useMemo(() => {
    const endDate = new Date();
    let startDate: Date;

    switch (selectedTimeRange) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
    }

    const filteredLog = foodLog.filter(item => {
      const itemDate = new Date(item.timestamp);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });

    // Daily aggregation
    const dailyData = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
      const dayItems = filteredLog.filter(item => {
        const itemDate = new Date(item.timestamp);
        return format(itemDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      const dayTotals = dayItems.reduce((acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      return {
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'MMM dd'),
        ...dayTotals
      };
    });

    // Weekly comparison data
    const weeklyData = [];
    for (let i = 0; i < Math.ceil(dailyData.length / 7); i++) {
      const weekStart = i * 7;
      const weekData = dailyData.slice(weekStart, weekStart + 7);
      const weekTotals = weekData.reduce((acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      weeklyData.push({
        label: `Week ${i + 1}`,
        date: weekData[0]?.date || '',
        ...weekTotals
      });
    }

    // Overall metrics
    const totalCalories = filteredLog.reduce((sum, item) => sum + (item.calories || 0), 0);
    const totalProtein = filteredLog.reduce((sum, item) => sum + (item.protein || 0), 0);
    const totalCarbs = filteredLog.reduce((sum, item) => sum + (item.carbs || 0), 0);
    const totalFat = filteredLog.reduce((sum, item) => sum + (item.fat || 0), 0);
    const avgCaloriesPerDay = dailyData.length > 0 ? totalCalories / dailyData.length : 0;

    return {
      dailyData,
      weeklyData,
      totals: { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
      averages: { calories: avgCaloriesPerDay },
      filteredLog
    };
  }, [foodLog, selectedTimeRange]);

  const caloriesTrendRef = useRef<HTMLCanvasElement>(null);
  const macroDistributionRef = useRef<HTMLCanvasElement>(null);
  const weeklyComparisonRef = useRef<HTMLCanvasElement>(null);
  const mealTimingRef = useRef<HTMLCanvasElement>(null);

  const chartRefs = useRef<{ [key: string]: Chart | null }>({
    caloriesTrend: null,
    macroDistribution: null,
    weeklyComparison: null,
    mealTiming: null
  });

  // Process data based on selected time range
  const getFilteredData = () => {
    const endDate = new Date();
    let startDate: Date;

    switch (selectedTimeRange) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
    }

    return foodLog.filter(entry => {
      const entryDate = new Date(entry.date);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });
  };

  // Calculate daily totals
  const calculateDailyTotals = (data: any[]) => {
    const dailyTotals: { [date: string]: any } = {};

    data.forEach(entry => {
      const date = format(new Date(entry.date), 'yyyy-MM-dd');
      if (!dailyTotals[date]) {
        dailyTotals[date] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          meals: []
        };
      }

      dailyTotals[date].calories += entry.calories || 0;
      dailyTotals[date].protein += entry.protein || 0;
      dailyTotals[date].carbs += entry.carbs || 0;
      dailyTotals[date].fat += entry.fat || 0;
      dailyTotals[date].fiber += entry.fiber || 0;
      dailyTotals[date].sugar += entry.sugar || 0;
      dailyTotals[date].sodium += entry.sodium || 0;
      dailyTotals[date].meals.push(entry);
    });

    return dailyTotals;
  };

  // Update all charts
  useEffect(() => {
    if (!isPremiumUser) return; // Exit early if not premium

    const filteredData = getFilteredData();
    const dailyTotals = calculateDailyTotals(filteredData);

    // Update Calories/Macro Trend Chart
    if (caloriesTrendRef.current) {
      const ctx = caloriesTrendRef.current.getContext('2d');
      if (!ctx) return;

      if (chartRefs.current.caloriesTrend) {
        chartRefs.current.caloriesTrend.destroy();
      }

      const dates = Object.keys(dailyTotals).sort();
      const values = dates.map(date => dailyTotals[date][selectedMetric]);

      chartRefs.current.caloriesTrend = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates.map(date => format(new Date(date), 'MMM d')),
          datasets: [{
            label: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
            data: values,
            borderColor: 'rgb(20, 184, 166)',
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend`
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Update Macro Distribution Chart
    if (macroDistributionRef.current) {
      const ctx = macroDistributionRef.current.getContext('2d');
      if (!ctx) return;

      if (chartRefs.current.macroDistribution) {
        chartRefs.current.macroDistribution.destroy();
      }

      // Optimize: Calculate all macro totals in a single iteration
      const macroTotals = Object.values(dailyTotals).reduce((acc, day) => {
        acc.protein += day.protein;
        acc.carbs += day.carbs;
        acc.fat += day.fat;
        return acc;
      }, { protein: 0, carbs: 0, fat: 0 });

      chartRefs.current.macroDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Protein', 'Carbs', 'Fat'],
          datasets: [{
            data: [macroTotals.protein, macroTotals.carbs, macroTotals.fat],
            backgroundColor: [
              'rgb(239, 68, 68)',
              'rgb(59, 130, 246)',
              'rgb(251, 191, 36)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Macro Distribution'
            }
          }
        }
      });
    }

    // Update Weekly Comparison Chart
    if (weeklyComparisonRef.current) {
      const ctx = weeklyComparisonRef.current.getContext('2d');
      if (!ctx) return;

      if (chartRefs.current.weeklyComparison) {
        chartRefs.current.weeklyComparison.destroy();
      }

      const weeklyAverages: { [week: string]: any } = {};
      Object.entries(dailyTotals).forEach(([date, data]) => {
        const weekStart = format(startOfWeek(new Date(date)), 'yyyy-MM-dd');
        if (!weeklyAverages[weekStart]) {
          weeklyAverages[weekStart] = { total: 0, count: 0 };
        }
        weeklyAverages[weekStart].total += data.calories;
        weeklyAverages[weekStart].count += 1;
      });

      const weeks = Object.keys(weeklyAverages).sort();
      const averages = weeks.map(week => 
        weeklyAverages[week].total / weeklyAverages[week].count
      );

      chartRefs.current.weeklyComparison = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: weeks.map(week => format(new Date(week), 'MMM d')),
          datasets: [{
            label: 'Average Daily Calories',
            data: averages,
            backgroundColor: 'rgba(20, 184, 166, 0.6)',
            borderColor: 'rgb(20, 184, 166)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Weekly Average Comparison'
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Update Meal Timing Chart
    if (mealTimingRef.current) {
      const ctx = mealTimingRef.current.getContext('2d');
      if (!ctx) return;

      if (chartRefs.current.mealTiming) {
        chartRefs.current.mealTiming.destroy();
      }

      const mealTimes: { [hour: number]: number } = {};
      filteredData.forEach(entry => {
        const hour = new Date(entry.date).getHours();
        mealTimes[hour] = (mealTimes[hour] || 0) + entry.calories;
      });

      const hours = Array.from({ length: 24 }, (_, i) => i);
      const calories = hours.map(hour => mealTimes[hour] || 0);

      chartRefs.current.mealTiming = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: hours.map(h => `${h}:00`),
          datasets: [{
            label: 'Calories by Hour',
            data: calories,
            borderColor: 'rgb(20, 184, 166)',
            backgroundColor: 'rgba(20, 184, 166, 0.2)',
            pointBackgroundColor: 'rgb(20, 184, 166)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(20, 184, 166)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Meal Timing Pattern'
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              ticks: { display: false }
            }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [foodLog, selectedTimeRange, selectedMetric, isPremiumUser]);

  // Premium-only content blur overlay
  if (!isPremiumUser) {
    return (
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-8 max-w-md">
            <i className="fas fa-chart-line text-6xl text-teal-500 mb-4"></i>
            <h3 className="text-2xl font-bold text-text-default mb-2">
              Advanced Analytics
            </h3>
            <p className="text-text-alt mb-6">
              Unlock powerful insights with detailed nutrition trends, weekly comparisons, meal timing analysis, and more.
            </p>
            <button
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <i className="fas fa-crown mr-2"></i>
              Upgrade to Premium
            </button>
          </div>
        </div>

        {/* Blurred preview content */}
        <div className="opacity-20">
          <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const dailyTotals = calculateDailyTotals(filteredData);

  // Calculate statistics - optimized to use single iteration
  const dailyValues = Object.values(dailyTotals);
  const totalDays = dailyValues.length;
  const stats = dailyValues.reduce((acc, day) => {
    acc.totalCalories += day.calories;
    acc.totalProtein += day.protein;
    acc.totalCarbs += day.carbs;
    acc.totalFat += day.fat;
    return acc;
  }, { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });

  const finalStats = {
    avgCalories: totalDays > 0 ? stats.totalCalories / totalDays : 0,
    avgProtein: totalDays > 0 ? stats.totalProtein / totalDays : 0,
    avgCarbs: totalDays > 0 ? stats.totalCarbs / totalDays : 0,
    avgFat: totalDays > 0 ? stats.totalFat / totalDays : 0,
    totalDays
  };

  // Handle empty state when no data
  if (analyticsData.filteredLog.length === 0) {
    return (
      <AnimatedCard
        title="Advanced Analytics"
        icon="fas fa-chart-line"
        iconColor="text-teal-500"
        animation="fade"
      >
        <EmptyState
          icon="fas fa-chart-pie"
          iconColor="text-teal-500 dark:text-teal-400"
          title="No Data to Analyze"
          description={`Start logging your meals to see detailed analytics for the ${selectedTimeRange === '7d' ? 'last 7 days' : selectedTimeRange === '30d' ? 'last 30 days' : 'last 90 days'}.`}
          actionLabel="Log Your First Meal"
          onAction={() => window.dispatchEvent(new CustomEvent('navigate-to-foodlog'))}
          tips={[
            "Track meals consistently for meaningful insights",
            "Add macros (protein, carbs, fat) for detailed analysis",
            "Check back after a week of logging for trends"
          ]}
        />
      </AnimatedCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedCard 
        title="Advanced Analytics"
        icon="fas fa-chart-line"
        iconColor="text-teal-500"
        animation="lift"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as 'calories' | 'protein' | 'carbs' | 'fat')}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="calories">Calories</option>
            <option value="protein">Protein</option>
            <option value="carbs">Carbs</option>
            <option value="fat">Fat</option>
          </select>
        </div>
      </AnimatedCard>

      {/* Enhanced Analytics */}
      <MetricsCard
        title="Daily Averages"
        metrics={[
          {
            label: 'Daily Calories',
            value: analyticsData.averages.calories,
            format: 'number',
            unit: 'kcal',
            color: 'bg-blue-500'
          },
          {
            label: 'Daily Protein',
            value: analyticsData.totals.protein / analyticsData.dailyData.length || 0,
            format: 'decimal',
            unit: 'g',
            color: 'bg-red-500'
          },
          {
            label: 'Daily Carbs',
            value: analyticsData.totals.carbs / analyticsData.dailyData.length || 0,
            format: 'decimal',
            unit: 'g',
            color: 'bg-green-500'
          },
          {
            label: 'Daily Fat',
            value: analyticsData.totals.fat / analyticsData.dailyData.length || 0,
            format: 'decimal',
            unit: 'g',
            color: 'bg-yellow-500'
          }
        ]}
        variant="compact"
        showTrends={false}
        animated={true}
      />

      {/* Nutrition Breakdown */}
      <NutritionBreakdown
        data={{
          protein: analyticsData.totals.protein / analyticsData.dailyData.length || 0,
          carbs: analyticsData.totals.carbs / analyticsData.dailyData.length || 0,
          fat: analyticsData.totals.fat / analyticsData.dailyData.length || 0,
          calories: analyticsData.averages.calories
        }}
        showPercentages={true}
        showMacroRings={true}
        variant="visual"
      />

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          data={analyticsData.dailyData.map(day => ({
            date: day.date,
            value: day[selectedMetric],
            label: day.label
          }))}
          title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend`}
          subtitle={`Daily ${selectedMetric} over time`}
          showTarget={false}
          showDots={true}
          showArea={true}
          color="#14b8a6"
          timeframe={selectedTimeRange === '7d' ? 'week' : selectedTimeRange === '30d' ? 'month' : 'quarter'}
          unit={selectedMetric === 'calories' ? ' kcal' : ' g'}
          height={250}
        />

        <InteractiveChart
          data={analyticsData.weeklyData.map((week, index) => ({
            label: week.label,
            value: week[selectedMetric],
            color: `hsl(${index * 60}, 70%, 50%)`
          }))}
          type="bar"
          title="Weekly Comparison"
          showGrid={true}
          showTooltip={true}
          showLegend={false}
          animated={true}
          height={250}
          unit={selectedMetric === 'calories' ? ' kcal' : ' g'}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Avg Calories</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {Math.round(finalStats.avgCalories)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4">
          <div className="text-sm text-red-600 dark:text-red-400 font-medium">Avg Protein</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {Math.round(finalStats.avgProtein)}g
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Avg Carbs</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {Math.round(finalStats.avgCarbs)}g
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Avg Fat</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {Math.round(finalStats.avgFat)}g
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Days Tracked</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {finalStats.totalDays}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="h-64">
            <canvas ref={caloriesTrendRef}></canvas>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="h-64">
            <canvas ref={macroDistributionRef}></canvas>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="h-64">
            <canvas ref={weeklyComparisonRef}></canvas>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="h-64">
            <canvas ref={mealTimingRef}></canvas>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <AnimatedCard
        title="Insights & Tips"
        icon="fas fa-lightbulb"
        iconColor="text-teal-500"
        animation="fade"
        className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700"
      >
        <ul className="text-sm text-teal-700 dark:text-teal-300 space-y-2">
          {analyticsData.averages.calories < 1500 && (
            <li className="flex items-center space-x-2">
              <i className="fas fa-exclamation-triangle text-yellow-500"></i>
              <span>Your average calorie intake seems low. Consider consulting with a nutritionist.</span>
            </li>
          )}
          {(analyticsData.totals.protein / analyticsData.dailyData.length) < 50 && (
            <li className="flex items-center space-x-2">
              <i className="fas fa-dumbbell text-red-500"></i>
              <span>Try to increase your protein intake for better muscle maintenance.</span>
            </li>
          )}
          {analyticsData.dailyData.length < 7 && (
            <li className="flex items-center space-x-2">
              <i className="fas fa-calendar-check text-blue-500"></i>
              <span>Track more days to get better insights into your eating patterns.</span>
            </li>
          )}
          <li className="flex items-center space-x-2">
            <i className="fas fa-clock text-green-500"></i>
            <span>Consistent meal timing can help regulate your metabolism.</span>
          </li>
        </ul>
      </AnimatedCard>
    </div>
  );
};

export default AdvancedAnalytics;