#!/bin/bash

TARGET_DIR="project_assets"

mkdir -p "$TARGET_DIR"

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
)

echo "📦 Moving non-critical root files to $TARGET_DIR..."

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    mv "$file" "$TARGET_DIR/"
    echo "✅ Moved $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "🎉 Done."
