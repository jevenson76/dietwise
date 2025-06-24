#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function productionSetup() {
  console.log('🚀 DietWise Production Setup Wizard\n');
  console.log('This wizard will help you set up production credentials and configuration.\n');

  const config = {
    phase: '',
    credentials: {},
    deployment: {},
    monitoring: {}
  };

  // Phase selection
  console.log('📋 Select setup phase:');
  console.log('1. Phase 1: Security & Credentials');
  console.log('2. Phase 2: Backend & Infrastructure');
  console.log('3. Phase 3: Mobile & Launch');
  console.log('4. Complete setup review\n');

  const phase = await question('Enter phase number (1-4): ');

  switch(phase) {
    case '1':
      await setupPhase1(config);
      break;
    case '2':
      await setupPhase2(config);
      break;
    case '3':
      await setupPhase3(config);
      break;
    case '4':
      await reviewSetup(config);
      break;
    default:
      console.log('Invalid selection. Exiting.');
      rl.close();
      return;
  }

  rl.close();
}

async function setupPhase1(config) {
  console.log('\n🔒 PHASE 1: SECURITY & CREDENTIALS\n');
  
  config.phase = 'phase1';
  
  // Generate secure secrets
  console.log('🔐 Generating secure secrets...');
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  
  console.log('✅ Secure secrets generated\n');

  // Collect production credentials
  console.log('📝 Enter production credentials:\n');
  
  config.credentials.SUPABASE_URL = await question('Supabase Production URL: ');
  config.credentials.SUPABASE_ANON_KEY = await question('Supabase Anon Key: ');
  config.credentials.SUPABASE_SERVICE_ROLE_KEY = await question('Supabase Service Role Key: ');
  
  config.credentials.GEMINI_API_KEY = await question('Gemini API Production Key: ');
  
  config.credentials.STRIPE_SECRET_KEY = await question('Stripe Live Secret Key (sk_live_...): ');
  config.credentials.STRIPE_PUBLISHABLE_KEY = await question('Stripe Live Publishable Key (pk_live_...): ');
  config.credentials.STRIPE_WEBHOOK_SECRET = await question('Stripe Webhook Secret (whsec_...): ');
  config.credentials.STRIPE_PRICE_ID_MONTHLY = await question('Monthly Price ID: ');
  config.credentials.STRIPE_PRICE_ID_YEARLY = await question('Yearly Price ID: ');
  
  // Domain configuration
  config.credentials.DOMAIN = await question('Production domain (e.g., dietwise.com): ');
  config.credentials.API_URL = `https://api.${config.credentials.DOMAIN}`;
  config.credentials.FRONTEND_URL = `https://${config.credentials.DOMAIN}`;
  
  // Use generated secrets
  config.credentials.JWT_SECRET = jwtSecret;
  config.credentials.JWT_REFRESH_SECRET = jwtRefreshSecret;
  config.credentials.SESSION_SECRET = sessionSecret;

  // Email configuration
  console.log('\n📧 Email Service Configuration:');
  const emailProvider = await question('Email provider (1=Resend, 2=SendGrid, 3=AWS SES): ');
  
  if (emailProvider === '1') {
    config.credentials.RESEND_API_KEY = await question('Resend API Key: ');
    config.credentials.EMAIL_FROM = await question('From email address: ');
  } else if (emailProvider === '2') {
    config.credentials.SENDGRID_API_KEY = await question('SendGrid API Key: ');
    config.credentials.EMAIL_FROM = await question('From email address: ');
  } else if (emailProvider === '3') {
    config.credentials.AWS_ACCESS_KEY_ID = await question('AWS Access Key ID: ');
    config.credentials.AWS_SECRET_ACCESS_KEY = await question('AWS Secret Access Key: ');
    config.credentials.AWS_REGION = await question('AWS Region: ');
    config.credentials.EMAIL_FROM = await question('From email address: ');
  }

  await saveProductionConfig(config);
  await generateProductionEnvFiles(config);
  
  console.log('\n✅ Phase 1 Complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Review generated .env.production files');
  console.log('2. Test all API connections');
  console.log('3. Move to Phase 2: Backend deployment');
}

