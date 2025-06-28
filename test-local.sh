#!/bin/bash

echo "🚀 Starting DietWise Local Test Environment"
echo "=========================================="
echo ""

# Kill any existing processes on our ports
echo "Cleaning up old processes..."
pkill -f "node.*3001" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start frontend only (since it has the UI you want to test)
echo "Starting frontend development server..."
echo ""
echo "The app will open at: http://localhost:5173"
echo ""

# Use the development environment with your credentials
export VITE_GEMINI_API_KEY=AIzaSyCik_tWF0_-8SHEnoTJ9dWoxMe1bV93Irk
export VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RbrneFmhcNUMRQyAYWrKMVYSau6i7oc9IMXgGNOOYXZj9u2HO5ouIu20oZgXKX9JJ248N8CmZ7tMmHWTI8fJ61Q00QfNee4bm

# Start Vite
npm run dev -- --port 5173 --host