#!/bin/bash

# Railway deployment script for DietWise backend
set -e

echo "Setting up Railway environment variables..."

# Set all environment variables from the JSON file
railway variables --set "NODE_ENV=production" \
                  --set "PORT=3001" \
                  --set "DATABASE_URL=postgresql://postgres:0zmEpl3v#Jux&vpz8JzcUmnuMBwwPAbFzuO\$HF#F@db.ozuuombybpfluztjvzdc.supabase.co:5432/postgres" \
                  --set "JWT_SECRET=P55K13v6rklXhVN6FtlI66WoA4e46Apu4cH5jiXru3DC53b6PJuQ1b/GI0u/EE/gyoDVdgKwd4LtOoZ/gc52yg==" \
                  --set "JWT_EXPIRES_IN=7d" \
                  --set "STRIPE_SECRET_KEY=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" \
                  --set "STRIPE_WEBHOOK_SECRET=" \
                  --set "STRIPE_PRICE_ID_MONTHLY=price_1Rbs8KFmhcNUMRQy7LPWM3n5" \
                  --set "STRIPE_PRICE_ID_YEARLY=price_1RbsAVFmhcNUMRQyI3IpNq17" \
                  --set "STRIPE_TRIAL_DAYS=7" \
                  --set "SUPABASE_URL=https://ozuuombybpfluztjvzdc.supabase.co" \
                  --set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dXVvbWJ5YnBmbHV6dGp2emRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNzIsImV4cCI6MjA2NTkzMDE3Mn0.nItFFmyF4PbgKQ_K8Gi-nztQPrU14iVxsne9B9xnqKM" \
                  --set "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dXVvbWJ5YnBmbHV6dGp2emRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM1NDE3MiwiZXhwIjoyMDY1OTMwMTcyfQ.YNM0BoGFkAZqrvBIs4pfNrd_kCX1-2tMrbuLdecZRd0" \
                  --set "GEMINI_API_KEY=AIzaSyALbHuWeJ3tS87ygqhQ5jbZ_RFGMDW288o" \
                  --set "FRONTEND_URL=https://dainty-fenglisu-ef1cdb.netlify.app" \
                  --set "CORS_ORIGIN=https://dainty-fenglisu-ef1cdb.netlify.app" \
                  --set "RATE_LIMIT_WINDOW_MS=60000" \
                  --set "RATE_LIMIT_MAX_REQUESTS=100" \
                  --set "LOG_LEVEL=warn"

echo "Deploying backend to Railway..."
railway up backend/backend --detach

echo "Railway deployment completed!"