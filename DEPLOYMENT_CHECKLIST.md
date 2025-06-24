# DietWise Deployment Checklist

## 🔐 Security Issues to Address

### High Priority
1. **Remove Console Logs** ⚠️
   - Found 146 console.log statements in production code
   - Run: `grep -r "console\." --include="*.ts" --include="*.tsx" --exclude-dir=node_modules . | grep -v -E "(test|spec|debug)"`
   - Replace with proper logging service (already have logger in backend)

2. **Package Vulnerabilities** ⚠️
   - Found high severity vulnerability in cross-spawn
   - Run `npm audit fix` to fix automatically fixable issues
   - May need to update imagemin dependencies manually

3. **Environment Variables** ✅
   - `.env` files are properly gitignored
   - Example files provided for reference
   - Ensure production `.env` has all required values:
     - `GEMINI_API_KEY`
     - `VITE_API_URL`
     - `VITE_STRIPE_PUBLISHABLE_KEY`
     - `VITE_SENTRY_DSN` (if using Sentry)
     - Backend env vars (database, stripe secret key, etc.)

### Backend Security ✅
- Helmet.js configured for security headers
- CORS properly configured
- Rate limiting implemented
- Input validation needed review

## 📋 Pre-Deployment Tasks

### Code Quality
1. **ESLint Warnings**
   - 166 warnings (mostly unused variables)
   - Run `npm run lint:fix` to auto-fix what's possible
   - Manually review and clean up unused imports/variables

2. **Tests** ✅
   - All unit tests passing
   - Run `npm run test:all` before deployment

3. **Build** ✅
   - Build completes without TypeScript errors
   - Bundle size looks reasonable

### Configuration
1. **SSL/HTTPS**
   - Ensure SSL certificates are configured on hosting platform
   - Update CORS origins to use HTTPS URLs
   - Force HTTPS redirects

2. **API URLs**
   - Update `VITE_API_URL` to production backend URL
   - Ensure all API calls use HTTPS in production

3. **Error Handling**
   - Review error messages don't expose sensitive info
   - Implement proper error boundaries
   - Set up error monitoring (Sentry configured in vite.config.ts)

## 🚀 Deployment Steps

1. **Environment Setup**
   ```bash
   # Create production .env file with real values
   cp .env.example.production .env.production
   # Edit .env.production with actual values
   ```

2. **Fix Critical Issues**
   ```bash
   # Fix package vulnerabilities
   npm audit fix
   
   # Remove console logs (use a script or manually)
   # Consider using a babel plugin to strip console.logs in production
   ```

3. **Build & Deploy**
   ```bash
   # Install dependencies
   npm install --production
   
   # Build the app
   npm run build
   
   # Deploy dist folder to hosting service
   ```

## 🔍 Post-Deployment Verification

1. **Security Headers**
   - Check headers using securityheaders.com
   - Verify CSP, X-Frame-Options, etc.

2. **Performance**
   - Run Lighthouse audit
   - Check bundle sizes
   - Verify lazy loading works

3. **Functionality**
   - Test critical user flows
   - Verify API connections
   - Check error handling
   - Test on multiple devices/browsers

## 📝 Additional Recommendations

1. **Logging & Monitoring**
   - Set up proper logging aggregation
   - Configure Sentry for error tracking
   - Set up uptime monitoring

2. **Backup & Recovery**
   - Database backup strategy
   - Disaster recovery plan
   - Version control for deployments

3. **Performance Optimization**
   - Enable gzip/brotli compression
   - Set up CDN for static assets
   - Optimize images (already have optimization script)

4. **Security Enhancements**
   - Implement Content Security Policy (CSP)
   - Add security.txt file
   - Regular security audits
   - Keep dependencies updated

## ⚡ Quick Fixes Script

Create a `pre-deploy.sh` script:
```bash
#!/bin/bash

# Remove console.logs
echo "Removing console.log statements..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\./d'

# Run tests
echo "Running tests..."
npm run test:unit

# Build
echo "Building application..."
npm run build

echo "Pre-deployment tasks complete!"
```

## 🔗 Useful Commands

```bash
# Check for secrets in code
git secrets --scan

# Find large files
find . -type f -size +1M | grep -v node_modules

# Check for TODO comments
grep -r "TODO" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

---
Remember to test thoroughly in a staging environment before deploying to production!