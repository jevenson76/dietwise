#!/bin/bash

echo "🚀 Starting pre-deployment checks..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create it from .env.example.production and fill in the values"
    exit 1
fi

# Check for required environment variables
required_vars=("VITE_API_URL" "GEMINI_API_KEY")
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.production || grep -q "^$var=your_" .env.production; then
        echo "❌ Error: $var is not properly set in .env.production"
        exit 1
    fi
done

echo "✅ Environment variables configured"

# Run tests
echo "🧪 Running tests..."
npm run test:unit
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Fix them before deploying."
    exit 1
fi
echo "✅ All tests passed"

# Check for ESLint errors (not warnings)
echo "📝 Checking for linting errors..."
npm run lint 2>&1 | grep -E "error" | grep -v "0 errors"
if [ $? -eq 0 ]; then
    echo "❌ ESLint errors found! Fix them before deploying."
    exit 1
fi
echo "✅ No linting errors"

# Check for high/critical vulnerabilities
echo "🔒 Checking for security vulnerabilities..."
npm audit --audit-level=high --production
if [ $? -ne 0 ]; then
    echo "⚠️  High or critical vulnerabilities found!"
    echo "Run 'npm audit fix' to attempt automatic fixes"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the application
echo "🔨 Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"

# Check build size
echo "📊 Build size summary:"
du -sh dist/
du -sh dist/assets/*.js | sort -h | tail -5

# Final checks
echo ""
echo "📋 Final checklist:"
echo "  ✓ Environment variables configured"
echo "  ✓ Tests passing"
echo "  ✓ No linting errors"
echo "  ✓ Build successful"
echo ""
echo "⚠️  Don't forget to:"
echo "  - Remove/wrap console.log statements (run: node scripts/remove-console-logs.js)"
echo "  - Update CORS origins for production"
echo "  - Configure SSL certificates"
echo "  - Set up monitoring and error tracking"
echo "  - Test on staging environment first"
echo ""
echo "✅ Pre-deployment checks complete! Ready to deploy dist/ folder"