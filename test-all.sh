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
