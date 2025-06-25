
import React, { useState, useCallback, useRef } from 'react';
import { getSevenDayDietPlan, API_KEY_ERROR_MESSAGE } from '@services/geminiService';
import { trackEvent } from '@services/analyticsService'; 
import { SevenDayPlanResponse, DailyMealPlan, ShoppingListCategory, Meal, GroundingSource } from '@appTypes';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Alert from '@components/common/Alert';
import LoadingState from '@components/common/LoadingState';
import ErrorMessage, { ErrorTemplates } from '@components/common/ErrorMessage';
import { createContextualError } from '../utils/errorMessages';
import type { GroundingChunk } from '@google/genai';

interface MealPlannerComponentProps {
  calorieTarget: number | null;
  isProfileComplete: boolean;
  apiKeyStatus: 'checking' | 'ok' | 'missing'; // Keep for internal logic if needed
  apiKeyMissing: boolean; // New prop for explicit UI handling
  onPlanGenerated: (planName?: string) => void; 
}

interface CachedMealPlan {
  key: string;
  data: SevenDayPlanResponse;
  sources?: GroundingSource[]; 
  timestamp: number;
}

const CACHE_DURATION_MS_PLAN = 15 * 60 * 1000; // 15 minutes for meal plans

const MealCard: React.FC<{ mealName: string; meal: Meal; accentColor: string }> = ({ mealName, meal, accentColor }) => (
  <div className="mb-3">
    <h5 className={`font-semibold ${accentColor}`}>{mealName}</h5>
    <p className="text-sm text-text-default"><span className="font-medium">{meal.name}</span>: {meal.description}</p>
    {meal.calories && <p className="text-xs text-text-alt">~{meal.calories} kcal</p>}
  </div>
);

const DailyPlanCard: React.FC<{ dayPlan: DailyMealPlan }> = ({ dayPlan }) => (
  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg shadow-md mb-4 border border-border-default">
    <h4 className="text-lg font-semibold text-teal-700 dark:text-teal-400 mb-3 border-b border-slate-300 dark:border-slate-600 pb-2">
      Day {dayPlan.day} {dayPlan.dailyCalories ? <span className="text-sm font-normal text-text-alt">(~{dayPlan.dailyCalories} kcal)</span> : ''}
    </h4>
    <MealCard mealName="Breakfast" meal={dayPlan.meals.breakfast} accentColor="text-orange-600 dark:text-orange-400" />
    <MealCard mealName="Lunch" meal={dayPlan.meals.lunch} accentColor="text-lime-600 dark:text-lime-400" />
    <MealCard mealName="Dinner" meal={dayPlan.meals.dinner} accentColor="text-sky-600 dark:text-sky-400" />
    {dayPlan.meals.snacks && dayPlan.meals.snacks.length > 0 && (
      <div>
        <h5 className="font-semibold text-purple-600 dark:text-purple-400">Snacks</h5>
        {dayPlan.meals.snacks.map((snack, index) => (
          <p key={index} className="text-sm text-text-alt ml-2 mb-1">
            <span className="font-medium text-text-default">{snack.name}</span>: {snack.description} {snack.calories ? <span className="text-xs text-text-alt">(~{snack.calories} kcal)</span> : ''}
          </p>
        ))}
      </div>
    )}
  </div>
);

const MealPlannerComponent: React.FC<MealPlannerComponentProps> = ({ calorieTarget, isProfileComplete, apiKeyStatus, apiKeyMissing, onPlanGenerated }) => {
  const [planData, setPlanData] = useState<SevenDayPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState('');
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);

  const cachedPlanRef = useRef<CachedMealPlan | null>(null);

  const fetchPlan = useCallback(async () => {
    if (apiKeyMissing) { // Check the new prop first
        setError(API_KEY_ERROR_MESSAGE);
        trackEvent('meal_plan_fetch_failed_api_key_missing_prop');
        return;
    }
    if (!calorieTarget) {
      setError("Please complete your profile and set goals to generate a meal plan.");
      trackEvent('meal_plan_fetch_failed_no_target');
      return;
    }
    // apiKeyStatus check can remain for internal logic or if apiKeyMissing prop wasn't used
    if (apiKeyStatus === 'missing') { 
        setError("API Key is not configured. This feature is unavailable.");
        trackEvent('meal_plan_fetch_failed_no_api_key_status');
        return;
    }
    setIsLoading(true);
    setError(null);
    setPlanData(null); 
    setGroundingSources([]);
    trackEvent('meal_plan_fetch_started', { calorieTarget, preferences });

    const cacheKey = `mealPlan-${calorieTarget}-${preferences}`;
    const now = Date.now();

    if (cachedPlanRef.current && cachedPlanRef.current.key === cacheKey && (now - cachedPlanRef.current.timestamp < CACHE_DURATION_MS_PLAN)) {
      setPlanData(cachedPlanRef.current.data);
      setGroundingSources(cachedPlanRef.current.sources || []);
      setIsLoading(false);
      trackEvent('meal_plan_fetch_cache_hit', { calorieTarget, preferences });
      onPlanGenerated(`Cached Plan for ${calorieTarget} kcal`); 
      return;
    }

    try {
      const result = await getSevenDayDietPlan(calorieTarget, preferences);

      let processedSources: GroundingSource[] = [];
      if (result.sources) {
        processedSources = result.sources
          .filter((chunk): chunk is GroundingChunk & { web: { uri?: string; title?: string } } => chunk.web !== undefined)
          .map(chunk => ({ web: chunk.web! }));
      }
      setGroundingSources(processedSources); 

      if (result.planData) {
        setPlanData(result.planData);
        cachedPlanRef.current = { key: cacheKey, data: result.planData, sources: processedSources, timestamp: now };
        trackEvent('meal_plan_fetch_success', { calorieTarget, preferences });
        onPlanGenerated(`Plan for ${calorieTarget} kcal`); 
      } else {
        setError(result.error || "Failed to generate meal plan. Please try again.");
        trackEvent('meal_plan_fetch_error', { calorieTarget, preferences, error: result.error });
        cachedPlanRef.current = null; 
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred while generating the plan.";
      setError(errorMessage);
      trackEvent('meal_plan_fetch_exception', { calorieTarget, preferences, error: errorMessage });
      cachedPlanRef.current = null; 
    } finally {
      setIsLoading(false);
    }
  }, [calorieTarget, preferences, apiKeyStatus, apiKeyMissing, onPlanGenerated]);

  const inputClass = "mt-1 block w-full px-4 py-2.5 border border-border-default rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm placeholder-slate-400 bg-bg-card text-text-default dark:placeholder-slate-500";

  if (!isProfileComplete || !calorieTarget) {
    return (
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-4">
          <i className="fas fa-calendar-alt mr-2.5 text-sky-500 dark:text-sky-400"></i>7-Day Meal Plan & Shopping List
        </h2>
        <div className="bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-400 text-sky-700 dark:text-sky-300 p-4 rounded-md text-center" role="status">
          <p className="font-medium">
            <i className="fas fa-info-circle mr-2"></i>
            Complete your profile and set a weight goal to generate a personalized 7-day meal plan and shopping list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-2">
        <i className="fas fa-calendar-alt mr-2.5 text-sky-500 dark:text-sky-400"></i>AI 7-Day Meal Plan & Shopping List
      </h2>
      <p className="text-sm text-text-alt mb-6">Enter any dietary preferences and let AI craft a plan for your ~{calorieTarget} kcal target!</p>

      {apiKeyMissing && (
         <Alert type="warning" message={<><strong>7-Day Planner Disabled:</strong><br/>{API_KEY_ERROR_MESSAGE}</>} className="mb-4" />
      )}

      <div className="mb-5">
        <label htmlFor="planPreferences" className="block text-sm font-medium text-text-alt">
          Dietary Preferences or Foods to Include/Avoid (optional)
        </label>
        <input
          type="text"
          id="planPreferences"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          className={inputClass}
          placeholder="e.g., vegetarian, high protein, gluten-free, no mushrooms"
          maxLength={250}
          disabled={apiKeyMissing}
        />
        <p className="text-xs text-text-alt mt-1.5">Example: "vegetarian, loves spicy food, allergic to peanuts"</p>
      </div>
      <button
        onClick={fetchPlan}
        disabled={isLoading || !calorieTarget || apiKeyStatus !== 'ok' || apiKeyMissing}
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        aria-busy={isLoading}
      >
        {isLoading ? <LoadingSpinner size="sm" color="text-white" label="Generating plan"/> : <><i className="fas fa-magic fa-fw mr-2"></i>Generate Plan & List</>}
      </button>

      {apiKeyStatus === 'missing' && !apiKeyMissing && <Alert type="warning" message="Gemini API Key is missing or invalid. Plan generation is disabled." className="mt-4" />}
      {error && (
        <div className="mt-4">
          <ErrorMessage
            {...createContextualError('meal-generation', error, { item: 'meal plan' })}
            actions={[
              {
                label: 'Try Again',
                action: generatePlan,
                icon: 'fas fa-redo',
              },
              {
                label: 'Adjust Preferences',
                action: () => {
                  setError(null);
                  document.getElementById('planPreferences')?.focus();
                },
                variant: 'secondary',
              },
            ]}
            onClose={() => setError(null)}
            compact
          />
        </div>
      )}

      {isLoading && (
        <div className="mt-8" aria-live="polite">
          <LoadingState
            message="Creating Your Personalized Meal Plan"
            submessage="Analyzing your preferences and nutritional needs..."
            estimatedTime={15}
            steps={{
              current: 1,
              total: 3,
              currentStep: "Generating meal ideas"
            }}
            tips={[
              "Calculating balanced nutrition for each meal",
              "Ensuring variety across the week",
              "Creating your shopping list with quantities",
              "Considering your dietary preferences"
            ]}
            size="md"
          />
        </div>
      )}

      {planData && !isLoading && (
        <div className="mt-8 pt-6 border-t border-border-default">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-semibold text-text-default mb-4 pb-2 border-b-2 border-teal-500">
                <i className="fas fa-utensils mr-2 text-teal-600 dark:text-teal-400"></i>Your 7-Day Meal Plan
              </h3>
              <p className="text-sm text-text-alt mb-4">Here's a sample meal plan. Adjust portion sizes based on your specific needs and the provided calorie estimates.</p>
              <div className="space-y-5 max-h-[100vh] overflow-y-auto pr-3 -mr-1 custom-scrollbar">
                {planData.dailyPlans.map((dayPlan) => (
                  <DailyPlanCard key={dayPlan.day} dayPlan={dayPlan} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-text-default mb-4 pb-2 border-b-2 border-orange-500">
                <i className="fas fa-shopping-cart mr-2 text-orange-600 dark:text-orange-400"></i>Shopping List
              </h3>
              <div className="bg-orange-50 dark:bg-orange-800/30 p-4 rounded-lg shadow-md max-h-[100vh] overflow-y-auto pr-3 -mr-1 custom-scrollbar border border-orange-200 dark:border-orange-700">
                {planData.shoppingList.map((category, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <h4 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-2 capitalize">{category.category}</h4>
                    <ul className="list-disc list-inside space-y-1.5 pl-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-text-default">
                          <span className="font-medium">{item.name}</span>
                          {item.quantity && <span className="text-xs text-text-alt"> - {item.quantity}</span>}
                          {item.brandSuggestion && <span className="block text-xs text-text-alt italic ml-4"> Suggestion: {item.brandSuggestion}</span>}
                          {item.notes && <span className="block text-xs text-text-alt ml-4"> Note: {item.notes}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {groundingSources.length > 0 && (
            <div className="mt-8 p-3 bg-sky-50 dark:bg-sky-800/50 border border-sky-200 dark:border-sky-700 rounded-lg w-full text-xs">
              <h4 className="text-sm font-semibold text-sky-700 dark:text-sky-300 mb-1.5">Data Sources (from Google Search):</h4>
              <ul className="list-disc list-inside space-y-1">
                {groundingSources.map((source, index) => (
                  source.web.uri ? (
                    <li key={index}>
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline hover:text-sky-800 dark:hover:text-sky-300">
                        {source.web.title || source.web.uri}
                      </a>
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlannerComponent;