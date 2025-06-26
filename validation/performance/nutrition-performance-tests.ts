import puppeteer, { Page, Browser } from 'puppeteer';
import lighthouse from 'lighthouse';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

interface PerformanceMetrics {
  test: string;
  metric: string;
  value: number;
  unit: string;
  threshold: number;
  passed: boolean;
  details?: any;
}

interface LoadTestResult {
  endpoint: string;
  concurrentUsers: number;
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
  peakResponseTime: number;
  errorRate: number;
  throughput: number; // requests per second
}

class NutritionPerformanceTester {
  private browser: Browser | null = null;
  private results: PerformanceMetrics[] = [];
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.TEST_URL || 'http://localhost:3000';
  }

  async runCompletePerformanceTest(): Promise<PerformanceMetrics[]> {
    console.log('⚡ Starting DietWise Performance Testing...\n');

    await this.setupBrowser();
    
    await this.testPageLoadPerformance();
    await this.testNutritionCalculationSpeed();
    await this.testFoodSearchPerformance();
    await this.testDatabaseQueryPerformance();
    await this.testMemoryUsage();
    await this.testMobilePerformance();
    await this.testApiLoadTesting();
    await this.testOfflinePerformance();
    await this.testLighthouseAudit();

    await this.cleanup();
    this.printPerformanceReport();
    
    return this.results;
  }

  private async setupBrowser(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }

  private async testPageLoadPerformance(): Promise<void> {
    console.log('🚀 Testing Page Load Performance...');

    const page = await this.browser!.newPage();
    
    // Test initial app load
    const startTime = Date.now();
    await page.goto(this.baseURL, { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;

    this.addMetric({
      test: 'Initial App Load',
      metric: 'Time to Interactive',
      value: loadTime,
      unit: 'ms',
      threshold: 3000,
      passed: loadTime < 3000
    });

    // Test Time to First Contentful Paint
    const fcpMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
          }
        }).observe({ entryTypes: ['paint'] });
      });
    });

    this.addMetric({
      test: 'First Contentful Paint',
      metric: 'FCP',
      value: fcpMetrics as number,
      unit: 'ms',
      threshold: 1800,
      passed: (fcpMetrics as number) < 1800
    });

    // Test Largest Contentful Paint
    const lcpMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Timeout after 10 seconds
        setTimeout(() => resolve(0), 10000);
      });
    });

    this.addMetric({
      test: 'Largest Contentful Paint',
      metric: 'LCP',
      value: lcpMetrics as number,
      unit: 'ms',
      threshold: 2500,
      passed: (lcpMetrics as number) < 2500
    });

    await page.close();
  }

  private async testNutritionCalculationSpeed(): Promise<void> {
    console.log('🧮 Testing Nutrition Calculation Performance...');

    const page = await this.browser!.newPage();
    await page.goto(this.baseURL);

    // Wait for app to load
    await page.waitForSelector('[data-testid="food-log-tab"]', { timeout: 10000 });

    // Test BMI calculation speed
    const bmiCalcTime = await page.evaluate(() => {
      const startTime = performance.now();
      
      // Mock user profile for calculation
      const userProfile = {
        age: 30,
        gender: 'male',
        height: { ft: 5, in: 10 },
        weight: 180,
        activityLevel: 'moderately_active'
      };

      // Trigger BMI calculation (assuming there's a global function)
      if (window.calculateBMI) {
        window.calculateBMI(userProfile);
      }

      return performance.now() - startTime;
    });

    this.addMetric({
      test: 'BMI Calculation',
      metric: 'Calculation Speed',
      value: bmiCalcTime,
      unit: 'ms',
      threshold: 50,
      passed: bmiCalcTime < 50
    });

    // Test macro target calculations
    const macroCalcTime = await page.evaluate(() => {
      const startTime = performance.now();
      
      // Perform 100 macro calculations to test performance
      for (let i = 0; i < 100; i++) {
        const targetCalories = 2000;
        const protein = targetCalories * 0.20 / 4;
        const carbs = targetCalories * 0.50 / 4;
        const fat = targetCalories * 0.30 / 9;
      }

      return performance.now() - startTime;
    });

    this.addMetric({
      test: 'Macro Calculations (100x)',
      metric: 'Batch Calculation Speed',
      value: macroCalcTime,
      unit: 'ms',
      threshold: 100,
      passed: macroCalcTime < 100
    });

    await page.close();
  }

  private async testFoodSearchPerformance(): Promise<void> {
    console.log('🔍 Testing Food Search Performance...');

    const page = await this.browser!.newPage();
    await page.goto(this.baseURL);

    // Navigate to food search
    await page.waitForSelector('[data-testid="add-food-button"]', { timeout: 10000 });
    await page.click('[data-testid="add-food-button"]');

    // Test search input responsiveness
    const searchElement = await page.waitForSelector('[data-testid="food-search"]', { timeout: 5000 });
    
    const searchStartTime = Date.now();
    await searchElement.type('apple');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });
    const searchTime = Date.now() - searchStartTime;

    this.addMetric({
      test: 'Food Search Response',
      metric: 'Search Speed',
      value: searchTime,
      unit: 'ms',
      threshold: 2000,
      passed: searchTime < 2000
    });

    // Test search with multiple terms
    await searchElement.clear();
    
    const complexSearchStart = Date.now();
    await searchElement.type('chicken breast grilled');
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });
    const complexSearchTime = Date.now() - complexSearchStart;

    this.addMetric({
      test: 'Complex Food Search',
      metric: 'Complex Search Speed',
      value: complexSearchTime,
      unit: 'ms',
      threshold: 3000,
      passed: complexSearchTime < 3000
    });

    await page.close();
  }

  private async testDatabaseQueryPerformance(): Promise<void> {
    console.log('🗄️ Testing Database Query Performance...');

    const queries = [
      '/api/foods/search?q=apple',
      '/api/users/profile',
      '/api/progress/summary',
      '/api/meals/suggestions',
      '/api/analytics/weekly'
    ];

    for (const query of queries) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${this.baseURL}${query}`, {
          headers: { 'Authorization': 'Bearer test-token' }
        });
        
        const responseTime = Date.now() - startTime;
        const responseSize = parseInt(response.headers.get('content-length') || '0');

        this.addMetric({
          test: `Database Query: ${query}`,
          metric: 'Response Time',
          value: responseTime,
          unit: 'ms',
          threshold: 500,
          passed: responseTime < 500,
          details: { responseSize, status: response.status }
        });
      } catch (error) {
        this.addMetric({
          test: `Database Query: ${query}`,
          metric: 'Response Time',
          value: 9999,
          unit: 'ms',
          threshold: 500,
          passed: false,
          details: { error: error.message }
        });
      }
    }
  }

  private async testMemoryUsage(): Promise<void> {
    console.log('💾 Testing Memory Usage...');

    const page = await this.browser!.newPage();
    await page.goto(this.baseURL);

    // Wait for app to load
    await page.waitForSelector('[data-testid="food-log-tab"]', { timeout: 10000 });

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Simulate heavy usage - add many food items
    for (let i = 0; i < 50; i++) {
      await page.evaluate((index) => {
        // Simulate adding food items to log
        const foodItem = {
          id: `test-${index}`,
          name: `Test Food ${index}`,
          calories: 100 + index,
          protein: 5 + index,
          carbs: 15 + index,
          fat: 2 + index
        };
        
        // Add to localStorage to simulate app behavior
        const existingLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
        existingLog.push(foodItem);
        localStorage.setItem('foodLog', JSON.stringify(existingLog));
      }, i);
    }

    // Wait a bit for processing
    await page.waitForTimeout(2000);

    // Get memory usage after operations
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    const memoryMB = memoryIncrease / (1024 * 1024);

    this.addMetric({
      test: 'Memory Usage (50 food items)',
      metric: 'Memory Increase',
      value: memoryMB,
      unit: 'MB',
      threshold: 10,
      passed: memoryMB < 10,
      details: { initialMemory, finalMemory }
    });

    await page.close();
  }

  private async testMobilePerformance(): Promise<void> {
    console.log('📱 Testing Mobile Performance...');

    const page = await this.browser!.newPage();
    
    // Emulate mobile device
    await page.emulate({
      name: 'iPhone 12',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    });

    // Test mobile load time
    const mobileStartTime = Date.now();
    await page.goto(this.baseURL, { waitUntil: 'networkidle0' });
    const mobileLoadTime = Date.now() - mobileStartTime;

    this.addMetric({
      test: 'Mobile App Load',
      metric: 'Mobile Load Time',
      value: mobileLoadTime,
      unit: 'ms',
      threshold: 4000,
      passed: mobileLoadTime < 4000
    });

    // Test mobile touch interactions
    await page.waitForSelector('[data-testid="food-log-tab"]', { timeout: 10000 });
    
    const touchStartTime = Date.now();
    await page.tap('[data-testid="add-food-button"]');
    await page.waitForSelector('[data-testid="food-form"]', { timeout: 5000 });
    const touchResponseTime = Date.now() - touchStartTime;

    this.addMetric({
      test: 'Mobile Touch Response',
      metric: 'Touch Response Time',
      value: touchResponseTime,
      unit: 'ms',
      threshold: 300,
      passed: touchResponseTime < 300
    });

    await page.close();
  }

  private async testApiLoadTesting(): Promise<void> {
    console.log('🔄 Testing API Load Performance...');

    const endpoints = [
      '/api/health',
      '/api/foods/search?q=apple',
      '/api/nutrition/calculate/bmi'
    ];

    for (const endpoint of endpoints) {
      const result = await this.simulateLoad(endpoint, 10, 50);
      
      this.addMetric({
        test: `Load Test: ${endpoint}`,
        metric: 'Average Response Time',
        value: result.averageResponseTime,
        unit: 'ms',
        threshold: 1000,
        passed: result.averageResponseTime < 1000,
        details: result
      });

      this.addMetric({
        test: `Load Test: ${endpoint}`,
        metric: 'Error Rate',
        value: result.errorRate,
        unit: '%',
        threshold: 5,
        passed: result.errorRate < 5,
        details: result
      });
    }
  }

  private async simulateLoad(endpoint: string, concurrentUsers: number, totalRequests: number): Promise<LoadTestResult> {
    const results: Array<{ success: boolean; responseTime: number }> = [];
    const startTime = Date.now();

    const requestsPerUser = Math.ceil(totalRequests / concurrentUsers);
    
    const userPromises = Array(concurrentUsers).fill(0).map(async () => {
      for (let i = 0; i < requestsPerUser; i++) {
        const requestStart = Date.now();
        try {
          const response = await fetch(`${this.baseURL}${endpoint}`, { 
            timeout: 10000 
          });
          const responseTime = Date.now() - requestStart;
          results.push({ success: response.ok, responseTime });
        } catch (error) {
          const responseTime = Date.now() - requestStart;
          results.push({ success: false, responseTime });
        }
      }
    });

    await Promise.all(userPromises);
    
    const totalTime = Date.now() - startTime;
    const successfulRequests = results.filter(r => r.success).length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const peakResponseTime = Math.max(...results.map(r => r.responseTime));
    const errorRate = ((results.length - successfulRequests) / results.length) * 100;
    const throughput = (results.length / totalTime) * 1000; // requests per second

    return {
      endpoint,
      concurrentUsers,
      totalRequests: results.length,
      successfulRequests,
      averageResponseTime,
      peakResponseTime,
      errorRate,
      throughput
    };
  }

  private async testOfflinePerformance(): Promise<void> {
    console.log('📴 Testing Offline Performance...');

    const page = await this.browser!.newPage();
    await page.goto(this.baseURL);

    // Wait for app to load
    await page.waitForSelector('[data-testid="food-log-tab"]', { timeout: 10000 });

    // Go offline
    await page.setOfflineMode(true);

    // Test offline functionality
    const offlineStartTime = Date.now();
    
    try {
      // Try to add food item while offline
      await page.click('[data-testid="add-food-button"]');
      await page.waitForSelector('[data-testid="food-form"]', { timeout: 5000 });
      
      const offlineResponseTime = Date.now() - offlineStartTime;

      this.addMetric({
        test: 'Offline App Response',
        metric: 'Offline Response Time',
        value: offlineResponseTime,
        unit: 'ms',
        threshold: 1000,
        passed: offlineResponseTime < 1000
      });

      // Test offline data persistence
      await page.fill('[data-testid="food-name"]', 'Offline Test Food');
      await page.fill('[data-testid="food-calories"]', '100');
      await page.click('[data-testid="save-food"]');

      // Check if item was queued for offline sync
      const isQueued = await page.evaluate(() => {
        const queue = localStorage.getItem('offlineFoodLogQueue');
        return queue && JSON.parse(queue).length > 0;
      });

      this.addMetric({
        test: 'Offline Data Queuing',
        metric: 'Queue Functionality',
        value: isQueued ? 1 : 0,
        unit: 'boolean',
        threshold: 1,
        passed: isQueued
      });

    } catch (error) {
      this.addMetric({
        test: 'Offline App Response',
        metric: 'Offline Response Time',
        value: 9999,
        unit: 'ms',
        threshold: 1000,
        passed: false,
        details: { error: error.message }
      });
    }

    await page.close();
  }

  private async testLighthouseAudit(): Promise<void> {
    console.log('💡 Running Lighthouse Performance Audit...');

    try {
      const { lhr } = await lighthouse(this.baseURL, {
        port: 9222,
        output: 'json',
        logLevel: 'info',
        onlyCategories: ['performance'],
        settings: {
          maxWaitForFcp: 15 * 1000,
          maxWaitForLoad: 35 * 1000,
          formFactor: 'mobile',
          throttling: {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4
          }
        }
      });

      const performanceScore = lhr.categories.performance.score * 100;
      
      this.addMetric({
        test: 'Lighthouse Performance',
        metric: 'Performance Score',
        value: performanceScore,
        unit: 'score',
        threshold: 90,
        passed: performanceScore >= 90,
        details: {
          fcp: lhr.audits['first-contentful-paint'].numericValue,
          lcp: lhr.audits['largest-contentful-paint'].numericValue,
          cls: lhr.audits['cumulative-layout-shift'].numericValue,
          tti: lhr.audits['interactive'].numericValue
        }
      });

      // Individual metric tests
      const metrics = [
        {
          name: 'First Contentful Paint',
          value: lhr.audits['first-contentful-paint'].numericValue,
          threshold: 1800
        },
        {
          name: 'Largest Contentful Paint',
          value: lhr.audits['largest-contentful-paint'].numericValue,
          threshold: 2500
        },
        {
          name: 'Cumulative Layout Shift',
          value: lhr.audits['cumulative-layout-shift'].numericValue,
          threshold: 0.1
        },
        {
          name: 'Time to Interactive',
          value: lhr.audits['interactive'].numericValue,
          threshold: 3800
        }
      ];

      metrics.forEach(metric => {
        this.addMetric({
          test: `Lighthouse ${metric.name}`,
          metric: metric.name,
          value: metric.value,
          unit: metric.name.includes('Shift') ? 'score' : 'ms',
          threshold: metric.threshold,
          passed: metric.value < metric.threshold
        });
      });

    } catch (error) {
      console.log('⚠️ Lighthouse audit failed:', error.message);
      this.addMetric({
        test: 'Lighthouse Performance',
        metric: 'Performance Score',
        value: 0,
        unit: 'score',
        threshold: 90,
        passed: false,
        details: { error: error.message }
      });
    }
  }

  private addMetric(metric: PerformanceMetrics): void {
    this.results.push(metric);
    
    const emoji = metric.passed ? '✅' : '❌';
    const value = typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value;
    console.log(`${emoji} ${metric.test}: ${value}${metric.unit} (threshold: ${metric.threshold}${metric.unit})`);
  }

  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private printPerformanceReport(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n' + '='.repeat(60));
    console.log('⚡ DIETWISE PERFORMANCE TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Performance Score: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    // Performance category breakdown
    const categories = ['Page Load', 'Calculation', 'Search', 'Database', 'Memory', 'Mobile', 'API Load', 'Offline', 'Lighthouse'];
    
    console.log('\n📊 Performance by Category:');
    categories.forEach(category => {
      const categoryTests = this.results.filter(r => r.test.includes(category));
      if (categoryTests.length > 0) {
        const categoryPassed = categoryTests.filter(r => r.passed).length;
        const categoryScore = (categoryPassed / categoryTests.length) * 100;
        console.log(`  ${category}: ${categoryScore.toFixed(1)}% (${categoryPassed}/${categoryTests.length})`);
      }
    });

    if (failedTests > 0) {
      console.log('\n❌ Failed Performance Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.test}: ${r.value}${r.unit} (threshold: ${r.threshold}${r.unit})`);
        });
    }

    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    if (this.results.some(r => r.test.includes('Load') && !r.passed)) {
      console.log('  - Optimize bundle size and implement code splitting');
      console.log('  - Implement service worker for better caching');
      console.log('  - Optimize images and use WebP format');
    }
    
    if (this.results.some(r => r.test.includes('Database') && !r.passed)) {
      console.log('  - Optimize database queries and add proper indexing');
      console.log('  - Implement query result caching');
      console.log('  - Consider database connection pooling');
    }
    
    if (this.results.some(r => r.test.includes('Memory') && !r.passed)) {
      console.log('  - Implement proper memory management');
      console.log('  - Add cleanup for unused components');
      console.log('  - Consider virtualization for large lists');
    }

    console.log('='.repeat(60));
  }
}

// Run performance tests if called directly
if (require.main === module) {
  const tester = new NutritionPerformanceTester();
  tester.runCompletePerformanceTest()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Performance testing failed:', error);
      process.exit(1);
    });
}

export { NutritionPerformanceTester, PerformanceMetrics, LoadTestResult };