#!/bin/bash

# DietWise Deployment Script
# This script automates the deployment process for DietWise

set -e # Exit on error

echo "🚀 DietWise Deployment Script"
echo "============================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

# Parse command line arguments
DEPLOY_FRONTEND=false
DEPLOY_BACKEND=false
BUILD_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend)
            DEPLOY_FRONTEND=true
            shift
            ;;
        --backend)
            DEPLOY_BACKEND=true
            shift
            ;;
        --all)
            DEPLOY_FRONTEND=true
            DEPLOY_BACKEND=true
            shift
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./deploy.sh [--frontend] [--backend] [--all] [--build-only]"
            exit 1
            ;;
    esac
done

# Default to deploying frontend if no options specified
if [ "$DEPLOY_FRONTEND" = false ] && [ "$DEPLOY_BACKEND" = false ] && [ "$BUILD_ONLY" = false ]; then
    DEPLOY_FRONTEND=true
fi

# Build Frontend
if [ "$DEPLOY_FRONTEND" = true ] || [ "$BUILD_ONLY" = true ]; then
    echo -e "\n${YELLOW}Building frontend for production...${NC}"
    
    # Check if .env.production exists
    if [ ! -f .env.production ]; then
        echo -e "${RED}Warning: .env.production not found!${NC}"
        echo "Creating from .env.example.production..."
        cp .env.example.production .env.production
        echo -e "${RED}Please update .env.production with your actual values${NC}"
        exit 1
    fi
    
    # Clean previous build
    rm -rf dist
    
    # Build
    npm run build:production
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend build completed successfully${NC}"
    else
        echo -e "${RED}✗ Frontend build failed${NC}"
        exit 1
    fi
fi

# Deploy Frontend to Netlify
if [ "$DEPLOY_FRONTEND" = true ] && [ "$BUILD_ONLY" = false ]; then
    echo -e "\n${YELLOW}Deploying frontend to Netlify...${NC}"
    
    # Check if netlify CLI is installed
    if ! command_exists netlify; then
        echo "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Deploy to Netlify
    echo "Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend deployed to Netlify successfully${NC}"
        echo -e "${YELLOW}Your site URL will be shown above${NC}"
    else
        echo -e "${RED}✗ Frontend deployment failed${NC}"
        exit 1
    fi
fi

# Backend deployment info
if [ "$DEPLOY_BACKEND" = true ]; then
    echo -e "\n${YELLOW}Backend Deployment Instructions:${NC}"
    echo "1. Go to https://railway.app"
    echo "2. Connect GitHub repo: jevenson76/dietwise"
    echo "3. Set root directory to: /backend"
    echo "4. Add environment variables from backend/.env.production"
    echo ""
    echo "Required environment variables:"
    echo "- NODE_ENV=production"
    echo "- DATABASE_URL (from Supabase)"
    echo "- JWT_SECRET"
    echo "- STRIPE_SECRET_KEY"
    echo "- STRIPE_WEBHOOK_SECRET"
    echo "- And others as needed..."
fi

# Post-deployment steps
echo -e "\n${YELLOW}Post-Deployment Checklist:${NC}"
echo "[ ] Update backend CORS_ORIGIN with Netlify URL"
echo "[ ] Configure Stripe webhooks with backend URL"
echo "[ ] Test user registration and login"
echo "[ ] Test Stripe payment flow"
echo "[ ] Verify AI features are working"

echo -e "\n${GREEN}Deployment script completed!${NC}"

# Summary
echo -e "\n${YELLOW}Summary:${NC}"
if [ "$BUILD_ONLY" = true ]; then
    echo "- Frontend built (not deployed)"
elif [ "$DEPLOY_FRONTEND" = true ]; then
    echo "- Frontend built and deployed to Netlify"
fi
if [ "$DEPLOY_BACKEND" = true ]; then
    echo "- Backend deployment instructions provided"
fi

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Note your Netlify URL"
echo "2. Update Railway backend CORS settings"
echo "3. Configure Stripe webhooks"
echo "4. Test the complete application"