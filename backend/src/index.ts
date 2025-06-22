import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

// Services
import { AnalyticsService } from './services/AnalyticsService';
import { CacheService } from './services/CacheService';
import { RiskService } from './services/RiskService';
import { SwellChainService } from './services/SwellChainService';
import { WebSocketService } from './services/WebSocketService';
import { CronService } from './services/CronService';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Routes
import analyticsRoutes from './routes/analytics';
import riskRoutes from './routes/risk';
import portfolioRoutes from './routes/portfolio';
import avsRoutes from './routes/avs';
import bridgeRoutes from './routes/bridge';
import userRoutes from './routes/user';

const app = express();
const server = createServer(app);

// Environment variables with defaults
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize database and cache
const prisma = new PrismaClient({
  log: NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const redis = new Redis(REDIS_URL, {
  connectTimeout: 10000,
  lazyConnect: true,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize services
const cacheService = new CacheService();
const analyticsService = new AnalyticsService();
const riskService = new RiskService(prisma, redis);
const swellChainService = new SwellChainService(prisma, redis);
const webSocketService = new WebSocketService(io);
const cronService = new CronService(
  analyticsService,
  riskService,
  swellChainService,
  webSocketService
);

// Basic middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  }
}));

app.use(compression());

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimit('api', 100, 60000)); // 100 requests per minute

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cronTasks: cronService.getStats(),
    environment: NODE_ENV
  };

  res.json(healthData);
});

// API routes
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/risk', riskRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/avs', avsRoutes);
app.use('/api/v1/bridge', bridgeRoutes);
app.use('/api/v1/user', userRoutes);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    timestamp: Date.now(),
    path: req.path
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  try {
    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });
    
    // Stop cron jobs
    await cronService.stop();
    logger.info('Cron service stopped');
    
    // Close WebSocket connections
    io.close();
    logger.info('WebSocket server closed');
    
    // Close database connections
    await prisma.$disconnect();
    logger.info('Database connection closed');
    
    // Close Redis connection
    try {
      await redis.disconnect();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error while disconnecting Redis:', error);
    }
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Test Redis connection
    await redis.ping();
    logger.info('Redis connected successfully');
    
    // Cron service starts automatically in constructor
    logger.info('Cron service initialized successfully');
    
    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 SwellScope backend server started`, {
        port: PORT,
        environment: NODE_ENV,
        corsOrigin: CORS_ORIGIN,
        nodeVersion: process.version,
        pid: process.pid
      });
      
      // Log available API endpoints
      logger.info('Available API endpoints:', {
        analytics: '/api/v1/analytics',
        risk: '/api/v1/risk',
        portfolio: '/api/v1/portfolio',
        avs: '/api/v1/avs',
        bridge: '/api/v1/bridge',
        user: '/api/v1/user',
        health: '/health'
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();

export { app, server, io }; 