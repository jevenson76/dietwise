# 🚀 DietWise Backend Deployment - Step by Step

## Your Generated Security Keys
```
JWT_SECRET=dEKV5w3wZ//WyM+OUkFafyX5VMlTU2/cgNxJnwnRSQQ=
```

## Step 1: Get Your Credentials from Excel

From your Credentials.xlsx file, you'll need:

### Stripe Production Keys
- `STRIPE_SECRET_KEY` (starts with sk_live_)
- `STRIPE_PUBLISHABLE_KEY` (starts with pk_live_)
- Monthly Price ID
- Yearly Price ID

### Supabase Credentials
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Database connection string

### Google Gemini
- `GEMINI_API_KEY`

## Step 2: Deploy Backend to Railway

1. **Go to Railway.app**
   ```
   https://railway.app
   ```

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select `jevenson76/dietwise` repository
   - Set root directory to: `/backend`

3. **Add Environment Variables**
   
   Click on your project → Variables → RAW Editor
   
   Copy and paste this (fill in your values from Excel):

   ```env
   # Server
   NODE_ENV=production
   PORT=3001
   
   # Database (from Supabase)
   DATABASE_URL=[YOUR_SUPABASE_CONNECTION_STRING]
   SUPABASE_URL=[YOUR_SUPABASE_URL]
   SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
   SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_KEY]
   
   # Security (use the generated one above)
   JWT_SECRET=dEKV5w3wZ//WyM+OUkFafyX5VMlTU2/cgNxJnwnRSQQ=
   JWT_EXPIRES_IN=7d
   
   # Stripe Production
   STRIPE_SECRET_KEY=[YOUR_STRIPE_SECRET_KEY]
   STRIPE_PRICE_ID_MONTHLY=[YOUR_MONTHLY_PRICE_ID]
   STRIPE_PRICE_ID_YEARLY=[YOUR_YEARLY_PRICE_ID]
   
   # Frontend (update after deploying frontend)
   FRONTEND_URL=https://dietwise.netlify.app
   CORS_ORIGIN=https://dietwise.netlify.app
   
   # AI
   GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Get your backend URL (e.g., https://dietwise-backend-production.up.railway.app)

## Step 3: Configure Stripe Webhooks

1. **Go to Stripe Dashboard**
   ```
   https://dashboard.stripe.com/webhooks
   ```

2. **Add endpoint**
   - Click "Add endpoint"
   - Endpoint URL: `[YOUR_RAILWAY_URL]/api/v1/stripe/webhook`
   - Select events:
     - ✓ customer.subscription.created
     - ✓ customer.subscription.updated
     - ✓ customer.subscription.deleted
     - ✓ invoice.payment_succeeded
     - ✓ invoice.payment_failed
     - ✓ checkout.session.completed

3. **Copy Webhook Secret**
   - After creating, click on the webhook
   - Copy the signing secret (starts with `whsec_`)
   - Go back to Railway → Variables
   - Add: `STRIPE_WEBHOOK_SECRET=[YOUR_WEBHOOK_SECRET]`

## Step 4: Update Frontend

1. **Create production env file**
   ```bash
   cd /home/jevenson/dietwise
   ```

2. **Create .env.production**
   ```env
   VITE_API_BASE_URL=[YOUR_RAILWAY_URL]/api/v1
   VITE_STRIPE_PUBLISHABLE_KEY=[YOUR_STRIPE_PUBLISHABLE_KEY]
   VITE_APP_ENV=production
   ```

3. **Build frontend**
   ```bash
   npm run build:production
   ```

4. **Deploy to Netlify**
   - Go to https://app.netlify.com/drop
   - Drag the `dist` folder
   - Get your Netlify URL

5. **Update Railway Backend**
   - Go back to Railway
   - Update these variables with your Netlify URL:
     - `FRONTEND_URL=[YOUR_NETLIFY_URL]`
     - `CORS_ORIGIN=[YOUR_NETLIFY_URL]`

## Step 5: Test Everything

1. **Test Backend**
   ```bash
   curl [YOUR_RAILWAY_URL]/health
   ```

2. **Test Full Flow**
   - Visit your Netlify URL
   - Create an account
   - Try to subscribe (use Stripe test card: 4242 4242 4242 4242)
   - Check Stripe dashboard for payment

## Quick Checklist

- [ ] Railway backend deployed
- [ ] Environment variables set
- [ ] Stripe webhooks configured
- [ ] Frontend deployed to Netlify
- [ ] Backend URL updated in frontend
- [ ] CORS configured correctly
- [ ] Health check passing
- [ ] User can register
- [ ] User can subscribe
- [ ] Webhook delivers successfully

## Common Issues

1. **CORS Error**: Make sure `CORS_ORIGIN` exactly matches your frontend URL (including https://)
2. **Webhook Fails**: Check the webhook secret is copied correctly
3. **Can't Connect to DB**: Verify Supabase connection string is correct
4. **Build Fails**: Make sure Railway is using Node 18+

## Next Steps

Once everything is working:
1. Update both app stores with your production URLs
2. Switch Stripe to live mode
3. Monitor Railway logs for any issues
4. Set up error tracking (Sentry)

---

**Need the credentials from your Excel file to proceed!**