
import React, { useState, useMemo } from 'react';
import { FoodItem, MyMeal } from '../types';
import Modal from './common/Modal';
import EmptyState from './common/EmptyState';
import UPCScannerComponent from './UPCScannerComponent'; // Import for modal usage
import { getSmartFoodSuggestions, getTimeBasedGreeting, FoodSuggestion } from '../utils/smartSuggestions';
import AnimatedButton from './common/AnimatedButton';
import AnimatedCard from './common/AnimatedCard';
import AnimatedList from './common/AnimatedList';
import FeedbackAnimations from './common/FeedbackAnimations';
import ProgressIndicator from './common/ProgressIndicator';
import SearchBar from './common/SearchBar';
import FilterPanel, { FilterGroup, ActiveFilter } from './common/FilterPanel';

interface FoodLogProps {
  loggedItems: FoodItem[];
  offlineQueue: FoodItem[];
  onAddFood: (foodItem: FoodItem, source: 'manual' | 'scan' | 'my_meal') => void;
  onRemoveFood: (foodId: string, isOfflineItem?: boolean) => void;
  targetCalories: number | null;
  userName: string | null;
  onOpenLogFromMyMeals: () => void;
  isOnline: boolean;
  onSyncOfflineItems: () => void;
  onOpenUPCScanner: () => void; // Prop to open App-level UPC scanner modal
  apiKeyMissing: boolean; // Prop to disable UPC scan button
  canScanBarcode?: { allowed: boolean; remaining: number };
  isPremiumUser?: boolean;
}

