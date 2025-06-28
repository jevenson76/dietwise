#!/bin/bash

echo "🚀 Starting DietWise Development Servers"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to kill processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend server
echo -e "${YELLOW}Starting backend server on port 3001...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend server
echo -e "${YELLOW}Starting frontend server on port 5173...${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Servers are starting!${NC}"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api-docs"
echo ""
echo "Test credentials:"
echo "- Any email/password for registration"
echo "- Stripe test card: 4242 4242 4242 4242"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop
wait