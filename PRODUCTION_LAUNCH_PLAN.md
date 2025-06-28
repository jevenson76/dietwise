# 🚀 DietWise Production Launch Plan

## 📅 Timeline: 21 Days to Launch

This comprehensive plan will get DietWise from development to production-ready in 3 weeks.

---

## 🔒 **PHASE 1: SECURITY & CREDENTIALS** (Days 1-7)

### Day 1-2: Set Up Production Services

#### **Priority 1: Supabase Production Setup**
- [ ] Create new Supabase production project
- [ ] Copy database schema from development
- [ ] Run RLS optimization migration
- [ ] Configure authentication settings
- [ ] Set up email templates for verification
- [ ] **Deliverable**: Production Supabase URL + keys

#### **Priority 2: Google Services**
- [ ] Create Google Cloud project for production
- [ ] Enable Gemini AI API
- [ ] Generate production API key with quotas
- [ ] Set up billing alerts
- [ ] **Deliverable**: Production Gemini API key

#### **Priority 3: Stripe Production**
- [ ] Upgrade to Stripe live mode
- [ ] Create subscription products (Monthly/Yearly)
- [ ] Configure tax settings for your regions
- [ ] Set up webhook endpoint (placeholder URL for now)
- [ ] **Deliverable**: Live Stripe keys + price IDs

### Day 3-4: Secure Code & Environment

#### **Remove Hardcoded Credentials**
```bash
# Run this audit script
npm run audit:credentials
```

**Files to update:**
- [ ] Remove test keys from `src/config/stripe.ts`
- [ ] Update `.env.example` with production template
- [ ] Add credential validation to startup
- [ ] Create secure environment setup guide

