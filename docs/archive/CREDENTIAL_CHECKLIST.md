# 🔐 DietWise Credential Checklist

## Quick Status (from validation script)

### ✅ Already Configured
- Frontend Stripe publishable key
- Frontend API URL and price IDs  
- Supabase URL, anon key, service role key
- JWT secret

### ❌ Missing Critical Credentials (App Won't Work)
1. **DATABASE_URL password** - Still has `[PASSWORD]` placeholder
2. **GEMINI_API_KEY** - Required for UPC scanning & AI features
3. **STRIPE_SECRET_KEY** - Required for payment processing
4. **STRIPE_WEBHOOK_SECRET** - Required for subscription management
5. **STRIPE_PRICE_ID_MONTHLY/YEARLY** - Missing in backend

## 📋 Complete Setup Guide

### 1. Database Password (URGENT)
```bash
# In backend/.env, find this line:
DATABASE_URL=postgresql://postgres.ozuuombybpfluztjvzdc:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Replace [PASSWORD] with actual password from:
# Supabase Dashboard → Settings → Database → Connection string
```

### 2. Google Gemini API Key
```bash
# Add to backend/.env:
GEMINI_API_KEY=your_actual_gemini_key_here

# Get it from:
# https://makersuite.google.com/app/apikey
# Click "Create API Key in new project"
```

### 3. Stripe Keys (Backend)
```bash
# Add to backend/.env:
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_ID_MONTHLY=price_1Rbs8KFmhcNUMRQy7LPWM3n5
STRIPE_PRICE_ID_YEARLY=price_1RbsAVFmhcNUMRQyI3IpNq17

# Get from:
# Secret key: https://dashboard.stripe.com/apikeys
# Webhook: https://dashboard.stripe.com/webhooks → Add endpoint
```

## 🚀 Quick Setup Commands

### Option 1: Interactive Setup
```bash
# Run the setup helper script
./scripts/setup-credentials.sh
```

### Option 2: Manual Setup
```bash
# Edit backend/.env and add:
cd backend
nano .env

# Add these lines:
DATABASE_URL=postgresql://postgres.ozuuombybpfluztjvzdc:YOUR_ACTUAL_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
GEMINI_API_KEY=your_gemini_key_here
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID_MONTHLY=price_1Rbs8KFmhcNUMRQy7LPWM3n5
STRIPE_PRICE_ID_YEARLY=price_1RbsAVFmhcNUMRQyI3IpNq17
```

## ✅ Validation

After adding credentials, verify everything is working:

```bash
# Run validation script
npm run validate:credentials

# You should see all green checkmarks for required credentials
```

## 🧪 Testing

Test each credential:

1. **Database**: Try logging in/signing up
2. **Gemini**: Try UPC scanning (scan barcode or enter: 028400589970)
3. **Stripe**: Try upgrading to premium
4. **Webhook**: Complete a payment and check subscription status

## 🔒 Security Reminders

1. **Never commit .env files** to Git
2. **Regenerate** the Gemini key that was exposed
3. **Use production keys** (sk_live_, not sk_test_)
4. **Set up Stripe webhook** endpoint in dashboard
5. **Add IP restrictions** to API keys where possible

## 📱 For Mobile Deployment

These credentials work for both web and mobile apps. The mobile app will use the same backend API with these credentials.

## 🆘 Troubleshooting

- **"Invalid API key"**: Make sure no quotes around keys in .env
- **"Database connection failed"**: Check password has no special characters that need escaping
- **"Stripe webhook failed"**: Ensure webhook secret matches dashboard
- **"Product not found" (UPC scan)**: Gemini API key issue

---

**Status**: Run `npm run validate:credentials` to check current status