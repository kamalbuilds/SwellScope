import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';

// Import routes
import analyticsRoutes from './routes/analytics';
import riskRoutes from './routes/risk';
import portfolioRoutes from './routes/portfolio';
import avsRoutes from './routes/avs';
import bridgeRoutes from './routes/bridge';
import userRoutes from './routes/user';

// Import services
import { AnalyticsService } from './services/AnalyticsService';
import { RiskService } from './services/RiskService';
import { SwellChainService } from './services/SwellChainService';
import { WebSocketService } from './services/WebSocketService';
import { CronService } from './services/CronService';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// API rate limiting for different endpoints
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
});

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute for sensitive operations
});

// Initialize services
let analyticsService: AnalyticsService;
let riskService: RiskService;
let swellChainService: SwellChainService;
let webSocketService: WebSocketService;
let cronService: CronService;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/v1/analytics', apiLimiter, analyticsRoutes);
app.use('/api/v1/risk', apiLimiter, riskRoutes);
app.use('/api/v1/portfolio', authMiddleware, apiLimiter, portfolioRoutes);
app.use('/api/v1/avs', apiLimiter, avsRoutes);
app.use('/api/v1/bridge', authMiddleware, strictLimiter, bridgeRoutes);
app.use('/api/v1/user', authMiddleware, strictLimiter, userRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Handle client subscription to specific data feeds
  socket.on('subscribe', (data) => {
    const { type, address } = data;
    
    switch (type) {
      case 'risk_updates':
        socket.join(`risk_${address}`);
        logger.info(`Client ${socket.id} subscribed to risk updates for ${address}`);
        break;
      case 'portfolio_updates':
        socket.join(`portfolio_${address}`);
        logger.info(`Client ${socket.id} subscribed to portfolio updates for ${address}`);
        break;
      case 'avs_updates':
        socket.join('avs_updates');
        logger.info(`Client ${socket.id} subscribed to AVS updates`);
        break;
      case 'market_data':
        socket.join('market_data');
        logger.info(`Client ${socket.id} subscribed to market data`);
        break;
      default:
        logger.warn(`Unknown subscription type: ${type}`);
    }
  });
  
  socket.on('unsubscribe', (data) => {
    const { type, address } = data;
    const room = type === 'risk_updates' || type === 'portfolio_updates' 
      ? `${type.split('_')[0]}_${address}` 
      : type;
    
    socket.leave(room);
    logger.info(`Client ${socket.id} unsubscribed from ${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  await prisma.$disconnect();
  await redis.quit();
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  await prisma.$disconnect();
  await redis.quit();
  
  process.exit(0);
});

// Initialize and start server
async function startServer() {
  try {
    // Connect to Redis
    await redis.connect();
    logger.info('Connected to Redis');
    
    // Initialize services
    analyticsService = new AnalyticsService(prisma, redis);
    riskService = new RiskService(prisma, redis);
    swellChainService = new SwellChainService(prisma, redis);
    webSocketService = new WebSocketService(io);
    cronService = new CronService(
      analyticsService,
      riskService,
      swellChainService,
      webSocketService
    );
    
    // Start background services
    await cronService.start();
    logger.info('Background services started');
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      logger.info(`🚀 SwellScope API server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
      logger.info(`🔴 Redis: ${redis.isOpen ? 'Connected' : 'Disconnected'}`);
      
      // Log available endpoints
      logger.info('📡 Available API endpoints:');
      logger.info('  GET  /health - Health check');
      logger.info('  GET  /api/v1/analytics/* - Analytics data');
      logger.info('  GET  /api/v1/risk/* - Risk assessment');
      logger.info('  GET  /api/v1/portfolio/* - Portfolio management');
      logger.info('  GET  /api/v1/avs/* - AVS performance data');
      logger.info('  POST /api/v1/bridge/* - Bridge operations');
      logger.info('  GET  /api/v1/user/* - User management');
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, server, io, prisma, redis }; 