#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 DietWise Production Setup CLI\n');
console.log('Please enter your credentials from the Excel file:\n');

async function setupProduction() {
  try {
    // Collect credentials
    console.log('📌 STRIPE CREDENTIALS:');
    const stripeSecretKey = await question('Stripe Secret Key (sk_live_...): ');
    const stripePublishableKey = await question('Stripe Publishable Key (pk_live_...): ');
    const stripeMonthlyPriceId = await question('Stripe Monthly Price ID: ');
    const stripeYearlyPriceId = await question('Stripe Yearly Price ID: ');
    
    console.log('\n📌 SUPABASE CREDENTIALS:');
    const supabaseUrl = await question('Supabase URL (https://xxx.supabase.co): ');
    const supabaseAnonKey = await question('Supabase Anon Key: ');
    const supabaseServiceKey = await question('Supabase Service Role Key: ');
    const databaseUrl = await question('Database URL (postgresql://...): ');
    
    console.log('\n📌 AI CREDENTIALS:');
    const geminiApiKey = await question('Gemini API Key: ');
    
    console.log('\n📌 DEPLOYMENT SETTINGS:');
    const frontendUrl = await question('Frontend URL (default: https://dietwise.netlify.app): ') || 'https://dietwise.netlify.app';
    
    // JWT Secret (already generated)
    const jwtSecret = 'dEKV5w3wZ//WyM+OUkFafyX5VMlTU2/cgNxJnwnRSQQ=';
    
    // Create backend .env.production
    const backendEnv = `# Production Environment Variables
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=${databaseUrl}
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Security
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=${stripeSecretKey}
STRIPE_PRICE_ID_MONTHLY=${stripeMonthlyPriceId}
STRIPE_PRICE_ID_YEARLY=${stripeYearlyPriceId}

# Frontend
FRONTEND_URL=${frontendUrl}
CORS_ORIGIN=${frontendUrl}

# AI
GEMINI_API_KEY=${geminiApiKey}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
`;

    // Create frontend .env.production
    const frontendEnv = `# Frontend Production Environment Variables
VITE_API_BASE_URL=https://dietwise-backend.up.railway.app/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}
VITE_APP_ENV=production
`;

    // Save environment files
    fs.writeFileSync(path.join(__dirname, '../backend/.env.production'), backendEnv);
    fs.writeFileSync(path.join(__dirname, '../.env.production'), frontendEnv);
    
    console.log('\n✅ Environment files created!');
    
    // Ask if user wants to deploy now
    const deployNow = await question('\nDo you want to deploy to Railway now? (y/n): ');
    
    if (deployNow.toLowerCase() === 'y') {
      console.log('\n🚀 Starting Railway deployment...\n');
      
      // Check if Railway CLI is installed
      try {
        execSync('railway --version', { stdio: 'ignore' });
      } catch {
        console.log('Installing Railway CLI...');
        execSync('npm install -g @railway/cli', { stdio: 'inherit' });
      }
      
      console.log('\n📋 Next steps:');
      console.log('1. Run: cd backend && railway login');
      console.log('2. Run: railway init (create new project)');
      console.log('3. Run: railway up (deploy)');
      console.log('4. Copy the deployment URL');
      console.log('5. Update frontend .env.production with the backend URL');
      console.log('6. Build frontend: npm run build:production');
      console.log('7. Deploy frontend to Netlify');
      
      console.log('\n🔧 After deployment, configure Stripe webhook:');
      console.log('- URL: [YOUR_BACKEND_URL]/api/v1/stripe/webhook');
      console.log('- Events: subscription.*, invoice.payment_*, checkout.session.completed');
    }
    
    console.log('\n✅ Setup complete! Your credentials are saved in:');
    console.log('- backend/.env.production');
    console.log('- .env.production');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

setupProduction();