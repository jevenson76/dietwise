#!/bin/bash
# Complete DietWise Authentication Test Sequence

echo "🚀 Testing DietWise Fresh Project Authentication..."

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s http://127.0.0.1:3001/health

echo -e "\n"

# Test 2: Registration
echo "2. Testing user registration..."
curl -X POST http://127.0.0.1:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@dietwise.com", "password": "securepassword123", "name": "Test User"}' \
  | python3 -m json.tool 2>/dev/null || echo "Registration response received"

echo -e "\n"

# Test 3: Login
echo "3. Testing user login..."
curl -X POST http://127.0.0.1:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@dietwise.com", "password": "securepassword123"}' \
  | python3 -m json.tool 2>/dev/null || echo "Login response received"

echo -e "\n"

# Test 4: Password reset
echo "4. Testing password reset..."
curl -X POST http://127.0.0.1:3001/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@dietwise.com"}'

echo -e "\n\n✅ Test sequence complete!"