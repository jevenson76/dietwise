export interface SmartSuggestion {
  id: string;
  name: string;
  category: string;
  confidence: number;
}

export interface FoodSuggestion {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export function getSmartSuggestions(query: string, existingItems: any[]): SmartSuggestion[] {
  // Basic implementation - can be enhanced with ML later
  const suggestions: SmartSuggestion[] = [];
  
  if (!query || query.length < 2) return suggestions;
  
  const commonFoods = [
    { name: 'Apple', category: 'Fruits' },
    { name: 'Banana', category: 'Fruits' },
    { name: 'Chicken Breast', category: 'Proteins' },
    { name: 'Rice', category: 'Grains' },
    { name: 'Broccoli', category: 'Vegetables' },
    { name: 'Eggs', category: 'Proteins' },
    { name: 'Milk', category: 'Dairy' },
    { name: 'Bread', category: 'Grains' },
    { name: 'Salmon', category: 'Proteins' },
    { name: 'Yogurt', category: 'Dairy' }
  ];
  
  const lowerQuery = query.toLowerCase();
  
  commonFoods.forEach((food, index) => {
    if (food.name.toLowerCase().includes(lowerQuery)) {
      suggestions.push({
        id: `suggestion-${index}`,
        name: food.name,
        category: food.category,
        confidence: food.name.toLowerCase().startsWith(lowerQuery) ? 0.9 : 0.7
      });
    }
  });
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
}

export function getSmartFoodSuggestions(targetCalories: number | null): FoodSuggestion[] {
  const hour = new Date().getHours();
  
  // Breakfast suggestions (5 AM - 11 AM)
  if (hour >= 5 && hour < 11) {
    return [
      { name: 'Oatmeal with Berries', calories: 250, protein: 8, carbs: 45, fat: 5 },
      { name: 'Greek Yogurt Parfait', calories: 200, protein: 15, carbs: 25, fat: 5 },
      { name: 'Scrambled Eggs & Toast', calories: 300, protein: 18, carbs: 25, fat: 15 }
    ];
  }
  
  // Lunch suggestions (11 AM - 3 PM)
  if (hour >= 11 && hour < 15) {
    return [
      { name: 'Grilled Chicken Salad', calories: 350, protein: 30, carbs: 20, fat: 15 },
      { name: 'Turkey Sandwich', calories: 400, protein: 25, carbs: 40, fat: 15 },
      { name: 'Quinoa Bowl', calories: 380, protein: 15, carbs: 50, fat: 12 }
    ];
  }
  
  // Dinner suggestions (5 PM - 9 PM)
  if (hour >= 17 && hour < 21) {
    return [
      { name: 'Salmon with Vegetables', calories: 450, protein: 35, carbs: 25, fat: 20 },
      { name: 'Chicken Stir-Fry', calories: 400, protein: 28, carbs: 35, fat: 15 },
      { name: 'Pasta Primavera', calories: 420, protein: 18, carbs: 55, fat: 12 }
    ];
  }
  
  // Snack suggestions (default)
  return [
    { name: 'Apple with Almond Butter', calories: 200, protein: 6, carbs: 25, fat: 10 },
    { name: 'Protein Bar', calories: 180, protein: 15, carbs: 20, fat: 7 },
    { name: 'Trail Mix', calories: 150, protein: 5, carbs: 15, fat: 10 }
  ];
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good morning! Time for a healthy breakfast 🌅";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon! Don't forget to stay hydrated 💧";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening! Ready for dinner? 🍽️";
  } else {
    return "Late night snacking? Choose wisely! 🌙";
  }
}