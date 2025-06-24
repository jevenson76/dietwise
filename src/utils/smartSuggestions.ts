export interface FoodSuggestion {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timeOfDay: string;
}

const breakfastSuggestions: FoodSuggestion[] = [
  { name: "Greek Yogurt with Berries", calories: 150, protein: 15, carbs: 20, fat: 2, servingSize: "1 cup", category: 'breakfast', timeOfDay: 'morning' },
  { name: "Oatmeal with Banana", calories: 200, protein: 6, carbs: 40, fat: 3, servingSize: "1 bowl", category: 'breakfast', timeOfDay: 'morning' },
  { name: "Scrambled Eggs (2)", calories: 180, protein: 12, carbs: 2, fat: 14, servingSize: "2 eggs", category: 'breakfast', timeOfDay: 'morning' },
  { name: "Avocado Toast", calories: 250, protein: 8, carbs: 30, fat: 15, servingSize: "1 slice", category: 'breakfast', timeOfDay: 'morning' },
  { name: "Smoothie (Banana, Spinach, Protein)", calories: 220, protein: 20, carbs: 25, fat: 5, servingSize: "1 cup", category: 'breakfast', timeOfDay: 'morning' },
];

const lunchSuggestions: FoodSuggestion[] = [
  { name: "Grilled Chicken Salad", calories: 300, protein: 35, carbs: 10, fat: 12, servingSize: "1 large bowl", category: 'lunch', timeOfDay: 'afternoon' },
  { name: "Turkey & Hummus Wrap", calories: 350, protein: 25, carbs: 40, fat: 12, servingSize: "1 wrap", category: 'lunch', timeOfDay: 'afternoon' },
  { name: "Quinoa Bowl with Vegetables", calories: 280, protein: 12, carbs: 45, fat: 8, servingSize: "1 bowl", category: 'lunch', timeOfDay: 'afternoon' },
  { name: "Tuna Salad Sandwich", calories: 320, protein: 22, carbs: 35, fat: 10, servingSize: "1 sandwich", category: 'lunch', timeOfDay: 'afternoon' },
  { name: "Vegetable Stir-fry with Rice", calories: 280, protein: 8, carbs: 50, fat: 8, servingSize: "1 bowl", category: 'lunch', timeOfDay: 'afternoon' },
];

const dinnerSuggestions: FoodSuggestion[] = [
  { name: "Grilled Salmon with Broccoli", calories: 350, protein: 30, carbs: 15, fat: 20, servingSize: "6oz + 1 cup", category: 'dinner', timeOfDay: 'evening' },
  { name: "Chicken Breast with Sweet Potato", calories: 380, protein: 35, carbs: 35, fat: 8, servingSize: "6oz + 1 medium", category: 'dinner', timeOfDay: 'evening' },
  { name: "Lean Beef with Asparagus", calories: 320, protein: 28, carbs: 8, fat: 18, servingSize: "5oz + 1 cup", category: 'dinner', timeOfDay: 'evening' },
  { name: "Vegetarian Pasta with Marinara", calories: 300, protein: 12, carbs: 55, fat: 6, servingSize: "1.5 cups", category: 'dinner', timeOfDay: 'evening' },
  { name: "Tofu Curry with Brown Rice", calories: 320, protein: 18, carbs: 45, fat: 10, servingSize: "1 bowl", category: 'dinner', timeOfDay: 'evening' },
];

const snackSuggestions: FoodSuggestion[] = [
  { name: "Apple with Almond Butter", calories: 180, protein: 6, carbs: 20, fat: 10, servingSize: "1 apple + 1 tbsp", category: 'snack', timeOfDay: 'any' },
  { name: "Protein Shake", calories: 150, protein: 25, carbs: 8, fat: 2, servingSize: "1 scoop", category: 'snack', timeOfDay: 'any' },
  { name: "Mixed Nuts (small handful)", calories: 170, protein: 6, carbs: 6, fat: 15, servingSize: "1 oz", category: 'snack', timeOfDay: 'any' },
  { name: "Greek Yogurt", calories: 100, protein: 17, carbs: 9, fat: 0, servingSize: "6 oz", category: 'snack', timeOfDay: 'any' },
  { name: "Hard-boiled Egg", calories: 70, protein: 6, carbs: 0, fat: 5, servingSize: "1 egg", category: 'snack', timeOfDay: 'any' },
];

export function getSmartFoodSuggestions(targetCalories?: number | null): FoodSuggestion[] {
  const currentHour = new Date().getHours();
  let suggestions: FoodSuggestion[] = [];

  // Determine meal type based on time of day
  if (currentHour >= 6 && currentHour < 11) {
    // Breakfast time (6 AM - 11 AM)
    suggestions = [...breakfastSuggestions];
  } else if (currentHour >= 11 && currentHour < 16) {
    // Lunch time (11 AM - 4 PM)
    suggestions = [...lunchSuggestions];
  } else if (currentHour >= 16 && currentHour < 22) {
    // Dinner time (4 PM - 10 PM)
    suggestions = [...dinnerSuggestions];
  } else {
    // Snack time (late night/early morning)
    suggestions = [...snackSuggestions];
  }

  // Add some snacks as additional options
  if (currentHour >= 6 && currentHour < 22) {
    suggestions.push(...snackSuggestions.slice(0, 2));
  }

  // Filter by calorie range if target is provided
  if (targetCalories) {
    const mealCalorieTarget = Math.round(targetCalories / 4); // Rough estimate for meal portion
    suggestions = suggestions.filter(food => 
      food.calories >= mealCalorieTarget * 0.5 && 
      food.calories <= mealCalorieTarget * 1.5
    );
  }

  // Shuffle and return top 6 suggestions
  return suggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);
}

export function getMealTypeByTime(): string {
  const currentHour = new Date().getHours();
  
  if (currentHour >= 6 && currentHour < 11) {
    return 'breakfast';
  } else if (currentHour >= 11 && currentHour < 16) {
    return 'lunch'; 
  } else if (currentHour >= 16 && currentHour < 22) {
    return 'dinner';
  } else {
    return 'snack';
  }
}

export function getTimeBasedGreeting(userName?: string | null): string {
  const currentHour = new Date().getHours();
  const name = userName ? `, ${userName}` : '';
  
  if (currentHour >= 5 && currentHour < 12) {
    return `Good morning${name}! Ready for a healthy breakfast?`;
  } else if (currentHour >= 12 && currentHour < 17) {
    return `Good afternoon${name}! Time for a nutritious lunch?`;
  } else if (currentHour >= 17 && currentHour < 21) {
    return `Good evening${name}! Planning a wholesome dinner?`;
  } else {
    return `Hey${name}! Looking for a healthy snack?`;
  }
}