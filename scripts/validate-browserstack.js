#!/usr/bin/env node

/**
 * BrowserStack Validation Script
 * Tests connection and validates credentials
 */

import https from 'https';

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || 'jasonevenson_4icqQp';
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || 'xJPz7rSNtBurqz5K6G5c';

function testBrowserStackConnection() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}`).toString('base64');
    
    const options = {
      hostname: 'api.browserstack.com',
      path: '/automate/plan.json',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

function getBrowserStackDevices() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}`).toString('base64');
    
    const options = {
      hostname: 'api.browserstack.com',
      path: '/automate/browsers.json',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function validateBrowserStack() {
  console.log('🧪 Validating BrowserStack Configuration...\n');
  
  console.log('📋 Configuration:');
  console.log(`   Username: ${BROWSERSTACK_USERNAME}`);
  console.log(`   Access Key: ${BROWSERSTACK_ACCESS_KEY.substring(0, 8)}...`);
  console.log('');

  try {
    // Test connection and get plan details
    console.log('🔌 Testing BrowserStack connection...');
    const planData = await testBrowserStackConnection();
    
    console.log('✅ Connection successful!');
    console.log(`   Plan: ${planData.automate_plan || 'Free'}`);
    console.log(`   Parallel Sessions: ${planData.parallel_sessions_running || 0}/${planData.parallel_sessions_max_allowed || 'N/A'}`);
    console.log(`   Team ID: ${planData.team_id || 'Personal'}`);
    console.log('');

    // Get available devices
    console.log('📱 Fetching available devices...');
    const devices = await getBrowserStackDevices();
    
    console.log('✅ Device list retrieved!');
    console.log(`   Total devices available: ${devices.length}`);
    
    // Filter and show relevant devices for DietWise testing
    const mobileDevices = devices.filter(d => d.device && d.real_mobile);
    const desktopBrowsers = devices.filter(d => !d.device && d.browser);
    
    console.log(`   Mobile devices: ${mobileDevices.length}`);
    console.log(`   Desktop browsers: ${desktopBrowsers.length}`);
    console.log('');

    // Show sample devices from our config
    console.log('🎯 Devices configured in browserstack.config.ts:');
    const configuredDevices = [
      'iPhone 14 Pro',
      'Samsung Galaxy S23', 
      'Google Pixel 7',
      'iPad Pro 12.9 2022',
      'Samsung Galaxy Tab S8'
    ];
    
    configuredDevices.forEach(deviceName => {
      const found = mobileDevices.find(d => 
        d.device && d.device.toLowerCase().includes(deviceName.toLowerCase().split(' ')[0])
      );
      const status = found ? '✅' : '⚠️';
      console.log(`   ${status} ${deviceName}`);
    });
    
    console.log('');
    console.log('🎉 BrowserStack validation complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npx playwright test --config=browserstack.config.ts');
    console.log('2. View results: https://app.browserstack.com/dashboard');
    console.log('3. Monitor usage in BrowserStack dashboard');
    
  } catch (error) {
    console.error('❌ BrowserStack validation failed:');
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Verify your credentials are correct');
    console.error('2. Check your BrowserStack account status');
    console.error('3. Ensure you have available parallel sessions');
    console.error('4. Visit: https://www.browserstack.com/accounts/subscriptions');
    
    process.exit(1);
  }
}

// Run validation
validateBrowserStack().catch(console.error);