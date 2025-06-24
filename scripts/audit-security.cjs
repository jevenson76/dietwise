#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function auditSecurity() {
  console.log('🔍 DietWise Security Audit\n');
  
  const issues = [];
  const warnings = [];
  const passed = [];

  // Check for hardcoded credentials
  console.log('🔐 Checking for hardcoded credentials...');
  
  const searchPaths = [
    'src/',
    'backend/src/',
    'capacitor.config.ts',
    'vite.config.ts'
  ];

  const dangerousPatterns = [
    /sk_test_[a-zA-Z0-9]+/g,  // Stripe test keys
    /pk_test_[a-zA-Z0-9]+/g,  // Stripe publishable keys
    /AIzaSy[a-zA-Z0-9_-]+/g,  // Google API keys
    /(password|secret|key)\s*[:=]\s*["'][^"']+["']/gi,
    /eyJ[a-zA-Z0-9_-]+/g,     // JWT tokens
  ];

  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      await scanForCredentials(searchPath, dangerousPatterns, issues);
    }
  }

  // Check environment files
  console.log('📁 Checking environment files...');
  
  const envFiles = ['.env', 'backend/.env', '.env.local', '.env.production'];
  let hasEnvFile = false;
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      hasEnvFile = true;
      const content = fs.readFileSync(envFile, 'utf8');
      
      // Check for placeholder values
      if (content.includes('your-') || content.includes('placeholder') || content.includes('example')) {
        warnings.push(`${envFile} contains placeholder values`);
      }
      
      // Check for test keys in production
      if (envFile.includes('production') && content.includes('sk_test_')) {
        issues.push(`${envFile} contains test Stripe keys in production`);
      }
    }
  }
  
  if (hasEnvFile) {
    passed.push('Environment files exist');
  } else {
    issues.push('No environment files found');
  }

  // Check HTTPS configuration
  console.log('🔒 Checking HTTPS configuration...');
  
  const configFiles = ['vite.config.ts', 'backend/src/index.ts'];
  let httpsConfigured = false;
  
  for (const configFile of configFiles) {
    if (fs.existsSync(configFile)) {
      const content = fs.readFileSync(configFile, 'utf8');
      if (content.includes('https') || content.includes('ssl')) {
        httpsConfigured = true;
        break;
      }
    }
  }
  
  if (httpsConfigured) {
    passed.push('HTTPS configuration found');
  } else {
    warnings.push('No HTTPS configuration detected');
  }

  // Check for security headers
  console.log('🛡️ Checking security headers...');
  
  const backendIndex = 'backend/src/index.ts';
  if (fs.existsSync(backendIndex)) {
    const content = fs.readFileSync(backendIndex, 'utf8');
    
    if (content.includes('helmet')) {
      passed.push('Security headers (helmet) configured');
    } else {
      warnings.push('No security headers middleware found');
    }
    
    if (content.includes('cors')) {
      passed.push('CORS configuration found');
    } else {
      issues.push('No CORS configuration found');
    }
  }

  // Check for input validation
  console.log('✅ Checking input validation...');
  
  const routeFiles = fs.existsSync('backend/src/routes/') 
    ? fs.readdirSync('backend/src/routes/').filter(f => f.endsWith('.ts'))
    : [];
  
  let hasValidation = false;
  for (const routeFile of routeFiles) {
    const content = fs.readFileSync(`backend/src/routes/${routeFile}`, 'utf8');
    if (content.includes('zod') || content.includes('validator') || content.includes('joi')) {
      hasValidation = true;
      break;
    }
  }
  
  if (hasValidation) {
    passed.push('Input validation found in routes');
  } else {
    warnings.push('No input validation middleware detected');
  }

  // Check for rate limiting
  console.log('🚦 Checking rate limiting...');
  
  if (fs.existsSync('backend/src/index.ts')) {
    const content = fs.readFileSync('backend/src/index.ts', 'utf8');
    if (content.includes('rate-limit') || content.includes('rateLimit')) {
      passed.push('Rate limiting configured');
    } else {
      warnings.push('No rate limiting found');
    }
  }

  // Check package.json for known vulnerabilities
  console.log('📦 Checking dependencies...');
  
  const packageFiles = ['package.json', 'backend/package.json'];
  for (const packageFile of packageFiles) {
    if (fs.existsSync(packageFile)) {
      const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      
      // Check for potentially dangerous dependencies
      const dangerousDeps = ['eval', 'vm2', 'serialize-javascript'];
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      for (const dep of dangerousDeps) {
        if (allDeps[dep]) {
          warnings.push(`Potentially dangerous dependency: ${dep} in ${packageFile}`);
        }
      }
    }
  }

  // Check for console.log statements in production code
  console.log('🖨️ Checking for debug statements...');
  
  let consoleLogCount = 0;
  await scanForPattern('src/', /console\.log\(/g, (file, matches) => {
    consoleLogCount += matches.length;
  });
  
  if (consoleLogCount > 0) {
    warnings.push(`Found ${consoleLogCount} console.log statements in production code`);
  } else {
    passed.push('No console.log statements in production code');
  }

  // Generate report
  console.log('\n📊 SECURITY AUDIT REPORT\n');
  console.log('='.repeat(50));
  
  if (issues.length === 0) {
    console.log('🎉 No critical security issues found!');
  } else {
    console.log('🚨 CRITICAL ISSUES (Fix before production):');
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS (Recommended fixes):');
    warnings.forEach((warning, i) => console.log(`   ${i + 1}. ${warning}`));
  }
  
  if (passed.length > 0) {
    console.log('\n✅ PASSED CHECKS:');
    passed.forEach((pass, i) => console.log(`   ${i + 1}. ${pass}`));
  }
  
  console.log('\n' + '='.repeat(50));
  
  const score = Math.round((passed.length / (passed.length + warnings.length + issues.length)) * 100);
  console.log(`\n🎯 Security Score: ${score}%`);
  
  if (score >= 90) {
    console.log('🟢 Excellent security posture');
  } else if (score >= 70) {
    console.log('🟡 Good security, some improvements needed');
  } else {
    console.log('🔴 Security improvements required before production');
  }
  
  console.log('\n📋 Recommendations:');
  console.log('1. Fix all critical issues before deploying');
  console.log('2. Address warnings for better security');
  console.log('3. Run "npm audit" to check for vulnerable dependencies');
  console.log('4. Use environment variables for all sensitive data');
  console.log('5. Enable HTTPS in production');
  console.log('6. Implement proper logging and monitoring\n');
}

async function scanForCredentials(dir, patterns, issues) {
  const files = getAllFiles(dir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push(`Potential credential found in ${file}: ${matches[0].substring(0, 20)}...`);
      }
    }
  }
}

async function scanForPattern(dir, pattern, callback) {
  const files = getAllFiles(dir);
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const matches = Array.from(content.matchAll(pattern));
      if (matches.length > 0) {
        callback(file, matches);
      }
    } catch (err) {
      // Skip binary files or files that can't be read
    }
  }
}

function getAllFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  
  // Check if it's a file, not a directory
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    return [dir];
  }
  
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...getAllFiles(fullPath));
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.js') || item.name.endsWith('.tsx') || item.name.endsWith('.jsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

auditSecurity().catch(console.error);