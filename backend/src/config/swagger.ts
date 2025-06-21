import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DietWise API',
      version: '1.0.0',
      description: 'DietWise Backend API Documentation',
      contact: {
        name: 'DietWise Team',
        email: 'support@dietwise.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.dietwise.com/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        HealthProfile: {
          type: 'object',
          required: ['age', 'sex', 'height', 'weight', 'activityLevel'],
          properties: {
            age: { type: 'number', minimum: 1, maximum: 120 },
            sex: { type: 'string', enum: ['male', 'female', 'other'] },
            height: {
              type: 'object',
              properties: {
                value: { type: 'number' },
                unit: { type: 'string', enum: ['cm', 'ft'] },
              },
            },
            weight: {
              type: 'object',
              properties: {
                value: { type: 'number' },
                unit: { type: 'string', enum: ['kg', 'lbs'] },
              },
            },
            activityLevel: {
              type: 'string',
              enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
            },
            targetWeight: {
              type: 'object',
              properties: {
                value: { type: 'number' },
                unit: { type: 'string', enum: ['kg', 'lbs'] },
              },
            },
            dietaryRestrictions: {
              type: 'array',
              items: { type: 'string' },
            },
            healthConditions: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        FoodLogEntry: {
          type: 'object',
          required: ['foodName', 'quantity', 'unit', 'calories', 'macros', 'mealType'],
          properties: {
            foodName: { type: 'string' },
            brand: { type: 'string' },
            barcode: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            calories: { type: 'number' },
            macros: {
              type: 'object',
              properties: {
                protein: { type: 'number' },
                carbs: { type: 'number' },
                fat: { type: 'number' },
                fiber: { type: 'number' },
                sugar: { type: 'number' },
              },
            },
            mealType: {
              type: 'string',
              enum: ['breakfast', 'lunch', 'dinner', 'snack'],
            },
            loggedAt: { type: 'string', format: 'date-time' },
          },
        },
        WeightEntry: {
          type: 'object',
          required: ['weight'],
          properties: {
            weight: {
              type: 'object',
              properties: {
                value: { type: 'number' },
                unit: { type: 'string', enum: ['kg', 'lbs'] },
              },
            },
            loggedAt: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export function setupSwagger(app: Express): void {
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}