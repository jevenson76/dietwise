import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'DietWise API is running'
  });
});

// API status
app.get('/api/v1/status', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        postgres: 'pending',
        mongodb: 'pending', 
        redis: 'pending'
      }
    }
  });
});

// Mock auth endpoints
app.post('/api/v1/auth/register', (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'Registration endpoint ready (mock)',
    data: {
      user: { id: '123', email: req.body.email, name: req.body.name },
      tokens: { accessToken: 'mock-token', refreshToken: 'mock-refresh' }
    }
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    status: 'success',
    message: 'Login endpoint ready (mock)',
    data: {
      user: { id: '123', email: req.body.email, name: 'Mock User' },
      tokens: { accessToken: 'mock-token', refreshToken: 'mock-refresh' }
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DietWise API Server running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Status: http://localhost:${PORT}/api/v1/status`);
});