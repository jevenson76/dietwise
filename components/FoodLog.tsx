
import React, { useState, useMemo } from 'react';
import { FoodItem, MyMeal } from '../types';
import Modal from './common/Modal';
import UPCScannerComponent from './UPCScannerComponent'; // Import for modal usage

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
      resetManualForm();
      setIsManualAddModalOpen(false);
    }
  };

  const getProgressGradient = () => {
    if (targetCalories === null || totalCaloriesToday === 0) return 'bg-slate-300 dark:bg-slate-600';
    const percentage = (totalCaloriesToday / targetCalories) * 100;
    if (percentage > 110) return 'bg-gradient-to-r from-red-500 to-rose-600'; 
    if (percentage > 90 && percentage <= 110) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage > 60) return 'bg-gradient-to-r from-yellow-400 to-amber-500'; 
    return 'bg-gradient-to-r from-sky-400 to-cyan-500'; 
  };

  const inputClass = "mt-1 block w-full px-3 py-2 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm placeholder-slate-400 bg-bg-card text-text-default dark:placeholder-slate-500";
  const greeting = userName ? `What are you fueling yourself with today, ${userName}?` : "Log your meals for today.";

  const actionButtonClass = "bg-gradient-to-r text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

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
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
      <div className="flex flex-wrap justify-between items-center mb-4 pb-3 border-b border-border-default">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-default">
          <i className="fas fa-apple-alt mr-2.5 text-green-500 dark:text-green-400"></i>Today's Food Log
        </h2>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <button 
              onClick={onOpenLogFromMyMeals}
              className={`${actionButtonClass} from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 focus:ring-purple-500`}
          >
              <i className="fas fa-book-open fa-fw mr-1.5"></i> Log My Meal
          </button>
          <button
            onClick={onOpenUPCScanner}
            disabled={apiKeyMissing || (canScanBarcode && !canScanBarcode.allowed)}
            className={`${actionButtonClass} from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 focus:ring-teal-500 relative`}
          >
            <i className="fas fa-barcode mr-1.5"></i> 
            Scan UPC
            {canScanBarcode && !isPremiumUser && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {canScanBarcode.remaining}
              </span>
            )}
          </button>
          <button 
              onClick={() => setIsManualAddModalOpen(true)}
              className={`${actionButtonClass} from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 focus:ring-sky-500`}
          >
              <i className="fas fa-plus fa-fw mr-1.5"></i> Add Manually
          </button>
        </div>
      </div>
      <p className="text-sm text-text-alt mb-6">{greeting}</p>

      {targetCalories !== null && (
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-text-alt mb-1.5">
            <span>{totalCaloriesToday.toLocaleString()} kcal consumed</span>
            <span className="font-semibold text-teal-700 dark:text-teal-400">Target: {targetCalories.toLocaleString()} kcal</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 shadow-inner overflow-hidden">
            <div 
                className={`${getProgressGradient()} h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-center text-xs text-white font-bold`}
                style={{ width: `${targetCalories ? Math.min(100, (totalCaloriesToday/targetCalories)*100) : 0}%` }}
                role="progressbar"
                aria-valuenow={targetCalories ? Math.min(100, (totalCaloriesToday/targetCalories)*100) : 0}
                aria-valuemin={0}
                aria-valuemax={100}
            >
              {targetCalories && totalCaloriesToday > 0 && Math.min(100, (totalCaloriesToday/targetCalories)*100).toFixed(0)}%
            </div>
          </div>
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

      {(loggedItems.length === 0 && offlineQueue.length === 0) ? (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-border-default">
            <i className="fas fa-utensils text-4xl text-slate-400 dark:text-slate-500 mb-3"></i>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No food logged yet today.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Scan or add items to get started!</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {reversedOfflineQueue.map((item) => renderFoodListItem(item, true))}
          {reversedLoggedItems.map((item) => renderFoodListItem(item, false))}
        </ul>
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
    </div>
  );
};

export default FoodLog;
