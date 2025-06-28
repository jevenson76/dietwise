#!/bin/bash

echo "🚀 DietWise Quick Deploy Script"
echo "================================"
echo ""
echo "This script will help you deploy DietWise to production."
echo ""
echo "Please paste your credentials below in this format:"
echo "GEMINI_API_KEY=your_key"
echo "STRIPE_SECRET_KEY=sk_live_..."
echo "STRIPE_PUBLISHABLE_KEY=pk_live_..."
echo "STRIPE_MONTHLY_PRICE_ID=price_..."
echo "STRIPE_YEARLY_PRICE_ID=price_..."
echo "SUPABASE_URL=https://xxx.supabase.co"
echo "SUPABASE_ANON_KEY=..."
echo "SUPABASE_SERVICE_KEY=..."
echo "DATABASE_URL=postgresql://..."
echo ""
echo "Paste your credentials (press Ctrl+D when done):"
echo "-------------------------------------------"

# Create temporary file for credentials
TEMP_CREDS=$(mktemp)
cat > $TEMP_CREDS

# Source the credentials
source $TEMP_CREDS

# JWT Secret (pre-generated)
JWT_SECRET="dEKV5w3wZ//WyM+OUkFafyX5VMlTU2/cgNxJnwnRSQQ="

# Create backend .env.production
cat > backend/.env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=$DATABASE_URL
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Security
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_PRICE_ID_MONTHLY=$STRIPE_MONTHLY_PRICE_ID
STRIPE_PRICE_ID_YEARLY=$STRIPE_YEARLY_PRICE_ID

# Frontend
FRONTEND_URL=https://dietwise.netlify.app
CORS_ORIGIN=https://dietwise.netlify.app

# AI
GEMINI_API_KEY=$GEMINI_API_KEY

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
EOF

# Create frontend .env.production
cat > .env.production << EOF
# Frontend Production Environment Variables
VITE_API_BASE_URL=https://dietwise-backend.up.railway.app/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
VITE_APP_ENV=production
EOF

# Clean up
rm $TEMP_CREDS

echo ""
echo "✅ Environment files created!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy backend to Railway:"
echo "   cd backend"
echo "   railway login"
echo "   railway init"
echo "   railway up"
echo ""
echo "2. Update frontend with backend URL"
echo "3. Build frontend: npm run build:production"
echo "4. Deploy to Netlify"
echo ""
echo "Run 'node scripts/setup-production.js' for interactive setup."