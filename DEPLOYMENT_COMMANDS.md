# 🚀 DietWise Deployment Commands

Your credentials are now configured! Follow these steps:

## 1. Deploy Backend to Railway

```bash
./deploy-backend.sh
```

This will:
- Log you into Railway (if needed)
- Create a new project
- Set all environment variables
- Deploy your backend
- Update frontend with backend URL

## 2. Configure Stripe Webhook

After backend is deployed, run:

```bash
./setup-stripe-webhook.sh
```

Or manually in Stripe Dashboard:
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://[YOUR-BACKEND-URL]/api/v1/stripe/webhook`
3. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   - checkout.session.completed
4. Copy webhook secret
5. Update in Railway:
   ```bash
   cd backend
   railway variables set STRIPE_WEBHOOK_SECRET=whsec_[YOUR-SECRET]
   ```

## 3. Build Frontend

```bash
npm run build:production
```

## 4. Deploy Frontend to Netlify

Option A - CLI:
```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Option B - Drag & Drop:
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder

## 5. Update Backend CORS

Once you have your Netlify URL:
```bash
cd backend
railway variables set FRONTEND_URL=https://[YOUR-NETLIFY-URL]
railway variables set CORS_ORIGIN=https://[YOUR-NETLIFY-URL]
```

## 6. Test Everything

```bash
# Test backend
curl https://[YOUR-BACKEND-URL]/health

# Test frontend
# Visit your Netlify URL and try:
# 1. Create account
# 2. Subscribe (use test card: 4242 4242 4242 4242)
# 3. Check Stripe dashboard
```

## Quick Commands Summary

```bash
# 1. Deploy backend
./deploy-backend.sh

# 2. Build frontend
npm run build:production

# 3. Deploy frontend
netlify deploy --prod --dir=dist

# 4. Configure webhook (after getting URLs)
./setup-stripe-webhook.sh
```

## Your Credentials Summary

- **Stripe Account**: Live mode ready ✅
- **Supabase**: jabsotyzukoaqynmwscv ✅
- **Gemini API**: Configured ✅
- **JWT Secret**: Generated ✅

## Monitoring URLs

- Railway Dashboard: https://railway.app/dashboard
- Stripe Dashboard: https://dashboard.stripe.com
- Netlify Dashboard: https://app.netlify.com
- Supabase Dashboard: https://supabase.com/dashboard/project/jabsotyzukoaqynmwscv