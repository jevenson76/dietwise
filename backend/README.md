# DietWise Backend API

## Overview
Production-ready backend API for DietWise, built with Node.js, Express, PostgreSQL, MongoDB, and Redis.

## Features
- 🔐 JWT-based authentication with refresh tokens
- 🔒 End-to-end encryption for health data
- 📊 RESTful API with Swagger documentation
- 🚀 Scalable microservices architecture
- 🛡️ Comprehensive security (rate limiting, CORS, helmet)
- 🐳 Docker support for easy deployment
- 📝 GDPR compliance with data export/deletion

## Tech Stack
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **Databases**: PostgreSQL (auth), MongoDB (health data), Redis (cache)
- **Authentication**: JWT with refresh tokens
- **Security**: Argon2id password hashing, AES-256-GCM encryption
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Deployment**: Docker + Docker Compose

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- MongoDB 7.0+
- Redis 7+
- Docker (optional)

### Installation

1. Clone the repository
```bash
cd backend
npm install
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations
```bash
npm run migrate
```

4. Start the development server
```bash
npm run dev
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3001/api-docs
- Health check: http://localhost:3001/health

## Architecture

### Database Schema

#### PostgreSQL (Authentication & User Management)
- `users` - User accounts and authentication
- `user_sessions` - Active refresh tokens
- `audit_logs` - Security event logging

#### MongoDB (Health Data)
- `healthprofiles` - Encrypted user health profiles
- `foodlogs` - Encrypted daily food logs
- `weighthistory` - Encrypted weight tracking

#### Redis (Cache & Sessions)
- Session tokens with TTL
- Rate limiting counters
- Temporary calculation cache

### Security Features

1. **Authentication**
   - JWT access tokens (15min expiry)
   - Refresh tokens (7 days expiry)
   - Automatic token rotation

2. **Data Encryption**
   - AES-256-GCM for health data
   - User-specific encryption keys
   - Argon2id password hashing

3. **API Security**
   - Rate limiting (100 req/min)
   - CORS protection
   - Helmet.js security headers
   - Input validation with Zod

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/verify-email` - Verify email address

### User Management
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update user profile
- `DELETE /api/v1/users/me` - Delete account
- `GET /api/v1/users/me/export` - Export user data (GDPR)

### Health Data
- `GET /api/v1/health/profile` - Get health profile
- `PUT /api/v1/health/profile` - Update health profile
- `GET /api/v1/health/food-logs` - Get food logs
- `POST /api/v1/health/food-logs` - Add food entry
- `GET /api/v1/health/weight-history` - Get weight history
- `POST /api/v1/health/weight-entries` - Add weight entry

## Development

### Project Structure
```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Data models & schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── tests/              # Test files
└── migrations/         # Database migrations
```

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Style
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Strong JWT secrets (min 32 chars)
- Secure database passwords
- Proper CORS origins
- Production database URLs

### Health Monitoring
- Health check: `GET /health`
- Metrics endpoint: `GET /metrics` (Prometheus format)
- Structured logging with Winston

### Scaling Considerations
- Horizontal scaling with load balancer
- Database connection pooling
- Redis for session management
- CDN for static assets

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
Copyright © 2025 DietWise. All rights reserved.