# Railway Deployment Checklist

## Pre-Deployment
- [ ] Backend builds successfully (`npm run build`)
- [ ] All environment variables documented
- [ ] Supabase database is set up
- [ ] Stripe account configured
- [ ] Frontend deployed to Netlify

## Railway Setup
- [ ] Create account at https://railway.app
- [ ] Connect GitHub account
- [ ] Create new project from GitHub repo

## Environment Variables to Set
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`
- [ ] `DATABASE_URL` = Supabase connection string
- [ ] `JWT_SECRET` = Generate secure random (use: `openssl rand -base64 32`)
- [ ] `STRIPE_SECRET_KEY` = From Stripe dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` = (Set after webhook config)
- [ ] `SUPABASE_URL` = From Supabase project settings
- [ ] `SUPABASE_ANON_KEY` = From Supabase API settings
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = From Supabase API settings
- [ ] `GEMINI_API_KEY` = From Google AI Studio
- [ ] `FRONTEND_URL` = Your Netlify URL (e.g., https://dietwise.netlify.app)

## Post-Deployment
- [ ] Copy Railway URL (e.g., https://dietwise-backend.up.railway.app)
- [ ] Test health endpoint: `<railway-url>/health`
- [ ] Configure Stripe webhooks with Railway URL
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Railway
- [ ] Update frontend `.env` with backend URL
- [ ] Rebuild and redeploy frontend
- [ ] Test full user flow (signup → subscription → access)

## Monitoring
- [ ] Check Railway logs for errors
- [ ] Monitor Stripe webhook deliveries
- [ ] Set up uptime monitoring (optional)

## Notes
- Railway free tier: 500 hours/month (~20 days)
- No credit card required for free tier
- Automatic deploys on git push
- Built-in SSL/HTTPS
- PostgreSQL addon available if needed