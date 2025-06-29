import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import { ScannedFoodInfo, SevenDayPlanResponse } from "../types";
import { log } from '../src/services/loggingService';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const API_KEY_ERROR_MESSAGE = "API Key not configured. Using mock data for testing purposes.";
const MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR = "MISSING_API_KEY_RUNTIME_CONSTRUCTOR_DietWise";

// Enable mock mode for testing when no API key is available
const USE_MOCK = !API_KEY || API_KEY === "MISSING_API_KEY" || API_KEY.length < 10 || API_KEY === MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR;

if (USE_MOCK) {
  const message = `Using mock Gemini service for testing. To enable real AI features, set the VITE_GEMINI_API_KEY environment variable.`;
  log.info(message, 'gemini-service', { useMock: true });
}

// Use a placeholder if API_KEY is truly missing at runtime for the constructor,
// but individual function calls will check and prevent actual API calls.
const ai = new GoogleGenAI({ apiKey: API_KEY || MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR });

const isApiKeyInvalid = () => !API_KEY || API_KEY === "MISSING_API_KEY" || API_KEY.length < 10 || API_KEY === MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR;

export const getMealIdeas = async (calorieTarget: number, preferences?: string): Promise<{ ideas: string | null; error?: string }> => {
  // Use mock data when no API key is available
  if (USE_MOCK) {
    const mockMealIdeas = {
      500: `**Breakfast Ideas (~500 calories):**

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
  - 1 tbsp olive oil for cooking (120 cal)`,
      700: `**Lunch Ideas (~700 calories):**

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
  - 2 tbsp hummus (70 cal)`,
      900: `**Dinner Ideas (~900 calories):**

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
  - 2 tbsp olive oil (240 cal)`
    };
    
    // Find closest calorie match
    const targets = Object.keys(mockMealIdeas).map(Number);
    const closest = targets.reduce((prev, curr) => 
      Math.abs(curr - calorieTarget) < Math.abs(prev - calorieTarget) ? curr : prev
    );
    
    const ideas = mockMealIdeas[closest as keyof typeof mockMealIdeas];
    const adjustedIdeas = preferences 
      ? `Based on your preference for "${preferences}":\n\n${ideas}`
      : ideas;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { ideas: adjustedIdeas };
  }
  
  // Original implementation for when API key is available
  log.time('getMealIdeas', 'gemini-service');
  log.info('Requesting meal ideas via backend API', 'gemini-service', { calorieTarget, hasPreferences: !!preferences });
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    const requestBody = {
      calorieTarget,
      mealType: 'dinner', // Default meal type
      preferences: preferences ? [preferences] : []
    };

    const response = await fetch(`${API_BASE_URL}/ai/meal-ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    log.timeEnd('getMealIdeas', 'gemini-service');
    log.info('Meal ideas request successful', 'gemini-service', { 
      responseLength: data.data?.length || 0,
      calorieTarget 
    });
    
    return { ideas: data.data ?? null, error: undefined };
  } catch (error: any) {
    log.timeEnd('getMealIdeas', 'gemini-service');
    log.error('Error fetching meal ideas from backend', 'gemini-service', { 
      error: error.message,
      calorieTarget,
      hasPreferences: !!preferences
    });
    return { ideas: null, error: error.message || "Sorry, we couldn't fetch meal ideas at this time. Please try again later." };
  }
};

export const getFoodInfoFromUPC = async (upc: string): Promise<{ foodInfo: ScannedFoodInfo | null; error?: string; sources?: GroundingChunk[] }> => {
  // Use mock data when no API key is available
  if (USE_MOCK) {
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
      },
      "456789012345": {
        name: "Brown Rice",
        brand: "Harvest Gold",
        servingSize: "1/4 cup dry (45g)",
        calories: 160,
        protein: 3,
        carbs: 34,
        fat: 1
      },
      "567890123456": {
        name: "Chicken Breast",
        brand: "Fresh Farms",
        servingSize: "4 oz (112g)",
        calories: 185,
        protein: 35,
        carbs: 0,
        fat: 4
      }
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foodInfo = mockUPCDatabase[upc];
    
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
  }
  
  if (isApiKeyInvalid()) {
    return { foodInfo: null, error: API_KEY_ERROR_MESSAGE };
  }
  try {
    const prompt = `Search the web for nutritional information for a product with UPC ${upc}. 
Provide its name, brand (if available), serving size (e.g., '100g' or '1 item'), calories per serving, protein (g) per serving, carbohydrates (g) per serving, and fat (g) per serving.
Present this information clearly.
If you cannot find specific nutritional details, state what you found and what is missing.
If the product itself cannot be identified from the UPC, respond with ONLY the text 'Product not found for this UPC'.
Otherwise, try to format your findings as a JSON-like structure within your text response, for example:
{
  "name": "Product Name",
  "brand": "Brand Name",
  "servingSize": "100g",
  "calories": 200,
  "protein": 10,
  "carbs": 30,
  "fat": 5
}
If some nutritional values are missing, omit them from the JSON structure or set them to null. Also include any textual description you found.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    const textResponse = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks || [];

    if (!textResponse) {
      return { foodInfo: null, error: "No response from AI service.", sources };
    }

    if (textResponse.includes("Product not found for this UPC")) {
      return { foodInfo: null, error: "Product information not found for this UPC.", sources };
    }

    const jsonRegex = /{\s*[\s\S]*?\s*}/m; 
    const match = textResponse.match(jsonRegex);

    if (match && match[0]) {
      try {
        let jsonStr = match[0];
        // Attempt to fix common JSON issues like trailing commas before closing braces/brackets
        jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1'); 

        const parsedData = JSON.parse(jsonStr) as ScannedFoodInfo;
        // Check for at least a name and one nutritional value to consider it valid
        if (parsedData.name && (parsedData.calories !== undefined || parsedData.protein !== undefined || parsedData.carbs !== undefined || parsedData.fat !== undefined)) {
           return { foodInfo: parsedData, sources };
        }
      } catch (e) {

        // Return a more generic "parsing issue" foodInfo object to indicate an attempt was made
        return { foodInfo: { name: "Product (parsing issue)", calories: undefined }, error: `Could not fully parse nutritional data. Details: ${textResponse.substring(0,150)}...`, sources };
      }
    }

    // If no JSON match or parsed JSON is invalid
    return { foodInfo: { name: "Product (data extraction issue)", calories: undefined }, error: `Could not extract structured data. Details: ${textResponse.substring(0,150)}...`, sources };

  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
    console.error("Error fetching food info from UPC via Gemini:", error);
    }
    const errorMessage = error.message || "Could not fetch food information for this UPC. Please try again.";
    return { foodInfo: null, error: errorMessage };
  }
};

