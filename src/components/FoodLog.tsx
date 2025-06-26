import React from 'react';
import { FoodItem } from '../types';

interface FoodLogProps {
  loggedItems: FoodItem[];
  offlineQueue?: FoodItem[];
  onAddFood: (item: FoodItem, source: 'manual' | 'scan' | 'my_meal') => void;
  onRemoveFood: (id: string, isOffline?: boolean) => void;
  targetCalories: number | null;
  userName?: string | null;
  onOpenLogFromMyMeals?: () => void;
  isOnline?: boolean;
  onSyncOfflineItems?: () => void;
  onOpenUPCScanner?: () => void;
  apiKeyMissing?: boolean;
  canScanBarcode?: boolean;
  isPremiumUser?: boolean;
  lastSyncTime?: string;
  showOfflineBanner?: boolean;
  onRetryConnection?: () => void;
}

const FoodLog: React.FC<FoodLogProps> = ({
  loggedItems,
  onAddFood,
  onRemoveFood,
  targetCalories,
  userName
}) => {
  const [newFood, setNewFood] = React.useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const totalCalories = loggedItems.reduce((sum, item) => sum + item.calories, 0);

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFood.name && newFood.calories) {
      const foodItem: FoodItem = {
        id: Date.now().toString(),
        name: newFood.name,
        calories: parseFloat(newFood.calories),
        protein: newFood.protein ? parseFloat(newFood.protein) : undefined,
        carbs: newFood.carbs ? parseFloat(newFood.carbs) : undefined,
        fat: newFood.fat ? parseFloat(newFood.fat) : undefined,
        timestamp: Date.now()
      };
      onAddFood(foodItem, 'manual');
      setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Food Log</h2>
        
        {/* Summary */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-medium">Today's Total:</span>
            <span className="text-xl font-bold">{totalCalories} cal</span>
          </div>
          {targetCalories && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Target: {targetCalories} cal ({targetCalories - totalCalories} remaining)
            </div>
          )}
        </div>

        {/* Add Food Form */}
        <form onSubmit={handleAddFood} className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Add Food</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Food name"
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="number"
              placeholder="Calories"
              value={newFood.calories}
              onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={newFood.protein}
              onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={newFood.carbs}
              onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Fat (g)"
              value={newFood.fat}
              onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
              className="px-3 py-2 border rounded-md"
            />
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md"
            >
              Add Food
            </button>
          </div>
        </form>

        {/* Food List */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-3">Today's Foods</h3>
          {loggedItems.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No foods logged yet today.
            </p>
          ) : (
            loggedItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.calories} cal
                    {item.protein && ` • ${item.protein}g protein`}
                    {item.carbs && ` • ${item.carbs}g carbs`}
                    {item.fat && ` • ${item.fat}g fat`}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveFood(item.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodLog;