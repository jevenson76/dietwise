# DietWise Quick Deploy Checklist (1 Hour)

## 🚨 IMMEDIATE ACTION REQUIRED

### 1. Choose Deployment Platform (5 minutes)
Pick ONE option for each:

**Frontend:**
- [ ] **Netlify** (RECOMMENDED - Free, Easy) 
- [ ] Vercel
- [ ] GitHub Pages

**Backend:**
- [ ] **Railway** (RECOMMENDED - Quick setup)
- [ ] Heroku
- [ ] Render

### 2. Gather Credentials (15 minutes)

**CRITICAL - Get these from your accounts:**

#### Stripe (https://dashboard.stripe.com)
- [ ] Live Secret Key: `sk_live_...`
- [ ] Live Publishable Key: `pk_live_...`
- [ ] Create Live Price IDs:
  - Monthly: `price_live_...`
  - Yearly: `price_live_...`

#### Supabase
- [ ] Database Password (check Supabase dashboard)

#### Domain (Optional)
- [ ] Domain name or use platform subdomain

### 3. Quick Deploy Steps (40 minutes)

#### A. Deploy Frontend to Netlify (10 min)
```bash
# Option 1: CLI Deploy
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Option 2: Drag & Drop
# Go to https://app.netlify.com/drop
# Drag the 'dist' folder
```

#### B. Deploy Backend to Railway (15 min)
1. Go to https://railway.app
2. Connect GitHub repo
3. Select `backend` directory
4. Add environment variables from `.env.production`
5. Deploy

#### C. Update Environment Variables (10 min)
1. Update `.env.production` with:
   - Backend URL from Railway
   - Your domain/subdomain
   - All Stripe live keys
   - Supabase password

2. Rebuild frontend with production env:
```bash
npm run build
```

3. Redeploy frontend to Netlify

#### D. Configure Stripe Webhook (5 min)
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-backend-url/api/v1/stripe/webhook`
3. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
4. Copy webhook secret to backend env

## 🎯 Minimal Working Deployment

If pressed for time, focus on:
1. Frontend on Netlify (drag & drop)
2. Backend on Railway
3. Use test Stripe keys initially
4. Switch to live keys after testing

## 📝 Post-Deploy Testing
```bash
# Test API
curl https://your-backend-url/health

# Test frontend
# Visit your-app.netlify.app
```

## ⚡ Need Help?
- Netlify: https://docs.netlify.com
- Railway: https://docs.railway.app
- Stripe: https://stripe.com/docs/webhooks

## 🔥 FASTEST PATH (30 minutes)
1. Deploy frontend to Netlify (drag & drop)
2. Deploy backend to Railway
3. Use existing test Stripe keys
4. Update domain later