export const getSevenDayDietPlan = async (
  calorieTarget: number, 
  preferences?: string
): Promise<{ planData: SevenDayPlanResponse | null; error?: string; sources?: GroundingChunk[] }> => {
  // Use mock data when no API key is available
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockPlan: SevenDayPlanResponse = {
      dailyPlans: [
        {
          day: 1,
          meals: {
            breakfast: { name: "Oatmeal with Berries", description: "Steel-cut oats with mixed berries and honey", calories: Math.round(calorieTarget * 0.25) },
            lunch: { name: "Grilled Chicken Salad", description: "Mixed greens with grilled chicken and vinaigrette", calories: Math.round(calorieTarget * 0.35) },
            dinner: { name: "Baked Salmon", description: "With roasted vegetables and quinoa", calories: Math.round(calorieTarget * 0.3) },
            snacks: [{ name: "Apple with Almond Butter", description: "1 medium apple with 2 tbsp almond butter", calories: Math.round(calorieTarget * 0.1) }]
          },
          dailyCalories: calorieTarget
        },
        {
          day: 2,
          meals: {
            breakfast: { name: "Greek Yogurt Parfait", description: "With granola and fresh fruit", calories: Math.round(calorieTarget * 0.25) },
            lunch: { name: "Turkey Wrap", description: "Whole wheat wrap with turkey and veggies", calories: Math.round(calorieTarget * 0.35) },
            dinner: { name: "Vegetable Stir-Fry", description: "With tofu and brown rice", calories: Math.round(calorieTarget * 0.3) },
            snacks: [{ name: "Carrot Sticks with Hummus", description: "Baby carrots with 2 tbsp hummus", calories: Math.round(calorieTarget * 0.1) }]
          },
          dailyCalories: calorieTarget
        },
        {
          day: 3,
          meals: {
            breakfast: { name: "Scrambled Eggs with Toast", description: "2 eggs with whole wheat toast", calories: Math.round(calorieTarget * 0.25) },
            lunch: { name: "Quinoa Bowl", description: "With roasted vegetables and tahini dressing", calories: Math.round(calorieTarget * 0.35) },
            dinner: { name: "Grilled Chicken Breast", description: "With sweet potato and green beans", calories: Math.round(calorieTarget * 0.3) },
            snacks: [{ name: "Mixed Nuts", description: "1/4 cup unsalted mixed nuts", calories: Math.round(calorieTarget * 0.1) }]
          },
          dailyCalories: calorieTarget
        },
        {
          day: 4,
          meals: {
            breakfast: { name: "Smoothie Bowl", description: "Protein smoothie with toppings", calories: Math.round(calorieTarget * 0.25) },
            lunch: { name: "Tuna Salad", description: "On mixed greens with olive oil dressing", calories: Math.round(calorieTarget * 0.35) },
            dinner: { name: "Beef Stir-Fry", description: "Lean beef with vegetables and rice", calories: Math.round(calorieTarget * 0.3) },
            snacks: [{ name: "Protein Bar", description: "Low sugar protein bar", calories: Math.round(calorieTarget * 0.1) }]
          },
          dailyCalories: calorieTarget
        },
        {
          day: 5,
          meals: {
            breakfast: { name: "Avocado Toast", description: "With poached egg on whole grain bread", calories: Math.round(calorieTarget * 0.25) },
            lunch: { name: "Lentil Soup", description: "With side salad", calories: Math.round(calorieTarget * 0.35) },
            dinner: { name: "Baked Cod", description: "With roasted potatoes and asparagus", calories: Math.round(calorieTarget * 0.3) },
            snacks: [{ name: "Greek Yogurt", description: "Plain with berries", calories: Math.round(calorieTarget * 0.1) }]
          },
          dailyCalories: calorieTarget
        },
        {
          day: 6,
          meals: {
            breakfast: { name: "Protein Pancakes", description: "With fresh fruit and maple syrup", calories: Math.round(calorieTarget * 0.25) },
            lunch: { name: "Chicken Caesar Salad", description: "With light dressing", calories: Math.round(calorieTarget * 0.35) },
            dinner: { name: "Turkey Meatballs", description: "With marinara sauce and zucchini noodles", calories: Math.round(calorieTarget * 0.3) },
            snacks: [{ name: "Rice Cakes", description: "With almond butter", calories: Math.round(calorieTarget * 0.1) }]
          },
          dailyCalories: calorieTarget
        },
        {
          day: 7,
          meals: {
            breakfast: { name: "Breakfast Burrito", description: "Eggs, beans, and veggies in whole wheat tortilla", calories: Math.round(calorieTarget * 0.25) },
            lunch: { name: "Mediterranean Bowl", description: "Falafel, hummus, and vegetables", calories: Math.round(calorieTarget * 0.35) },
            dinner: { name: "Grilled Steak", description: "With baked sweet potato and salad", calories: Math.round(calorieTarget * 0.3) },
            snacks: [{ name: "Trail Mix", description: "Nuts and dried fruit", calories: Math.round(calorieTarget * 0.1) }]
          },
          dailyCalories: calorieTarget
        }
      ],
      shoppingList: [
        {
          category: "Produce",
          items: [
            { name: "Mixed Berries", quantity: "2 lbs", brandSuggestion: "Fresh or frozen", notes: "For breakfast parfaits and oatmeal" },
            { name: "Bananas", quantity: "1 bunch", brandSuggestion: "Organic preferred", notes: "For smoothies and snacks" },
            { name: "Mixed Salad Greens", quantity: "2 bags", brandSuggestion: "Spring mix or baby spinach", notes: "For salads" },
            { name: "Carrots", quantity: "2 lbs", brandSuggestion: "Baby carrots for snacking", notes: "" },
            { name: "Sweet Potatoes", quantity: "4 medium", brandSuggestion: "Any variety", notes: "For dinners" }
          ]
        },
        {
          category: "Protein",
          items: [
            { name: "Chicken Breast", quantity: "2 lbs", brandSuggestion: "Organic free-range", notes: "For grilling" },
            { name: "Salmon Fillets", quantity: "1.5 lbs", brandSuggestion: "Wild-caught preferred", notes: "For baking" },
            { name: "Ground Turkey", quantity: "1 lb", brandSuggestion: "Lean 93/7", notes: "For meatballs" },
            { name: "Eggs", quantity: "1 dozen", brandSuggestion: "Free-range", notes: "For breakfast" },
            { name: "Greek Yogurt", quantity: "32 oz", brandSuggestion: "Plain, non-fat", notes: "" }
          ]
        },
        {
          category: "Pantry Staples",
          items: [
            { name: "Oatmeal", quantity: "1 container", brandSuggestion: "Steel-cut or rolled oats", notes: "" },
            { name: "Quinoa", quantity: "1 lb", brandSuggestion: "Any brand", notes: "" },
            { name: "Brown Rice", quantity: "2 lbs", brandSuggestion: "Long grain", notes: "" },
            { name: "Almond Butter", quantity: "1 jar", brandSuggestion: "Natural, no sugar added", notes: "" },
            { name: "Olive Oil", quantity: "1 bottle", brandSuggestion: "Extra virgin", notes: "For cooking and dressings" }
          ]
        }
      ]
    };
    
    if (preferences) {
      // Add a note about preferences to the first day
      mockPlan.dailyPlans[0].meals.breakfast.description += ` (adjusted for ${preferences})`;
    }
    
    return { planData: mockPlan };
  }
  
  if (isApiKeyInvalid()) {
    return { planData: null, error: API_KEY_ERROR_MESSAGE };
  }

  const prompt = `
Create a detailed 7-day meal plan targeting approximately ${calorieTarget} calories per day.
${preferences ? `Incorporate these dietary preferences: ${preferences}.` : ''}
For each day, provide meals for breakfast, lunch, dinner, and 1-2 healthy snacks. 
Include a name and a brief description for each meal item. Estimate calories for each meal if possible.

Additionally, generate a comprehensive shopping list for the entire 7-day plan. 
Categorize the shopping list (e.g., Produce, Protein, Dairy, Pantry Staples). 
For each item, suggest a quantity (e.g., "1kg", "2 cans", "1 loaf") and, if possible, mention common brand examples or types (e.g., "Quaker Oats", "Tyson Chicken Breast", "Barilla Whole Wheat Pasta", "Fage Total 0% Greek Yogurt"). If a specific brand isn't applicable, suggest a generic type like "Low-sodium soy sauce".

Return the entire response as a single JSON object with the following structure:
{
  "dailyPlans": [
    {
      "day": 1, 
      "meals": {
        "breakfast": { "name": "Meal Name", "description": "Details...", "calories": 300 },
        "lunch": { "name": "Meal Name", "description": "Details...", "calories": 500 },
        "dinner": { "name": "Meal Name", "description": "Details...", "calories": 700 },
        "snacks": [
          { "name": "Snack Name", "description": "Details...", "calories": 250 }
        ]
      },
      "dailyCalories": 1750 
    } 
  ],
  "shoppingList": [
    {
      "category": "Category Name", 
      "items": [
        { "name": "Item Name", "quantity": "Amount", "brandSuggestion": "Brand or Type", "notes": "Optional extra info" }
      ]
    }
  ]
}
Ensure the JSON is valid.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
      }
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks || [];
    let jsonStr = response.text?.trim() || '';

    // Remove markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr) as SevenDayPlanResponse;
      if (parsedData && parsedData.dailyPlans && parsedData.dailyPlans.length > 0 && parsedData.shoppingList) {
        return { planData: parsedData, sources };
      } else {

        return { planData: null, error: "Received plan data in an unexpected format. Please try again. Raw: " + (response.text?.substring(0,100) || 'No response'), sources };
      }
    } catch (e: any) {
      if (process.env.NODE_ENV !== 'production') {
      console.error("Failed to parse JSON response for meal plan:", e);
      }
       // Log the problematic text
      return { planData: null, error: `Failed to parse meal plan data. Please try again. Error: ${e.message}. Raw: ${response.text?.substring(0,100) || 'No response'}...`, sources };
    }

  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
    console.error("Error fetching 7-day diet plan from Gemini:", error);
    }
    const errorMessage = error.message || "Could not generate the 7-day meal plan. Please try again later.";
    return { planData: null, error: errorMessage };
  }
};
