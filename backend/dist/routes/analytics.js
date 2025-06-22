"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AnalyticsService_1 = require("../services/AnalyticsService");
const CacheService_1 = require("../services/CacheService");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const analyticsService = new AnalyticsService_1.AnalyticsService();
const cacheService = new CacheService_1.CacheService();
// Get overall analytics data
router.get('/', (0, rateLimiter_1.rateLimit)('analytics:overview', 100, 900), // 100 requests per 15 minutes
(0, validation_1.validateQuery)(['timeRange', 'chain']), async (req, res) => {
    try {
        const { timeRange = '24h', chain = '1101' } = req.query;
        const cacheKey = `analytics:overview:${timeRange}:${chain}`;
        // Check cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: cached,
                timestamp: Date.now(),
                cached: true
            });
        }
        const data = await analyticsService.getOverviewData(timeRange, parseInt(chain));
        // Cache for 5 minutes
        await cacheService.set(cacheKey, data, 300);
        res.json({
            success: true,
            data,
            timestamp: Date.now(),
            cached: false
        });
    }
    catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics data',
            timestamp: Date.now()
        });
    }
});
// Get TVL data
router.get('/tvl', (0, rateLimiter_1.rateLimit)('analytics:tvl', 200, 900), (0, validation_1.validateQuery)(['timeRange', 'protocol']), async (req, res) => {
    try {
        const { timeRange = '24h', protocol } = req.query;
        const cacheKey = `analytics:tvl:${timeRange}:${protocol || 'all'}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: cached,
                timestamp: Date.now(),
                cached: true
            });
        }
        const data = await analyticsService.getTVLData(timeRange, protocol);
        await cacheService.set(cacheKey, data, 180); // Cache for 3 minutes
        res.json({
            success: true,
            data,
            timestamp: Date.now(),
            cached: false
        });
    }
    catch (error) {
        console.error('TVL data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch TVL data',
            timestamp: Date.now()
        });
    }
});
// Get yield data
router.get('/yields', (0, rateLimiter_1.rateLimit)('analytics:yields', 200, 900), (0, validation_1.validateQuery)(['timeRange', 'protocol']), async (req, res) => {
    try {
        const { timeRange = '24h', protocol } = req.query;
        const cacheKey = `analytics:yields:${timeRange}:${protocol || 'all'}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: cached,
                timestamp: Date.now(),
                cached: true
            });
        }
        const data = await analyticsService.getYieldData(timeRange, protocol);
        await cacheService.set(cacheKey, data, 300); // Cache for 5 minutes
        res.json({
            success: true,
            data,
            timestamp: Date.now(),
            cached: false
        });
    }
    catch (error) {
        console.error('Yield data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch yield data',
            timestamp: Date.now()
        });
    }
});
// Get protocol rankings
router.get('/protocols', (0, rateLimiter_1.rateLimit)('analytics:protocols', 150, 900), (0, validation_1.validateQuery)(['sortBy', 'order', 'limit']), async (req, res) => {
    try {
        const { sortBy = 'tvl', order = 'desc', limit = '50' } = req.query;
        const cacheKey = `analytics:protocols:${sortBy}:${order}:${limit}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: cached,
                timestamp: Date.now(),
                cached: true
            });
        }
        const data = await analyticsService.getProtocolRankings(sortBy, order, parseInt(limit));
        await cacheService.set(cacheKey, data, 600); // Cache for 10 minutes
        res.json({
            success: true,
            data,
            timestamp: Date.now(),
            cached: false
        });
    }
    catch (error) {
        console.error('Protocol rankings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch protocol rankings',
            timestamp: Date.now()
        });
    }
});
// Get user statistics (requires auth)
router.get('/users', auth_1.auth, (0, rateLimiter_1.rateLimit)('analytics:users', 50, 900), (0, validation_1.validateQuery)(['timeRange']), async (req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const cacheKey = `analytics:users:${timeRange}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: cached,
                timestamp: Date.now(),
                cached: true
            });
        }
        const data = await analyticsService.getUserStats(timeRange);
        await cacheService.set(cacheKey, data, 600); // Cache for 10 minutes
        res.json({
            success: true,
            data,
            timestamp: Date.now(),
            cached: false
        });
    }
    catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user statistics',
            timestamp: Date.now()
        });
    }
});
// Get real-time metrics
router.get('/realtime', (0, rateLimiter_1.rateLimit)('analytics:realtime', 300, 900), async (req, res) => {
    try {
        const cacheKey = 'analytics:realtime';
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: cached,
                timestamp: Date.now(),
                cached: true
            });
        }
        const data = await analyticsService.getRealtimeMetrics();
        await cacheService.set(cacheKey, data, 30); // Cache for 30 seconds
        res.json({
            success: true,
            data,
            timestamp: Date.now(),
            cached: false
        });
    }
    catch (error) {
        console.error('Realtime metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch realtime metrics',
            timestamp: Date.now()
        });
    }
});
// Get Swellchain specific metrics
router.get('/swellchain', (0, rateLimiter_1.rateLimit)('analytics:swellchain', 100, 900), (0, validation_1.validateQuery)(['timeRange']), async (req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        const cacheKey = `analytics:swellchain:${timeRange}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: cached,
                timestamp: Date.now(),
                cached: true
            });
        }
        const data = await analyticsService.getSwellchainMetrics(timeRange);
        await cacheService.set(cacheKey, data, 300); // Cache for 5 minutes
        res.json({
            success: true,
            data,
            timestamp: Date.now(),
            cached: false
        });
    }
    catch (error) {
        console.error('Swellchain metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch Swellchain metrics',
            timestamp: Date.now()
        });
    }
});
// Get transaction data
router.get('/transactions', (0, rateLimiter_1.rateLimit)('analytics:transactions', 100, 900), (0, validation_1.validateQuery)(['timeRange', 'type', 'limit']), async (req, res) => {
    try {
        const { timeRange = '24h', type, limit = '100' } = req.query;
        const cacheKey = `analytics:transactions:${timeRange}:${type || 'all'}:${limit}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: cached,
                timestamp: Date.now(),
                cached: true
            });
        }
        const data = await analyticsService.getTransactionData(timeRange, type, parseInt(limit));
        await cacheService.set(cacheKey, data, 180); // Cache for 3 minutes
        res.json({
            success: true,
            data,
            timestamp: Date.now(),
            cached: false
        });
    }
    catch (error) {
        console.error('Transaction data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transaction data',
            timestamp: Date.now()
        });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map