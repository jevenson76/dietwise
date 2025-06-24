export interface SmartSuggestion {
  id: string;
  name: string;
  category: string;
  confidence: number;
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