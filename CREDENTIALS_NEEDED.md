# 🔑 DietWise - Credentials Needed for Deployment

**Status:** Ready for deployment once credentials are configured  
**Priority:** Set up these 3 essential services to get fully functional

---

## 🚨 **REQUIRED CREDENTIALS (Must have for full functionality)**

### 1. 🤖 **Google Gemini AI API Key** 
**Purpose:** Powers all AI features (meal suggestions, barcode scanning, 7-day planner)

```bash
# Frontend .env
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

**Cost:** Free tier available, then pay-per-use (~$10-50/month)

---

### 2. 🗄️ **Supabase Database Project**
**Purpose:** User accounts, data storage, authentication

```bash
# Backend .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret_from_supabase
```

**How to get:**
1. Sign up at [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy URL, anon key, service role key, and JWT secret
5. Run database setup: `/backend/sql/safe-fresh-setup.sql`

**Cost:** Free tier (50MB database), then $25/month

---

### 3. 💳 **Stripe Payment Processing**
**Purpose:** Premium subscriptions ($9.99/month, $79/year)

```bash
# Frontend .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key

# Backend .env
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID_MONTHLY=price_monthly_id
STRIPE_PRICE_ID_YEARLY=price_yearly_id
```

**How to get:**
1. Sign up at [Stripe](https://stripe.com)
2. Create products: "DietWise Premium" ($9.99/month, $79/year)
3. Get publishable and secret keys from Dashboard
4. Set up webhook endpoint: `your-backend-url/api/stripe/webhook`
5. Copy webhook secret

**Cost:** 2.9% + $0.30 per transaction

---

## ⚙️ **OPTIONAL CREDENTIALS (Nice to have)**

### 4. 📧 **Email Service (SMTP)**
**Purpose:** Password resets, notifications

```bash
# Backend .env (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=DietWise <noreply@dietwise.com>
```

**Setup:** Enable 2FA on Gmail → Generate App Password

---

### 5. 🔍 **Sentry Error Tracking**
**Purpose:** Production error monitoring

```bash
# Frontend .env (optional)
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_ORG=your_org
VITE_SENTRY_PROJECT=your_project
VITE_SENTRY_AUTH_TOKEN=your_auth_token
```

**Setup:** Create [Sentry](https://sentry.io) account → Create project

---

### 6. 🚀 **Redis Caching**
**Purpose:** Performance optimization

```bash
# Backend .env (optional)
REDIS_URL=redis://localhost:6379
```

**Setup:** Install Redis on your server or use cloud provider

---

## 📋 **Quick Setup Checklist**

### **Phase 1: Essential (Required for launch)**
- [ ] **Get Gemini API key** (5 minutes)
- [ ] **Create Supabase project** (10 minutes)
- [ ] **Set up Stripe account** (20 minutes)
- [ ] **Update environment variables**
- [ ] **Test all functionality**

### **Phase 2: Production Ready**
- [ ] **Configure email service**
- [ ] **Set up error monitoring**
- [ ] **Add Redis caching**
- [ ] **Set up monitoring**

---

## 🎯 **What Works Without Each Service**

| Service Missing | Impact | Workaround |
|----------------|--------|------------|
| **Gemini AI** | No meal suggestions, no barcode scanning | Manual food entry only |
| **Supabase** | No cloud sync, local storage only | Works offline, no account creation |
| **Stripe** | No premium features | All features free/unlocked |
| **Email** | No password resets | Users must remember passwords |
| **Sentry** | No error tracking | Check logs manually |
| **Redis** | Slower performance | Direct database queries |

---

## 🔧 **Current Status**

### ✅ **Already Configured:**
- App builds and runs perfectly
- All code optimized and tested
- Mobile apps ready for app stores
- Security measures implemented
- Performance optimizations complete

### ⚠️ **Needs Your Credentials:**
- Google Gemini API key
- Your own Supabase project  
- Your own Stripe account

### 🎯 **Time to Launch:**
- **With essential credentials:** 30-60 minutes setup
- **Production ready:** 2-3 hours complete setup

---

## 💰 **Cost Summary**

| Service | Development | Production (Monthly) |
|---------|-------------|---------------------|
| **Gemini AI** | Free tier | $10-50 |
| **Supabase** | Free tier | $0-25 |
| **Stripe** | Test mode | % of revenue |
| **Email** | Free | $0 |
| **Sentry** | Free tier | $0-26 |
| **Redis** | Local/free | $5-15 |
| **Total** | **$0** | **$15-116** |

---

## 🚀 **Ready to Deploy**

Once you have the 3 essential credentials:

1. **Update environment variables**
2. **Test locally**
3. **Deploy to production**
4. **Submit to app stores**

The app is fully functional and ready for users!

---

*Last updated: 2025-06-23 | Essential services: 3 | Setup time: ~1 hour*