async function setupPhase2(config) {
  console.log('\n🏗️ PHASE 2: BACKEND & INFRASTRUCTURE\n');
  
  // Load existing config
  const existingConfig = await loadProductionConfig();
  if (!existingConfig) {
    console.log('❌ Please complete Phase 1 first');
    return;
  }
  
  Object.assign(config, existingConfig);
  config.phase = 'phase2';

  console.log('🚀 Deployment Platform Selection:');
  console.log('1. Railway (Recommended - $5-20/month)');
  console.log('2. DigitalOcean App Platform ($12-25/month)');
  console.log('3. Vercel + Supabase ($0-50/month)');
  console.log('4. AWS/Docker (Advanced)\n');

  const platform = await question('Select platform (1-4): ');
  
  config.deployment.platform = platform;
  config.deployment.domain = config.credentials.DOMAIN;

  switch(platform) {
    case '1':
      await setupRailway(config);
      break;
    case '2':
      await setupDigitalOcean(config);
      break;
    case '3':
      await setupVercel(config);
      break;
    case '4':
      await setupAWS(config);
      break;
  }

  // Monitoring setup
  console.log('\n📊 Monitoring Setup:');
  config.monitoring.sentry = await question('Sentry DSN (for error tracking): ');
  config.monitoring.uptimeRobot = await question('Setup UptimeRobot? (y/n): ') === 'y';
  
  await saveProductionConfig(config);
  
  console.log('\n✅ Phase 2 Complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy backend to chosen platform');
  console.log('2. Test production API endpoints');
  console.log('3. Move to Phase 3: Mobile app deployment');
}

async function setupPhase3(config) {
  console.log('\n📱 PHASE 3: MOBILE & LAUNCH\n');
  
  const existingConfig = await loadProductionConfig();
  if (!existingConfig || existingConfig.phase !== 'phase2') {
    console.log('❌ Please complete Phase 1 & 2 first');
    return;
  }
  
  Object.assign(config, existingConfig);
  config.phase = 'phase3';

  // Mobile app configuration
  console.log('📱 Mobile App Configuration:');
  config.mobile = {
    appId: 'com.dietwise.app',
    appName: 'DietWise',
    version: '1.0.0'
  };

  // App Store setup
  console.log('\n🍎 iOS App Store:');
  config.mobile.ios = {
    teamId: await question('Apple Developer Team ID: '),
    bundleId: config.mobile.appId,
    developerId: await question('Apple Developer Account Email: ')
  };

  console.log('\n🤖 Google Play Store:');
  config.mobile.android = {
    packageName: config.mobile.appId,
    developerEmail: await question('Google Play Developer Email: ')
  };

  // Final checks
  console.log('\n🔍 Pre-launch Checklist:');
  const checks = [
    'Backend API responding correctly',
    'Payment flow tested end-to-end',
    'Email notifications working',
    'Mobile apps connecting to production API',
    'All monitoring alerts configured'
  ];

  for (const check of checks) {
    const result = await question(`✓ ${check} - Complete? (y/n): `);
    config.checklist = config.checklist || {};
    config.checklist[check] = result === 'y';
  }

  await saveProductionConfig(config);
  
  console.log('\n🎉 Ready for Launch!');
  console.log('\n📋 Final steps:');
  console.log('1. Submit apps to stores');
  console.log('2. Switch DNS to production');
  console.log('3. Launch announcement');
}

async function setupRailway(config) {
  console.log('\n🚂 Railway Deployment Setup:');
  console.log('\n📋 Railway deployment steps:');
  console.log('1. Install Railway CLI: npm install -g @railway/cli');
  console.log('2. Login: railway login');
  console.log('3. Deploy: railway up');
  console.log('\n🔗 Set these environment variables in Railway dashboard:');
  
  const envVars = Object.entries(config.credentials)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  console.log('\n' + envVars);
}

async function setupDigitalOcean(config) {
  console.log('\n🌊 DigitalOcean App Platform Setup:');
  console.log('\n📋 Steps:');
  console.log('1. Create new App in DigitalOcean');
  console.log('2. Connect GitHub repository');
  console.log('3. Set environment variables');
  console.log('4. Deploy');
}

async function setupVercel(config) {
  console.log('\n▲ Vercel + Supabase Setup:');
  console.log('\n📋 Steps:');
  console.log('1. Connect GitHub to Vercel');
  console.log('2. Set environment variables');
  console.log('3. Use Supabase for backend');
}

async function setupAWS(config) {
  console.log('\n☁️ AWS Setup:');
  console.log('\n📋 Advanced setup - requires Docker knowledge');
  console.log('1. Create ECS cluster');
  console.log('2. Set up RDS database');
  console.log('3. Configure load balancer');
}

