# API Key Setup Guide for DietWise

## 🔐 Security First

**IMPORTANT**: Never share or commit API keys to version control. The API key you shared should be regenerated immediately.

## 📋 Required API Keys

### 1. Google Gemini API Key (Required)
This powers all AI features including:
- UPC barcode scanning
- Meal suggestions
- 7-day meal planning

**How to obtain:**
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the generated key

**How to configure:**
1. Create a `.env` file in the project root
2. Add: `GEMINI_API_KEY=your_actual_key_here`
3. Restart the development server

### 2. Optional API Keys

**Stripe (for payments):**
- `VITE_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard

**Sentry (for error tracking):**
- `VITE_SENTRY_DSN` - From Sentry project settings

## 🚀 Setup Steps

### Local Development
```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit .env and add your API key
# GEMINI_API_KEY=your_key_here

# 3. Restart the dev server
npm run dev
```

### Production Deployment

**Vercel:**
```bash
vercel env add GEMINI_API_KEY
```

**Railway:**
- Add via Railway dashboard → Variables

**Netlify:**
- Add via Site settings → Environment variables

## 🛡️ API Key Security

### Restrict Your API Key
1. Go to Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Click on your API key
4. Set restrictions:
   - API restrictions: Restrict to Gemini API only
   - Website restrictions: Add your domains

### Example restrictions:
```
Allowed domains:
- localhost:*
- dietwise.app
- *.dietwise.app
```

## ✅ Testing Your Setup

1. Open the app
2. Try the UPC scanner
3. Scan a barcode (or enter: 028400589970)
4. If nutrition data appears, your API key is working!

## 🚨 If Your Key Was Exposed

1. **Immediately regenerate** at Google Cloud Console
2. Update your `.env` file with the new key
3. Check usage to ensure no unauthorized access
4. Set up billing alerts as a precaution

## 📝 Environment File Template

Create `.env` in your project root:

```env
# Required for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
VITE_API_URL=http://localhost:3001/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Remember: The `.env` file should **never** be committed to Git!