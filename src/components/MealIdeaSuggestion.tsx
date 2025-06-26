import React from 'react';

interface MealIdeaSuggestionProps {
  calorieTarget: number | null;
  isProfileComplete: boolean;
  userName?: string | null;
  apiKeyMissing?: boolean;
  canGetMealSuggestion?: boolean;
  onMealSuggestion?: () => void;
  onUpgradeClick?: () => void;
  isPremiumUser?: boolean;
}

const MealIdeaSuggestion: React.FC<MealIdeaSuggestionProps> = ({
  calorieTarget,
  isProfileComplete,
  userName
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Meal Ideas</h2>
      
      {!isProfileComplete ? (
        <p className="text-gray-500 dark:text-gray-400">
          Complete your profile to get personalized meal suggestions.
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {userName ? `Hi ${userName}!` : 'Hello!'} Based on your target of {calorieTarget} calories per day,
            here are some meal ideas:
          </p>
          
          <div className="grid gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h3 className="font-semibold mb-2">Breakfast (400-500 cal)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Oatmeal with berries and nuts, Greek yogurt parfait, or eggs with whole grain toast
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h3 className="font-semibold mb-2">Lunch (500-600 cal)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Grilled chicken salad, quinoa bowl with vegetables, or turkey and avocado wrap
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h3 className="font-semibold mb-2">Dinner (600-700 cal)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Baked salmon with roasted vegetables, lean beef stir-fry, or vegetarian chili
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealIdeaSuggestion;