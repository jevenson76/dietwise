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

  
  try {
    // Test connection and get plan details

    const planData = await testBrowserStackConnection();
    
    // Get available devices

    const devices = await getBrowserStackDevices();
    
    
    // Filter and show relevant devices for DietWise testing
    const mobileDevices = devices.filter(d => d.device && d.real_mobile);
    const desktopBrowsers = devices.filter(d => !d.device && d.browser);
    
    // Show sample devices from our config

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

    });
    
    
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('❌ BrowserStack validation failed:');
    }
    if (process.env.NODE_ENV !== 'production') {
    console.error(`   Error: ${error.message}`);
    }
    if (process.env.NODE_ENV !== 'production') {
    console.error('');
    }
    if (process.env.NODE_ENV !== 'production') {
    console.error('Troubleshooting:');
    }
    if (process.env.NODE_ENV !== 'production') {
    console.error('1. Verify your credentials are correct');
    }
    if (process.env.NODE_ENV !== 'production') {
    console.error('2. Check your BrowserStack account status');
    }
    if (process.env.NODE_ENV !== 'production') {
    console.error('3. Ensure you have available parallel sessions');
    }
    if (process.env.NODE_ENV !== 'production') {
    console.error('4. Visit: https://www.browserstack.com/accounts/subscriptions');
    }
    
    process.exit(1);
  }
}

// Run validation
if (process.env.NODE_ENV !== 'production') {
validateBrowserStack().catch(console.error);
}