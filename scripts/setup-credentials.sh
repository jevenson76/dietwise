#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 DietWise Credential Setup Helper${NC}"
echo "===================================="
echo ""

# Check if backend/.env exists
if [ ! -f backend/.env ]; then
    echo -e "${RED}Error: backend/.env not found!${NC}"
    echo "Creating from example..."
    cp backend/.env.example backend/.env
fi

echo -e "${YELLOW}This script will help you add the missing credentials.${NC}"
echo -e "${YELLOW}Have these ready:${NC}"
echo "1. Supabase database password"
echo "2. Google Gemini API key"
echo "3. Stripe secret key (sk_live_...)"
echo "4. Stripe webhook secret (whsec_...)"
echo ""
read -p "Press Enter to continue..."

# Get Supabase password
echo ""
echo -e "${BLUE}1. Supabase Database Password${NC}"
echo "Get this from: Supabase Dashboard → Settings → Database → Connection string"
read -sp "Enter the database password: " DB_PASSWORD
echo ""

# Update DATABASE_URL
if [ ! -z "$DB_PASSWORD" ]; then
    # Use sed to replace [PASSWORD] with actual password
    sed -i.bak "s/\[PASSWORD\]/$DB_PASSWORD/g" backend/.env
    echo -e "${GREEN}✓ Database password updated${NC}"
else
    echo -e "${RED}✗ Skipped database password${NC}"
fi

# Get Gemini API key
echo ""
echo -e "${BLUE}2. Google Gemini API Key${NC}"
echo "Get this from: https://makersuite.google.com/app/apikey"
read -sp "Enter your Gemini API key: " GEMINI_KEY
echo ""

if [ ! -z "$GEMINI_KEY" ]; then
    # Update or add GEMINI_API_KEY
    if grep -q "^GEMINI_API_KEY=" backend/.env; then
        sed -i.bak "s/^GEMINI_API_KEY=.*/GEMINI_API_KEY=$GEMINI_KEY/" backend/.env
    else
        echo "GEMINI_API_KEY=$GEMINI_KEY" >> backend/.env
    fi
    echo -e "${GREEN}✓ Gemini API key added${NC}"
else
    echo -e "${RED}✗ Skipped Gemini API key${NC}"
fi

# Get Stripe credentials
echo ""
echo -e "${BLUE}3. Stripe Secret Key${NC}"
echo "Get this from: https://dashboard.stripe.com/apikeys"
read -sp "Enter your Stripe secret key (sk_live_...): " STRIPE_SECRET
echo ""

if [ ! -z "$STRIPE_SECRET" ]; then
    # Add Stripe secret key
    echo "STRIPE_SECRET_KEY=$STRIPE_SECRET" >> backend/.env
    echo -e "${GREEN}✓ Stripe secret key added${NC}"
else
    echo -e "${RED}✗ Skipped Stripe secret key${NC}"
fi

echo ""
echo -e "${BLUE}4. Stripe Webhook Secret${NC}"
echo "Get this from: Stripe Dashboard → Webhooks → Your endpoint"
read -sp "Enter your webhook secret (whsec_...): " WEBHOOK_SECRET
echo ""

if [ ! -z "$WEBHOOK_SECRET" ]; then
    echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> backend/.env
    echo -e "${GREEN}✓ Stripe webhook secret added${NC}"
else
    echo -e "${RED}✗ Skipped webhook secret${NC}"
fi

# Add Stripe price IDs (copy from frontend)
echo ""
echo -e "${BLUE}5. Adding Stripe Price IDs${NC}"
echo "STRIPE_PRICE_ID_MONTHLY=price_1Rbs8KFmhcNUMRQy7LPWM3n5" >> backend/.env
echo "STRIPE_PRICE_ID_YEARLY=price_1RbsAVFmhcNUMRQyI3IpNq17" >> backend/.env
echo -e "${GREEN}✓ Stripe price IDs added${NC}"

# Optional: Email configuration
echo ""
echo -e "${BLUE}Optional: Email Configuration${NC}"
read -p "Do you want to configure email settings? (y/N): " CONFIGURE_EMAIL

if [[ "$CONFIGURE_EMAIL" =~ ^[Yy]$ ]]; then
    read -p "SMTP Username/Email: " SMTP_USER
    read -sp "SMTP Password/App Password: " SMTP_PASS
    echo ""
    
    if [ ! -z "$SMTP_USER" ] && [ ! -z "$SMTP_PASS" ]; then
        sed -i.bak "s/^SMTP_USER=.*/SMTP_USER=$SMTP_USER/" backend/.env
        sed -i.bak "s/^SMTP_PASS=.*/SMTP_PASS=$SMTP_PASS/" backend/.env
        echo -e "${GREEN}✓ Email configuration updated${NC}"
    fi
fi

# Remove backup files
rm -f backend/.env.bak

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: npm run validate:credentials"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: npm run dev"
echo "4. Test all features (UPC scanning, payments, etc.)"
echo ""
echo -e "${YELLOW}Remember: Never commit .env files to Git!${NC}"