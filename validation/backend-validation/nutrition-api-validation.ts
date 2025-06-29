import axios from 'axios';
import crypto from 'crypto';

interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
  duration?: number;
  details?: any;
}

interface NutritionAPIEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  timeout: number;
}

class NutritionAPIValidator {
  private baseURL: string;
  private apiKey: string;
  private results: ValidationResult[] = [];

  constructor() {
    this.baseURL = process.env.API_URL || 'http://localhost:3001';
    this.apiKey = process.env.API_KEY || '';
  }

  async validateAllEndpoints(): Promise<ValidationResult[]> {
    await this.validateHealthCheck();
    await this.validateAuthentication();
    await this.validateUserManagement();
    await this.validateFoodDatabase();
    await this.validateNutritionCalculations();
    await this.validateMealPlanning();
    await this.validateProgressTracking();
    await this.validateAIIntegration();
    await this.validateFileUpload();
    await this.validateSecurity();
    await this.validatePerformance();
    await this.validateDataIntegrity();

    this.printSummary();
    return this.results;
  }

  private async validateHealthCheck(): Promise<void> {

    
    const tests = [
      {
        name: 'API Health Check',
        endpoint: { url: '/health', method: 'GET' as const, expectedStatus: 200, timeout: 5000 }
      },
      {
        name: 'Database Connection',
        endpoint: { url: '/health/db', method: 'GET' as const, expectedStatus: 200, timeout: 10000 }
      },
      {
        name: 'External API Status',
        endpoint: { url: '/health/external', method: 'GET' as const, expectedStatus: 200, timeout: 15000 }
      }
    ];

    for (const test of tests) {
      await this.runEndpointTest(test.name, test.endpoint);
    }
  }

  private async validateAuthentication(): Promise<void> {
    // Test user registration
    const testUser = {
      email: `test-${Date.now()}@dietwise-test.com`,
      password: 'TestPass123!',
      name: 'Test User'
    };

    await this.runEndpointTest('User Registration', {
      url: '/auth/register',
      method: 'POST',
      body: testUser,
      expectedStatus: 201,
      timeout: 10000
    });

    // Test login
    await this.runEndpointTest('User Login', {
      url: '/auth/login',
      method: 'POST',
      body: { email: testUser.email, password: testUser.password },
      expectedStatus: 200,
      timeout: 10000
    });

    // Test invalid login
    await this.runEndpointTest('Invalid Login Rejection', {
      url: '/auth/login',
      method: 'POST',
      body: { email: testUser.email, password: 'wrongpassword' },
      expectedStatus: 401,
      timeout: 10000
    });

    // Test password reset
    await this.runEndpointTest('Password Reset Request', {
      url: '/auth/forgot-password',
      method: 'POST',
      body: { email: testUser.email },
      expectedStatus: 200,
      timeout: 10000
    });
  }

  private async validateUserManagement(): Promise<void> {
    const authToken = await this.getAuthToken();

    await this.runEndpointTest('Get User Profile', {
      url: '/users/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
      expectedStatus: 200,
      timeout: 5000
    });

    await this.runEndpointTest('Update User Profile', {
      url: '/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Updated Test User',
        age: 30,
        height: { ft: 5, in: 10 },
        weight: 180,
        activityLevel: 'moderately_active'
      },
      expectedStatus: 200,
      timeout: 10000
    });

