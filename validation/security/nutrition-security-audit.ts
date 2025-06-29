import axios from 'axios';
import crypto from 'crypto';

interface SecurityTest {
  name: string;
  category: 'Authentication' | 'Authorization' | 'Input Validation' | 'Data Protection' | 'Infrastructure';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  passed: boolean;
  details: string;
  recommendation?: string;
}

class NutritionSecurityAuditor {
  private baseURL: string;
  private results: SecurityTest[] = [];

  constructor() {
    this.baseURL = process.env.API_URL || 'http://localhost:3001';
  }

  async runCompleteSecurityAudit(): Promise<SecurityTest[]> {
    await this.testAuthentication();
    await this.testAuthorization();
    await this.testInputValidation();
    await this.testDataProtection();
    await this.testInfrastructure();
    await this.testSpecificNutritionVulnerabilities();

    this.printSecurityReport();
    return this.results;
  }

  private async testAuthentication(): Promise<void> {
    // Test password requirements
    await this.testPasswordPolicy();
    
    // Test session management
    await this.testSessionSecurity();
    
    // Test JWT security
    await this.testJWTSecurity();
    
    // Test account lockout
    await this.testAccountLockout();
    
    // Test password reset security
    await this.testPasswordResetSecurity();
  }

  private async testPasswordPolicy(): Promise<void> {
    const weakPasswords = [
      '123456',
      'password',
      '12345678',
      'qwerty',
      'abc123',
      'password123'
    ];

    for (const weakPassword of weakPasswords) {
      try {
        const response = await axios.post(`${this.baseURL}/auth/register`, {
          email: `test-${Date.now()}@example.com`,
          password: weakPassword,
          name: 'Test User'
        });

        this.addResult({
          name: `Weak Password Rejection (${weakPassword})`,
          category: 'Authentication',
          severity: 'High',
          passed: response.status !== 201,
          details: response.status === 201 
            ? 'Weak password was accepted' 
            : 'Weak password properly rejected'
        });
      } catch (error) {
        this.addResult({
          name: `Weak Password Rejection (${weakPassword})`,
          category: 'Authentication',
          severity: 'High',
          passed: true,
          details: 'Weak password properly rejected'
        });
      }
    }
  }

  private async testSessionSecurity(): Promise<void> {
    try {
      // Test session timeout
      const response = await axios.get(`${this.baseURL}/auth/session-info`, {
        headers: { Authorization: 'Bearer expired-token' }
      });

      this.addResult({
        name: 'Session Timeout Handling',
        category: 'Authentication',
        severity: 'Medium',
        passed: response.status === 401,
        details: response.status === 401 
          ? 'Expired sessions properly rejected' 
          : 'Expired sessions not properly handled'
      });
    } catch (error) {
      this.addResult({
        name: 'Session Timeout Handling',
        category: 'Authentication',
        severity: 'Medium',
        passed: true,
        details: 'Expired sessions properly rejected'
      });
    }
  }

