# DietWise Backend Deployment Guide

## Prerequisites

1. Node.js 18+ and npm
2. PostgreSQL database (via Supabase)
3. Stripe account with API keys
4. Server or cloud platform (Railway, Render, Heroku, etc.)

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Option 1: Railway (Recommended - Best Free Tier)

1. **Create Railway Account** at https://railway.app

2. **Deploy via GitHub (Easiest):**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `dietwise` repository
   - Railway will auto-detect the `/backend` folder
   - Click "Deploy Now"

3. **Configure Environment Variables:**
   In Railway dashboard, go to Variables tab and add:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<your-supabase-connection-string>
   JWT_SECRET=<generate-secure-random-string>
   STRIPE_SECRET_KEY=<from-stripe-dashboard>
   STRIPE_WEBHOOK_SECRET=<will-set-after-webhook-config>
   SUPABASE_URL=<from-supabase-settings>
   SUPABASE_ANON_KEY=<from-supabase-settings>
   SUPABASE_SERVICE_ROLE_KEY=<from-supabase-settings>
   GEMINI_API_KEY=<from-google-ai-studio>
   FRONTEND_URL=<your-netlify-url>
   ```

4. **Get Your Backend URL:**
   - Railway provides: `https://dietwise-backend.up.railway.app`
   - Custom domains available on paid plans

5. **Alternative: Deploy via CLI:**
   ```bash
   npm i -g @railway/cli
   railway login
   railway link  # Select your project
   railway up    # Deploy
   ```

### Option 2: Render (Free Tier Available)

1. **Create a Render Account** at https://render.com
2. **Connect your GitHub repository**
3. **Create a new Web Service:**
   - Name: `dietwise-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free
4. **Add environment variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: Generate secure random string
   - `STRIPE_SECRET_KEY`: From Stripe dashboard
   - `STRIPE_WEBHOOK_SECRET`: Will set after webhook config
   - `SUPABASE_URL`: From Supabase settings
   - `SUPABASE_ANON_KEY`: From Supabase settings
   - `SUPABASE_SERVICE_ROLE_KEY`: From Supabase settings
   - `GEMINI_API_KEY`: From Google AI Studio
   - `FRONTEND_URL`: Your Netlify URL
5. **Deploy** - Click "Create Web Service"
6. **Note your URL**: `https://dietwise-backend.onrender.com`

### Option 3: Docker

1. **Build the image:**
   ```bash
   docker build -t dietwise-backend .
   ```

2. **Run locally:**
   ```bash
   docker run -p 3001:3001 --env-file .env dietwise-backend
   ```

3. **Deploy to any Docker host**

## Stripe Webhook Setup

1. **Install Stripe CLI:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **For local testing:**
   ```bash
   stripe listen --forward-to localhost:3001/api/v1/stripe/webhook
   ```
   Copy the webhook secret and add to .env

3. **For production:**
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://your-domain.com/api/v1/stripe/webhook`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `checkout.session.completed`
   - Copy the webhook secret to your environment variables

## Database Setup

1. **Create Supabase project**
2. **Run migrations:**
   ```bash
   npm run migrate
   ```
3. **Enable Row Level Security (RLS)**
4. **Configure authentication**

## Security Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure CORS for your frontend domain only
- [ ] Enable rate limiting
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry)
- [ ] Regular security audits

## Monitoring

1. **Health check endpoint:** `/health`
2. **API documentation:** `/api-docs`
3. **Logs:** Check server logs for errors
4. **Stripe Dashboard:** Monitor payment events

## Troubleshooting

### Common Issues:

1. **Database connection errors:**
   - Check DATABASE_URL format
   - Verify Supabase credentials
   - Check network connectivity

2. **Stripe webhook failures:**
   - Verify webhook secret
   - Check request body parsing
   - Ensure raw body for webhook endpoint

3. **Authentication errors:**
   - Verify JWT_SECRET matches frontend
   - Check token expiration
   - Ensure proper CORS setup

## Support

For issues, check:
- Server logs
- Supabase logs
- Stripe webhook logs
- Application error tracking