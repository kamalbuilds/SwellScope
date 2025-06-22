import express from 'express';
import { RiskService } from '../services/RiskService';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { auth as authMiddleware } from '../middleware/auth';
import { validateQuery, validateAddress, validatePagination } from '../middleware/validation';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest, RiskMetrics, RiskAlert, RiskProfile } from '../types';

const router = express.Router();

// Initialize services (these would be injected in a real implementation)
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const riskService = new RiskService(prisma, redis);

/**
 * GET /api/v1/risk/metrics/:address
 * Get comprehensive risk metrics for a user's portfolio
 */
router.get('/metrics/:address', 
  validateAddress('address'),
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    
    try {
      logger.info(`Fetching risk metrics for address: ${address}`);
      
      const riskMetrics = await riskService.getRiskMetrics(address);
      
      const response: ApiResponse<RiskMetrics> = {
        success: true,
        data: riskMetrics,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`Risk metrics retrieved successfully for ${address}`);
      res.json(response);
    } catch (error) {
      logger.error(`Error fetching risk metrics for ${address}:`, error);
      throw error;
    }
  })
);

/**
 * GET /api/v1/risk/alerts/:address
 * Get active risk alerts for a user
 */
router.get('/alerts/:address',
  validateAddress('address'),
  validateQuery(['severity', 'type', 'limit']),
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const { severity, type, limit = '10' } = req.query;
    
    try {
      logger.info(`Fetching risk alerts for address: ${address}`);
      
      let alerts = await riskService.getRiskAlerts(address);
      
      // Apply filters
      if (severity) {
        alerts = alerts.filter(alert => alert.severity === severity);
      }
      
      if (type) {
        alerts = alerts.filter(alert => alert.type === type);
      }
      
      // Apply limit
      const limitNum = parseInt(limit as string);
      alerts = alerts.slice(0, limitNum);
      
      const response: ApiResponse<RiskAlert[]> = {
        success: true,
        data: alerts,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`${alerts.length} risk alerts retrieved for ${address}`);
      res.json(response);
    } catch (error) {
      logger.error(`Error fetching risk alerts for ${address}:`, error);
      throw error;
    }
  })
);

/**
 * GET /api/v1/risk/profile/:address
 * Get risk profile settings for a user
 */
router.get('/profile/:address',
  authMiddleware,
  validateAddress('address'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { address } = req.params;
    
    // Ensure user can only access their own profile
    if (req.user?.address !== address) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to risk profile',
        timestamp: Date.now()
      });
    }
    
    try {
      logger.info(`Fetching risk profile for address: ${address}`);
      
      // In a real implementation, this would fetch from database
      const riskProfile: RiskProfile = {
        userId: address,
        riskTolerance: 'moderate',
        maxSlashingRisk: 0.05,
        maxLiquidityRisk: 0.3,
        maxConcentration: 0.5,
        rebalanceThreshold: 0.1,
        autoRebalance: true,
        alertThresholds: {
          slashing: 0.03,
          liquidity: 0.2,
          concentration: 0.4,
          performance: -0.1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const response: ApiResponse<RiskProfile> = {
        success: true,
        data: riskProfile,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`Risk profile retrieved for ${address}`);
      res.json(response);
    } catch (error) {
      logger.error(`Error fetching risk profile for ${address}:`, error);
      throw error;
    }
  })
);

/**
 * PUT /api/v1/risk/profile/:address
 * Update risk profile settings for a user
 */
