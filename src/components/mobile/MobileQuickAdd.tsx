import React, { useState, useRef, useEffect } from 'react';

interface MobileQuickAddProps {
  onAdd: (name: string, calories: number) => void;
  onScan: () => void;
  isOnline: boolean;
}

const MobileQuickAdd: React.FC<MobileQuickAddProps> = ({ onAdd, onScan, isOnline }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && calories) {
      onAdd(name, parseInt(calories));
      setName('');
      setCalories('');
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setCalories('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-20 left-4 right-4 flex gap-2 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex-1 bg-primary-600 text-white rounded-full py-3 px-6 font-medium shadow-lg active:scale-95 transition-transform"
        >
          <i className="fas fa-plus mr-2"></i>
          Quick Add Food
        </button>
        <button
          onClick={onScan}
          className="bg-gray-900 text-white rounded-full p-3 shadow-lg active:scale-95 transition-transform"
          aria-label="Scan barcode"
        >
          <i className="fas fa-barcode text-xl"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-4 pb-8 animate-slide-up">
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
        
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Add Food
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="food-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Food Name
            </label>
            <input
              ref={nameInputRef}
              id="food-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Apple, Chicken Breast"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="food-calories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Calories
            </label>
            <input
              id="food-calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g., 95"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              min="0"
            />
          </div>

          {!isOnline && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <i className="fas fa-wifi-slash mr-2"></i>
                You're offline. This will be saved locally and synced when you're back online.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium active:bg-gray-300 dark:active:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-medium active:bg-primary-700"
            >
              Add Food
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileQuickAdd;