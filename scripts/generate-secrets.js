#!/usr/bin/env node

import crypto from 'crypto';

console.log('🔐 Generating secure secrets for DietWise production deployment\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('base64');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('\n');

// Generate other random strings if needed
const randomString = crypto.randomBytes(16).toString('hex');
console.log('Random String (for other uses):');
console.log(randomString);
console.log('\n');

console.log('📋 Environment Variables Template:\n');
console.log(`# Security
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Generate these from your accounts:
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...
# SUPABASE_URL=https://[PROJECT-ID].supabase.co
# SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# GEMINI_API_KEY=...
`);

console.log('✅ Copy the JWT_SECRET above and use it in your Railway environment variables');