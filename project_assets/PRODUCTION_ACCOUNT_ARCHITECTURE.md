# 🏗️ DietWise Production Account Architecture

## Overview
This document outlines a production-ready account system architecture for DietWise, focusing on security, scalability, and user experience.

## 🎯 Architecture Goals
- **Security First**: Protect user data with industry-standard practices
- **Scalable**: Handle millions of users without performance degradation
- **User-Friendly**: Simple onboarding with multiple auth options
- **Privacy-Focused**: GDPR/CCPA compliant data handling
- **Resilient**: Handle failures gracefully with proper fallbacks

## 🏛️ System Architecture

### 1. **Authentication Layer**

#### Primary Auth Provider: Auth0/Firebase Auth/AWS Cognito
```
┌─────────────────────────────────────────────────────────┐
│                   Authentication Flow                     │
├─────────────────────────────────────────────────────────┤
│  Client App  ──────> Auth Provider ──────> Backend API   │
│      ↑                    │                      │        │
│      └────── JWT Token ───┴──────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

#### Supported Auth Methods:
- **Email/Password** with email verification
- **Social Login** (Google, Apple, Facebook)
- **Magic Links** (passwordless email auth)
- **Biometric** (FaceID/TouchID for mobile)
- **Two-Factor Authentication** (TOTP/SMS)

### 2. **Data Architecture**

#### User Data Schema
```typescript
interface UserAccount {
  // Core Identity
  id: string;                    // UUID v4
  email: string;                 // Encrypted at rest
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Authentication
  authProvider: 'email' | 'google' | 'apple' | 'facebook';
  authProviderId: string;
  passwordHash?: string;         // Argon2id hashed
  mfaEnabled: boolean;
  mfaSecret?: string;           // Encrypted
  
  // Profile Data
  profile: {
    displayName: string;
    avatarUrl?: string;
    timezone: string;
    locale: string;
    preferences: UserPreferences;
  };
  
  // Account Status
  status: 'active' | 'suspended' | 'deleted';
  subscription: SubscriptionData;
  
  // Privacy & Compliance
  gdprConsent: boolean;
  gdprConsentDate?: Date;
  dataRetentionDate?: Date;
  deletionRequestDate?: Date;
}

interface UserHealthData {
  userId: string;
  // Encrypted health data
  encryptedData: string;        // AES-256-GCM encrypted
  dataKey: string;              // User-specific encryption key
  lastModified: Date;
}
```

### 3. **Database Architecture**

#### Multi-Database Strategy
```
┌─────────────────────────────────────────────────────────┐
│                   Database Layout                         │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL (Primary)                                     │
│  ├── users table (account data)                          │
│  ├── sessions table (active sessions)                    │
│  └── audit_logs table (security events)                  │
│                                                           │
│  MongoDB (Health Data)                                    │
│  ├── user_profiles collection                            │
│  ├── food_logs collection                                │
│  ├── weight_history collection                           │
│  └── meal_plans collection                               │
│                                                           │
│  Redis (Cache & Sessions)                                 │
│  ├── Session tokens (TTL: 24h)                          │
│  ├── Rate limiting counters                              │
│  └── Temporary calculation cache                         │
└─────────────────────────────────────────────────────────┘
```

### 4. **API Architecture**

#### RESTful API Structure
```typescript
// Authentication Endpoints
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/mfa/enable
POST   /api/v1/auth/mfa/verify

// User Account Endpoints
GET    /api/v1/users/me
PUT    /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/me/export  // GDPR data export
POST   /api/v1/users/me/delete-request

// Health Data Endpoints (all encrypted)
GET    /api/v1/health/profile
PUT    /api/v1/health/profile
GET    /api/v1/health/food-logs
POST   /api/v1/health/food-logs
GET    /api/v1/health/weight-history
POST   /api/v1/health/weight-entries
```

### 5. **Security Architecture**

#### Security Layers
```
┌─────────────────────────────────────────────────────────┐
│                  Security Stack                           │
├─────────────────────────────────────────────────────────┤
│  1. WAF (CloudFlare/AWS WAF)                             │
│     └── DDoS protection, IP filtering                    │
│                                                           │
│  2. API Gateway (Kong/AWS API Gateway)                   │
│     └── Rate limiting, API key validation                │
│                                                           │
│  3. Application Security                                  │
│     ├── JWT validation (RS256)                          │
│     ├── CORS policy enforcement                          │
│     ├── Input validation & sanitization                  │
│     └── SQL injection prevention                         │
│                                                           │
│  4. Data Security                                         │
│     ├── Encryption at rest (AES-256)                    │
│     ├── Encryption in transit (TLS 1.3)                 │
│     ├── Field-level encryption for PII                   │
│     └── Encrypted backups                                │
└─────────────────────────────────────────────────────────┘
```

#### Security Best Practices
- **Password Requirements**: Min 12 chars, complexity rules
- **Session Management**: Secure, httpOnly, sameSite cookies
- **Rate Limiting**: 100 requests/minute per IP
- **Account Lockout**: 5 failed attempts = 15 min lockout
- **Audit Logging**: All auth events logged
- **Vulnerability Scanning**: Weekly automated scans

### 6. **Microservices Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                 Service Breakdown                         │
├─────────────────────────────────────────────────────────┤
│  Auth Service (Node.js)                                   │
│  └── Handles all authentication/authorization            │
│                                                           │
│  User Service (Node.js)                                   │
│  └── Manages user profiles and preferences               │
│                                                           │
│  Health Service (Node.js)                                 │
│  └── Handles encrypted health data                       │
│                                                           │
│  Notification Service (Node.js)                           │
│  └── Email, push, SMS notifications                      │
│                                                           │
│  Analytics Service (Python)                               │
│  └── User behavior tracking, insights                    │
│                                                           │
│  Export Service (Go)                                      │
│  └── GDPR exports, bulk operations                       │
└─────────────────────────────────────────────────────────┘
```

