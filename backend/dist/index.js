"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const compression_1 = tslib_1.__importDefault(require("compression"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const ioredis_1 = tslib_1.__importDefault(require("ioredis"));
const client_1 = require("@prisma/client");
// Services
const AnalyticsService_1 = require("./services/AnalyticsService");
const CacheService_1 = require("./services/CacheService");
const RiskService_1 = require("./services/RiskService");
const SwellChainService_1 = require("./services/SwellChainService");
const WebSocketService_1 = require("./services/WebSocketService");
const CronService_1 = require("./services/CronService");
// Middleware
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = require("./utils/logger");
// Routes
const analytics_1 = tslib_1.__importDefault(require("./routes/analytics"));
const risk_1 = tslib_1.__importDefault(require("./routes/risk"));
const portfolio_1 = tslib_1.__importDefault(require("./routes/portfolio"));
const avs_1 = tslib_1.__importDefault(require("./routes/avs"));
const bridge_1 = tslib_1.__importDefault(require("./routes/bridge"));
const user_1 = tslib_1.__importDefault(require("./routes/user"));
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
// Environment variables with defaults
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
// Initialize database and cache
const prisma = new client_1.PrismaClient({
    log: NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
const redis = new ioredis_1.default(REDIS_URL, {
    connectTimeout: 10000,
    lazyConnect: true,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
});
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});
exports.io = io;
// Initialize services
const cacheService = new CacheService_1.CacheService();
const analyticsService = new AnalyticsService_1.AnalyticsService();
const riskService = new RiskService_1.RiskService(prisma, redis);
const swellChainService = new SwellChainService_1.SwellChainService(prisma, redis);
const webSocketService = new WebSocketService_1.WebSocketService(io);
const cronService = new CronService_1.CronService(analyticsService, riskService, swellChainService, webSocketService);
// Basic middleware
app.use((0, helmet_1.default)({
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
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting
app.use('/api', (0, rateLimiter_1.rateLimit)('api', 100, 60000)); // 100 requests per minute
// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.logger.info('HTTP Request', {
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
app.use('/api/v1/analytics', analytics_1.default);
app.use('/api/v1/risk', risk_1.default);
app.use('/api/v1/portfolio', portfolio_1.default);
app.use('/api/v1/avs', avs_1.default);
app.use('/api/v1/bridge', bridge_1.default);
app.use('/api/v1/user', user_1.default);
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
app.use(errorHandler_1.errorHandler);
// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`${signal} received, starting graceful shutdown...`);
    try {
        // Stop accepting new connections
        server.close(() => {
            logger_1.logger.info('HTTP server closed');
        });
        // Stop cron jobs
        await cronService.stop();
        logger_1.logger.info('Cron service stopped');
        // Close WebSocket connections
        io.close();
        logger_1.logger.info('WebSocket server closed');
        // Close database connections
        await prisma.$disconnect();
        logger_1.logger.info('Database connection closed');
        // Close Redis connection
        redis.disconnect();
        logger_1.logger.info('Redis connection closed');
        logger_1.logger.info('Graceful shutdown completed');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
};
// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', { promise, reason });
    gracefulShutdown('UNHANDLED_REJECTION');
});
// Start the server
async function startServer() {
    try {
        // Test database connection
        await prisma.$connect();
        logger_1.logger.info('Database connected successfully');
        // Test Redis connection
        await redis.ping();
        logger_1.logger.info('Redis connected successfully');
        // Cron service starts automatically in constructor
        logger_1.logger.info('Cron service initialized successfully');
        // Start HTTP server
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 SwellScope backend server started`, {
                port: PORT,
                environment: NODE_ENV,
                corsOrigin: CORS_ORIGIN,
                nodeVersion: process.version,
                pid: process.pid
            });
            // Log available API endpoints
            logger_1.logger.info('Available API endpoints:', {
                analytics: '/api/v1/analytics',
                risk: '/api/v1/risk',
                portfolio: '/api/v1/portfolio',
                avs: '/api/v1/avs',
                bridge: '/api/v1/bridge',
                user: '/api/v1/user',
                health: '/health'
            });
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Start the application
startServer();
//# sourceMappingURL=index.js.map