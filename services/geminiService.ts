import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import { ScannedFoodInfo, SevenDayPlanResponse } from "../types";
import { log } from '../src/services/loggingService';

const API_KEY = process.env.API_KEY;
export const API_KEY_ERROR_MESSAGE = "API Key not configured or invalid. AI-powered features are unavailable. Please ensure the API_KEY environment variable is set correctly by the application administrator.";
const MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR = "MISSING_API_KEY_RUNTIME_CONSTRUCTOR_DietWise";

if (!API_KEY || API_KEY === "MISSING_API_KEY" || API_KEY.length < 10 || API_KEY === MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR) {
  const message = `CRITICAL DietWise SETUP ERROR: The Gemini API Key is not configured or is the placeholder value. AI features will not function. Please ensure the 'API_KEY' environment variable is correctly set in the deployment environment. Current key starts with: ${API_KEY ? API_KEY.substring(0,5) : 'undefined'}`;
  log.error(message, 'gemini-service', { apiKeyProvided: !!API_KEY, apiKeyLength: API_KEY?.length || 0 });
  // No throw here to allow app to load and show errors in UI
}

// Use a placeholder if API_KEY is truly missing at runtime for the constructor,
// but individual function calls will check and prevent actual API calls.
const ai = new GoogleGenAI({ apiKey: API_KEY || MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR });

const isApiKeyInvalid = () => !API_KEY || API_KEY === "MISSING_API_KEY" || API_KEY.length < 10 || API_KEY === MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR;

export const getMealIdeas = async (calorieTarget: number, preferences?: string): Promise<{ ideas: string | null; error?: string }> => {
  if (isApiKeyInvalid()) {
    log.warn('API key invalid for meal ideas request', 'gemini-service', { calorieTarget, hasPreferences: !!preferences });
    return { ideas: null, error: API_KEY_ERROR_MESSAGE };
  }
  
  log.time('getMealIdeas', 'gemini-service');
  log.info('Requesting meal ideas', 'gemini-service', { calorieTarget, hasPreferences: !!preferences });
  
  try {
    const prompt = `Suggest 3-4 healthy meal ideas for a day, totaling around ${calorieTarget} calories. ${preferences ? `Consider these preferences: ${preferences}.` : ''} Provide a brief description for each meal (breakfast, lunch, dinner, snack). Format the response as a list.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
    });
    
    log.timeEnd('getMealIdeas', 'gemini-service');
    log.info('Meal ideas request successful', 'gemini-service', { 
      responseLength: response.text?.length || 0,
      calorieTarget 
    });
    
    return { ideas: response.text ?? null, error: undefined };
  } catch (error: any) {
    log.timeEnd('getMealIdeas', 'gemini-service');
    log.error('Error fetching meal ideas from Gemini', 'gemini-service', { 
      error: error.message,
      calorieTarget,
      hasPreferences: !!preferences
    });
    return { ideas: null, error: error.message || "Sorry, we couldn't fetch meal ideas at this time. Please try again later." };
  }
};

export const getFoodInfoFromUPC = async (upc: string): Promise<{ foodInfo: ScannedFoodInfo | null; error?: string; sources?: GroundingChunk[] }> => {
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
