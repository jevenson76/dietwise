# Railway Environment Update Instructions

## Quick Update (2 minutes):

1. **Go to**: https://railway.app/dashboard
2. **Find**: `elegant-manifestation-production` project
3. **Click**: Variables tab
4. **Update these 3 variables**:

```
CORS_ORIGIN
Old: https://dainty-fenglisu-ef1cdb.netlify.app
New: https://euphonious-moonbeam-b33115.netlify.app

FRONTEND_URL  
Old: https://dainty-fenglisu-ef1cdb.netlify.app
New: https://euphonious-moonbeam-b33115.netlify.app

STRIPE_WEBHOOK_SECRET
Old: (empty or placeholder)
New: whsec_pWkZRaxQZ79sh3V0lgeWmeKC3e8GqirJ
```

5. **Click**: Deploy button (or wait for auto-redeploy)

## Verification:
After deployment, test: https://euphonious-moonbeam-b33115.netlify.app
- Premium status should work correctly
- No more CORS errors
- All API calls should succeed

## Alternative: Use Railway CLI
If you have Railway CLI setup locally:
```bash
railway login
railway link [your-project-id]
railway variables set CORS_ORIGIN=https://euphonious-moonbeam-b33115.netlify.app
railway variables set FRONTEND_URL=https://euphonious-moonbeam-b33115.netlify.app
railway variables set STRIPE_WEBHOOK_SECRET=whsec_pWkZRaxQZ79sh3V0lgeWmeKC3e8GqirJ
```