#### **Generate Secure Secrets**
```bash
# Generate secure JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

- [ ] Generate 64-byte JWT secret
- [ ] Generate 64-byte JWT refresh secret
- [ ] Create secure session secrets
- [ ] **Deliverable**: Secure production secrets

### Day 5-6: Authentication & Email

#### **Email Service Setup**
- [ ] Choose email provider (Resend/SendGrid/AWS SES)
- [ ] Configure SMTP settings
- [ ] Set up email templates
- [ ] Test email delivery

#### **Authentication Improvements**
- [ ] Make Redis optional with memory fallback
- [ ] Implement email verification flow
- [ ] Add password reset functionality
- [ ] Test forgot password flow
- [ ] **Deliverable**: Working email authentication

### Day 7: Security Audit & Testing

#### **Security Checklist**
- [ ] No credentials in source code ✓
- [ ] HTTPS everywhere ✓
- [ ] Secure headers configured ✓
- [ ] Rate limiting implemented ✓
- [ ] Input validation on all endpoints ✓
- [ ] **Deliverable**: Security audit report

---

## 🏗️ **PHASE 2: BACKEND & INFRASTRUCTURE** (Days 8-14)

### Day 8-9: Production Database

#### **Database Setup**
- [ ] Deploy PostgreSQL on production server
  - **Option A**: Supabase (recommended - $0-25/month)
  - **Option B**: Railway PostgreSQL ($5-20/month)
  - **Option C**: DigitalOcean Managed DB ($15-50/month)

#### **Database Optimization**
```sql
-- Run these performance optimizations
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_food_logging_user_date ON food_logging(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_meal_plans_user_active ON meal_plans(user_id, is_active);
```

- [ ] Create production database
- [ ] Run all migrations
- [ ] Add performance indexes
- [ ] Set up automated backups
- [ ] **Deliverable**: Production database ready

### Day 10-11: Backend Deployment

#### **Choose Hosting Platform**
**Recommended**: Railway (easiest) or DigitalOcean App Platform

**Railway Setup** (Recommended - $5-20/month):
```bash
# Deploy to Railway
npm install -g @railway/cli
railway login
railway init
railway up
```

**Alternative: DigitalOcean App Platform** ($12-25/month):
- [ ] Create App Platform app
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set up custom domain

#### **Backend Configuration**
- [ ] Deploy backend to production
- [ ] Configure SSL certificate
- [ ] Set up custom domain
- [ ] Configure CORS for production domain
- [ ] **Deliverable**: Live backend API

### Day 12-13: Payment Integration

#### **Stripe Production Setup**
- [ ] Configure webhook endpoint URL
- [ ] Test webhook receiving
- [ ] Verify subscription creation flow
- [ ] Test payment failure handling
- [ ] Add invoice/receipt emails

#### **Payment Flow Testing**
```bash
# Test with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

- [ ] Test complete signup → payment → access flow
- [ ] Verify subscription cancellation
- [ ] Test payment method updates
- [ ] **Deliverable**: Working payments end-to-end

### Day 14: Monitoring & Performance

#### **Set Up Monitoring**
- [ ] Add error tracking (Sentry - free tier)
- [ ] Set up uptime monitoring (UptimeRobot - free)
- [ ] Configure log aggregation
- [ ] Add performance monitoring

#### **Performance Optimization**
- [ ] Enable production caching
- [ ] Optimize database queries
- [ ] Set up CDN for static assets
- [ ] **Deliverable**: Monitored, optimized backend

---

## 📱 **PHASE 3: MOBILE & LAUNCH** (Days 15-21)

### Day 15-16: Mobile App Preparation

#### **App Configuration**
```json
// Update capacitor.config.json
{
  "appId": "com.dietwise.app",
  "appName": "DietWise",
  "bundledWebRuntime": false,
  "version": "1.0.0"
}
```

- [ ] Update app version to 1.0.0
- [ ] Generate app icons (1024x1024 source)
- [ ] Create splash screens
- [ ] Update app metadata

#### **iOS Preparation**
- [ ] Enroll in Apple Developer Program ($99)
- [ ] Create App Store Connect app
- [ ] Generate distribution certificate
- [ ] Create provisioning profiles
- [ ] **Deliverable**: iOS ready for store

#### **Android Preparation**
- [ ] Create Google Play Console account ($25)
- [ ] Generate signing key
- [ ] Create store listing
- [ ] Upload APK bundle
- [ ] **Deliverable**: Android ready for store

### Day 17-18: App Store Assets

#### **Marketing Materials**
- [ ] App screenshots (iPhone 6.7", iPad Pro, Android)
- [ ] App store description
- [ ] Keywords for ASO
- [ ] Privacy policy URL
- [ ] Support URL

#### **Store Listings**
- [ ] Upload iOS app to App Store Connect
- [ ] Submit for review (7-day review time)
- [ ] Upload Android app to Play Console
- [ ] Submit for review (3-day review time)
- [ ] **Deliverable**: Apps submitted to stores

### Day 19-20: Final Testing & Bug Fixes

#### **Production Testing Checklist**
- [ ] Complete user journey testing
- [ ] Payment flow testing with real cards
- [ ] Email notifications working
- [ ] Mobile app connects to production API
- [ ] All AI features working (Gemini API)

#### **Load Testing**
```bash
# Install artillery for load testing
npm install -g artillery
artillery run load-test.yml
```

- [ ] API can handle 100 concurrent users
- [ ] Database performs well under load
- [ ] No memory leaks in backend
- [ ] **Deliverable**: Production-tested system

### Day 21: Launch & Monitoring

#### **Go Live Checklist**
- [ ] Switch DNS to production
- [ ] Enable monitoring alerts
- [ ] Deploy web app to production
- [ ] Announce launch
- [ ] Monitor for issues

#### **Launch Day Tasks**
- [ ] Post on social media
- [ ] Email beta testers
- [ ] Monitor error rates
- [ ] Respond to user feedback
- [ ] **Deliverable**: Live application

---

## 💰 **BUDGET BREAKDOWN**

### Development Costs (One-time)
- Apple Developer: $99
- Google Play: $25
- Domain name: $15/year
- **Total**: $139

### Monthly Operating Costs
- **Tier 1 (0-1K users)**: $30-50/month
  - Supabase: Free
  - Railway: $5
  - Gemini API: $10-20
  - Monitoring: Free tiers

- **Tier 2 (1K-10K users)**: $100-200/month
  - Supabase: $25
  - Railway: $20
  - Gemini API: $50-100
  - Email service: $20

- **Tier 3 (10K+ users)**: $300-500/month
  - Database: $100
  - Hosting: $50
  - AI API: $200
  - Email/monitoring: $50

---

## 🛠️ **TOOLS & SCRIPTS FOR EXECUTION**

### Credential Management
```bash
# Set up production environment
npm run setup:production

# Validate all credentials
npm run validate:production

# Deploy to production
npm run deploy:production
```

### Testing Scripts
```bash
# Complete system test
npm run test:production

# Load testing
npm run test:load

# Security audit
npm run audit:security
```

### Monitoring Dashboard
```bash
# Health check endpoint
GET /api/health

# Metrics endpoint
GET /api/metrics

# Status page
https://your-app.com/status
```

---

## ⚠️ **RISK MITIGATION**

### High-Risk Items & Mitigation
1. **App Store Rejection**
   - Mitigation: Submit early, follow guidelines exactly
   - Backup: Have web app ready as fallback

2. **Payment Issues**
   - Mitigation: Extensive Stripe testing
   - Backup: Manual payment processing initially

3. **API Rate Limits**
   - Mitigation: Implement proper rate limiting
   - Backup: Upgrade API plans proactively

4. **Database Performance**
   - Mitigation: Load testing before launch
   - Backup: Database scaling plan ready

---

## 📋 **DAILY STANDUP TEMPLATE**

### Daily Check-in Questions:
1. What did I complete yesterday?
2. What am I working on today?
3. What blockers do I have?
4. Are we on track for launch?

### Weekly Milestones:
- **Week 1**: All credentials secured ✓
- **Week 2**: Backend deployed and tested ✓
- **Week 3**: Apps in store review ✓

---

## 🎯 **SUCCESS METRICS**

### Launch Criteria:
- [ ] 0% critical bugs
- [ ] <2 second API response times
- [ ] >99% uptime
- [ ] Payment success rate >98%
- [ ] App store approval

### Post-Launch Goals (30 days):
- 100+ app downloads
- 50+ paying users
- <5% churn rate
- 4+ star rating
- <1% error rate

---

## 📞 **SUPPORT PLAN**

### Launch Week Support:
- Monitor 24/7 for first 3 days
- Daily error report reviews
- Immediate bug fix deployment
- User feedback response within 2 hours

### Ongoing Support:
- Weekly performance reviews
- Monthly feature updates
- Quarterly security audits
- Semi-annual major releases

---

**Ready to start? Let's begin with Day 1: Setting up production Supabase!** 🚀