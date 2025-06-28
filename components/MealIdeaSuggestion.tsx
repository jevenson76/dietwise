import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getMealIdeas, API_KEY_ERROR_MESSAGE } from '@services/geminiService';
import { trackEvent } from '@services/analyticsService'; 
import LoadingSpinner from '@components/common/LoadingSpinner';
import Alert from '@components/common/Alert';
import LoadingState from '@components/common/LoadingState';

interface MealIdeaSuggestionProps {
  calorieTarget: number | null;
  isProfileComplete: boolean;
  userName: string | null;
  apiKeyMissing: boolean; // New prop
  canGetMealSuggestion?: { allowed: boolean; remaining: number };
  onMealSuggestion?: () => void;
  onUpgradeClick?: () => void;
  isPremiumUser?: boolean;
}

interface CachedMealIdeas {
  key: string;
  data: string; 
  timestamp: number;
}

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const MealIdeaSuggestion: React.FC<MealIdeaSuggestionProps> = ({ 
  calorieTarget, 
  isProfileComplete, 
  userName, 
  apiKeyMissing,
  canGetMealSuggestion,
  onMealSuggestion,
  onUpgradeClick,
  isPremiumUser
}) => {
  const [ideas, setIdeas] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState('');
  const [selectedProtein, setSelectedProtein] = useState<string | null>(null);
  const [selectedDietType, setSelectedDietType] = useState<string | null>(null);

  const cachedIdeasRef = useRef<CachedMealIdeas | null>(null);

  const proteinOptions = [
    { value: 'chicken', label: 'Chicken', icon: 'fas fa-drumstick-bite' },
    { value: 'beef', label: 'Beef', icon: 'fas fa-hamburger' },
    { value: 'fish', label: 'Fish', icon: 'fas fa-fish' },
    { value: 'vegetarian', label: 'Vegetarian', icon: 'fas fa-leaf' },
    { value: 'tofu', label: 'Tofu/Soy', icon: 'fas fa-seedling' },
  ];

  const dietTypes = [
    { value: 'keto', label: 'Keto' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten-Free' },
  ];

  const fetchIdeas = useCallback(async () => {
    // Check premium limits
    if (canGetMealSuggestion && !canGetMealSuggestion.allowed) {
      setError('meal_limit_reached');
      trackEvent('meal_ideas_fetch_failed_limit_reached');
      return;
    }

    if (apiKeyMissing) {
      setError(API_KEY_ERROR_MESSAGE);
      trackEvent('meal_ideas_fetch_failed_api_key_missing');
      return;
    }
    if (!calorieTarget) {
      setError("Please complete your profile and set goals to get meal ideas.");
      trackEvent('meal_ideas_fetch_failed_no_target');
      return;
    }
    setIsLoading(true);
    setError(null);
    setIdeas(null); 
    
    // Combine preferences with selected protein and diet type
    const combinedPreferences = [
      preferences,
      selectedProtein,
      selectedDietType
    ].filter(Boolean).join(', ');
    
    trackEvent('meal_ideas_fetch_started', { calorieTarget, preferences: combinedPreferences });

    const cacheKey = `mealIdeas-${calorieTarget}-${combinedPreferences}`;
    const now = Date.now();

    if (cachedIdeasRef.current && cachedIdeasRef.current.key === cacheKey && (now - cachedIdeasRef.current.timestamp < CACHE_DURATION_MS)) {
      setIdeas(cachedIdeasRef.current.data);
      setIsLoading(false);
      trackEvent('meal_ideas_fetch_cache_hit', { calorieTarget, preferences });
      return;
    }

    try {
      const result = await getMealIdeas(calorieTarget, combinedPreferences);

      // Increment usage counter after successful API call
      if (onMealSuggestion && !result.error) {
        onMealSuggestion();
      }

      if (result.error) {
        setError(result.error);
        setIdeas(null);
        trackEvent('meal_ideas_fetch_error_api_issue', { calorieTarget, preferences: combinedPreferences, error: result.error });
      } else if (result.ideas) {
        setIdeas(result.ideas);
        cachedIdeasRef.current = { key: cacheKey, data: result.ideas, timestamp: now };
        trackEvent('meal_ideas_fetch_success', { calorieTarget, preferences: combinedPreferences, resultLength: result.ideas.length });
      } else {
        setError("Received no ideas or an unexpected response.");
        trackEvent('meal_ideas_fetch_empty', { calorieTarget, preferences: combinedPreferences });
      }
    } catch (err: any) { 
      const errorMessage = err.message || "An unexpected error occurred while fetching meal ideas.";
      setError(errorMessage);
      trackEvent('meal_ideas_fetch_exception', { calorieTarget, preferences: combinedPreferences, error: errorMessage });
      cachedIdeasRef.current = null; 
    } finally {
      setIsLoading(false);
    }
  }, [calorieTarget, preferences, selectedProtein, selectedDietType, apiKeyMissing, canGetMealSuggestion, onMealSuggestion]);

  const inputClass = "mt-1 block w-full px-4 py-2.5 border border-border-default rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm placeholder-slate-400 bg-bg-card text-text-default dark:placeholder-slate-500";
  const greeting = userName ? `Looking for inspiration, ${userName}?` : "Need some meal ideas?";

  if (!isProfileComplete || !calorieTarget) {
     return (
        <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-4">
                <i className="fas fa-lightbulb mr-2.5 text-yellow-500 dark:text-yellow-400"></i>Meal Ideas
            </h2>
            <div className="bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-400 text-sky-700 dark:text-sky-300 p-4 rounded-md text-center" role="status">
              <p className="font-medium">
                <i className="fas fa-info-circle mr-2"></i>
                Complete your profile and set a weight goal to get personalized meal ideas.
              </p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-2">
        <i className="fas fa-lightbulb mr-2.5 text-yellow-500 dark:text-yellow-400"></i>AI Meal Ideas
      </h2>
      <p className="text-sm text-text-alt mb-6">{greeting} Let's find some tasty options for your ~{calorieTarget} kcal target!</p>

      {apiKeyMissing && (
        <Alert type="warning" message={<><strong>Meal Ideas Disabled:</strong><br/>{API_KEY_ERROR_MESSAGE}</>} className="mb-4" />
      )}

      {/* Protein Selection */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-alt mb-2">
          Select Protein Type (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {proteinOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedProtein(selectedProtein === option.value ? null : option.value)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedProtein === option.value
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'bg-bg-card border-border-default hover:border-teal-400'
              }`}
              disabled={apiKeyMissing}
            >
              <i className={`${option.icon} mr-2`}></i>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Diet Type Selection */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-alt mb-2">
          Select Diet Type (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {dietTypes.map((diet) => (
            <button
              key={diet.value}
              onClick={() => setSelectedDietType(selectedDietType === diet.value ? null : diet.value)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                selectedDietType === diet.value
                  ? 'bg-cyan-500 text-white border-cyan-500'
                  : 'bg-bg-card border-border-default hover:border-cyan-400'
              }`}
              disabled={apiKeyMissing}
            >
              {diet.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="preferences" className="block text-sm font-medium text-text-alt">
          Dietary Preferences or Foods to Include/Avoid (optional)
        </label>
        <input
          type="text"
          id="preferences"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          className={inputClass}
          placeholder="e.g., vegetarian, high protein, no nuts"
          maxLength={200}
          disabled={apiKeyMissing}
        />
      </div>
      <button
        onClick={fetchIdeas}
        disabled={isLoading || !calorieTarget || apiKeyMissing || (canGetMealSuggestion && !canGetMealSuggestion.allowed)}
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        aria-busy={isLoading}
      >
        {isLoading ? <LoadingSpinner size="sm" color="text-white" label="Generating ideas"/> : (
          <>
            <i className="fas fa-wand-magic-sparkles fa-fw mr-2"></i>
            Suggest Meal Ideas
            {canGetMealSuggestion && !isPremiumUser && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                {canGetMealSuggestion.remaining} left
              </span>
            )}
          </>
        )}
      </button>
      {error && error !== 'meal_limit_reached' && <Alert type="error" message={error} onClose={() => setError(null)} className="mt-4" />}

      {isLoading && (
        <div className="mt-6">
          <LoadingState
            message="Crafting Personalized Meal Ideas"
            submessage={`Finding options around ${calorieTarget} calories${selectedProtein ? ` with ${selectedProtein}` : ''}${selectedDietType ? ` (${selectedDietType})` : ''}`}
            estimatedTime={8}
            tips={[
              "Analyzing nutritional balance...",
              "Considering your preferences...",
              "Finding creative combinations...",
              "Calculating accurate portions..."
            ]}
            size="sm"
          />
        </div>
      )}

      {error === 'meal_limit_reached' && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-lock text-yellow-600 dark:text-yellow-400 mr-3 mt-1"></i>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Daily Limit Reached</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You've used all {canGetMealSuggestion?.remaining === 0 ? 'your' : canGetMealSuggestion?.remaining} free meal suggestions for today.
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Upgrade to Premium for unlimited AI-powered meal suggestions!
              </p>
              <button
                onClick={onUpgradeClick}
                className="mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition-all text-sm"
              >
                <i className="fas fa-crown mr-2"></i>Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      )}
      {ideas && !isLoading && (
        <div className="mt-6 pt-4 border-t border-border-default">
          <h3 className="text-lg font-semibold text-text-default">Suggestions for ~{calorieTarget} kcal:</h3>
          <div className="mt-3 prose prose-sm max-w-none bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-text-default shadow-inner overflow-x-auto custom-scrollbar">
            <pre className="whitespace-pre-wrap font-sans text-sm">{ideas}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealIdeaSuggestion;