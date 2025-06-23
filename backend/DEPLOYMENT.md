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

### Option 1: Railway (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and initialize:**
   ```bash
   railway login
   railway init
   ```

3. **Add environment variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set SUPABASE_URL=your_url
   # Add all other variables from .env.example
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

### Option 2: Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add all environment variables
6. Deploy

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