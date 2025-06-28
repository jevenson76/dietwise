#!/bin/bash

echo "🚀 Starting DietWise Full Stack Application"
echo "=========================================="
echo ""

# Kill any existing processes
echo "Cleaning up old processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend
echo "Starting backend server on port 3001..."
cd backend
npm run dev > /tmp/dietwise-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running at http://localhost:3001"
else
    echo "❌ Backend failed to start. Check /tmp/dietwise-backend.log"
fi

# Start frontend
echo ""
echo "Starting frontend server on port 5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "==========================================="
echo "🎉 DietWise is starting up!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api-docs"
echo ""
echo "✨ AI Meal Planning is now connected!"
echo ""
echo "To test AI features:"
echo "1. Go to the 'Meal Ideas' tab"
echo "2. Click 'Get AI Meal Suggestions'"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "==========================================="

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait