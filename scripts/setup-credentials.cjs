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

async function setupCredentials() {
  console.log('🔐 DietWise Credential Setup\n');
  console.log('This script will help you securely set up your credentials.\n');

  const credentials = {
    backend: {},
    frontend: {}
  };

  // Backend credentials
  console.log('📦 BACKEND CREDENTIALS\n');
  
  // Database
  console.log('1️⃣ Database Configuration');
  credentials.backend.DATABASE_URL = await question('PostgreSQL URL (postgresql://user:pass@host:5432/db): ') || 'postgresql://dietwise:password@localhost:5432/dietwise';
  credentials.backend.REDIS_URL = await question('Redis URL (redis://localhost:6379): ') || 'redis://localhost:6379';
  
  // Authentication
  console.log('\n2️⃣ Authentication');
  credentials.backend.JWT_SECRET = await question('JWT Secret (press Enter to generate): ') || crypto.randomBytes(32).toString('hex');
  credentials.backend.JWT_REFRESH_SECRET = await question('JWT Refresh Secret (press Enter to generate): ') || crypto.randomBytes(32).toString('hex');
  
  // Gemini AI
  console.log('\n3️⃣ Google Gemini AI');
  credentials.backend.GEMINI_API_KEY = await question('Gemini API Key: ');
  
  // Stripe
  console.log('\n4️⃣ Stripe Payment Processing');
  credentials.backend.STRIPE_SECRET_KEY = await question('Stripe Secret Key (sk_test_...): ');
  credentials.backend.STRIPE_WEBHOOK_SECRET = await question('Stripe Webhook Secret (whsec_...): ');
  credentials.backend.STRIPE_PRICE_ID_MONTHLY = await question('Monthly Price ID: ');
  credentials.backend.STRIPE_PRICE_ID_YEARLY = await question('Yearly Price ID: ');
  
  // Supabase
  console.log('\n5️⃣ Supabase');
  credentials.backend.SUPABASE_URL = await question('Supabase URL: ');
  credentials.backend.SUPABASE_ANON_KEY = await question('Supabase Anon Key: ');
  credentials.backend.SUPABASE_SERVICE_ROLE_KEY = await question('Supabase Service Role Key: ');
  
  // Server config
  console.log('\n6️⃣ Server Configuration');
  credentials.backend.PORT = await question('Backend Port (3000): ') || '3000';
  credentials.backend.NODE_ENV = await question('Environment (development): ') || 'development';
  credentials.backend.FRONTEND_URL = await question('Frontend URL (http://localhost:5173): ') || 'http://localhost:5173';
  credentials.backend.CORS_ORIGIN = credentials.backend.FRONTEND_URL;
  
  // Frontend credentials
  console.log('\n\n📱 FRONTEND CREDENTIALS\n');
  credentials.frontend.VITE_SUPABASE_URL = credentials.backend.SUPABASE_URL;
  credentials.frontend.VITE_SUPABASE_ANON_KEY = credentials.backend.SUPABASE_ANON_KEY;
  credentials.frontend.VITE_STRIPE_PUBLISHABLE_KEY = await question('Stripe Publishable Key (pk_test_...): ');
  credentials.frontend.VITE_API_URL = `http://localhost:${credentials.backend.PORT}/api`;
  
  // Write .env files
  console.log('\n\n📝 Writing configuration files...\n');
  
  // Backend .env
  const backendEnv = Object.entries(credentials.backend)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const backendPath = path.join(__dirname, '../backend/.env');
  fs.writeFileSync(backendPath, backendEnv);
  console.log(`✅ Created: ${backendPath}`);
  
  // Frontend .env
  const frontendEnv = Object.entries(credentials.frontend)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const frontendPath = path.join(__dirname, '../.env');
  fs.writeFileSync(frontendPath, frontendEnv);
  console.log(`✅ Created: ${frontendPath}`);
  
  // Create .gitignore entries
  console.log('\n🛡️ Updating .gitignore files...');
  
  const gitignorePaths = [
    path.join(__dirname, '../.gitignore'),
    path.join(__dirname, '../backend/.gitignore')
  ];
  
  for (const gitignorePath of gitignorePaths) {
    let content = '';
    if (fs.existsSync(gitignorePath)) {
      content = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    if (!content.includes('.env')) {
      content += '\n# Environment variables\n.env\n.env.local\n.env.production\n';
      fs.writeFileSync(gitignorePath, content);
      console.log(`✅ Updated: ${gitignorePath}`);
    }
  }
  
  console.log('\n✨ Credential setup complete!\n');
  console.log('Next steps:');
  console.log('1. Run "npm run validate-credentials" to test your configuration');
  console.log('2. Set up your Stripe webhook endpoint at: https://dashboard.stripe.com/webhooks');
  console.log('3. Never commit .env files to version control\n');
  
  rl.close();
}

setupCredentials().catch(console.error);