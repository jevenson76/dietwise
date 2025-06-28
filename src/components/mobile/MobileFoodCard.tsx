import React, { useState } from 'react';
import { FoodItem } from '../../types';

interface MobileFoodCardProps {
  food: FoodItem;
  onDelete: (id: string) => void;
  onEdit?: (food: FoodItem) => void;
}

const MobileFoodCard: React.FC<MobileFoodCardProps> = ({ food, onDelete, onEdit }) => {
  const [showActions, setShowActions] = useState(false);

  const macroColors = {
    protein: 'text-blue-600 dark:text-blue-400',
    carbs: 'text-green-600 dark:text-green-400', 
    fat: 'text-orange-600 dark:text-orange-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 active:scale-[0.98] transition-transform">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Food name and calories */}
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {food.name}
            </h3>
            <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
              {food.calories} cal
            </span>
          </div>

          {/* Serving size */}
          {food.servingSize && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {food.servingSize}
            </p>
          )}

          {/* Macros */}
          <div className="flex gap-4 text-sm">
            <span className={macroColors.protein}>
              <i className="fas fa-dumbbell mr-1"></i>
              {food.protein || 0}g
            </span>
            <span className={macroColors.carbs}>
              <i className="fas fa-wheat-awn mr-1"></i>
              {food.carbs || 0}g
            </span>
            <span className={macroColors.fat}>
              <i className="fas fa-droplet mr-1"></i>
              {food.fat || 0}g
            </span>
          </div>
        </div>

        {/* Actions button */}
        <button
          onClick={() => setShowActions(!showActions)}
          className="ml-2 p-2 -mr-2 -mt-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-700"
          aria-label="More options"
        >
          <i className="fas fa-ellipsis-vertical text-gray-400"></i>
        </button>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {onEdit && (
            <button
              onClick={() => onEdit(food)}
              className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium active:bg-gray-200 dark:active:bg-gray-600"
            >
              <i className="fas fa-edit mr-2"></i>
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(food.id)}
            className="flex-1 py-2 px-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium active:bg-red-200 dark:active:bg-red-900/30"
          >
            <i className="fas fa-trash mr-2"></i>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileFoodCard;