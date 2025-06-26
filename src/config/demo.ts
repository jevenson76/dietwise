// Demo configuration for GitHub Pages deployment

export const DEMO_CONFIG = {
  isDemo: process.env.NODE_ENV === 'production' && window.location.hostname === 'jevenson76.github.io',
  demoUser: {
    name: 'Demo User',
    age: 30,
    gender: 'male' as const,
    height: { ft: 5, in: 10 },
    weight: 180,
    activityLevel: 'moderately_active' as const,
    dietGoal: 'lose_weight' as const,
    targetWeight: 170,
    profileCreationDate: '2024-01-01',
    customMacroTargets: null,
    isPremium: false
  },
  demoFoodLog: [
    {
      id: '1',
      name: 'Banana',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14.4,
      servingSize: '1 medium',
      dateAdded: '2024-06-26T08:00:00.000Z',
      mealType: 'breakfast' as const
    },
    {
      id: '2',
      name: 'Chicken Breast',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      servingSize: '100g',
      dateAdded: '2024-06-26T12:30:00.000Z',
      mealType: 'lunch' as const
    },
    {
      id: '3',
      name: 'Brown Rice',
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      fiber: 3.5,
      sugar: 0.7,
      servingSize: '1 cup cooked',
      dateAdded: '2024-06-26T18:00:00.000Z',
      mealType: 'dinner' as const
    }
  ],
  demoWeightLog: [
    { id: '1', weight: 185, date: '2024-06-01T00:00:00.000Z', notes: 'Starting weight' },
    { id: '2', weight: 183, date: '2024-06-08T00:00:00.000Z', notes: 'Week 1 progress' },
    { id: '3', weight: 181, date: '2024-06-15T00:00:00.000Z', notes: 'Steady progress' },
    { id: '4', weight: 180, date: '2024-06-22T00:00:00.000Z', notes: 'Current weight' },
    { id: '5', weight: 179, date: '2024-06-26T00:00:00.000Z', notes: 'Recent weigh-in' }
  ],
  notifications: {
    welcome: 'Welcome to DietWise Demo! This is a demonstration version with sample data.',
    limitations: 'Demo Mode: Some features like AI suggestions and data sync are simulated.',
    upgrade: 'This is a demo. In the full version, you can sync data, get AI suggestions, and access premium features.'
  }
};

export const isDemoMode = () => DEMO_CONFIG.isDemo;

export const getDemoData = () => ({
  userProfile: DEMO_CONFIG.demoUser,
  foodLog: DEMO_CONFIG.demoFoodLog,
  weightLog: DEMO_CONFIG.demoWeightLog
});

// Mock API responses for demo mode
export const mockApiResponses = {
  searchFood: (query: string) => [
    { id: '1', name: `${query} (Demo)`, calories: 100, protein: 5, carbs: 15, fat: 2 },
    { id: '2', name: `Organic ${query}`, calories: 90, protein: 4, carbs: 18, fat: 1 },
    { id: '3', name: `${query} - Low Fat`, calories: 80, protein: 6, carbs: 12, fat: 1 }
  ],
  
  generateMealSuggestion: () => ({
    name: 'Demo Healthy Meal',
    description: 'A balanced meal suggestion for demonstration purposes',
    ingredients: ['Lean protein', 'Whole grains', 'Fresh vegetables'],
    calories: 450,
    protein: 35,
    carbs: 40,
    fat: 12,
    prepTime: '25 minutes'
  }),
  
  calculateNutrition: (userProfile: any) => ({
    bmi: 25.8,
    bmr: 1847,
    tdee: 2600,
    targetCalories: 2100,
    macros: {
      protein: 130,
      carbs: 210,
      fat: 70
    }
  })
};