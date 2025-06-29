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
async function setupProduction() {
  try {
    // Collect credentials

    const stripeSecretKey = await question('Stripe Secret Key (sk_live_...): ');
    const stripePublishableKey = await question('Stripe Publishable Key (pk_live_...): ');
    const stripeMonthlyPriceId = await question('Stripe Monthly Price ID: ');
    const stripeYearlyPriceId = await question('Stripe Yearly Price ID: ');
    

    const supabaseUrl = await question('Supabase URL (https://xxx.supabase.co): ');
    const supabaseAnonKey = await question('Supabase Anon Key: ');
    const supabaseServiceKey = await question('Supabase Service Role Key: ');
    const databaseUrl = await question('Database URL (postgresql://...): ');
    

    const geminiApiKey = await question('Gemini API Key: ');
    

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
    

    
    // Ask if user wants to deploy now
    const deployNow = await question('\nDo you want to deploy to Railway now? (y/n): ');
    
    if (deployNow.toLowerCase() === 'y') {

      
      // Check if Railway CLI is installed
      try {
        execSync('railway --version', { stdio: 'ignore' });
      } catch {

        execSync('npm install -g @railway/cli', { stdio: 'inherit' });
      }
      
      
    }
    
    
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', error.message);
    }
  } finally {
    rl.close();
  }
}

setupProduction();