# 🚀 DietWise Master TODO List

**Generated:** December 22, 2024
**Status:** Consolidating all TODOs and fixing critical issues

## 🚨 CRITICAL SECURITY ISSUES (Must fix immediately)

### 1. Remove Android Keystore from Repository
- [ ] Delete `/android/app/keystore/dietwise-release.keystore` 
- [ ] Generate new keystore and keep it secure
- [ ] Update `.gitignore` to prevent future commits

### 2. Remove Hardcoded Credentials
- [ ] Remove Supabase credentials from `/backend/test-auth.js`
- [ ] Remove Supabase credentials from `/backend/test-fresh-signup.js`
- [ ] Remove Supabase credentials from `/backend/test-direct-login.js`
- [ ] Move all credentials to environment variables

### 3. Security Configuration
- [ ] Add comprehensive `.gitignore` entries
- [ ] Remove sensitive files from git history
- [ ] Set up proper environment variable management

## 🔴 HIGH PRIORITY FIXES

### 4. Production Code Cleanup
- [ ] Remove all console.log statements (32 files affected)
- [ ] Replace with proper logging service
- [ ] Remove debug/test code from production

### 5. Splash Screen Integration
- [ ] Integrate `SplashScreen.tsx` component into `App.tsx`
- [ ] Use `useSplashScreen` hook properly
- [ ] Test on both Android and iOS

### 6. Error Handling & User Experience
- [ ] Add proper error boundaries for all API calls
- [ ] Implement user-friendly error messages
- [ ] Add loading states for all async operations
- [ ] Add offline mode handling

### 7. Backend TODO Implementation
- [ ] Implement `/backend/src/routes/health.routes.ts` endpoints (6 TODOs)
- [ ] Implement `/backend/src/routes/user.routes.ts` endpoints (4 TODOs)

## 🟡 MEDIUM PRIORITY IMPROVEMENTS

### 8. Code Refactoring
- [ ] Split large `App.tsx` file into smaller components
- [ ] Optimize chained array operations for performance
- [ ] Remove unused imports and variables
- [ ] Implement proper state management (Redux/Zustand)

### 9. Performance Optimization
- [ ] Lazy load heavy dependencies (charts, PDF generation)
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add performance monitoring

### 10. Testing & Quality
- [ ] Fix all ESLint warnings
- [ ] Add missing unit tests
- [ ] Add integration tests for API endpoints
- [ ] Set up CI/CD pipeline

## 🟢 LOW PRIORITY ENHANCEMENTS

### 11. Clean Up Repository
- [ ] Remove `/public/sw.js.backup`
- [ ] Clean up mock implementations in:
  - `/src/aso/keywordStrategy.ts`
  - `/src/partnerships/corporateWellness.ts`
  - `/src/viral/viralMechanics.ts`
- [ ] Remove duplicate TODO files

### 12. Development Experience
- [ ] Add proper ESLint rules
- [ ] Configure Prettier
- [ ] Add pre-commit hooks
- [ ] Improve TypeScript types

## 📋 APP STORE REQUIREMENTS (From PRODUCTION_READY_TODO.md)

### Legal & Compliance
- [ ] Finalize Privacy Policy with company details
- [ ] Finalize Terms of Service
- [ ] Register as Apple merchant
- [ ] Configure In-App Purchase items

### Backend Deployment
- [ ] Deploy backend to production server
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure production environment variables
- [ ] Set up monitoring and logging

### Payment Integration
- [ ] Create production Stripe account
- [ ] Configure webhook endpoints
- [ ] Test full payment flow
- [ ] Set up tax configuration

### Store Submission
- [ ] Create developer accounts ($25 Google, $99 Apple)
- [ ] Generate production build keys
- [ ] Create app store screenshots
- [ ] Prepare marketing materials
- [ ] Submit for review

## 🔧 IMPLEMENTATION PLAN

### Phase 1: Critical Security (Today)
1. Remove sensitive files from repository
2. Update .gitignore
3. Clean git history
4. Regenerate keys

### Phase 2: Code Quality (Days 1-2)
1. Remove console statements
2. Integrate splash screen
3. Implement error handling
4. Fix backend TODOs

### Phase 3: Optimization (Days 3-4)
1. Refactor large components
2. Optimize performance
3. Clean up codebase
4. Add tests

### Phase 4: Deployment (Days 5-7)
1. Deploy backend
2. Configure production environment
3. Test payment flow
4. Submit to stores

## ✅ Definition of Done
- All critical security issues resolved
- No console.log in production code
- Splash screen working on all platforms
- All API endpoints implemented
- Error handling throughout app
- Backend deployed and tested
- Payment flow working end-to-end
- App store listings approved

---

**Note:** This master TODO consolidates all issues from code analysis, PRODUCTION_READY_TODO.md, and audit findings. Previous TODO files can be archived after review.