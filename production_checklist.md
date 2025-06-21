# ✅ Unified Production, Testing, and Deployment Checklist for Dietwise

**Project:** Dietwise
**Publisher:** Wizard Tech LLC
**Maintainer:** Jason Evenson
**Environment:** WSL + Netlify + iOS/Android + Node.js/TS + Vite + Supabase

---

## 🔧 Backend (Node/Express + TypeScript)

*

## 🧪 Testing (Vitest + Playwright + Shell)

*

```sh
#!/bin/bash

mkdir -p audit

echo "🔍 Running lint..."
npx eslint . || exit 1

echo "🧪 Running unit tests..."
vitest run --coverage || exit 1

echo "🧪 Running E2E tests..."
PWDEBUG=0 npm run test:e2e || exit 1

echo "🧪 Running CLI test runner..."
./test-runner.sh || exit 1

echo "✅ All test phases passed."
```

*

## 📱 Mobile (iOS/Android + Capacitor)

*

## 🔐 Secrets & Security

*

## 🛠 Build, Lint, and Quality Gate

### 🔁 Codex ESLint Fix Review Queue (Prompt Chain)

To resolve all `@typescript-eslint/no-unused-vars` warnings without model failure:

**Use the following Codex prompt per file:**

```sh
codex review <file> --prompt "Identify and fix all @typescript-eslint/no-unused-vars issues. Rename unused parameters with a leading underscore. Remove unused imports. Rename placeholders with _var and add // TODO comments if future use is intended. Return a clean, complete block."
```

**Files to review in this order:**

1. backend/src/middleware/auth.middleware.ts
2. backend/src/middleware/errorHandler.ts
3. components/AdvancedAnalytics.tsx
4. components/FoodLog.tsx
5. components/MealIdeaSuggestion.tsx
6. components/MyLibraryComponent.tsx
7. components/SplashScreen.tsx
8. components/UserProfileForm.tsx
9. components/UserStatusDashboard.tsx
10. components/WeightChartComponent.tsx
11. components/WeightLogFormComponent.tsx
12. components/common/ErrorBoundary.tsx
13. constants.ts
14. hooks/useCameraBarcodeScanner.ts
15. hooks/useSplashScreen.ts
16. services/api/auth.ts
17. src/App.tsx
18. src/customer-success/healthScore.ts
19. src/finance/revenueOptimization.ts
20. src/seo/contentStrategy.ts
21. src/utils/dataLimits.ts
22. tests/e2e/bulletproof-test.spec.ts
23. tests/e2e/full-user-journey.spec.ts
24. tests/e2e/mobile-features.spec.ts
25. tests/unit/UserProfileForm.test.tsx

*

```js
import reactHooks from 'eslint-plugin-react-hooks';
...
plugins: {
  'react-hooks': reactHooks
},
rules: {
  'react-hooks/exhaustive-deps': 'warn'
}
```

*

## 🧾 Documentation & Reports

*

## 🚀 Netlify Deployment

*

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "./plugins/check-todos"
```

*

## 🎯 Final Push Strategy

*

```sh
npm install
npm test
npm run build
```

*

---

*This unified checklist enforces full audit coverage for backend, mobile, testing, secrets, CI, and deployment.*
