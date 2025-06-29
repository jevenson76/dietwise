#!/usr/bin/env node

import crypto from 'crypto';
// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('base64');
// Generate other random strings if needed
const randomString = crypto.randomBytes(16).toString('hex');
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