import React, { useState, useEffect } from 'react';
import { trackEvent } from '@services/analyticsService';

interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface CustomMacroTargetsProps {
  currentTargets: MacroTargets;
  onUpdateTargets: (targets: MacroTargets) => void;
  isPremiumUser: boolean;
  onUpgradeClick: () => void;
  targetCalories: number | null;
}

const CustomMacroTargets: React.FC<CustomMacroTargetsProps> = ({
  currentTargets,
  onUpdateTargets,
  isPremiumUser,
  onUpgradeClick,
  targetCalories
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTargets, setTempTargets] = useState<MacroTargets>(currentTargets);
  const [macroPercentages, setMacroPercentages] = useState({
    protein: 30,
    carbs: 40,
    fat: 30
  });

  useEffect(() => {
    setTempTargets(currentTargets);
  }, [currentTargets]);

  // Calculate macro percentages from current targets
  useEffect(() => {
    if (targetCalories && targetCalories > 0) {
      const proteinCals = tempTargets.protein * 4;
      const carbsCals = tempTargets.carbs * 4;
      const fatCals = tempTargets.fat * 9;
      const totalCals = proteinCals + carbsCals + fatCals;
      
      if (totalCals > 0) {
        setMacroPercentages({
          protein: Math.round((proteinCals / totalCals) * 100),
          carbs: Math.round((carbsCals / totalCals) * 100),
          fat: Math.round((fatCals / totalCals) * 100)
        });
      }
    }
  }, [tempTargets, targetCalories]);

  const handlePercentageChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    if (!targetCalories) return;

    // Ensure percentages add up to 100
    const newPercentages = { ...macroPercentages, [macro]: value };
    const total = newPercentages.protein + newPercentages.carbs + newPercentages.fat;
    
    if (total > 100) {
      // Adjust other macros proportionally
      const excess = total - 100;
      const otherMacros = Object.keys(newPercentages).filter(m => m !== macro) as ('protein' | 'carbs' | 'fat')[];
      const adjustment = excess / otherMacros.length;
      
      otherMacros.forEach(m => {
        newPercentages[m] = Math.max(0, newPercentages[m] - adjustment);
      });
    }

    setMacroPercentages(newPercentages);

    // Calculate gram amounts from percentages
    const proteinGrams = Math.round((targetCalories * (newPercentages.protein / 100)) / 4);
    const carbsGrams = Math.round((targetCalories * (newPercentages.carbs / 100)) / 4);
    const fatGrams = Math.round((targetCalories * (newPercentages.fat / 100)) / 9);

    setTempTargets({
      ...tempTargets,
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams
    });
  };

  const handleGramChange = (macro: keyof MacroTargets, value: number) => {
    setTempTargets({
      ...tempTargets,
      [macro]: value
    });
  };

  const handleSave = () => {
    onUpdateTargets(tempTargets);
    setIsEditing(false);
    trackEvent('custom_macro_targets_updated', tempTargets);
  };

  const handleCancel = () => {
    setTempTargets(currentTargets);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (!isPremiumUser) {
      onUpgradeClick();
      trackEvent('custom_macros_upgrade_prompt');
      return;
    }
    setIsEditing(true);
  };

  // Calculate calories from current macro targets
  const calculateCaloriesFromMacros = () => {
    return (tempTargets.protein * 4) + (tempTargets.carbs * 4) + (tempTargets.fat * 9);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-text-default">
          <i className="fas fa-sliders-h mr-2 text-teal-500"></i>
          Macro Targets
        </h3>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isPremiumUser
                ? 'bg-teal-500 hover:bg-teal-600 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
            }`}
          >
            {isPremiumUser ? (
              <>
                <i className="fas fa-edit mr-2"></i>
                Customize
              </>
            ) : (
              <>
                <i className="fas fa-crown mr-2"></i>
                Upgrade to Customize
              </>
            )}
          </button>
        )}
      </div>

      {!isPremiumUser && !isEditing && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <i className="fas fa-lock text-4xl text-gray-400 mb-2"></i>
            <p className="text-text-alt font-medium">Premium Feature</p>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6">
          {targetCalories && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <i className="fas fa-info-circle mr-2"></i>
                Adjusting percentages will automatically calculate gram amounts based on your {targetCalories} calorie target.
              </p>
            </div>
          )}

          {/* Percentage-based input */}
          {targetCalories && (
            <div className="space-y-4">
              <h4 className="font-semibold text-text-default">Adjust by Percentage</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="flex justify-between text-sm text-text-alt mb-1">
                    <span>Protein</span>
                    <span>{macroPercentages.protein}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={macroPercentages.protein}
                    onChange={(e) => handlePercentageChange('protein', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-500"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm text-text-alt mb-1">
                    <span>Carbohydrates</span>
                    <span>{macroPercentages.carbs}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    value={macroPercentages.carbs}
                    onChange={(e) => handlePercentageChange('carbs', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm text-text-alt mb-1">
                    <span>Fat</span>
                    <span>{macroPercentages.fat}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={macroPercentages.fat}
                    onChange={(e) => handlePercentageChange('fat', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-yellow-500"
                  />
                </div>
              </div>

              <div className="text-center text-sm text-text-alt">
                Total: {macroPercentages.protein + macroPercentages.carbs + macroPercentages.fat}%
              </div>
            </div>
          )}

          {/* Direct gram input */}
          <div className="space-y-4">
            <h4 className="font-semibold text-text-default">Or Set Exact Amounts</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-alt mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={tempTargets.protein}
                  onChange={(e) => handleGramChange('protein', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-alt mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={tempTargets.carbs}
                  onChange={(e) => handleGramChange('carbs', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-alt mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={tempTargets.fat}
                  onChange={(e) => handleGramChange('fat', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-alt mb-1">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tempTargets.fiber}
                  onChange={(e) => handleGramChange('fiber', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-text-alt">
                Total Calories from Macros: <span className="font-bold text-text-default">{calculateCaloriesFromMacros()}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition-all"
            >
              <i className="fas fa-save mr-2"></i>
              Save Targets
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {currentTargets.protein}g
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">Protein</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentTargets.carbs}g
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Carbs</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {currentTargets.fat}g
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Fat</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currentTargets.fiber}g
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Fiber</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMacroTargets;