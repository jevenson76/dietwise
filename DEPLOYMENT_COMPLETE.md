# 🎉 DietWise Deployment Guide

## ✅ Completed Steps

1. **Frontend Built** - Production build ready in `dist` folder
2. **Deployment Script Created** - `deploy.sh` for automated deployments
3. **Backend Ready** - Configured for Railway deployment

## 🚀 Deploy Frontend to Netlify (Manual Steps)

### Option 1: Drag & Drop (Easiest)
1. Open your browser and go to: https://app.netlify.com/drop
2. Open your file manager to the `/home/jevenson/dietwise/dist` folder
3. Drag the entire `dist` folder onto the Netlify drop page
4. Netlify will automatically deploy your site
5. You'll get a URL like: `https://amazing-name-123456.netlify.app`

### Option 2: GitHub Integration
1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Production build ready"
   git push origin main
   ```
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub account
5. Select `jevenson76/dietwise` repository
6. Build settings:
   - Build command: `npm run build:production`
   - Publish directory: `dist`
7. Deploy!

### Option 3: Use the created zip file
1. I've created `dietwise-dist.zip` in your project folder
2. You can share this with anyone who needs to deploy
3. They can extract and deploy the contents

## 📋 Post-Deployment Checklist

### 1. Update Backend CORS
Once you have your Netlify URL, update your Railway backend:
- Go to Railway dashboard
- Update environment variables:
  - `FRONTEND_URL=https://your-site.netlify.app`
  - `CORS_ORIGIN=https://your-site.netlify.app`

### 2. Configure Stripe Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://dietwise-backend.up.railway.app/api/v1/stripe/webhook`
3. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - checkout.session.completed
4. Copy the webhook secret
5. Update Railway backend with `STRIPE_WEBHOOK_SECRET`

### 3. Test Your Deployment
- [ ] Visit your Netlify URL
- [ ] Create a test account
- [ ] Try the AI features (meal suggestions)
- [ ] Test Stripe subscription (use test card: 4242 4242 4242 4242)
- [ ] Check mobile responsiveness

## 🔧 Troubleshooting

### CORS Errors
- Make sure the backend CORS_ORIGIN exactly matches your Netlify URL (including https://)
- No trailing slashes!

### API Connection Issues
- Verify the backend URL in `.env.production` is correct
- Check Railway logs for any errors
- Ensure all environment variables are set in Railway

### Stripe Issues
- Double-check webhook secret is copied correctly
- Verify you're using live keys (pk_live_ and sk_live_)
- Check Stripe dashboard for webhook delivery status

## 📱 Mobile App Deployment

After web deployment is working:
1. Update capacitor.config.ts with your production URL
2. Build for iOS/Android:
   ```bash
   npm run build
   npx cap sync
   npx cap open ios  # or android
   ```

## 🎯 Next Steps

1. **Custom Domain** (Optional)
   - Add a custom domain in Netlify settings
   - Update SSL certificate

2. **Performance Monitoring**
   - Set up Google Analytics
   - Configure Sentry for error tracking
   - Monitor with Lighthouse

3. **Marketing**
   - Submit to app stores
   - Set up social media
   - Create landing page

## 📞 Support

- Backend Logs: Check Railway dashboard
- Frontend Issues: Check browser console
- Payments: Check Stripe dashboard
- Build Issues: Check this guide first!

---

**Your app is ready for deployment! Follow the steps above to go live.** 🚀