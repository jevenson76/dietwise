import { ScannedFoodInfo, SevenDayPlanResponse } from "../types";

// Mock meal ideas data for testing
const mockMealIdeas = [
  {
    calories: 500,
    ideas: `**Breakfast Ideas (~500 calories):**

• **Classic Oatmeal Bowl**
  - 1 cup cooked oatmeal (150 cal)
  - 1 medium banana, sliced (105 cal)
  - 2 tbsp almond butter (190 cal)
  - 1 tsp honey (20 cal)
  - Dash of cinnamon

• **Veggie Scramble**
  - 2 large eggs (140 cal)
  - 1 cup mixed vegetables (30 cal)
  - 1 slice whole wheat toast (80 cal)
  - 1/2 avocado (120 cal)
  - 1 tbsp olive oil for cooking (120 cal)`
  },
  {
    calories: 700,
    ideas: `**Lunch Ideas (~700 calories):**

• **Grilled Chicken Salad**
  - 4 oz grilled chicken breast (185 cal)
  - 2 cups mixed greens (20 cal)
  - 1/4 cup feta cheese (90 cal)
  - 1/4 cup walnuts (165 cal)
  - 2 tbsp olive oil dressing (240 cal)

• **Turkey and Avocado Wrap**
  - Large whole wheat tortilla (120 cal)
  - 4 oz sliced turkey (120 cal)
  - 1/2 avocado (120 cal)
  - Lettuce, tomato, onion (20 cal)
  - 2 tbsp hummus (70 cal)
  - 1 oz cheese (110 cal)`
  },
  {
    calories: 900,
    ideas: `**Dinner Ideas (~900 calories):**

• **Salmon with Quinoa**
  - 6 oz grilled salmon (350 cal)
  - 1 cup cooked quinoa (220 cal)
  - 2 cups roasted vegetables (60 cal)
  - 2 tbsp olive oil (240 cal)
  - Side salad with dressing (30 cal)

• **Pasta Primavera**
  - 2 cups cooked whole wheat pasta (340 cal)
  - 1 cup mixed vegetables (30 cal)
  - 1/2 cup marinara sauce (50 cal)
  - 2 tbsp parmesan cheese (40 cal)
  - 2 tbsp olive oil (240 cal)
  - Garlic bread slice (200 cal)`
  }
];

// Mock UPC data
const mockUPCDatabase: { [key: string]: ScannedFoodInfo } = {
  "123456789012": {
    name: "Organic Greek Yogurt",
    brand: "Nature's Best",
    servingSize: "1 container (170g)",
    calories: 150,
    protein: 15,
    carbs: 12,
    fat: 5
  },
  "234567890123": {
    name: "Whole Grain Bread",
    brand: "Healthy Choice",
    servingSize: "1 slice (40g)",
    calories: 80,
    protein: 4,
    carbs: 15,
    fat: 1
  },
  "345678901234": {
    name: "Almond Butter",
    brand: "NutriSpread",
    servingSize: "2 tbsp (32g)",
    calories: 190,
    protein: 7,
    carbs: 8,
    fat: 16
  }
};

export const getMealIdeas = async (calorieTarget: number, preferences?: string): Promise<{ ideas: string | null; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find closest calorie match
  const closest = mockMealIdeas.reduce((prev, curr) => 
    Math.abs(curr.calories - calorieTarget) < Math.abs(prev.calories - calorieTarget) ? curr : prev
  );
  
  let ideas = closest.ideas;
  
  // Adjust ideas based on preferences if provided
  if (preferences) {
    ideas = `Based on your preference for "${preferences}":\n\n${ideas}`;
  }
  
  return { ideas };
};

export const scanBarcode = async (barcode: string): Promise<{ foodInfo: ScannedFoodInfo | null; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const foodInfo = mockUPCDatabase[barcode];
  
  if (foodInfo) {
    return { foodInfo };
  }
  
  // Return generic product for unknown barcodes
  return {
    foodInfo: {
      name: "Generic Product",
      brand: "Unknown Brand",
      servingSize: "1 serving",
      calories: 100,
      protein: 3,
      carbs: 15,
      fat: 4
    }
  };
};

export const generateSevenDayPlan = async (
  dailyCalories: number,
  dietaryRestrictions: string[] = [],
  preferences: string[] = []
): Promise<{ plan: SevenDayPlanResponse | null; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const plan: SevenDayPlanResponse = {
    days: [
      {
        day: "Monday",
        meals: {
          breakfast: { name: "Oatmeal with Berries", calories: 350, description: "Steel-cut oats with mixed berries and honey" },
          lunch: { name: "Grilled Chicken Salad", calories: 450, description: "Mixed greens with grilled chicken and vinaigrette" },
          dinner: { name: "Baked Salmon", calories: 550, description: "With roasted vegetables and quinoa" },
          snacks: [{ name: "Apple with Almond Butter", calories: 200, description: "1 medium apple with 2 tbsp almond butter" }]
        },
        totalCalories: 1550
      },
      {
        day: "Tuesday",
        meals: {
          breakfast: { name: "Greek Yogurt Parfait", calories: 300, description: "With granola and fresh fruit" },
          lunch: { name: "Turkey Wrap", calories: 500, description: "Whole wheat wrap with turkey and veggies" },
          dinner: { name: "Vegetable Stir-Fry", calories: 600, description: "With tofu and brown rice" },
          snacks: [{ name: "Carrot Sticks with Hummus", calories: 150, description: "Baby carrots with 2 tbsp hummus" }]
        },
        totalCalories: 1550
      }
    ],
    weekSummary: {
      averageDailyCalories: Math.round(dailyCalories),
      macroBreakdown: { protein: 30, carbs: 45, fat: 25 },
      tips: ["Stay hydrated", "Prep meals on Sunday", "Keep healthy snacks available"]
    }
  };
  
  return { plan };
};

// Export a check function for API key status
export const checkApiKey = (): 'valid' | 'missing' | 'invalid' => {
  return 'valid'; // Always return valid for mock
};

// Export error message for consistency
export const API_KEY_ERROR_MESSAGE = "Using mock data for testing - no API key required";