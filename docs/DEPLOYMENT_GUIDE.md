# DietWise Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Stripe account (live API keys)
- Hosting provider (Vercel, Netlify, or similar)
- Domain name configured
- SSL certificate (usually provided by host)

## Environment Setup

### 1. Environment Variables

Create production `.env` file:
```bash
# API Keys
GEMINI_API_KEY=your_production_gemini_key

# Stripe Production Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
VITE_STRIPE_PRICE_MONTHLY=price_LIVE_MONTHLY_PRICE_ID
VITE_STRIPE_PRICE_YEARLY=price_LIVE_YEARLY_PRICE_ID

# Optional: Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Build Configuration

Update `vite.config.ts` for production:
```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs
        drop_debugger: true
      }
    }
  }
});
```

## Deployment Steps

### 1. Pre-deployment Checklist

- [ ] Switch to Stripe live keys
- [ ] Update success/cancel URLs to production domain
- [ ] Remove all debug/demo features
- [ ] Test payment flow with real card
- [ ] Configure domain and SSL
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics tracking
- [ ] Review security headers

### 2. Build Process

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add VITE_STRIPE_PRICE_MONTHLY
vercel env add VITE_STRIPE_PRICE_YEARLY
```

### 4. Netlify Deployment

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in site settings
4. Enable automatic deploys

### 5. Custom Server Deployment

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name dietwise.app;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/dietwise/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self' https://*.stripe.com";

    # Gzip compression
    gzip on;
    gzip_types text/plain application/javascript text/css application/json;
}
```

## Post-Deployment

### 1. Stripe Configuration

1. **Webhook Setup**:
   ```
   https://dietwise.app/api/webhooks/stripe
   ```
   Events to subscribe:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed

2. **Customer Portal**:
   - Enable in Stripe Dashboard
   - Configure allowed actions
   - Set up redirect URL

### 2. Monitoring Setup

#### Error Tracking (Sentry)
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 0.1,
});
```

#### Analytics
```typescript
// Google Analytics 4
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX");
ReactGA.send("pageview");
```

### 3. Performance Optimization

1. **Enable CDN**:
   - CloudFlare or host-provided CDN
   - Cache static assets
   - Configure cache headers

2. **Image Optimization**:
   ```bash
   # Optimize images before deployment
   npx imagemin src/assets/* --out-dir=dist/assets
   ```

3. **Bundle Analysis**:
   ```bash
   npm run build -- --analyze
   ```

### 4. Security Hardening

1. **Content Security Policy**:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; 
                  script-src 'self' https://js.stripe.com; 
                  style-src 'self' 'unsafe-inline'; 
                  img-src 'self' data: https:;">
   ```

2. **API Rate Limiting**:
   - Implement on server endpoints
   - Use Cloudflare rate limiting

3. **Input Validation**:
   - Sanitize all user inputs
   - Validate data types and ranges

## Rollback Plan

### Quick Rollback Steps:
1. **Vercel**: `vercel rollback`
2. **Netlify**: Use deploy history in dashboard
3. **Custom**: Keep previous build artifacts

### Database Considerations:
- No database migrations needed (localStorage only)
- User data persists across deployments

## Maintenance Mode

Create `maintenance.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>DietWise - Maintenance</title>
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: system-ui;
            background: #f3f4f6;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 { color: #14b8a6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>DietWise is under maintenance</h1>
        <p>We'll be back shortly. Thank you for your patience!</p>
    </div>
</body>
</html>
```

## Production Monitoring

### Key Metrics to Track:
1. **Application Health**:
   - Page load time
   - API response times
   - JavaScript error rate
   - Payment success rate

2. **Business Metrics**:
   - Conversion rate (free to premium)
   - Feature usage by tier
   - Churn rate
   - Average revenue per user

3. **Infrastructure**:
   - Server uptime
   - CDN hit rate
   - SSL certificate expiry
   - Domain renewal dates

### Alerts to Configure:
- Payment failures > 5%
- Page load time > 3 seconds
- JavaScript errors > 100/hour
- Server 5xx errors
- SSL certificate expiring < 30 days

## Troubleshooting

### Common Issues:

1. **Stripe Integration**:
   - Verify API keys are correct
   - Check webhook signature validation
   - Ensure success/cancel URLs are absolute

2. **Build Failures**:
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify environment variables

3. **Performance Issues**:
   - Enable compression
   - Optimize images
   - Reduce bundle size
   - Implement code splitting

## Backup Strategy

### Regular Backups:
1. **Code**: Git repository (GitHub/GitLab)
2. **Environment**: Document all env variables
3. **User Data**: Export localStorage data option
4. **Stripe**: Use Stripe's data export tools

### Disaster Recovery:
1. Keep deployment scripts in version control
2. Document all third-party service configurations
3. Maintain staging environment for testing
4. Regular deployment drills

## Support Documentation

### For Customer Support:
1. Common subscription issues and solutions
2. How to verify premium status
3. Refund process via Stripe
4. Data export instructions

### For Developers:
1. Local development setup
2. Testing payment flows
3. Adding new premium features
4. Performance profiling