### 7. **Frontend Integration**

#### State Management
```typescript
// Redux/Zustand Store Structure
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
}

// Axios Interceptor for Auto Token Refresh
axios.interceptors.request.use(async (config) => {
  const token = await getValidAccessToken(); // Auto-refresh if needed
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

#### Protected Routes
```typescript
// React Router Protection
<Route path="/dashboard" element={
  <RequireAuth>
    <Dashboard />
  </RequireAuth>
} />

// Next.js Middleware
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### 8. **Data Privacy & Compliance**

#### GDPR/CCPA Compliance
- **Right to Access**: Export all user data in JSON/CSV
- **Right to Deletion**: Hard delete with 30-day grace period
- **Right to Rectification**: Edit any personal data
- **Data Portability**: Standard export formats
- **Consent Management**: Granular consent options

#### Data Retention Policy
```typescript
interface DataRetentionPolicy {
  activeUserData: 'indefinite';
  inactiveUserData: '2 years';
  deletedUserData: '30 days';
  auditLogs: '1 year';
  analyticsData: '3 years';
  backups: '90 days';
}
```

### 9. **Infrastructure**

#### Cloud Architecture (AWS/GCP/Azure)
```
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure                           │
├─────────────────────────────────────────────────────────┤
│  CDN (CloudFront)                                         │
│  └── Static assets, global distribution                  │
│                                                           │
│  Load Balancer (ALB)                                      │
│  └── Distributes traffic across instances                │
│                                                           │
│  Auto-Scaling Groups                                      │
│  ├── Auth Service (2-10 instances)                      │
│  ├── API Service (3-20 instances)                       │
│  └── Background Jobs (1-5 instances)                    │
│                                                           │
│  Managed Services                                         │
│  ├── RDS Multi-AZ (PostgreSQL)                          │
│  ├── DocumentDB/MongoDB Atlas                           │
│  ├── ElastiCache (Redis)                               │
│  └── S3 (File storage)                                  │
└─────────────────────────────────────────────────────────┘
```

### 10. **Development Workflow**

#### Environment Setup
```bash
# Development
- Local PostgreSQL + MongoDB
- Local Redis
- Mock Auth Provider

# Staging
- Replica of production
- Test data only
- Feature flags enabled

# Production
- Multi-region deployment
- Blue-green deployments
- Automatic rollback capability
```

## 🚀 Implementation Roadmap

### Phase 1: MVP (Month 1)
- Basic email/password auth
- User profiles
- Session management
- Basic security

### Phase 2: Enhanced Auth (Month 2)
- Social logins
- Two-factor authentication
- Password recovery
- Email verification

### Phase 3: Scale & Security (Month 3)
- Microservices split
- Enhanced encryption
- Rate limiting
- Audit logging

### Phase 4: Compliance (Month 4)
- GDPR implementation
- Data export tools
- Consent management
- Privacy controls

### Phase 5: Enterprise (Month 5-6)
- SSO/SAML support
- Team accounts
- Advanced analytics
- API for partners

## 📊 Monitoring & Observability

### Key Metrics
- Authentication success/failure rates
- API response times (p50, p95, p99)
- Active user sessions
- Database connection pool usage
- Error rates by endpoint

### Tools
- **APM**: DataDog/New Relic
- **Logging**: ELK Stack/Splunk
- **Monitoring**: Prometheus/Grafana
- **Error Tracking**: Sentry
- **Uptime**: Pingdom/UptimeRobot

## 🔐 Security Checklist

- [ ] HTTPS everywhere (TLS 1.3)
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Account lockout mechanism
- [ ] Audit logging
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Penetration testing
- [ ] Data encryption at rest
- [ ] Secure password storage (Argon2id)
- [ ] JWT token rotation
- [ ] API versioning
- [ ] CORS properly configured
- [ ] Secrets management (AWS Secrets Manager)

## 💰 Cost Estimates (AWS)

### Small Scale (10K users)
- ~$500/month

### Medium Scale (100K users)
- ~$2,000/month

### Large Scale (1M users)
- ~$10,000/month

## 🎯 Success Metrics

- 99.9% uptime SLA
- <100ms average API response time
- <2% authentication failure rate
- Zero security breaches
- 100% GDPR compliance
- <24 hour support response time