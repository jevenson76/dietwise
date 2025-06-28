# DietWise Backend Production Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Prepare Your Accounts

1. **Stripe Production Setup**
   - Log in to [Stripe Dashboard](https://dashboard.stripe.com)
   - Switch to **Live Mode** (toggle in top-right)
   - Get your production keys:
     - `STRIPE_SECRET_KEY`: Starts with `sk_live_`
     - `STRIPE_PUBLISHABLE_KEY`: Starts with `pk_live_`
   - Create subscription prices:
     - Monthly: $9.99/month
     - Yearly: $99.99/year
   - Note the Price IDs (format: `price_1234...`)

2. **Supabase Production Database**
   - Your existing Supabase project should work
   - Get credentials from Supabase Dashboard → Settings → API:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **Google Gemini API**
   - Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Step 2: Deploy to Railway

1. **Create Railway Account**
   ```
   Go to: https://railway.app
   Sign up with GitHub
   ```

2. **Deploy Backend**
   ```bash
   # In your backend directory
   cd /home/jevenson/dietwise/backend
   
   # Install Railway CLI (optional but helpful)
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Create new project
   railway init
   
   # Link to existing project (if using GitHub)
   railway link
   ```

   **OR use Railway Dashboard:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `dietwise` repository
   - Set root directory to `/backend`

3. **Configure Environment Variables in Railway**
   
   Go to your project → Variables → Add all of these:

   ```env
   # Core Configuration
   NODE_ENV=production
   PORT=3001
   
   # Database (from Supabase)
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT-ID].supabase.co
   SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-KEY]
   
   # Security
   JWT_SECRET=[GENERATE-WITH: openssl rand -base64 32]
   JWT_EXPIRES_IN=7d
   
   # Stripe Production Keys
   STRIPE_SECRET_KEY=sk_live_[YOUR-KEY]
   STRIPE_WEBHOOK_SECRET=[WILL-SET-AFTER-WEBHOOK-CONFIG]
   STRIPE_PRICE_ID_MONTHLY=price_[YOUR-MONTHLY-PRICE-ID]
   STRIPE_PRICE_ID_YEARLY=price_[YOUR-YEARLY-PRICE-ID]
   
   # Frontend URL (update after frontend deployment)
   FRONTEND_URL=https://dietwise.netlify.app
   CORS_ORIGIN=https://dietwise.netlify.app
   
   # AI Service
   GEMINI_API_KEY=[YOUR-GEMINI-KEY]
   
   # Optional but recommended
   LOG_LEVEL=info
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Deploy**
   - Railway will automatically deploy when you add variables
   - Get your backend URL from Railway dashboard (e.g., `https://dietwise-backend.up.railway.app`)

### Step 3: Configure Stripe Webhooks

1. **Go to Stripe Dashboard → Developers → Webhooks**

2. **Add endpoint**
   - Endpoint URL: `https://[YOUR-RAILWAY-URL]/api/v1/stripe/webhook`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `checkout.session.completed`

3. **Copy the Webhook Secret**
   - Starts with `whsec_`
   - Add to Railway as `STRIPE_WEBHOOK_SECRET`

### Step 4: Update Frontend Configuration

1. **Update frontend environment variables**
   ```bash
   cd /home/jevenson/dietwise
   
   # Create production env file
   cp .env.example .env.production
   ```

2. **Edit `.env.production`:**
   ```env
   VITE_API_BASE_URL=https://[YOUR-RAILWAY-URL]/api/v1
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR-KEY]
   VITE_APP_ENV=production
   ```

3. **Build and deploy frontend**
   ```bash
   npm run build:production
   
   # Deploy to Netlify
   netlify deploy --prod --dir=dist
   ```

### Step 5: Test Everything

1. **Test Backend Health**
   ```bash
   curl https://[YOUR-RAILWAY-URL]/health
   ```

2. **Test Stripe Integration**
   - Create a test account on your app
   - Try to subscribe
   - Check Stripe dashboard for the payment

3. **Test Webhook**
   - Check Stripe webhook logs
   - Verify subscription status updates in database

## 📋 Production Checklist

- [ ] Stripe live keys configured
- [ ] Railway deployment successful
- [ ] Backend health check passing
- [ ] Stripe webhooks configured and tested
- [ ] Frontend connected to production backend
- [ ] SSL/HTTPS working on both frontend and backend
- [ ] CORS configured correctly
- [ ] Database migrations run
- [ ] Test user can register and subscribe
- [ ] Subscription status syncs correctly

## 🔧 Troubleshooting

### Common Issues:

1. **CORS errors**
   - Ensure `CORS_ORIGIN` matches your frontend URL exactly
   - Include protocol (https://)

2. **Stripe webhook failures**
   - Check webhook secret is correct
   - Verify endpoint URL has no typos
   - Check Railway logs for errors

3. **Database connection issues**
   - Verify Supabase connection string
   - Check if database is accessible from Railway

4. **Build failures**
   - Check Node version (requires 18+)
   - Verify all dependencies are in package.json

## 🚨 Important Security Notes

1. **Never commit secrets to Git**
2. **Use strong JWT secret** (min 32 characters)
3. **Enable Stripe webhook signature verification**
4. **Keep production keys separate from test keys**
5. **Monitor Railway logs for suspicious activity**

## 📊 Monitoring

1. **Railway Dashboard**
   - View logs
   - Monitor resource usage
   - Set up alerts

2. **Stripe Dashboard**
   - Monitor webhook deliveries
   - Check payment success rates
   - Review failed payments

3. **Supabase Dashboard**
   - Monitor database connections
   - Check query performance
   - Review security policies

## 🎯 Next Steps

1. Set up error monitoring (Sentry)
2. Configure automated backups
3. Set up uptime monitoring
4. Create staging environment
5. Document API for mobile apps

---

**Support Resources:**
- Railway Docs: https://docs.railway.app
- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs