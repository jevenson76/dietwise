# DietWise Production Deployment Guide

## Overview

This guide covers deploying the DietWise backend to production and configuring all necessary services for a production-ready application.

## Prerequisites

- Node.js 18+ production server
- PostgreSQL database
- Domain name with SSL certificate
- Stripe account with live keys
- (Optional) Redis for caching and sessions

## Backend Deployment Options

### Option 1: Cloud Platforms (Recommended)

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Heroku
```bash
# Install Heroku CLI
# Create app
heroku create dietwise-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```

#### DigitalOcean App Platform
```bash
# Use the DigitalOcean control panel
# Connect GitHub repository
# Configure environment variables
# Auto-deploy from main branch
```

#### AWS/GCP/Azure
- Use container services (ECS, Cloud Run, Container Instances)
- Configure load balancers and auto-scaling
- Set up managed PostgreSQL databases

### Option 2: VPS/Dedicated Server

#### Server Setup (Ubuntu 22.04)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Certbot (SSL certificates)
sudo apt install -y certbot python3-certbot-nginx
```

## Database Setup

### PostgreSQL Configuration

```sql
-- Create database
CREATE DATABASE dietwise_production;

-- Create user
CREATE USER dietwise_user WITH PASSWORD 'secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE dietwise_production TO dietwise_user;
ALTER USER dietwise_user CREATEDB;
```

### Run Migrations

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://dietwise_user:password@localhost:5432/dietwise_production"

# Run migrations
cd backend
npm run migrate
```

## Environment Configuration

### Backend Environment Variables

Create `/backend/.env.production`:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET_KEY=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d

# Stripe Configuration (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
STRIPE_PRICE_ID_MONTHLY=price_live_monthly_id
STRIPE_PRICE_ID_YEARLY=price_live_yearly_id

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=warn

# Email Configuration (for password resets)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM="DietWise <noreply@yourdomain.com>"

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

### Frontend Environment Variables

Create `/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

## SSL Certificate Setup

### Using Certbot (Let's Encrypt)

```bash
# Get certificate for your domain
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

## Nginx Configuration

### `/etc/nginx/sites-available/dietwise-backend`

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/dietwise-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Process Management

### PM2 Configuration

Create `backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'dietwise-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production'
    },
    log_file: '/var/log/pm2/dietwise-backend.log',
    error_file: '/var/log/pm2/dietwise-backend-error.log',
    out_file: '/var/log/pm2/dietwise-backend-out.log',
    time: true
  }]
}
```

### Deploy with PM2:

```bash
# Build the application
cd backend
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## Stripe Webhook Configuration

### 1. Create Webhook Endpoint in Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set URL: `https://api.yourdomain.com/api/v1/stripe/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 2. Update Environment Variable

Copy the webhook signing secret from Stripe and update:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

## Frontend Deployment

### Build for Production

```bash
# Build with production environment
npm run build

# Upload dist/ folder to your web hosting
# Or deploy to Netlify/Vercel/etc.
```

### Static Hosting Options

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### AWS S3 + CloudFront
```bash
# Upload to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Database Backup Strategy

### Automated PostgreSQL Backups

```bash
#!/bin/bash
# /opt/scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/postgresql"
DB_NAME="dietwise_production"

mkdir -p $BACKUP_DIR

pg_dump $DB_NAME | gzip > $BACKUP_DIR/dietwise_backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "dietwise_backup_*.sql.gz" -mtime +30 -delete
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /opt/scripts/backup-db.sh
```

## Monitoring & Logging

### Application Monitoring

#### PM2 Monitoring
```bash
# Monitor in real-time
pm2 monit

# View logs
pm2 logs dietwise-backend

# Restart if needed
pm2 restart dietwise-backend
```

#### Optional: Add APM Tools
- New Relic
- DataDog  
- Sentry for error tracking

### System Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Check system resources
htop
df -h
free -h
```

## Security Checklist

### Server Security
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Regular security updates
- [ ] Non-root user for application
- [ ] Fail2ban for intrusion prevention

### Application Security
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set

### Database Security
- [ ] PostgreSQL access restricted
- [ ] Regular backups tested
- [ ] Connection encryption enabled
- [ ] Audit logging enabled

## Performance Optimization

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

### Application Optimization
- Enable compression in Nginx
- Use Redis for session storage
- Implement database connection pooling
- Set up CDN for static assets

## Deployment Automation

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/dietwise-backend
            git pull origin main
            npm ci
            npm run build
            pm2 restart dietwise-backend
```

## Post-Deployment Testing

### Health Checks
```bash
# Test API endpoints
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/api/v1/auth/health

# Test Stripe webhook
# Use Stripe CLI to forward events for testing
```

### Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test load
ab -n 1000 -c 10 https://api.yourdomain.com/health
```

## Troubleshooting

### Common Issues

**503 Service Unavailable**
- Check PM2 process status: `pm2 status`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

**Database Connection Issues**
- Verify DATABASE_URL
- Check PostgreSQL status: `sudo systemctl status postgresql`
- Test connection: `psql $DATABASE_URL`

**SSL Certificate Issues**
- Check certificate validity: `sudo certbot certificates`
- Renew if needed: `sudo certbot renew`

### Log Locations
- PM2 logs: `/var/log/pm2/`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`

## Maintenance Schedule

### Daily
- [ ] Monitor application logs
- [ ] Check system resources
- [ ] Verify backup completion

### Weekly  
- [ ] Review error rates
- [ ] Update dependencies (security patches)
- [ ] Performance monitoring review

### Monthly
- [ ] Full system updates
- [ ] SSL certificate renewal check
- [ ] Database maintenance
- [ ] Backup restore testing

## Support & Documentation

- Backend API docs: `https://api.yourdomain.com/api-docs`
- Monitoring dashboard: PM2 or your chosen APM
- Log aggregation: Consider ELK stack or similar
- Team communication: Slack alerts for critical issues

---

This guide provides a comprehensive approach to deploying DietWise to production. Adjust configurations based on your specific hosting requirements and scale.