#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Setting up test environment for DietWise\n');
console.log('⚠️  WARNING: This creates a test configuration.');
console.log('    You MUST update with real credentials before production use.\n');

// Generate secure random secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

// Backend test configuration
const backendEnv = `# Server Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Database Configuration (Update with your real database)
DATABASE_URL=postgresql://dietwise:password@localhost:5432/dietwise

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Supabase Configuration (Update with your project details)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRES_IN=7d

# Google Gemini AI (Update with your API key)
GEMINI_API_KEY=your-gemini-api-key-here

# Stripe Configuration (Update with your keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID_MONTHLY=price_monthly_id
STRIPE_PRICE_ID_YEARLY=price_yearly_id

# Logging
LOG_LEVEL=info
`;

// Frontend test configuration
const frontendEnv = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# API Configuration
VITE_API_URL=http://localhost:3000/api
`;

// Write files
const backendPath = path.join(__dirname, '../backend/.env');
const frontendPath = path.join(__dirname, '../.env');

fs.writeFileSync(backendPath, backendEnv);
console.log(`✅ Created: ${backendPath}`);

fs.writeFileSync(frontendPath, frontendEnv);
console.log(`✅ Created: ${frontendPath}`);

console.log('\n📝 Test environment files created!\n');
console.log('🔑 IMPORTANT: Update the following in your .env files:');
console.log('   1. GEMINI_API_KEY - Get from https://makersuite.google.com/app/apikey');
console.log('   2. SUPABASE_URL, SUPABASE_ANON_KEY - From your Supabase project');
console.log('   3. STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY - From Stripe dashboard');
console.log('   4. DATABASE_URL - Your PostgreSQL connection string');
console.log('\nRun "npm run test:credentials" to validate your configuration.');