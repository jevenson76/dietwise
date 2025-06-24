import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

interface MealIdeaRequest {
  calorieTarget: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietaryRestrictions?: string[];
  preferences?: string[];
}

interface UPCScanRequest {
  upc: string;
}

interface MealPlanRequest {
  dailyCalorieTarget: number;
  dietaryRestrictions?: string[];
  preferences?: string[];
  allergies?: string[];
  startDate?: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-preview-04-17',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });
  }

  async getMealIdeas(request: MealIdeaRequest) {
    try {
      const prompt = `Generate 3 healthy ${request.mealType} ideas targeting approximately ${request.calorieTarget} calories.
      ${request.dietaryRestrictions?.length ? `Dietary restrictions: ${request.dietaryRestrictions.join(', ')}` : ''}
      ${request.preferences?.length ? `Preferences: ${request.preferences.join(', ')}` : ''}
      
      Return as JSON array with format:
      [
        {
          "name": "Meal Name",
          "description": "Brief description",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "ingredients": ["ingredient1", "ingredient2"],
          "servingSize": "portion description"
        }
      ]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error generating meal ideas:', error);
      throw new Error('Failed to generate meal ideas');
    }
  }

  async getFoodInfoFromUPC(request: UPCScanRequest) {
    try {
      const { upc } = request;
      
      const prompt = `Search the web for nutritional information for a product with UPC ${upc}.
      Return ONLY a JSON object with this exact structure (no additional text):
      {
        "name": "Product Name",
        "brand": "Brand Name",
        "servingSize": "Serving Size Description",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number or null,
        "sugar": number or null,
        "sodium": number or null,
        "sources": ["source URLs"]
      }
      
      If the product cannot be found, return: {"error": "Product not found"}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const productInfo = JSON.parse(jsonMatch[0]);
      
      if (productInfo.error) {
        return null;
      }

      return productInfo;
    } catch (error) {
      logger.error('Error looking up UPC:', error);
      throw new Error('Failed to look up product information');
    }
  }

  async getSevenDayMealPlan(request: MealPlanRequest) {
    try {
      const prompt = `Create a comprehensive 7-day meal plan targeting ${request.dailyCalorieTarget} calories per day.
      ${request.dietaryRestrictions?.length ? `Dietary restrictions: ${request.dietaryRestrictions.join(', ')}` : ''}
      ${request.preferences?.length ? `Preferences: ${request.preferences.join(', ')}` : ''}
      ${request.allergies?.length ? `Allergies: ${request.allergies.join(', ')}` : ''}
      
      Return as JSON with format:
      {
        "weekPlan": [
          {
            "day": "Day Name",
            "date": "YYYY-MM-DD",
            "meals": {
              "breakfast": { "name": "...", "calories": ..., "protein": ..., "carbs": ..., "fat": ... },
              "lunch": { "name": "...", "calories": ..., "protein": ..., "carbs": ..., "fat": ... },
              "dinner": { "name": "...", "calories": ..., "protein": ..., "carbs": ..., "fat": ... },
              "snacks": [{ "name": "...", "calories": ... }]
            },
            "totalCalories": number,
            "totalProtein": number,
            "totalCarbs": number,
            "totalFat": number
          }
        ],
        "shoppingList": {
          "proteins": ["item1", "item2"],
          "produce": ["item1", "item2"],
          "dairy": ["item1", "item2"],
          "grains": ["item1", "item2"],
          "pantry": ["item1", "item2"]
        }
      }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error generating meal plan:', error);
      throw new Error('Failed to generate meal plan');
    }
  }
}

// Singleton instance
let geminiService: GeminiService | null = null;

export const getGeminiService = () => {
  if (!geminiService) {
    geminiService = new GeminiService();
  }
  return geminiService;
};