router.put('/profile/:address',
  authMiddleware,
  validateAddress('address'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { address } = req.params;
    const updates = req.body;
    
    // Ensure user can only update their own profile
    if (req.user?.address !== address) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to risk profile',
        timestamp: Date.now()
      });
    }
    
    try {
      logger.info(`Updating risk profile for address: ${address}`);
      
      // Validate updates
      const allowedFields = [
        'riskTolerance', 'maxSlashingRisk', 'maxLiquidityRisk', 
        'maxConcentration', 'rebalanceThreshold', 'autoRebalance', 'alertThresholds'
      ];
      
      const updateFields = Object.keys(updates);
      const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
      
      if (invalidFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid fields: ${invalidFields.join(', ')}`,
          timestamp: Date.now()
        });
      }
      
      // In a real implementation, this would update the database
      const updatedProfile: RiskProfile = {
        userId: address,
        riskTolerance: updates.riskTolerance || 'moderate',
        maxSlashingRisk: updates.maxSlashingRisk || 0.05,
        maxLiquidityRisk: updates.maxLiquidityRisk || 0.3,
        maxConcentration: updates.maxConcentration || 0.5,
        rebalanceThreshold: updates.rebalanceThreshold || 0.1,
        autoRebalance: updates.autoRebalance !== undefined ? updates.autoRebalance : true,
        alertThresholds: {
          ...updates.alertThresholds,
          slashing: updates.alertThresholds?.slashing || 0.03,
          liquidity: updates.alertThresholds?.liquidity || 0.2,
          concentration: updates.alertThresholds?.concentration || 0.4,
          performance: updates.alertThresholds?.performance || -0.1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const response: ApiResponse<RiskProfile> = {
        success: true,
        data: updatedProfile,
        message: 'Risk profile updated successfully',
        timestamp: Date.now()
      };
      
      logger.info(`Risk profile updated for ${address}`);
      res.json(response);
    } catch (error) {
      logger.error(`Error updating risk profile for ${address}:`, error);
      throw error;
    }
  })
);

/**
 * POST /api/v1/risk/assessment/:address
 * Trigger a manual risk assessment for a user
 */
router.post('/assessment/:address',
  authMiddleware,
  validateAddress('address'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { address } = req.params;
    
    // Ensure user can only trigger assessment for their own address
    if (req.user?.address !== address) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access',
        timestamp: Date.now()
      });
    }
    
    try {
      logger.info(`Triggering risk assessment for address: ${address}`);
      
      // Force fresh risk calculation (bypass cache)
      const riskMetrics = await riskService.getRiskMetrics(address);
      
      const response: ApiResponse<RiskMetrics> = {
        success: true,
        data: riskMetrics,
        message: 'Risk assessment completed',
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`Risk assessment completed for ${address}`);
      res.json(response);
    } catch (error) {
      logger.error(`Error in risk assessment for ${address}:`, error);
      throw error;
    }
  })
);

/**
 * GET /api/v1/risk/validators/:address
 * Get validator risk analysis for a user's positions
 */
router.get('/validators/:address',
  validateAddress('address'),
  validateQuery(['sort', 'order', 'limit']),
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const { sort = 'riskScore', order = 'desc', limit = '20' } = req.query;
    
    try {
      logger.info(`Fetching validator risks for address: ${address}`);
      
      const riskMetrics = await riskService.getRiskMetrics(address);
      let validatorRisks = riskMetrics.validatorRisks || [];
      
      // Sort validators
      validatorRisks.sort((a, b) => {
        const aVal = (a as any)[sort as string] || 0;
        const bVal = (b as any)[sort as string] || 0;
        return order === 'desc' ? bVal - aVal : aVal - bVal;
      });
      
      // Apply limit
      const limitNum = parseInt(limit as string);
      validatorRisks = validatorRisks.slice(0, limitNum);
      
      const response: ApiResponse<typeof validatorRisks> = {
        success: true,
        data: validatorRisks,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`${validatorRisks.length} validator risks retrieved for ${address}`);
      res.json(response);
    } catch (error) {
      logger.error(`Error fetching validator risks for ${address}:`, error);
      throw error;
    }
  })
);

/**
 * GET /api/v1/risk/avs/:address
 * Get AVS risk analysis for a user's positions
 */
router.get('/avs/:address',
  validateAddress('address'),
  validateQuery(['sort', 'order', 'limit']),
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const { sort = 'riskScore', order = 'desc', limit = '10' } = req.query;
    
    try {
      logger.info(`Fetching AVS risks for address: ${address}`);
      
      const riskMetrics = await riskService.getRiskMetrics(address);
      let avsRisks = riskMetrics.avsRisks || [];
      
      // Sort AVS risks
      avsRisks.sort((a, b) => {
        const aVal = (a as any)[sort as string] || 0;
        const bVal = (b as any)[sort as string] || 0;
        return order === 'desc' ? bVal - aVal : aVal - bVal;
      });
      
      // Apply limit
      const limitNum = parseInt(limit as string);
      avsRisks = avsRisks.slice(0, limitNum);
      
      const response: ApiResponse<typeof avsRisks> = {
        success: true,
        data: avsRisks,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`${avsRisks.length} AVS risks retrieved for ${address}`);
      res.json(response);
    } catch (error) {
      logger.error(`Error fetching AVS risks for ${address}:`, error);
      throw error;
    }
  })
);

/**
 * POST /api/v1/risk/alerts/:address/dismiss
 * Dismiss specific risk alerts
 */
router.post('/alerts/:address/dismiss',
  authMiddleware,
  validateAddress('address'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { address } = req.params;
    const { alertIds } = req.body;
    
    // Ensure user can only dismiss their own alerts
    if (req.user?.address !== address) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access',
        timestamp: Date.now()
      });
    }
    
    if (!alertIds || !Array.isArray(alertIds)) {
      return res.status(400).json({
        success: false,
        error: 'alertIds must be an array',
        timestamp: Date.now()
      });
    }
    
    try {
      logger.info(`Dismissing alerts for address: ${address}`, { alertIds });
      
      // In a real implementation, this would update alert status in database
      
      const response: ApiResponse<{ dismissed: string[] }> = {
        success: true,
        data: { dismissed: alertIds },
        message: `${alertIds.length} alerts dismissed`,
        timestamp: Date.now()
      };
      
      logger.info(`${alertIds.length} alerts dismissed for ${address}`);
      res.json(response);
    } catch (error) {
      logger.error(`Error dismissing alerts for ${address}:`, error);
      throw error;
    }
  })
);

export default router; 