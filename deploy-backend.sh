#!/bin/bash

echo "🚀 DietWise Backend Deployment Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to backend directory
cd backend

echo -e "${YELLOW}Step 1: Checking Railway login status...${NC}"
if ! railway whoami &>/dev/null; then
    echo -e "${YELLOW}Please log in to Railway:${NC}"
    railway login
else
    echo -e "${GREEN}✓ Already logged in to Railway${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Creating new Railway project...${NC}"
echo "Project name: dietwise-backend"

# Create new project
railway init -n dietwise-backend

echo ""
echo -e "${YELLOW}Step 3: Setting environment variables...${NC}"

# Read .env.production and set variables in Railway
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ ! "$key" =~ ^#.*$ ]] && [[ -n "$key" ]]; then
        # Remove quotes if present
        value="${value%\"}"
        value="${value#\"}"
        echo "Setting $key..."
        railway variables set "$key=$value" &>/dev/null
    fi
done < .env.production

echo -e "${GREEN}✓ Environment variables set${NC}"

echo ""
echo -e "${YELLOW}Step 4: Deploying to Railway...${NC}"
railway up

echo ""
echo -e "${YELLOW}Step 5: Getting deployment URL...${NC}"
BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*' | grep -o '[^"]*$' | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}Could not get deployment URL automatically.${NC}"
    echo "Please check Railway dashboard for your URL."
else
    echo -e "${GREEN}✓ Backend deployed to: https://$BACKEND_URL${NC}"
    
    # Update frontend .env.production with actual backend URL
    echo ""
    echo -e "${YELLOW}Step 6: Updating frontend configuration...${NC}"
    cd ..
    sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=https://$BACKEND_URL/api/v1|" .env.production
    echo -e "${GREEN}✓ Frontend configuration updated${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Backend deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to Stripe Dashboard and add webhook:"
echo "   URL: https://$BACKEND_URL/api/v1/stripe/webhook"
echo "   Events: customer.subscription.*, invoice.payment_*, checkout.session.completed"
echo ""
echo "2. Copy the webhook secret and update it in Railway:"
echo "   railway variables set STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "3. Build and deploy frontend:"
echo "   npm run build:production"
echo "   netlify deploy --prod --dir=dist"
echo ""
echo "Railway Dashboard: https://railway.app/dashboard"