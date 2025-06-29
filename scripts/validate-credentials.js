#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
};

class CredentialValidator {
  constructor() {
    this.results = {
      frontend: { valid: 0, invalid: 0, warnings: 0 },
      backend: { valid: 0, invalid: 0, warnings: 0 }
    };
  }

  async validate() {
    log.header('🔐 DietWise Credential Validation');
    
    // Check frontend credentials
    await this.validateFrontend();
    
    // Check backend credentials
    await this.validateBackend();
    
    // Show summary
    this.showSummary();
  }

  async validateFrontend() {
    log.header('Frontend Credentials (.env)');
    
    const frontendEnvPath = path.join(rootDir, '.env');
    if (!fs.existsSync(frontendEnvPath)) {
      log.error('Frontend .env file not found!');
      log.info('Create one with: cp .env.example .env');
      this.results.frontend.invalid++;
      return;
    }

    const frontendEnv = dotenv.parse(fs.readFileSync(frontendEnvPath));

    // Required frontend credentials
    const requiredFrontend = [
      {
        key: 'VITE_API_URL',
        validate: (value) => value && value.startsWith('http'),
        error: 'Must be a valid URL starting with http:// or https://'
      },
      {
        key: 'VITE_STRIPE_PUBLISHABLE_KEY',
        validate: (value) => value && value.startsWith('pk_'),
        error: 'Must start with pk_test_ or pk_live_'
      },
      {
        key: 'VITE_STRIPE_PRICE_MONTHLY',
        validate: (value) => value && value.startsWith('price_'),
        error: 'Must be a valid Stripe price ID starting with price_'
      },
      {
        key: 'VITE_STRIPE_PRICE_YEARLY',
        validate: (value) => value && value.startsWith('price_'),
        error: 'Must be a valid Stripe price ID starting with price_'
      }
    ];

    // Optional frontend credentials
    const optionalFrontend = [
      'VITE_SENTRY_DSN',
      'VITE_SENTRY_ORG',
      'VITE_SENTRY_PROJECT',
      'VITE_SENTRY_AUTH_TOKEN'
    ];

    // Validate required
    for (const config of requiredFrontend) {
      const value = frontendEnv[config.key];
      if (!value) {
        log.error(`${config.key} is missing`);
        this.results.frontend.invalid++;
      } else if (!config.validate(value)) {
        log.error(`${config.key}: ${config.error}`);
        this.results.frontend.invalid++;
      } else {
        log.success(`${config.key} is configured`);
        this.results.frontend.valid++;
      }
    }

    // Check optional
    for (const key of optionalFrontend) {
      if (!frontendEnv[key]) {
        log.warning(`${key} is not configured (optional)`);
        this.results.frontend.warnings++;
      } else {
        log.success(`${key} is configured`);
        this.results.frontend.valid++;
      }
    }

    // Check if using production Stripe keys
    if (frontendEnv.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
      log.warning('Using TEST Stripe key - switch to pk_live_ for production');
      this.results.frontend.warnings++;
    }
  }

