#!/bin/bash

# DietWise Comprehensive Test Runner
# This script runs all tests and generates a detailed report

echo "🧪 DietWise Test Suite Runner"
echo "============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to run test suite
run_test_suite() {
    local suite_name=$1
    local command=$2
    
    echo -e "${YELLOW}Running $suite_name...${NC}"
    
    if $command; then
        echo -e "${GREEN}✅ $suite_name PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $suite_name FAILED${NC}"
        ((FAILED++))
    fi
    echo ""
}

# Install Playwright browsers if needed
if [ ! -d "node_modules/@playwright/test/lib/server/chromium" ]; then
    echo "Installing Playwright browsers..."
    npm run playwright:install
fi

# Run all test suites
echo "Starting test execution..."
echo ""

# Unit tests
run_test_suite "Unit Tests" "npm run test:unit"

# Integration tests
run_test_suite "Integration Tests" "npm run test:integration"

# E2E tests - Desktop
run_test_suite "E2E Tests (Desktop)" "npm run test:e2e -- --project=chromium"

# E2E tests - Mobile
run_test_suite "E2E Tests (Mobile)" "npm run test:mobile"

# Accessibility tests
run_test_suite "Accessibility Tests" "npm run test:a11y"

# Visual regression tests
run_test_suite "Visual Regression Tests" "npm run test:visual"

# Coverage report
echo -e "${YELLOW}Generating coverage report...${NC}"
npm run test:coverage

# Summary
echo ""
echo "============================="
echo "📊 Test Summary"
echo "============================="
echo -e "Total Tests Run: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

# Generate HTML report
echo "📄 Generating HTML reports..."
echo "- Coverage Report: ./coverage/index.html"
echo "- Playwright Report: ./playwright-report/index.html"
echo ""

# Exit with appropriate code
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! DietWise is bulletproof!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the reports.${NC}"
    exit 1
fi