    await this.runEndpointTest('Get User Preferences', {
      url: '/users/preferences',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
      expectedStatus: 200,
      timeout: 5000
    });
  }

  private async validateFoodDatabase(): Promise<void> {
    const authToken = await this.getAuthToken();

    await this.runEndpointTest('Search Foods', {
      url: '/foods/search?q=apple',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
      expectedStatus: 200,
      timeout: 10000
    });

    await this.runEndpointTest('Get Food by Barcode', {
      url: '/foods/barcode/123456789012',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
      expectedStatus: 200,
      timeout: 15000
    });

    await this.runEndpointTest('Add Custom Food', {
      url: '/foods/custom',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Test Custom Food',
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 2,
        servingSize: '1 cup'
      },
      expectedStatus: 201,
      timeout: 10000
    });

    await this.runEndpointTest('Get Nutrition Facts', {
      url: '/foods/123/nutrition',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
      expectedStatus: 200,
      timeout: 5000
    });
  }

  private async validateNutritionCalculations(): Promise<void> {
    const authToken = await this.getAuthToken();

    const userProfile = {
      age: 30,
      gender: 'male',
      height: { ft: 5, in: 10 },
      weight: 180,
      activityLevel: 'moderately_active',
      dietGoal: 'lose_weight'
    };

    await this.runEndpointTest('Calculate BMI', {
      url: '/nutrition/calculate/bmi',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: userProfile,
      expectedStatus: 200,
      timeout: 5000
    });

    await this.runEndpointTest('Calculate BMR', {
      url: '/nutrition/calculate/bmr',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: userProfile,
      expectedStatus: 200,
      timeout: 5000
    });

    await this.runEndpointTest('Calculate Daily Targets', {
      url: '/nutrition/targets',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: userProfile,
      expectedStatus: 200,
      timeout: 5000
    });

    await this.runEndpointTest('Validate Macro Ratios', {
      url: '/nutrition/validate-macros',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 2
      },
      expectedStatus: 200,
      timeout: 5000
    });
  }

  private async validateMealPlanning(): Promise<void> {
    const authToken = await this.getAuthToken();

    await this.runEndpointTest('Get Meal Plans', {
      url: '/meals/plans',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
      expectedStatus: 200,
      timeout: 10000
    });

    await this.runEndpointTest('Create Custom Meal', {
      url: '/meals/custom',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Test Meal',
        ingredients: [
          { foodId: '123', amount: 100 },
          { foodId: '456', amount: 50 }
        ]
      },
      expectedStatus: 201,
      timeout: 10000
    });

    await this.runEndpointTest('Generate Meal Suggestions', {
      url: '/meals/suggestions',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        targetCalories: 500,
        dietaryRestrictions: ['vegetarian'],
        mealType: 'lunch'
      },
      expectedStatus: 200,
      timeout: 20000
    });
  }

  private async validateProgressTracking(): Promise<void> {
    const authToken = await this.getAuthToken();

    await this.runEndpointTest('Log Food Entry', {
      url: '/progress/food-log',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        foodId: '123',
        amount: 100,
        mealType: 'breakfast',
        date: new Date().toISOString()
      },
      expectedStatus: 201,
      timeout: 10000
    });

    await this.runEndpointTest('Log Weight Entry', {
      url: '/progress/weight',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        weight: 179.5,
        date: new Date().toISOString()
      },
      expectedStatus: 201,
      timeout: 10000
    });

    await this.runEndpointTest('Get Progress Summary', {
      url: '/progress/summary',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
      expectedStatus: 200,
      timeout: 10000
    });

    await this.runEndpointTest('Export Progress Data', {
      url: '/progress/export',
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
      expectedStatus: 200,
      timeout: 15000
    });
  }

  private async validateAIIntegration(): Promise<void> {
    const authToken = await this.getAuthToken();

    await this.runEndpointTest('AI Meal Suggestion', {
      url: '/ai/suggest-meal',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        preferences: ['healthy', 'quick'],
        targetCalories: 500,
        availableIngredients: ['chicken', 'vegetables']
      },
      expectedStatus: 200,
      timeout: 30000
    });

    await this.runEndpointTest('Nutrition Analysis', {
      url: '/ai/analyze-nutrition',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        foodLog: [
          { name: 'Apple', calories: 95, protein: 0.5 },
          { name: 'Chicken Breast', calories: 165, protein: 31 }
        ]
      },
      expectedStatus: 200,
      timeout: 20000
    });
  }

  private async validateFileUpload(): Promise<void> {
    const authToken = await this.getAuthToken();

    // Mock image data
    const imageBuffer = Buffer.from('fake-image-data');

    await this.runEndpointTest('Upload Food Photo', {
      url: '/upload/food-photo',
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      },
      body: imageBuffer,
      expectedStatus: 200,
      timeout: 15000
    });

    await this.runEndpointTest('Upload Profile Picture', {
      url: '/upload/profile-picture',
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      },
      body: imageBuffer,
      expectedStatus: 200,
      timeout: 15000
    });
  }

  private async validateSecurity(): Promise<void> {
    // Test rate limiting
    await this.testRateLimit();
    
    // Test SQL injection protection
    await this.testSQLInjection();
    
    // Test XSS protection
    await this.testXSSProtection();
    
    // Test CORS configuration
    await this.testCORS();
    
    // Test authentication bypass attempts
    await this.testAuthBypass();
  }

  private async validatePerformance(): Promise<void> {
    const authToken = await this.getAuthToken();

    // Test concurrent requests
    const concurrentTests = Array(10).fill(null).map((_, i) => 
      this.runEndpointTest(`Concurrent Request ${i + 1}`, {
        url: '/health',
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
        expectedStatus: 200,
        timeout: 5000
      })
    );

    await Promise.all(concurrentTests);

    // Test large payload handling
    const largePayload = {
      foodLog: Array(1000).fill({
        name: 'Test Food',
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 2
      })
    };

    await this.runEndpointTest('Large Payload Handling', {
      url: '/progress/bulk-import',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: largePayload,
      expectedStatus: 200,
      timeout: 30000
    });
  }

  private async validateDataIntegrity(): Promise<void> {
    const authToken = await this.getAuthToken();

    // Test data validation
    await this.runEndpointTest('Invalid Nutrition Data Rejection', {
      url: '/foods/custom',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Invalid Food',
        calories: -100, // Invalid negative calories
        protein: 'invalid', // Invalid data type
        carbs: null
      },
      expectedStatus: 400,
      timeout: 5000
    });

    // Test data consistency
    await this.runEndpointTest('Macro Consistency Validation', {
      url: '/nutrition/validate-macros',
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        calories: 100,
        protein: 50, // 200 calories from protein alone
        carbs: 25,   // 100 calories from carbs
        fat: 10      // 90 calories from fat (total = 390 vs 100 declared)
      },
      expectedStatus: 400,
      timeout: 5000
    });
  }

  private async runEndpointTest(testName: string, endpoint: NutritionAPIEndpoint): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${this.baseURL}${endpoint.url}`,
        headers: endpoint.headers,
        data: endpoint.body,
        timeout: endpoint.timeout,
        validateStatus: () => true // Don't throw on any status code
      });

      const duration = Date.now() - startTime;
      const passed = response.status === endpoint.expectedStatus;

      this.results.push({
        test: testName,
        passed,
        message: passed 
          ? `✅ ${testName} passed (${duration}ms)`
          : `❌ ${testName} failed - Expected ${endpoint.expectedStatus}, got ${response.status}`,
        duration,
        details: {
          status: response.status,
          responseTime: duration,
          responseSize: JSON.stringify(response.data).length
        }
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        passed: false,
        message: `❌ ${testName} failed - ${error.message}`,
        duration,
        details: { error: error.message }
      });
    }
  }

  private async getAuthToken(): Promise<string> {
    // Mock auth token for testing
    return 'mock-jwt-token-for-testing';
  }

  private async testRateLimit(): Promise<void> {

    
    const requests = Array(20).fill(null).map(() => 
      axios.get(`${this.baseURL}/health`, { timeout: 5000 })
    );

    try {
      await Promise.all(requests);
      this.results.push({
        test: 'Rate Limiting',
        passed: false,
        message: '❌ Rate limiting not properly configured'
      });
    } catch (error) {
      this.results.push({
        test: 'Rate Limiting',
        passed: true,
        message: '✅ Rate limiting working correctly'
      });
    }
  }

  private async testSQLInjection(): Promise<void> {
    const maliciousPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users --"
    ];

    for (const payload of maliciousPayloads) {
      await this.runEndpointTest(`SQL Injection Protection (${payload.substring(0, 10)}...)`, {
        url: '/foods/search',
        method: 'GET',
        headers: { 'q': payload },
        expectedStatus: 400,
        timeout: 5000
      });
    }
  }

  private async testXSSProtection(): Promise<void> {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">'
    ];

    for (const payload of xssPayloads) {
      await this.runEndpointTest(`XSS Protection (${payload.substring(0, 10)}...)`, {
        url: '/users/profile',
        method: 'PUT',
        body: { name: payload },
        expectedStatus: 400,
        timeout: 5000
      });
    }
  }

  private async testCORS(): Promise<void> {
    await this.runEndpointTest('CORS Configuration', {
      url: '/health',
      method: 'OPTIONS',
      headers: { 
        'Origin': 'http://evil-site.com',
        'Access-Control-Request-Method': 'GET'
      },
      expectedStatus: 200,
      timeout: 5000
    });
  }

  private async testAuthBypass(): Promise<void> {
    await this.runEndpointTest('Protected Endpoint Access (No Auth)', {
      url: '/users/profile',
      method: 'GET',
      expectedStatus: 401,
      timeout: 5000
    });

    await this.runEndpointTest('Protected Endpoint Access (Invalid Token)', {
      url: '/users/profile',
      method: 'GET',
      headers: { Authorization: 'Bearer invalid-token' },
      expectedStatus: 401,
      timeout: 5000
    });
  }

  private printSummary(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    
    if (failedTests > 0) {

      this.results
        .filter(r => !r.passed)

    }
    
    const avgResponseTime = this.results
      .filter(r => r.duration)
      .reduce((sum, r) => sum + r.duration!, 0) / this.results.length;
    
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new NutritionAPIValidator();
  validator.validateAllEndpoints()
    .then(() => process.exit(0))
    .catch(error => {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Validation failed:', error);
      }
      process.exit(1);
    });
}

export { NutritionAPIValidator, ValidationResult };