const FoodLog: React.FC<FoodLogProps> = ({ 
  loggedItems, 
  offlineQueue,
  onAddFood, 
  onRemoveFood, 
  targetCalories, 
  userName, 
  onOpenLogFromMyMeals,
  isOnline,
  onSyncOfflineItems,
  onOpenUPCScanner, // Use this prop
  apiKeyMissing,
  canScanBarcode,
  isPremiumUser
}) => {
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  const [manualFoodName, setManualFoodName] = useState('');
  const [manualFoodCalories, setManualFoodCalories] = useState<number | ''>('');
  const [manualServingSize, setManualServingSize] = useState('');
  const [manualProtein, setManualProtein] = useState<number | ''>('');
  const [manualCarbs, setManualCarbs] = useState<number | ''>('');
  const [manualFat, setManualFat] = useState<number | ''>('');
  const [itemAdded, setItemAdded] = useState(false);
  const [itemRemoved, setItemRemoved] = useState('');

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Memoize expensive calculations to avoid recalculating on every render
  const reversedOfflineQueue = useMemo(() => [...offlineQueue].reverse(), [offlineQueue]);
  const reversedLoggedItems = useMemo(() => [...loggedItems].reverse(), [loggedItems]);
  
  const totalCaloriesToday = loggedItems.reduce((sum, item) => sum + item.calories, 0);
  const remainingCalories = targetCalories !== null ? targetCalories - totalCaloriesToday : null;

  const resetManualForm = () => {
    setManualFoodName('');
    setManualFoodCalories('');
    setManualServingSize('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
  }

  const handleManualAdd = () => {
    if (manualFoodName && manualFoodCalories !== '') {
      onAddFood({
        id: `manual-${Date.now()}`,
        name: manualFoodName,
        calories: Number(manualFoodCalories),
        servingSize: manualServingSize || undefined,
        protein: manualProtein !== '' ? Number(manualProtein) : undefined,
        carbs: manualCarbs !== '' ? Number(manualCarbs) : undefined,
        fat: manualFat !== '' ? Number(manualFat) : undefined,
        timestamp: Date.now(),
      }, 'manual');
      setItemAdded(true);
      setTimeout(() => setItemAdded(false), 1500);
      resetManualForm();
      setIsManualAddModalOpen(false);
    }
  };

  const handleSuggestionAdd = (suggestion: FoodSuggestion) => {
    onAddFood({
      id: `suggestion-${Date.now()}`,
      name: suggestion.name,
      calories: suggestion.calories,
      servingSize: undefined,
      protein: suggestion.protein,
      carbs: suggestion.carbs,
      fat: suggestion.fat,
      timestamp: Date.now(),
    }, 'manual');
    setItemAdded(true);
    setTimeout(() => setItemAdded(false), 1500);
  };

  const getProgressGradient = () => {
    if (targetCalories === null || totalCaloriesToday === 0) return 'bg-slate-300 dark:bg-slate-600';
    const percentage = (totalCaloriesToday / targetCalories) * 100;
    if (percentage > 110) return 'bg-gradient-to-r from-red-500 to-rose-600'; 
    if (percentage > 90 && percentage <= 110) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage > 60) return 'bg-gradient-to-r from-yellow-400 to-amber-500'; 
    return 'bg-gradient-to-r from-sky-400 to-cyan-500'; 
  };

  const inputClass = "mt-1 block w-full px-4 py-2.5 border border-border-default rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm placeholder-slate-400 bg-bg-card text-text-default dark:placeholder-slate-500";
  const greeting = getTimeBasedGreeting();
  const smartSuggestions = useMemo(() => getSmartFoodSuggestions(targetCalories), [targetCalories]);

  const actionButtonClass = "bg-gradient-to-r text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

  // Filter configurations
  const filterGroups: FilterGroup[] = [
    {
      id: 'calories',
      label: 'Calories',
      type: 'range',
      min: 0,
      max: 1000,
      step: 10,
      unit: ' kcal'
    },
    {
      id: 'protein',
      label: 'Protein',
      type: 'range',
      min: 0,
      max: 100,
      step: 1,
      unit: 'g'
    },
    {
      id: 'timeOfDay',
      label: 'Time of Day',
      type: 'select',
      options: [
        { id: 'morning', label: 'Morning (6AM-12PM)', value: 'morning' },
        { id: 'afternoon', label: 'Afternoon (12PM-6PM)', value: 'afternoon' },
        { id: 'evening', label: 'Evening (6PM-12AM)', value: 'evening' },
        { id: 'night', label: 'Night (12AM-6AM)', value: 'night' }
      ]
    },
    {
      id: 'hasMacros',
      label: 'Has Macro Info',
      type: 'toggle'
    },
    {
      id: 'hasServingSize',
      label: 'Has Serving Size',
      type: 'toggle'
    }
  ];

  // Get time category for filtering
  const getTimeCategory = (timestamp: number) => {
    const hour = new Date(timestamp).getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night';
  };

  // Filter and search logic
  const filterItems = (items: FoodItem[]) => {
    return items.filter(item => {
      // Search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Apply active filters
      for (const filter of activeFilters) {
        switch (filter.groupId) {
          case 'calories':
            if (item.calories < filter.value[0] || item.calories > filter.value[1]) return false;
            break;
          case 'protein':
            if (!item.protein || item.protein < filter.value[0] || item.protein > filter.value[1]) return false;
            break;
          case 'timeOfDay':
            if (getTimeCategory(item.timestamp) !== filter.value) return false;
            break;
          case 'hasMacros':
            if (filter.value && (!item.protein || !item.carbs || !item.fat)) return false;
            break;
          case 'hasServingSize':
            if (filter.value && !item.servingSize) return false;
            break;
        }
      }
      return true;
    });
  };

  const filteredLoggedItems = filterItems(reversedLoggedItems);
  const filteredOfflineQueue = filterItems(reversedOfflineQueue);

  // Filter handlers
  const handleFilterChange = (groupId: string, value: any) => {
    const existingFilterIndex = activeFilters.findIndex(f => f.groupId === groupId);
    const filterGroup = filterGroups.find(g => g.id === groupId);
    if (!filterGroup) return;

    let label = '';
    if (filterGroup.type === 'range') {
      label = `${filterGroup.label}: ${value[0]}${filterGroup.unit || ''} - ${value[1]}${filterGroup.unit || ''}`;
    } else if (filterGroup.type === 'toggle') {
      label = `${filterGroup.label}: ${value ? 'Yes' : 'No'}`;
    } else if (filterGroup.type === 'select') {
      const option = filterGroup.options?.find(opt => opt.value === value);
      label = option ? `${filterGroup.label}: ${option.label}` : `${filterGroup.label}: ${value}`;
    }

    const newFilter: ActiveFilter = {
      groupId,
      value,
      label
    };

    if (existingFilterIndex >= 0) {
      const newFilters = [...activeFilters];
      newFilters[existingFilterIndex] = newFilter;
      setActiveFilters(newFilters);
    } else {
      setActiveFilters([...activeFilters, newFilter]);
    }
  };

  const clearFilters = () => setActiveFilters([]);

  const clearFilter = (groupId: string) => {
    setActiveFilters(activeFilters.filter(f => f.groupId !== groupId));
  };

  // Generate food suggestions for search
  const allItems = [...loggedItems, ...offlineQueue];
  const foodSuggestions = Array.from(new Set(allItems.map(item => item.name)))
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  const renderFoodListItem = (item: FoodItem, isOffline: boolean) => (
    <li 
        key={item.id} 
        className={`flex justify-between items-start p-4 border rounded-lg transition-colors shadow-sm 
                    ${isOffline 
                        ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 opacity-80' 
                        : 'bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 border-border-default'}`}
        aria-label={`${item.name}${isOffline ? ' (Pending Sync)' : ''}`}
    >
      <div className="flex-grow">
        <p className="font-semibold text-text-default text-base">{item.name} {isOffline && <span className="text-xs text-yellow-600 dark:text-yellow-400">(Offline)</span>}</p>
        <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">{item.calories} kcal</p>
        <p className="text-xs text-text-alt mt-1 space-x-2">
          {item.servingSize && `Serving: ${item.servingSize}`}
          {item.protein !== undefined && <span className="inline-block">P: {item.protein}g</span>}
          {item.carbs !== undefined && <span className="inline-block">C: {item.carbs}g</span>}
          {item.fat !== undefined && <span className="inline-block">F: {item.fat}g</span>}
        </p>
      </div>
      <button
        onClick={() => onRemoveFood(item.id, isOffline)}
        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors ml-2 flex-shrink-0"
        aria-label={`Remove ${item.name}${isOffline ? ' (Pending Sync)' : ''}`}
      >
        <i className="fas fa-trash-alt fa-fw"></i>
      </button>
    </li>
  );

  return (
    <FeedbackAnimations trigger={itemAdded} type="success" animation="bounce">
      <AnimatedCard 
        title="Today's Food Log" 
        icon="fas fa-apple-alt" 
        iconColor="text-green-500 dark:text-green-400"
        animation="lift"
        className="mt-6 sm:mt-8"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <AnimatedButton 
            onClick={onOpenLogFromMyMeals}
            variant="primary"
            icon="fas fa-book-open"
            animation="scale"
            className="from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            Log My Meal
          </AnimatedButton>
          <AnimatedButton
            onClick={onOpenUPCScanner}
            disabled={apiKeyMissing || (canScanBarcode && !canScanBarcode.allowed)}
            variant="primary"
            icon="fas fa-barcode"
            animation="scale"
            className="from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 relative"
          >
            Scan UPC
            {canScanBarcode && !isPremiumUser && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {canScanBarcode.remaining}
              </span>
            )}
          </AnimatedButton>
          <AnimatedButton 
            onClick={() => setIsManualAddModalOpen(true)}
            variant="primary"
            icon="fas fa-plus"
            animation="scale"
            className="from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
            data-tooltip="add-food-button"
          >
            Add Manually
          </AnimatedButton>
          <AnimatedButton
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            icon="fas fa-filter"
            animation="scale"
            className={`border-2 ${activeFilters.length > 0 ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' : 'border-gray-300 dark:border-gray-600'} relative`}
          >
            Filter
            {activeFilters.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </AnimatedButton>
        </div>

        {/* Search and Filter Controls */}
        {(loggedItems.length > 0 || offlineQueue.length > 0) && (
          <div className="mb-4 space-y-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search your food log..."
              suggestions={foodSuggestions}
              onSuggestionSelect={setSearchQuery}
              icon="fas fa-search"
              variant="compact"
              size="md"
            />
            
            {showFilters && (
              <FilterPanel
                filterGroups={filterGroups}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                onClearFilter={clearFilter}
                variant="inline"
                showActiveCount={true}
              />
            )}

            {(searchQuery || activeFilters.length > 0) && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredLoggedItems.length + filteredOfflineQueue.length} of {loggedItems.length + offlineQueue.length} food entries
                {(searchQuery || activeFilters.length > 0) && (
                  <button
                    onClick={() => { setSearchQuery(''); clearFilters(); }}
                    className="ml-2 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      <p className="text-sm text-text-alt mb-6">{greeting}</p>

      {targetCalories !== null && (
        <div className="mb-6" data-tooltip="calorie-summary">
          <ProgressIndicator
            value={totalCaloriesToday}
            max={targetCalories}
            showPercentage={true}
            showValue={true}
            label="Daily Calorie Progress"
            color={
              (totalCaloriesToday / targetCalories) > 1.1 ? 'danger' :
              (totalCaloriesToday / targetCalories) > 0.9 ? 'success' :
              (totalCaloriesToday / targetCalories) > 0.6 ? 'warning' : 'primary'
            }
            animated={true}
            striped={true}
            className="animate-slide-up"
          />
          {remainingCalories !== null && (
            <p className={`text-sm mt-1.5 text-right font-medium ${remainingCalories < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
              {remainingCalories < 0 ? `${Math.abs(remainingCalories).toLocaleString()} kcal over target` : `${remainingCalories.toLocaleString()} kcal remaining`}
            </p>
          )}
        </div>
      )}

      {offlineQueue.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-800/40 border border-yellow-300 dark:border-yellow-600 rounded-md">
            <div className="flex justify-between items-center">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <i className="fas fa-cloud-arrow-up mr-2 animate-pulse"></i>
                    You have {offlineQueue.length} item(s) logged offline. 
                    {!isOnline ? " Connect to sync." : ""}
                </p>
                {isOnline && (
                    <button 
                        onClick={onSyncOfflineItems}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1.5 px-3 rounded-md text-xs shadow transition-all"
                    >
                        Sync Now
                    </button>
                )}
            </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-700">
          <h3 className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-3 flex items-center">
            <i className="fas fa-lightbulb mr-2 animate-pulse"></i>
            Quick Add Suggestions
          </h3>
          <AnimatedList animation="stagger" delay={150} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {smartSuggestions.map((suggestion: any, index: number) => (
              <AnimatedButton
                key={index}
                onClick={() => handleSuggestionAdd(suggestion)}
                variant="ghost"
                animation="scale"
                className="p-3 bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-600 hover:border-teal-300 dark:hover:border-teal-500 text-left h-auto"
              >
                <div className="text-left">
                  <p className="font-medium text-xs text-gray-900 dark:text-white truncate">{suggestion.name}</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400">{suggestion.calories} kcal</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.servingSize}</p>
                </div>
              </AnimatedButton>
            ))}
          </AnimatedList>
        </div>
      )}

      {(loggedItems.length === 0 && offlineQueue.length === 0) ? (
        <EmptyState
          icon="fas fa-utensils"
          iconColor="text-teal-500 dark:text-teal-400"
          title="Start Your Food Journey"
          description="Track your first meal to begin understanding your nutrition habits."
          actionLabel="Add Your First Food"
          onAction={() => setIsManualAddModalOpen(true)}
          secondaryActionLabel={canScanBarcode?.allowed ? "Scan Barcode" : undefined}
          onSecondaryAction={canScanBarcode?.allowed ? onOpenUPCScanner : undefined}
          tips={[
            "Start with breakfast to build a consistent tracking habit",
            "Use the barcode scanner for packaged foods",
            "Save frequently eaten foods to your library for quick access"
          ]}
          className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 rounded-lg py-8"
        />
      ) : (filteredLoggedItems.length === 0 && filteredOfflineQueue.length === 0) ? (
        <EmptyState
          icon="fas fa-search"
          iconColor="text-gray-500 dark:text-gray-400"
          title="No Food Entries Found"
          description={searchQuery || activeFilters.length > 0 
            ? "No food entries match your search criteria. Try adjusting your filters or search terms."
            : "You don't have any food entries yet."
          }
          actionLabel={searchQuery || activeFilters.length > 0 ? "Clear Filters" : "Add Your First Food"}
          onAction={searchQuery || activeFilters.length > 0 
            ? () => { setSearchQuery(''); clearFilters(); }
            : () => setIsManualAddModalOpen(true)
          }
          tips={[
            "Use the search bar to find foods by name",
            "Filter by time of day to see meal patterns",
            "Apply calorie or macro filters to analyze your intake"
          ]}
        />
      ) : (
        <AnimatedList animation="stagger" delay={100} className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {filteredOfflineQueue.map((item) => renderFoodListItem(item, true))}
          {filteredLoggedItems.map((item) => renderFoodListItem(item, false))}
        </AnimatedList>
      )}
       <Modal isOpen={isManualAddModalOpen} onClose={() => { resetManualForm(); setIsManualAddModalOpen(false); }} title="Add Food Manually">
        <div className="space-y-4">
            <div>
                <label htmlFor="manualFoodName" className="block text-sm font-medium text-text-alt">Food Name <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    id="manualFoodName" 
                    value={manualFoodName} 
                    onChange={(e) => setManualFoodName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g., Apple"
                    required
                />
            </div>
            <div>
                <label htmlFor="manualFoodCalories" className="block text-sm font-medium text-text-alt">Calories (kcal) <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    id="manualFoodCalories" 
                    value={manualFoodCalories} 
                    onChange={(e) => setManualFoodCalories(e.target.value === '' ? '' : Number(e.target.value))}
                    className={inputClass}
                    placeholder="e.g., 95"
                    min="0"
                    required
                />
            </div>
             <div>
                <label htmlFor="manualServingSize" className="block text-sm font-medium text-text-alt">Serving Size (optional)</label>
                <input 
                    type="text" 
                    id="manualServingSize" 
                    value={manualServingSize} 
                    onChange={(e) => setManualServingSize(e.target.value)}
                    className={inputClass}
                    placeholder="e.g., 1 medium, 100g"
                />
            </div>
            <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label htmlFor="manualProtein" className="block text-xs font-medium text-text-alt">Protein (g)</label>
                    <input type="number" id="manualProtein" value={manualProtein} onChange={(e) => setManualProtein(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} placeholder="e.g., 0.5" min="0"/>
                </div>
                <div>
                    <label htmlFor="manualCarbs" className="block text-xs font-medium text-text-alt">Carbs (g)</label>
                    <input type="number" id="manualCarbs" value={manualCarbs} onChange={(e) => setManualCarbs(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} placeholder="e.g., 25" min="0"/>
                </div>
                <div>
                    <label htmlFor="manualFat" className="block text-xs font-medium text-text-alt">Fat (g)</label>
                    <input type="number" id="manualFat" value={manualFat} onChange={(e) => setManualFat(e.target.value === '' ? '' : Number(e.target.value))} className={inputClass} placeholder="e.g., 0.2" min="0"/>
                </div>
            </div>
            <button 
                onClick={handleManualAdd}
                disabled={!manualFoodName || manualFoodCalories === '' || Number(manualFoodCalories) <= 0}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isOnline ? "Add Food Item" : "Add to Offline Queue"}
            </button>
        </div>
      </Modal>
      </AnimatedCard>
    </FeedbackAnimations>
  );
};

export default FoodLog;