  async validateBackend() {
    log.header('Backend Credentials (backend/.env)');
    
    const backendEnvPath = path.join(rootDir, 'backend', '.env');
    if (!fs.existsSync(backendEnvPath)) {
      log.error('Backend .env file not found!');
      log.info('Create one with: cd backend && cp .env.example .env');
      this.results.backend.invalid++;
      return;
    }

    const backendEnv = dotenv.parse(fs.readFileSync(backendEnvPath));

    // Critical backend credentials
    const criticalBackend = [
      {
        key: 'SUPABASE_URL',
        validate: (value) => value && value.includes('supabase.co'),
        error: 'Must be a valid Supabase URL',
        test: async (value) => await this.testSupabaseConnection(value)
      },
      {
        key: 'SUPABASE_ANON_KEY',
        validate: (value) => value && value.startsWith('eyJ'),
        error: 'Must be a valid Supabase anon key'
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        validate: (value) => value && value.startsWith('eyJ'),
        error: 'Must be a valid Supabase service role key'
      },
      {
        key: 'DATABASE_URL',
        validate: (value) => {
          if (!value) return false;
          if (value.includes('[PASSWORD]')) {
            log.error('DATABASE_URL still contains [PASSWORD] placeholder!');
            return false;
          }
          return value.startsWith('postgresql://');
        },
        error: 'Must be a valid PostgreSQL connection string'
      },
      {
        key: 'GEMINI_API_KEY',
        validate: (value) => value && value.length > 20 && !value.includes('your-'),
        error: 'Must be a valid Gemini API key (get from https://makersuite.google.com/app/apikey)',
        test: async (value) => await this.testGeminiAPI(value)
      },
      {
        key: 'STRIPE_SECRET_KEY',
        validate: (value) => value && value.startsWith('sk_'),
        error: 'Must start with sk_test_ or sk_live_'
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        validate: (value) => value && value.startsWith('whsec_'),
        error: 'Must be a valid webhook secret starting with whsec_'
      },
      {
        key: 'STRIPE_PRICE_ID_MONTHLY',
        validate: (value) => value && value.startsWith('price_'),
        error: 'Must match frontend VITE_STRIPE_PRICE_MONTHLY'
      },
      {
        key: 'STRIPE_PRICE_ID_YEARLY',
        validate: (value) => value && value.startsWith('price_'),
        error: 'Must match frontend VITE_STRIPE_PRICE_YEARLY'
      }
    ];

    // Optional backend credentials
    const optionalBackend = [
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS',
      'EMAIL_FROM',
      'REDIS_URL',
      'ENCRYPTION_KEY'
    ];

    // Validate critical
    for (const config of criticalBackend) {
      const value = backendEnv[config.key];
      if (!value) {
        log.error(`${config.key} is missing - THIS IS REQUIRED!`);
        this.results.backend.invalid++;
      } else if (!config.validate(value)) {
        log.error(`${config.key}: ${config.error}`);
        this.results.backend.invalid++;
      } else {
        log.success(`${config.key} is configured`);
        this.results.backend.valid++;
        
        // Run additional tests if available
        if (config.test) {
          await config.test(value);
        }
      }
    }

    // Check optional
    for (const key of optionalBackend) {
      if (!backendEnv[key] || backendEnv[key].includes('your-')) {
        log.warning(`${key} is not configured (optional)`);
        this.results.backend.warnings++;
      } else {
        log.success(`${key} is configured`);
        this.results.backend.valid++;
      }
    }

    // Cross-check Stripe keys
    const frontendEnvPath = path.join(rootDir, '.env');
    if (fs.existsSync(frontendEnvPath)) {
      const frontendEnv = dotenv.parse(fs.readFileSync(frontendEnvPath));
      
      if (backendEnv.STRIPE_PRICE_ID_MONTHLY !== frontendEnv.VITE_STRIPE_PRICE_MONTHLY) {
        log.error('STRIPE_PRICE_ID_MONTHLY does not match frontend VITE_STRIPE_PRICE_MONTHLY');
        this.results.backend.invalid++;
      }
      
      if (backendEnv.STRIPE_PRICE_ID_YEARLY !== frontendEnv.VITE_STRIPE_PRICE_YEARLY) {
        log.error('STRIPE_PRICE_ID_YEARLY does not match frontend VITE_STRIPE_PRICE_YEARLY');
        this.results.backend.invalid++;
      }
    }

    // Check if using production Stripe keys
    if (backendEnv.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      log.warning('Using TEST Stripe key - switch to sk_live_ for production');
      this.results.backend.warnings++;
    }
  }

  async testSupabaseConnection(url) {
    try {
      const response = await this.httpsGet(`${url}/rest/v1/`);
      if (response.statusCode === 200 || response.statusCode === 401) {
        log.info('  → Supabase URL is reachable');
        return true;
      }
    } catch (error) {
      log.warning('  → Could not verify Supabase connection');
    }
    return false;
  }

  async testGeminiAPI(apiKey) {
    try {
      log.info('  → Testing Gemini API key...');
      const data = JSON.stringify({
        contents: [{
          parts: [{ text: "Say 'OK' if this works" }]
        }]
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const response = await this.httpsRequest(options, data);
      if (response.statusCode === 200) {
        log.info('  → Gemini API key is valid and working!');
        return true;
      } else if (response.statusCode === 403) {
        log.error('  → Gemini API key is invalid or has no access');
      } else {
        log.warning('  → Could not verify Gemini API key');
      }
    } catch (error) {
      log.warning('  → Error testing Gemini API: ' + error.message);
    }
    return false;
  }

  httpsGet(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        resolve(res);
      }).on('error', reject);
    });
  }

  httpsRequest(options, data) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        resolve(res);
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  showSummary() {
    log.header('Validation Summary');
    
    const frontendTotal = this.results.frontend.valid + this.results.frontend.invalid;
    const backendTotal = this.results.backend.valid + this.results.backend.invalid;
    

    if (this.results.frontend.warnings > 0) {

    }
    

    if (this.results.backend.warnings > 0) {

    }
    
    const totalInvalid = this.results.frontend.invalid + this.results.backend.invalid;
    
    if (totalInvalid === 0) {
      log.success('\n🎉 All required credentials are properly configured!');
      log.info('Your app is ready for production deployment.');
    } else {
      log.error(`\n❌ ${totalInvalid} required credentials are missing or invalid!`);
      log.info('Fix the issues above before deploying to production.');
    }

    // Show next steps
    log.header('Next Steps');
    if (totalInvalid > 0) {
    } else {
    }
  }
}

// Run validation
const validator = new CredentialValidator();
if (process.env.NODE_ENV !== 'production') {
validator.validate().catch(console.error);
}