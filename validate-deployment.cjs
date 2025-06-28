#!/usr/bin/env node

/**
 * DietWise Deployment Validation Script
 * Tests all critical functionality of the deployed application
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  FRONTEND_URL: 'https://euphonious-moonbeam-b33115.netlify.app',
  BACKEND_URL: 'https://dietwise-backend.up.railway.app',
  API_BASE: 'https://dietwise-backend.up.railway.app/api/v1'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    
    const req = lib.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test functions
async function testFrontend() {
  log('\n🌐 Testing Frontend Deployment...', 'blue');
  
  try {
    const response = await makeRequest(CONFIG.FRONTEND_URL);
    
    if (response.statusCode === 200) {
      log('✅ Frontend is accessible', 'green');
      
      // Check for key elements
      const body = response.body;
      const checks = [
        { name: 'Title includes DietWise', test: body.includes('DietWise') },
        { name: 'Service Worker present', test: body.includes('serviceWorker') },
        { name: 'CSS assets loaded', test: body.includes('.css') },
        { name: 'JS assets loaded', test: body.includes('.js') },
        { name: 'React app structure', test: body.includes('id="root"') || body.includes('id="app"') }
      ];
      
      checks.forEach(check => {
        if (check.test) {
          log(`  ✅ ${check.name}`, 'green');
        } else {
          log(`  ❌ ${check.name}`, 'red');
        }
      });
      
      return true;
    } else {
      log(`❌ Frontend returned status ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Frontend test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testBackend() {
  log('\n🔧 Testing Backend API...', 'blue');
  
  const endpoints = [
    { url: `${CONFIG.BACKEND_URL}`, name: 'Root endpoint' },
    { url: `${CONFIG.API_BASE}/health`, name: 'Health check' },
    { url: `${CONFIG.API_BASE}/auth/health`, name: 'Auth health' }
  ];
  
  let passedTests = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.url);
      
      if (response.statusCode < 500) {
        log(`  ✅ ${endpoint.name} (${response.statusCode})`, 'green');
        passedTests++;
      } else {
        log(`  ❌ ${endpoint.name} (${response.statusCode})`, 'red');
      }
    } catch (error) {
      log(`  ❌ ${endpoint.name} - ${error.message}`, 'red');
    }
  }
  
  return passedTests > 0;
}

async function testCORS() {
  log('\n🔗 Testing CORS Configuration...', 'blue');
  
  try {
    // This is a basic test - in browser, CORS would be more thoroughly tested
    const response = await makeRequest(`${CONFIG.API_BASE}/health`);
    
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];
    
    let corsFound = false;
    corsHeaders.forEach(header => {
      if (response.headers[header]) {
        log(`  ✅ ${header}: ${response.headers[header]}`, 'green');
        corsFound = true;
      }
    });
    
    if (!corsFound) {
      log('  ⚠️  No CORS headers detected - may need configuration', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`  ❌ CORS test failed: ${error.message}`, 'red');
    return false;
  }
}

async function generateReport() {
  log('\n📊 Generating Deployment Report...', 'blue');
  
  const results = {
    frontend: await testFrontend(),
    backend: await testBackend(),
    cors: await testCORS(),
    timestamp: new Date().toISOString()
  };
  
  // Summary
  log('\n📋 DEPLOYMENT SUMMARY', 'blue');
  log('==================', 'blue');
  log(`Frontend URL: ${CONFIG.FRONTEND_URL}`);
  log(`Backend URL: ${CONFIG.BACKEND_URL}`);
  log(`Test Time: ${results.timestamp}`);
  
  const overallStatus = results.frontend && results.backend;
  log(`\nOverall Status: ${overallStatus ? '✅ DEPLOYED' : '❌ ISSUES DETECTED'}`, 
      overallStatus ? 'green' : 'red');
  
  // Recommendations
  log('\n💡 NEXT STEPS:', 'yellow');
  if (results.frontend && results.backend) {
    log('1. Test user registration manually');
    log('2. Verify Stripe integration works');
    log('3. Test AI meal suggestions');
    log('4. Check mobile responsiveness');
  } else {
    if (!results.frontend) {
      log('1. Check Netlify deployment logs');
      log('2. Verify build completed successfully');
    }
    if (!results.backend) {
      log('1. Check Railway deployment status');
      log('2. Verify environment variables are set');
      log('3. Check Railway logs for errors');
    }
  }
  
  return results;
}

// Start validation
async function main() {
  log('🚀 DietWise Deployment Validation', 'blue');
  log('=================================', 'blue');
  
  const results = await generateReport();
  
  // Create simple test server
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.url === '/status') {
      res.end(JSON.stringify(results, null, 2));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>DietWise Deployment Monitor</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .status { padding: 20px; margin: 10px 0; border-radius: 5px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; }
            .info { background: #d1ecf1; border: 1px solid #bee5eb; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>🚀 DietWise Deployment Monitor</h1>
          
          <div class="status ${results.frontend ? 'success' : 'error'}">
            <h3>Frontend Status: ${results.frontend ? '✅ Online' : '❌ Issues'}</h3>
            <p><a href="${CONFIG.FRONTEND_URL}" target="_blank">${CONFIG.FRONTEND_URL}</a></p>
          </div>
          
          <div class="status ${results.backend ? 'success' : 'error'}">
            <h3>Backend Status: ${results.backend ? '✅ Online' : '❌ Issues'}</h3>
            <p><a href="${CONFIG.BACKEND_URL}" target="_blank">${CONFIG.BACKEND_URL}</a></p>
          </div>
          
          <div class="status info">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="${CONFIG.FRONTEND_URL}" target="_blank">DietWise App</a></li>
              <li><a href="https://app.netlify.com/projects/euphonious-moonbeam-b33115/overview" target="_blank">Netlify Dashboard</a></li>
              <li><a href="https://railway.app" target="_blank">Railway Dashboard</a></li>
              <li><a href="https://dashboard.stripe.com" target="_blank">Stripe Dashboard</a></li>
              <li><a href="/status" target="_blank">API Status (JSON)</a></li>
            </ul>
          </div>
          
          <div class="status info">
            <h3>Last Checked: ${new Date(results.timestamp).toLocaleString()}</h3>
            <button onclick="location.reload()">Refresh Status</button>
          </div>
        </body>
        </html>
      `);
    }
  });
  
  const port = 8080;
  server.listen(port, () => {
    log(`\n🖥️  Test server running at http://localhost:${port}`, 'green');
    log('   View deployment status and quick links in your browser', 'green');
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { makeRequest, CONFIG };