"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const RiskService_1 = require("../services/RiskService");
const client_1 = require("@prisma/client");
const ioredis_1 = tslib_1.__importDefault(require("ioredis"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
// Initialize services (these would be injected in a real implementation)
const prisma = new client_1.PrismaClient();
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
const riskService = new RiskService_1.RiskService(prisma, redis);
/**
 * GET /api/v1/risk/metrics/:address
 * Get comprehensive risk metrics for a user's portfolio
 */
router.get('/metrics/:address', (0, validation_1.validateAddress)('address'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { address } = req.params;
    try {
        logger_1.logger.info(`Fetching risk metrics for address: ${address}`);
        const riskMetrics = await riskService.getRiskMetrics(address);
        const response = {
            success: true,
            data: riskMetrics,
            timestamp: Date.now(),
            cached: false
        };
        logger_1.logger.info(`Risk metrics retrieved successfully for ${address}`);
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching risk metrics for ${address}:`, error);
        throw error;
    }
}));
/**
 * GET /api/v1/risk/alerts/:address
 * Get active risk alerts for a user
 */
router.get('/alerts/:address', (0, validation_1.validateAddress)('address'), (0, validation_1.validateQuery)(['severity', 'type', 'limit']), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { address } = req.params;
    const { severity, type, limit = '10' } = req.query;
    try {
        logger_1.logger.info(`Fetching risk alerts for address: ${address}`);
        let alerts = await riskService.getRiskAlerts(address);
        // Apply filters
        if (severity) {
            alerts = alerts.filter(alert => alert.severity === severity);
        }
        if (type) {
            alerts = alerts.filter(alert => alert.type === type);
        }
        // Apply limit
        const limitNum = parseInt(limit);
        alerts = alerts.slice(0, limitNum);
        const response = {
            success: true,
            data: alerts,
            timestamp: Date.now(),
            cached: false
        };
        logger_1.logger.info(`${alerts.length} risk alerts retrieved for ${address}`);
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching risk alerts for ${address}:`, error);
        throw error;
    }
}));
/**
 * GET /api/v1/risk/profile/:address
 * Get risk profile settings for a user
 */
router.get('/profile/:address', auth_1.auth, (0, validation_1.validateAddress)('address'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
        logger_1.logger.info(`Fetching risk profile for address: ${address}`);
        // In a real implementation, this would fetch from database
        const riskProfile = {
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
        const response = {
            success: true,
            data: riskProfile,
            timestamp: Date.now(),
            cached: false
        };
        logger_1.logger.info(`Risk profile retrieved for ${address}`);
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching risk profile for ${address}:`, error);
        throw error;
    }
}));
/**
 * PUT /api/v1/risk/profile/:address
 * Update risk profile settings for a user
 */
router.put('/profile/:address', auth_1.auth, (0, validation_1.validateAddress)('address'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
        logger_1.logger.info(`Updating risk profile for address: ${address}`);
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
        const updatedProfile = {
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
        const response = {
            success: true,
            data: updatedProfile,
            message: 'Risk profile updated successfully',
            timestamp: Date.now()
        };
        logger_1.logger.info(`Risk profile updated for ${address}`);
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error(`Error updating risk profile for ${address}:`, error);
        throw error;
    }
}));
/**
 * POST /api/v1/risk/assessment/:address
 * Trigger a manual risk assessment for a user
 */
router.post('/assessment/:address', auth_1.auth, (0, validation_1.validateAddress)('address'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
        logger_1.logger.info(`Triggering risk assessment for address: ${address}`);
        // Force fresh risk calculation (bypass cache)
        const riskMetrics = await riskService.getRiskMetrics(address);
        const response = {
            success: true,
            data: riskMetrics,
            message: 'Risk assessment completed',
            timestamp: Date.now(),
            cached: false
        };
        logger_1.logger.info(`Risk assessment completed for ${address}`);
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error(`Error in risk assessment for ${address}:`, error);
        throw error;
    }
}));
/**
 * GET /api/v1/risk/validators/:address
 * Get validator risk analysis for a user's positions
 */
router.get('/validators/:address', (0, validation_1.validateAddress)('address'), (0, validation_1.validateQuery)(['sort', 'order', 'limit']), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { address } = req.params;
    const { sort = 'riskScore', order = 'desc', limit = '20' } = req.query;
    try {
        logger_1.logger.info(`Fetching validator risks for address: ${address}`);
        const riskMetrics = await riskService.getRiskMetrics(address);
        let validatorRisks = riskMetrics.validatorRisks || [];
        // Sort validators
        validatorRisks.sort((a, b) => {
            const aVal = a[sort] || 0;
            const bVal = b[sort] || 0;
            return order === 'desc' ? bVal - aVal : aVal - bVal;
        });
        // Apply limit
        const limitNum = parseInt(limit);
        validatorRisks = validatorRisks.slice(0, limitNum);
        const response = {
            success: true,
            data: validatorRisks,
            timestamp: Date.now(),
            cached: false
        };
        logger_1.logger.info(`${validatorRisks.length} validator risks retrieved for ${address}`);
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching validator risks for ${address}:`, error);
        throw error;
    }
}));
/**
 * GET /api/v1/risk/avs/:address
 * Get AVS risk analysis for a user's positions
 */
router.get('/avs/:address', (0, validation_1.validateAddress)('address'), (0, validation_1.validateQuery)(['sort', 'order', 'limit']), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { address } = req.params;
    const { sort = 'riskScore', order = 'desc', limit = '10' } = req.query;
    try {
        logger_1.logger.info(`Fetching AVS risks for address: ${address}`);
        const riskMetrics = await riskService.getRiskMetrics(address);
        let avsRisks = riskMetrics.avsRisks || [];
        // Sort AVS risks
        avsRisks.sort((a, b) => {
            const aVal = a[sort] || 0;
            const bVal = b[sort] || 0;
            return order === 'desc' ? bVal - aVal : aVal - bVal;
        });
        // Apply limit
        const limitNum = parseInt(limit);
        avsRisks = avsRisks.slice(0, limitNum);
        const response = {
            success: true,
            data: avsRisks,
            timestamp: Date.now(),
            cached: false
        };
        logger_1.logger.info(`${avsRisks.length} AVS risks retrieved for ${address}`);
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching AVS risks for ${address}:`, error);
        throw error;
    }
}));
/**
 * POST /api/v1/risk/alerts/:address/dismiss
 * Dismiss specific risk alerts
 */
router.post('/alerts/:address/dismiss', auth_1.auth, (0, validation_1.validateAddress)('address'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
        logger_1.logger.info(`Dismissing alerts for address: ${address}`, { alertIds });
        // In a real implementation, this would update alert status in database
        const response = {
            success: true,
            data: { dismissed: alertIds },
            message: `${alertIds.length} alerts dismissed`,
            timestamp: Date.now()
        };
        logger_1.logger.info(`${alertIds.length} alerts dismissed for ${address}`);
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error(`Error dismissing alerts for ${address}:`, error);
        throw error;
    }
}));
exports.default = router;
//# sourceMappingURL=risk.js.map