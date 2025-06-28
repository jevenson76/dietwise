#!/bin/bash
echo "🔍 Running production readiness checks..."

# Stop if any TODOs remain
if rg -q 'TODO|FIXME|BUG|HACK|REFACTOR'; then
  echo "❌ Unresolved dev flags found. Review production_checklist.md and todos.txt."
  exit 1
fi

# Run linter
npx eslint . || { echo "❌ Linting failed"; exit 1; }

# Run tests
npm test || { echo "❌ Tests failed"; exit 1; }

# Build
npm run build || { echo "❌ Build failed"; exit 1; }

echo "✅ All checks passed. Ready for deploy."