async function reviewSetup(config) {
  console.log('\n📊 SETUP REVIEW\n');
  
  const configPath = path.join(__dirname, '../production-config.json');
  if (!fs.existsSync(configPath)) {
    console.log('❌ No production configuration found. Please run Phase 1 first.');
    return;
  }

  const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  console.log('📋 Current Configuration:');
  console.log(`Phase: ${existingConfig.phase || 'Not set'}`);
  console.log(`Domain: ${existingConfig.credentials?.DOMAIN || 'Not set'}`);
  console.log(`Platform: ${existingConfig.deployment?.platform || 'Not set'}`);
  
  console.log('\n🔍 Health Checks:');
  
  // Check if credentials are set
  const requiredCreds = ['SUPABASE_URL', 'GEMINI_API_KEY', 'STRIPE_SECRET_KEY'];
  for (const cred of requiredCreds) {
    const isSet = existingConfig.credentials?.[cred] && existingConfig.credentials[cred] !== '';
    console.log(`${isSet ? '✅' : '❌'} ${cred}: ${isSet ? 'Set' : 'Missing'}`);
  }
  
  console.log('\n📈 Readiness Score:');
  const totalChecks = requiredCreds.length;
  const passedChecks = requiredCreds.filter(cred => 
    existingConfig.credentials?.[cred] && existingConfig.credentials[cred] !== ''
  ).length;
  
  const score = Math.round((passedChecks / totalChecks) * 100);
  console.log(`${score}% Ready for Production`);
  
  if (score === 100) {
    console.log('\n🎉 You are ready to launch!');
  } else {
    console.log('\n⚠️ Complete remaining phases before launch');
  }
}

async function saveProductionConfig(config) {
  const configPath = path.join(__dirname, '../production-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n💾 Configuration saved to: ${configPath}`);
}

async function loadProductionConfig() {
  const configPath = path.join(__dirname, '../production-config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

async function generateProductionEnvFiles(config) {
  // Backend production env
  const backendEnv = `# DietWise Production Backend Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=${config.credentials.FRONTEND_URL}
FRONTEND_URL=${config.credentials.FRONTEND_URL}

# Database
DATABASE_URL=${config.credentials.SUPABASE_URL}/rest/v1/
SUPABASE_URL=${config.credentials.SUPABASE_URL}
SUPABASE_ANON_KEY=${config.credentials.SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${config.credentials.SUPABASE_SERVICE_ROLE_KEY}

# Authentication
JWT_SECRET=${config.credentials.JWT_SECRET}
JWT_REFRESH_SECRET=${config.credentials.JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=7d

# AI Service
GEMINI_API_KEY=${config.credentials.GEMINI_API_KEY}

# Payment Processing
STRIPE_SECRET_KEY=${config.credentials.STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${config.credentials.STRIPE_WEBHOOK_SECRET}
STRIPE_PRICE_ID_MONTHLY=${config.credentials.STRIPE_PRICE_ID_MONTHLY}
STRIPE_PRICE_ID_YEARLY=${config.credentials.STRIPE_PRICE_ID_YEARLY}

# Email Configuration
EMAIL_FROM=${config.credentials.EMAIL_FROM}
${config.credentials.RESEND_API_KEY ? `RESEND_API_KEY=${config.credentials.RESEND_API_KEY}` : ''}
${config.credentials.SENDGRID_API_KEY ? `SENDGRID_API_KEY=${config.credentials.SENDGRID_API_KEY}` : ''}

# Monitoring
${config.monitoring?.sentry ? `SENTRY_DSN=${config.monitoring.sentry}` : ''}
LOG_LEVEL=warn
`;

  // Frontend production env
  const frontendEnv = `# DietWise Production Frontend Configuration
VITE_NODE_ENV=production
VITE_API_URL=${config.credentials.API_URL}/api
VITE_SUPABASE_URL=${config.credentials.SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${config.credentials.SUPABASE_ANON_KEY}
VITE_STRIPE_PUBLISHABLE_KEY=${config.credentials.STRIPE_PUBLISHABLE_KEY}
`;

  // Write files
  const backendPath = path.join(__dirname, '../backend/.env.production');
  const frontendPath = path.join(__dirname, '../.env.production');
  
  fs.writeFileSync(backendPath, backendEnv);
  fs.writeFileSync(frontendPath, frontendEnv);
  
  console.log(`✅ Backend production env: ${backendPath}`);
  console.log(`✅ Frontend production env: ${frontendPath}`);
}

// Start the setup wizard
productionSetup().catch(console.error);