import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { documentsRouter } from './api/documents/router';
import { suppliersRouter } from './api/suppliers/router';
import { categoriesRouter } from './api/categories/router';
import { authRouter } from './api/auth/router';
import { exportRouter } from './api/export/router';
import { settingsRouter } from './api/settings/router';
import { webhooksRouter } from './api/webhooks/router';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ============================================================================
// Middleware Configuration
// ============================================================================

// CORS Configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// Health Check Endpoint
// ============================================================================

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// ============================================================================
// API Routes
// ============================================================================

app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/export', exportRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/webhooks', webhooksRouter);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'SmartBill API Server',
    version: '1.0.0',
    documentation: '/health',
  });
});

// ============================================================================
// Error Handling
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
      path: req.path,
    },
  });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 SmartBill Backend Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
