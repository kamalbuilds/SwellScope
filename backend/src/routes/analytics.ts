import { Router } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { CacheService } from '../services/CacheService';
import { auth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimiter';
import { validateQuery } from '../middleware/validation';
import { ApiResponse } from '../types';

const router = Router();
const analyticsService = new AnalyticsService();
const cacheService = new CacheService();

// Get overall analytics data
router.get('/', 
  rateLimit('analytics:overview', 100, 900), // 100 requests per 15 minutes
  validateQuery(['timeRange', 'chain']),
  async (req, res) => {
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
        } as ApiResponse<any>);
      }

      const data = await analyticsService.getOverviewData(timeRange as string, parseInt(chain as string));
      
      // Cache for 5 minutes
      await cacheService.set(cacheKey, data, 300);
      
      res.json({
        success: true,
        data,
        timestamp: Date.now(),
        cached: false
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Analytics overview error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics data',
        timestamp: Date.now()
      } as ApiResponse<any>);
    }
  }
);

// Get TVL data
router.get('/tvl',
  rateLimit('analytics:tvl', 200, 900),
  validateQuery(['timeRange', 'protocol']),
  async (req, res) => {
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
        } as ApiResponse<any>);
      }

      const data = await analyticsService.getTVLData(timeRange as string, protocol as string);
      
      await cacheService.set(cacheKey, data, 180); // Cache for 3 minutes
      
      res.json({
        success: true,
        data,
        timestamp: Date.now(),
        cached: false
      } as ApiResponse<any>);
    } catch (error) {
      console.error('TVL data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch TVL data',
        timestamp: Date.now()
      } as ApiResponse<any>);
    }
  }
);

// Get yield data
router.get('/yields',
  rateLimit('analytics:yields', 200, 900),
  validateQuery(['timeRange', 'protocol']),
  async (req, res) => {
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
        } as ApiResponse<any>);
      }

      const data = await analyticsService.getYieldData(timeRange as string, protocol as string);
      
      await cacheService.set(cacheKey, data, 300); // Cache for 5 minutes
      
      res.json({
        success: true,
        data,
        timestamp: Date.now(),
        cached: false
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Yield data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch yield data',
        timestamp: Date.now()
      } as ApiResponse<any>);
    }
  }
);

// Get protocol rankings
router.get('/protocols',
  rateLimit('analytics:protocols', 150, 900),
  validateQuery(['sortBy', 'order', 'limit']),
  async (req, res) => {
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
        } as ApiResponse<any>);
      }

      const data = await analyticsService.getProtocolRankings(
        sortBy as string,
        order as 'asc' | 'desc',
        parseInt(limit as string)
      );
      
      await cacheService.set(cacheKey, data, 600); // Cache for 10 minutes
      
      res.json({
        success: true,
        data,
        timestamp: Date.now(),
        cached: false
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Protocol rankings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch protocol rankings',
        timestamp: Date.now()
      } as ApiResponse<any>);
    }
  }
);

// Get user statistics (requires auth)
router.get('/users',
  auth,
  rateLimit('analytics:users', 50, 900),
  validateQuery(['timeRange']),
  async (req, res) => {
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
        } as ApiResponse<any>);
      }

      const data = await analyticsService.getUserStats(timeRange as string);
      
      await cacheService.set(cacheKey, data, 600); // Cache for 10 minutes
      
      res.json({
        success: true,
        data,
        timestamp: Date.now(),
        cached: false
      } as ApiResponse<any>);
    } catch (error) {
      console.error('User stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics',
        timestamp: Date.now()
      } as ApiResponse<any>);
    }
  }
);

// Get real-time metrics
router.get('/realtime',
  rateLimit('analytics:realtime', 300, 900),
  async (req, res) => {
    try {
      const cacheKey = 'analytics:realtime';
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          timestamp: Date.now(),
          cached: true
        } as ApiResponse<any>);
      }

      const data = await analyticsService.getRealtimeMetrics();
      
      await cacheService.set(cacheKey, data, 30); // Cache for 30 seconds
      
      res.json({
        success: true,
        data,
        timestamp: Date.now(),
        cached: false
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Realtime metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch realtime metrics',
        timestamp: Date.now()
      } as ApiResponse<any>);
    }
  }
);

// Get Swellchain specific metrics
router.get('/swellchain',
  rateLimit('analytics:swellchain', 100, 900),
  validateQuery(['timeRange']),
  async (req, res) => {
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
        } as ApiResponse<any>);
      }

      const data = await analyticsService.getSwellchainMetrics(timeRange as string);
      
      await cacheService.set(cacheKey, data, 300); // Cache for 5 minutes
      
      res.json({
        success: true,
        data,
        timestamp: Date.now(),
        cached: false
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Swellchain metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Swellchain metrics',
        timestamp: Date.now()
      } as ApiResponse<any>);
    }
  }
);

// Get transaction data
router.get('/transactions',
  rateLimit('analytics:transactions', 100, 900),
  validateQuery(['timeRange', 'type', 'limit']),
  async (req, res) => {
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
        } as ApiResponse<any>);
      }

      const data = await analyticsService.getTransactionData(
        timeRange as string,
        type as string,
        parseInt(limit as string)
      );
      
      await cacheService.set(cacheKey, data, 180); // Cache for 3 minutes
      
      res.json({
        success: true,
        data,
        timestamp: Date.now(),
        cached: false
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Transaction data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transaction data',
        timestamp: Date.now()
      } as ApiResponse<any>);
    }
  }
);

export default router; 