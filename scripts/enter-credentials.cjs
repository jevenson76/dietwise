#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function enterCredentials() {
  console.log('🔐 DietWise Quick Credential Setup\n');
  console.log('Enter your credentials below. Press Enter to skip optional fields.\n');

  const credentials = {};

  // Essential credentials
  console.log('📌 REQUIRED CREDENTIALS:\n');
  
  credentials.GEMINI_API_KEY = await question('Gemini API Key: ');
  credentials.SUPABASE_URL = await question('Supabase URL: ');
  credentials.SUPABASE_ANON_KEY = await question('Supabase Anon Key: ');
  credentials.SUPABASE_SERVICE_ROLE_KEY = await question('Supabase Service Role Key: ');
  credentials.STRIPE_SECRET_KEY = await question('Stripe Secret Key (sk_test_...): ');
  credentials.STRIPE_PUBLISHABLE_KEY = await question('Stripe Publishable Key (pk_test_...): ');
  
  console.log('\n📌 OPTIONAL (press Enter to use defaults):\n');
  
  credentials.STRIPE_WEBHOOK_SECRET = await question('Stripe Webhook Secret (whsec_...): ');
  credentials.STRIPE_PRICE_ID_MONTHLY = await question('Monthly Price ID: ');
  credentials.STRIPE_PRICE_ID_YEARLY = await question('Yearly Price ID: ');
  credentials.DATABASE_URL = await question('Database URL (default: postgresql://dietwise:password@localhost:5432/dietwise): ');

  // Set defaults
  credentials.DATABASE_URL = credentials.DATABASE_URL || 'postgresql://dietwise:password@localhost:5432/dietwise';
  
  // Generate secure secrets
  const crypto = require('crypto');
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

  // Create backend .env
  const backendEnv = `# Server Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Database Configuration
DATABASE_URL=${credentials.DATABASE_URL}
REDIS_URL=redis://localhost:6379

# Supabase Configuration
SUPABASE_URL=${credentials.SUPABASE_URL}
SUPABASE_ANON_KEY=${credentials.SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${credentials.SUPABASE_SERVICE_ROLE_KEY}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRES_IN=7d

# Google Gemini AI
GEMINI_API_KEY=${credentials.GEMINI_API_KEY}

# Stripe Configuration
STRIPE_SECRET_KEY=${credentials.STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${credentials.STRIPE_WEBHOOK_SECRET}
STRIPE_PRICE_ID_MONTHLY=${credentials.STRIPE_PRICE_ID_MONTHLY}
STRIPE_PRICE_ID_YEARLY=${credentials.STRIPE_PRICE_ID_YEARLY}

# Logging
LOG_LEVEL=info
`;

  // Create frontend .env
  const frontendEnv = `# Supabase Configuration
VITE_SUPABASE_URL=${credentials.SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${credentials.SUPABASE_ANON_KEY}

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=${credentials.STRIPE_PUBLISHABLE_KEY}

# API Configuration
VITE_API_URL=http://localhost:3000/api
`;

  // Write files
  const backendPath = path.join(__dirname, '../backend/.env');
  const frontendPath = path.join(__dirname, '../.env');

  fs.writeFileSync(backendPath, backendEnv);
  fs.writeFileSync(frontendPath, frontendEnv);

  console.log('\n✅ Credentials saved successfully!');
  console.log('\n📁 Created files:');
  console.log(`   - ${backendPath}`);
  console.log(`   - ${frontendPath}`);
  
  console.log('\n🚀 Next steps:');
  console.log('   1. Run "npm run test:credentials" to validate');
  console.log('   2. Run "npm run dev" to start the frontend');
  console.log('   3. Run "npm run backend:dev" to start the backend');
  
  rl.close();
}

enterCredentials().catch(console.error);