#!/bin/bash

TARGET_DIR="project_assets"
mkdir -p "$TARGET_DIR"

FILES=(
  "MOBILE_SETUP.md"
  "Project Plan Remaining.txt"
  "TESTING_GUIDE.md"
  "TESTING_STRATEGY.md"
  "checklist.md"
  "import_path_fix.txt"
  "monetizationPlan.md"
  "organize-docs.sh"
  "publish.sh"
  "stripe.env"
  "test-splash.html"
  "dietwise---your-personal-dieting-companion (5).zip"
  "index.html.backup"
  "index.tsx.backup"
)

echo "📦 Moving files into $TARGET_DIR..."

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    mv "$file" "$TARGET_DIR/"
    echo "✅ Moved: $file"
  else
    echo "⚠️  File not found or already moved: $file"
  fi
done

echo "🧹 Cleanup complete."
