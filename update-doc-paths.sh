#!/bin/bash

echo "🔄 Updating Markdown file references to project_assets/..."

# All .md files that might reference moved files
TARGET_DOCS=$(find . -name "*.md" -not -path "./project_assets/*")

# Common files moved to project_assets/
FILES=(
  "BULLETPROOF_TEST_REPORT.md"
  "BULLETPROOF_FINAL_REPORT.md"
  "dietwise-app-screenshot.png"
  "dietwise-desktop.png"
  "dietwise-mobile.png"
  "dietwise-tablet.png"
  "dietwise_guide.md"
  "TEST_RESULTS_SUMMARY.md"
  "SUPABASE_INTEGRATION_GUIDE.md"
  "deployment.md"
  "DEPLOYMENT_SUCCESS.md"
  "PRODUCTION_ACCOUNT_ARCHITECTURE.md"
  "MOBILE_SETUP.md"
  "TESTING_GUIDE.md"
  "TESTING_STRATEGY.md"
  "stripe.env"
  "checklist.md"
  "monetizationPlan.md"
)

for file in "${FILES[@]}"; do
  for doc in $TARGET_DOCS; do
    if grep -q "$file" "$doc"; then
      sed -i "s|\b$file\b|project_assets/$file|g" "$doc"
      echo "✅ Updated $file in $doc"
    fi
  done
done

echo "✅ All references updated."