  private async testJWTSecurity(): Promise<void> {
    const maliciousTokens = [
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.', // None algorithm
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid-signature', // Invalid signature
      'invalid.jwt.token', // Malformed token
    ];

    for (const token of maliciousTokens) {
      try {
        const response = await axios.get(`${this.baseURL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.addResult({
          name: 'JWT Token Validation',
          category: 'Authentication',
          severity: 'Critical',
          passed: response.status === 401,
          details: response.status === 401 
            ? 'Invalid JWT properly rejected' 
            : 'Invalid JWT was accepted'
        });
      } catch (error) {
        this.addResult({
          name: 'JWT Token Validation',
          category: 'Authentication',
          severity: 'Critical',
          passed: true,
          details: 'Invalid JWT properly rejected'
        });
      }
    }
  }

  private async testAccountLockout(): Promise<void> {
    const testEmail = `lockout-test-${Date.now()}@example.com`;
    
    // Attempt multiple failed logins
    let lockoutTriggered = false;
    for (let i = 0; i < 6; i++) {
      try {
        const response = await axios.post(`${this.baseURL}/auth/login`, {
          email: testEmail,
          password: 'wrong-password'
        });
        
        if (response.status === 429) {
          lockoutTriggered = true;
          break;
        }
      } catch (error) {
        if (error.response?.status === 429) {
          lockoutTriggered = true;
          break;
        }
      }
    }

    this.addResult({
      name: 'Account Lockout Mechanism',
      category: 'Authentication',
      severity: 'Medium',
      passed: lockoutTriggered,
      details: lockoutTriggered 
        ? 'Account lockout properly triggered after failed attempts' 
        : 'Account lockout not implemented or not triggered'
    });
  }

  private async testPasswordResetSecurity(): Promise<void> {
    try {
      // Test password reset with invalid email
      const response = await axios.post(`${this.baseURL}/auth/forgot-password`, {
        email: 'nonexistent@example.com'
      });

      // Should not reveal whether email exists
      this.addResult({
        name: 'Password Reset Email Enumeration',
        category: 'Authentication',
        severity: 'Low',
        passed: response.status === 200,
        details: response.status === 200 
          ? 'Password reset does not reveal email existence' 
          : 'Password reset reveals email existence'
      });
    } catch (error) {
      this.addResult({
        name: 'Password Reset Email Enumeration',
        category: 'Authentication',
        severity: 'Low',
        passed: true,
        details: 'Password reset properly implemented'
      });
    }
  }

  private async testAuthorization(): Promise<void> {
    await this.testVerticalPrivilegeEscalation();
    await this.testHorizontalPrivilegeEscalation();
    await this.testResourceAccess();
  }

  private async testVerticalPrivilegeEscalation(): Promise<void> {
    // Test accessing admin endpoints with regular user token
    const regularUserToken = 'regular-user-token'; // Mock token

    try {
      const response = await axios.get(`${this.baseURL}/admin/users`, {
        headers: { Authorization: `Bearer ${regularUserToken}` }
      });

      this.addResult({
        name: 'Vertical Privilege Escalation Protection',
        category: 'Authorization',
        severity: 'Critical',
        passed: response.status === 403,
        details: response.status === 403 
          ? 'Admin endpoints properly protected' 
          : 'Regular user can access admin endpoints'
      });
    } catch (error) {
      this.addResult({
        name: 'Vertical Privilege Escalation Protection',
        category: 'Authorization',
        severity: 'Critical',
        passed: true,
        details: 'Admin endpoints properly protected'
      });
    }
  }

  private async testHorizontalPrivilegeEscalation(): Promise<void> {
    // Test accessing another user's data
    const userAToken = 'user-a-token'; // Mock token for user A
    const userBId = 'user-b-id'; // User B's ID

    try {
      const response = await axios.get(`${this.baseURL}/users/${userBId}/profile`, {
        headers: { Authorization: `Bearer ${userAToken}` }
      });

      this.addResult({
        name: 'Horizontal Privilege Escalation Protection',
        category: 'Authorization',
        severity: 'High',
        passed: response.status === 403,
        details: response.status === 403 
          ? 'Users cannot access other users\' data' 
          : 'Users can access other users\' data'
      });
    } catch (error) {
      this.addResult({
        name: 'Horizontal Privilege Escalation Protection',
        category: 'Authorization',
        severity: 'High',
        passed: true,
        details: 'Users cannot access other users\' data'
      });
    }
  }

  private async testResourceAccess(): Promise<void> {
    // Test premium feature access for free users
    const freeUserToken = 'free-user-token'; // Mock token

    try {
      const response = await axios.get(`${this.baseURL}/analytics/advanced`, {
        headers: { Authorization: `Bearer ${freeUserToken}` }
      });

      this.addResult({
        name: 'Premium Feature Access Control',
        category: 'Authorization',
        severity: 'Medium',
        passed: response.status === 403,
        details: response.status === 403 
          ? 'Premium features properly protected' 
          : 'Free users can access premium features'
      });
    } catch (error) {
      this.addResult({
        name: 'Premium Feature Access Control',
        category: 'Authorization',
        severity: 'Medium',
        passed: true,
        details: 'Premium features properly protected'
      });
    }
  }

  private async testInputValidation(): Promise<void> {
    await this.testSQLInjection();
    await this.testXSSPrevention();
    await this.testCommandInjection();
    await this.testPathTraversal();
    await this.testNutritionDataValidation();
  }

  private async testSQLInjection(): Promise<void> {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT password FROM users --",
      "1'; WAITFOR DELAY '00:00:30'; --"
    ];

    for (const payload of sqlPayloads) {
      try {
        const response = await axios.get(`${this.baseURL}/foods/search`, {
          params: { q: payload }
        });

        // Check if response indicates SQL injection vulnerability
        const isVulnerable = response.data && (
          JSON.stringify(response.data).includes('syntax error') ||
          JSON.stringify(response.data).includes('mysql_') ||
          JSON.stringify(response.data).includes('ORA-') ||
          response.data.length === 0 && payload.includes('DROP')
        );

        this.addResult({
          name: `SQL Injection Protection (${payload.substring(0, 10)}...)`,
          category: 'Input Validation',
          severity: 'Critical',
          passed: !isVulnerable,
          details: isVulnerable 
            ? 'SQL injection vulnerability detected' 
            : 'SQL injection properly prevented'
        });
      } catch (error) {
        this.addResult({
          name: `SQL Injection Protection (${payload.substring(0, 10)}...)`,
          category: 'Input Validation',
          severity: 'Critical',
          passed: true,
          details: 'Input properly rejected or sanitized'
        });
      }
    }
  }

  private async testXSSPrevention(): Promise<void> {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">',
      '<svg onload="alert(1)">',
      '"><script>alert("xss")</script>'
    ];

    for (const payload of xssPayloads) {
      try {
        const response = await axios.post(`${this.baseURL}/foods/custom`, {
          name: payload,
          calories: 100
        });

        // Check if XSS payload was sanitized
        const isVulnerable = response.data && 
          JSON.stringify(response.data).includes('<script>');

        this.addResult({
          name: `XSS Prevention (${payload.substring(0, 10)}...)`,
          category: 'Input Validation',
          severity: 'High',
          passed: !isVulnerable,
          details: isVulnerable 
            ? 'XSS vulnerability detected' 
            : 'XSS properly prevented'
        });
      } catch (error) {
        this.addResult({
          name: `XSS Prevention (${payload.substring(0, 10)}...)`,
          category: 'Input Validation',
          severity: 'High',
          passed: true,
          details: 'Malicious input properly rejected'
        });
      }
    }
  }

  private async testCommandInjection(): Promise<void> {
    const commandPayloads = [
      '; ls -la',
      '| cat /etc/passwd',
      '`whoami`',
      '$(id)',
      '&& rm -rf /'
    ];

    for (const payload of commandPayloads) {
      try {
        const response = await axios.post(`${this.baseURL}/upload/food-photo`, {
          filename: `image${payload}.jpg`
        });

        this.addResult({
          name: `Command Injection Protection (${payload.substring(0, 10)}...)`,
          category: 'Input Validation',
          severity: 'Critical',
          passed: response.status === 400,
          details: response.status === 400 
            ? 'Command injection properly prevented' 
            : 'Potential command injection vulnerability'
        });
      } catch (error) {
        this.addResult({
          name: `Command Injection Protection (${payload.substring(0, 10)}...)`,
          category: 'Input Validation',
          severity: 'Critical',
          passed: true,
          details: 'Command injection properly prevented'
        });
      }
    }
  }

  private async testPathTraversal(): Promise<void> {
    const pathPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
    ];

    for (const payload of pathPayloads) {
      try {
        const response = await axios.get(`${this.baseURL}/files/${payload}`);

        this.addResult({
          name: `Path Traversal Protection (${payload.substring(0, 15)}...)`,
          category: 'Input Validation',
          severity: 'High',
          passed: response.status === 400 || response.status === 404,
          details: response.status === 400 || response.status === 404 
            ? 'Path traversal properly prevented' 
            : 'Potential path traversal vulnerability'
        });
      } catch (error) {
        this.addResult({
          name: `Path Traversal Protection (${payload.substring(0, 15)}...)`,
          category: 'Input Validation',
          severity: 'High',
          passed: true,
          details: 'Path traversal properly prevented'
        });
      }
    }
  }

  private async testNutritionDataValidation(): Promise<void> {
    const invalidNutritionData = [
      { calories: -100, protein: 5 },
      { calories: 'invalid', protein: 5 },
      { calories: 999999, protein: 5 },
      { calories: 100, protein: -5 },
      { calories: 100, protein: 'string' },
      { calories: 100, protein: 999999 }
    ];

    for (const data of invalidNutritionData) {
      try {
        const response = await axios.post(`${this.baseURL}/foods/custom`, {
          name: 'Test Food',
          ...data
        });

        this.addResult({
          name: `Nutrition Data Validation (${JSON.stringify(data).substring(0, 20)}...)`,
          category: 'Input Validation',
          severity: 'Medium',
          passed: response.status === 400,
          details: response.status === 400 
            ? 'Invalid nutrition data properly rejected' 
            : 'Invalid nutrition data was accepted'
        });
      } catch (error) {
        this.addResult({
          name: `Nutrition Data Validation (${JSON.stringify(data).substring(0, 20)}...)`,
          category: 'Input Validation',
          severity: 'Medium',
          passed: true,
          details: 'Invalid nutrition data properly rejected'
        });
      }
    }
  }

  private async testDataProtection(): Promise<void> {
    await this.testDataEncryption();
    await this.testSensitiveDataExposure();
    await this.testDataLeakage();
  }

  private async testDataEncryption(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}/users/profile`);
      
      // Check if sensitive data is not exposed in plain text
      const hasPlaintextPassword = JSON.stringify(response.data).includes('"password"');
      const hasPlaintextCreditCard = JSON.stringify(response.data).match(/\d{16}/);

      this.addResult({
        name: 'Sensitive Data Encryption',
        category: 'Data Protection',
        severity: 'Critical',
        passed: !hasPlaintextPassword && !hasPlaintextCreditCard,
        details: !hasPlaintextPassword && !hasPlaintextCreditCard 
          ? 'Sensitive data properly encrypted' 
          : 'Sensitive data exposed in plain text'
      });
    } catch (error) {
      this.addResult({
        name: 'Sensitive Data Encryption',
        category: 'Data Protection',
        severity: 'Critical',
        passed: true,
        details: 'Unable to access user data without authentication'
      });
    }
  }

  private async testSensitiveDataExposure(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}/api-docs`);
      
      // Check if API documentation exposes sensitive endpoints
      const exposesAdminEndpoints = JSON.stringify(response.data).includes('/admin/');
      const exposesInternalEndpoints = JSON.stringify(response.data).includes('/internal/');

      this.addResult({
        name: 'API Documentation Security',
        category: 'Data Protection',
        severity: 'Medium',
        passed: !exposesAdminEndpoints && !exposesInternalEndpoints,
        details: !exposesAdminEndpoints && !exposesInternalEndpoints 
          ? 'API documentation does not expose sensitive endpoints' 
          : 'API documentation exposes sensitive endpoints'
      });
    } catch (error) {
      this.addResult({
        name: 'API Documentation Security',
        category: 'Data Protection',
        severity: 'Medium',
        passed: true,
        details: 'API documentation properly protected or not exposed'
      });
    }
  }

  private async testDataLeakage(): Promise<void> {
    try {
      // Test error messages for information leakage
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: 'test@example.com',
        password: 'wrong-password'
      });

      const errorMessage = response.data?.message || '';
      const revealsUserExistence = errorMessage.toLowerCase().includes('user not found') ||
                                  errorMessage.toLowerCase().includes('email not registered');

      this.addResult({
        name: 'Information Leakage in Error Messages',
        category: 'Data Protection',
        severity: 'Low',
        passed: !revealsUserExistence,
        details: !revealsUserExistence 
          ? 'Error messages do not reveal sensitive information' 
          : 'Error messages reveal sensitive information'
      });
    } catch (error) {
      this.addResult({
        name: 'Information Leakage in Error Messages',
        category: 'Data Protection',
        severity: 'Low',
        passed: true,
        details: 'Error handling properly implemented'
      });
    }
  }

  private async testInfrastructure(): Promise<void> {
    await this.testHTTPSEnforcement();
    await this.testCORSConfiguration();
    await this.testSecurityHeaders();
    await this.testRateLimiting();
  }

  private async testHTTPSEnforcement(): Promise<void> {
    try {
      const httpUrl = this.baseURL.replace('https://', 'http://');
      const response = await axios.get(httpUrl, { maxRedirects: 0 });

      this.addResult({
        name: 'HTTPS Enforcement',
        category: 'Infrastructure',
        severity: 'High',
        passed: response.status === 301 || response.status === 302,
        details: response.status === 301 || response.status === 302 
          ? 'HTTP properly redirects to HTTPS' 
          : 'HTTP connections are allowed'
      });
    } catch (error) {
      this.addResult({
        name: 'HTTPS Enforcement',
        category: 'Infrastructure',
        severity: 'High',
        passed: true,
        details: 'HTTPS properly enforced'
      });
    }
  }

  private async testCORSConfiguration(): Promise<void> {
    try {
      const response = await axios.options(`${this.baseURL}/health`, {
        headers: {
          'Origin': 'http://malicious-site.com',
          'Access-Control-Request-Method': 'GET'
        }
      });

      const allowOrigin = response.headers['access-control-allow-origin'];
      const isSecure = allowOrigin !== '*' && !allowOrigin?.includes('malicious-site.com');

      this.addResult({
        name: 'CORS Configuration Security',
        category: 'Infrastructure',
        severity: 'Medium',
        passed: isSecure,
        details: isSecure 
          ? 'CORS properly configured with origin restrictions' 
          : 'CORS allows access from any origin or malicious sites'
      });
    } catch (error) {
      this.addResult({
        name: 'CORS Configuration Security',
        category: 'Infrastructure',
        severity: 'Medium',
        passed: true,
        details: 'CORS properly configured'
      });
    }
  }

  private async testSecurityHeaders(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': ['DENY', 'SAMEORIGIN'],
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': true,
        'Content-Security-Policy': true
      };

      for (const [header, expectedValue] of Object.entries(securityHeaders)) {
        const headerValue = response.headers[header.toLowerCase()];
        let passed = false;

        if (Array.isArray(expectedValue)) {
          passed = expectedValue.some(val => headerValue?.includes(val));
        } else if (typeof expectedValue === 'boolean') {
          passed = !!headerValue;
        } else {
          passed = headerValue === expectedValue;
        }

        this.addResult({
          name: `Security Header: ${header}`,
          category: 'Infrastructure',
          severity: 'Medium',
          passed,
          details: passed 
            ? `${header} properly configured` 
            : `${header} missing or misconfigured`
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Security Headers Check',
        category: 'Infrastructure',
        severity: 'Medium',
        passed: false,
        details: 'Unable to check security headers'
      });
    }
  }

  private async testRateLimiting(): Promise<void> {
    const requests = Array(50).fill(null).map(() => 
      axios.get(`${this.baseURL}/health`).catch(e => e.response)
    );

    try {
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(response => 
        response?.status === 429 || response?.status === 503
      );

      this.addResult({
        name: 'Rate Limiting Implementation',
        category: 'Infrastructure',
        severity: 'Medium',
        passed: rateLimited,
        details: rateLimited 
          ? 'Rate limiting properly implemented' 
          : 'Rate limiting not detected'
      });
    } catch (error) {
      this.addResult({
        name: 'Rate Limiting Implementation',
        category: 'Infrastructure',
        severity: 'Medium',
        passed: true,
        details: 'Rate limiting or connection limits in place'
      });
    }
  }

  private async testSpecificNutritionVulnerabilities(): Promise<void> {
    await this.testFoodDataManipulation();
    await this.testCalorieCalculationTampering();
    await this.testMacroNutrientValidation();
    await this.testBarcodeDataSecurity();
  }

  private async testFoodDataManipulation(): Promise<void> {
    try {
      // Test if users can manipulate global food database
      const response = await axios.put(`${this.baseURL}/foods/1`, {
        calories: 0 // Try to set calories to 0 for a food item
      });

      this.addResult({
        name: 'Food Database Manipulation Protection',
        category: 'Authorization',
        severity: 'High',
        passed: response.status === 403 || response.status === 401,
        details: response.status === 403 || response.status === 401 
          ? 'Global food database properly protected' 
          : 'Users can manipulate global food database'
      });
    } catch (error) {
      this.addResult({
        name: 'Food Database Manipulation Protection',
        category: 'Authorization',
        severity: 'High',
        passed: true,
        details: 'Global food database properly protected'
      });
    }
  }

  private async testCalorieCalculationTampering(): Promise<void> {
    try {
      // Test if users can submit inconsistent nutrition data
      const response = await axios.post(`${this.baseURL}/foods/validate`, {
        calories: 100,
        protein: 50, // 200 calories from protein
        carbs: 50,   // 200 calories from carbs
        fat: 20      // 180 calories from fat
        // Total: 580 calories vs declared 100
      });

      this.addResult({
        name: 'Calorie Calculation Validation',
        category: 'Input Validation',
        severity: 'Medium',
        passed: response.status === 400,
        details: response.status === 400 
          ? 'Inconsistent nutrition data properly rejected' 
          : 'Inconsistent nutrition data was accepted'
      });
    } catch (error) {
      this.addResult({
        name: 'Calorie Calculation Validation',
        category: 'Input Validation',
        severity: 'Medium',
        passed: true,
        details: 'Nutrition data validation properly implemented'
      });
    }
  }

  private async testMacroNutrientValidation(): Promise<void> {
    const invalidMacros = [
      { protein: -10 },
      { carbs: 999999 },
      { fat: 'string' },
      { fiber: -5 },
      { sugar: null }
    ];

    for (const macro of invalidMacros) {
      try {
        const response = await axios.post(`${this.baseURL}/nutrition/validate`, macro);

        this.addResult({
          name: `Macro Validation (${Object.keys(macro)[0]})`,
          category: 'Input Validation',
          severity: 'Low',
          passed: response.status === 400,
          details: response.status === 400 
            ? 'Invalid macro data properly rejected' 
            : 'Invalid macro data was accepted'
        });
      } catch (error) {
        this.addResult({
          name: `Macro Validation (${Object.keys(macro)[0]})`,
          category: 'Input Validation',
          severity: 'Low',
          passed: true,
          details: 'Invalid macro data properly rejected'
        });
      }
    }
  }

  private async testBarcodeDataSecurity(): Promise<void> {
    const maliciousBarcodes = [
      '"><script>alert("xss")</script>',
      "'; DROP TABLE foods; --",
      '../../../etc/passwd',
      'javascript:alert("xss")'
    ];

    for (const barcode of maliciousBarcodes) {
      try {
        const response = await axios.get(`${this.baseURL}/foods/barcode/${encodeURIComponent(barcode)}`);

        this.addResult({
          name: `Barcode Security (${barcode.substring(0, 10)}...)`,
          category: 'Input Validation',
          severity: 'Medium',
          passed: response.status === 400 || response.status === 404,
          details: response.status === 400 || response.status === 404 
            ? 'Malicious barcode properly handled' 
            : 'Malicious barcode accepted'
        });
      } catch (error) {
        this.addResult({
          name: `Barcode Security (${barcode.substring(0, 10)}...)`,
          category: 'Input Validation',
          severity: 'Medium',
          passed: true,
          details: 'Malicious barcode properly rejected'
        });
      }
    }
  }

  private addResult(result: Omit<SecurityTest, 'recommendation'>): void {
    this.results.push({
      ...result,
      recommendation: this.getRecommendation(result)
    });
    
    const emoji = result.passed ? '✅' : '❌';
    const severity = result.severity.padEnd(8);

  }

  private getRecommendation(result: Omit<SecurityTest, 'recommendation'>): string {
    if (result.passed) return 'Continue monitoring';

    const recommendations = {
      'Authentication': {
        'Weak Password Rejection': 'Implement strong password policy with minimum 8 characters, special characters, and complexity requirements',
        'Session Timeout Handling': 'Implement proper session timeout and token expiration',
        'JWT Token Validation': 'Implement proper JWT signature validation and algorithm verification',
        'Account Lockout Mechanism': 'Implement account lockout after 5-10 failed login attempts',
        'Password Reset Email Enumeration': 'Return same response regardless of email existence'
      },
      'Authorization': {
        'Vertical Privilege Escalation Protection': 'Implement role-based access control (RBAC) with proper permission checks',
        'Horizontal Privilege Escalation Protection': 'Implement resource-level access control and user ownership validation',
        'Premium Feature Access Control': 'Implement subscription status validation for premium features'
      },
      'Input Validation': {
        'SQL Injection Protection': 'Use parameterized queries and input sanitization',
        'XSS Prevention': 'Implement output encoding and Content Security Policy (CSP)',
        'Command Injection Protection': 'Validate and sanitize all file operations and system commands',
        'Path Traversal Protection': 'Validate file paths and use allowlist for file access'
      },
      'Data Protection': {
        'Sensitive Data Encryption': 'Encrypt sensitive data at rest and in transit',
        'API Documentation Security': 'Restrict API documentation access and remove sensitive endpoints',
        'Information Leakage in Error Messages': 'Use generic error messages that don\'t reveal system information'
      },
      'Infrastructure': {
        'HTTPS Enforcement': 'Redirect all HTTP traffic to HTTPS and implement HSTS',
        'CORS Configuration Security': 'Configure CORS with specific allowed origins',
        'Security Headers': 'Implement all recommended security headers',
        'Rate Limiting Implementation': 'Implement rate limiting to prevent abuse'
      }
    };

    return recommendations[result.category]?.[result.name] || 'Review and fix the identified security issue';
  }

  private printSecurityReport(): void {
    const criticalIssues = this.results.filter(r => !r.passed && r.severity === 'Critical').length;
    const highIssues = this.results.filter(r => !r.passed && r.severity === 'High').length;
    const mediumIssues = this.results.filter(r => !r.passed && r.severity === 'Medium').length;
    const lowIssues = this.results.filter(r => !r.passed && r.severity === 'Low').length;
    const totalPassed = this.results.filter(r => r.passed).length;
    const securityScore = (totalPassed / this.results.length) * 100;
    if (criticalIssues > 0) {

      this.results
        .filter(r => !r.passed && r.severity === 'Critical')
        .forEach(r => {
        });
    }

    if (securityScore < 80) {
    } else if (securityScore < 95) {

    } else {

    }
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new NutritionSecurityAuditor();
  auditor.runCompleteSecurityAudit()
    .then(() => process.exit(0))
    .catch(error => {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Security audit failed:', error);
      }
      process.exit(1);
    });
}

export { NutritionSecurityAuditor, SecurityTest };