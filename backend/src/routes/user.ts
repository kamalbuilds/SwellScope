import express from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { auth as authMiddleware, optionalAuth, generateToken } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  ApiResponse, 
  AuthenticatedRequest, 
  User, 
  UserPreferences,
  UserSubscription,
  AuthRequest,
  AuthResponse
} from '../types';

const router = express.Router();

// Initialize services (these would be injected in a real implementation)
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * POST /api/v1/user/auth
 * Authenticate user with wallet signature
 */
router.post('/auth',
  validateBody(['address', 'signature', 'message'], ['timestamp']),
  asyncHandler(async (req, res) => {
    const { address, signature, message, timestamp = Date.now() }: AuthRequest = req.body;
    
    try {
      logger.info(`Authentication attempt for address: ${address}`);
      
      // In a real implementation, this would:
      // 1. Verify the signature against the message
      // 2. Check if the message is valid and not replayed
      // 3. Create or update user record
      
      // Mock signature verification (in production, use ethers.js or similar)
      const isValidSignature = signature && signature.length === 132; // Mock validation
      
      if (!isValidSignature) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature',
          timestamp: Date.now()
        });
      }
      
      // Get or create user
      const user = await getOrCreateUser(address);
      
      // Generate JWT token
      const token = generateToken(user.id, user.address);
      
      const authResponse: AuthResponse = {
        token,
        user,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      };
      
      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: authResponse,
        message: 'Authentication successful',
        timestamp: Date.now()
      };
      
      logger.info(`User authenticated successfully: ${address}`);
      res.json(response);
    } catch (error) {
      logger.error(`Authentication error for ${address}:`, error);
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/profile
 * Get current user's profile
 */
router.get('/profile',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      logger.info(`Fetching profile for user: ${userId}`);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: Date.now()
        });
      }
      
      const user = await getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: Date.now()
        });
      }
      
      const response: ApiResponse<User> = {
        success: true,
        data: user,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`Profile retrieved for user: ${userId}`);
      res.json(response);
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw error;
    }
  })
);

/**
 * PUT /api/v1/user/profile
 * Update current user's profile
 */
router.put('/profile',
  authMiddleware,
  validateBody([], ['username', 'email', 'avatar']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { username, email, avatar } = req.body;
    
    try {
      const userId = req.user?.id;
      logger.info(`Updating profile for user: ${userId}`);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: Date.now()
        });
      }
      
      const user = await getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: Date.now()
        });
      }
      
      // Update user profile (in a real implementation, this would update the database)
      const updatedUser: User = {
        ...user,
        username: username || user.username,
        email: email || user.email,
        avatar: avatar || user.avatar,
        lastActive: new Date()
      };
      
      const response: ApiResponse<User> = {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
        timestamp: Date.now()
      };
      
      logger.info(`Profile updated for user: ${userId}`);
      res.json(response);
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/preferences
 * Get current user's preferences
 */
router.get('/preferences',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      logger.info(`Fetching preferences for user: ${userId}`);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: Date.now()
        });
      }
      
      const user = await getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: Date.now()
        });
      }
      
      const response: ApiResponse<UserPreferences> = {
        success: true,
        data: user.preferences,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`Preferences retrieved for user: ${userId}`);
      res.json(response);
    } catch (error) {
      logger.error('Error fetching user preferences:', error);
      throw error;
    }
  })
);

/**
 * PUT /api/v1/user/preferences
 * Update current user's preferences
 */
router.put('/preferences',
  authMiddleware,
  validateBody([], ['theme', 'currency', 'language', 'timezone', 'notifications', 'privacy']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const updates = req.body;
    
    try {
      const userId = req.user?.id;
      logger.info(`Updating preferences for user: ${userId}`);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: Date.now()
        });
      }
      
      const user = await getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: Date.now()
        });
      }
      
      // Update user preferences (merge with existing)
      const updatedPreferences: UserPreferences = {
        ...user.preferences,
        ...updates
      };
      
      const response: ApiResponse<UserPreferences> = {
        success: true,
        data: updatedPreferences,
        message: 'Preferences updated successfully',
        timestamp: Date.now()
      };
      
      logger.info(`Preferences updated for user: ${userId}`);
      res.json(response);
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/subscription
 * Get current user's subscription information
 */
router.get('/subscription',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      logger.info(`Fetching subscription for user: ${userId}`);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: Date.now()
        });
      }
      
      const user = await getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: Date.now()
        });
      }
      
      const response: ApiResponse<UserSubscription> = {
        success: true,
        data: user.subscription,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`Subscription retrieved for user: ${userId}`);
      res.json(response);
    } catch (error) {
      logger.error('Error fetching user subscription:', error);
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/stats
 * Get user statistics and activity
 */
router.get('/stats',
  authMiddleware,
  validateQuery(['timeRange']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { timeRange = '30d' } = req.query;
    
    try {
      const userAddress = req.user?.address;
      logger.info(`Fetching stats for user: ${userAddress}`, { timeRange });
      
      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: Date.now()
        });
      }
      
      // In a real implementation, this would aggregate user data from various sources
      const stats = await getUserStats(userAddress, timeRange as string);
      
      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`Stats retrieved for user: ${userAddress}`);
      res.json(response);
    } catch (error) {
      logger.error('Error fetching user stats:', error);
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/activity
 * Get user activity feed
 */
router.get('/activity',
  authMiddleware,
  validateQuery(['limit', 'offset', 'type']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { limit = '20', offset = '0', type } = req.query;
    
    try {
      const userAddress = req.user?.address;
      logger.info(`Fetching activity for user: ${userAddress}`);
      
      if (!userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: Date.now()
        });
      }
      
      let activities = await getUserActivity(userAddress);
      
      // Apply filters
      if (type) {
        activities = activities.filter(activity => activity.type === type);
      }
      
      // Apply pagination
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const paginatedActivities = activities.slice(offsetNum, offsetNum + limitNum);
      
      const response: ApiResponse<typeof paginatedActivities> = {
        success: true,
        data: paginatedActivities,
        timestamp: Date.now(),
        cached: false
      };
      
      logger.info(`${paginatedActivities.length} activities retrieved for user: ${userAddress}`);
      res.json(response);
    } catch (error) {
      logger.error('Error fetching user activity:', error);
      throw error;
    }
  })
);

/**
 * POST /api/v1/user/subscribe
 * Subscribe to a subscription tier
 */
router.post('/subscribe',
  authMiddleware,
  validateBody(['tier'], ['paymentMethod']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { tier, paymentMethod = 'crypto' } = req.body;
    
    try {
      const userId = req.user?.id;
      logger.info(`Processing subscription for user: ${userId}`, { tier });
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: Date.now()
        });
      }
      
      // Validate tier
      const validTiers = ['basic', 'premium', 'enterprise'];
      if (!validTiers.includes(tier)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid subscription tier',
          timestamp: Date.now()
        });
      }
      
      // In a real implementation, this would:
      // 1. Process payment
      // 2. Update user subscription
      // 3. Send confirmation email
      
      const subscriptionResult = {
        transactionId: `sub_${Date.now()}`,
        tier,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        features: getSubscriptionFeatures(tier),
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      const response: ApiResponse<typeof subscriptionResult> = {
        success: true,
        data: subscriptionResult,
        message: 'Subscription activated successfully',
        timestamp: Date.now()
      };
      
      logger.info(`Subscription activated for user: ${userId}`, { tier, transactionId: subscriptionResult.transactionId });
      res.json(response);
    } catch (error) {
      logger.error('Error processing subscription:', error);
      throw error;
    }
  })
);

/**
 * DELETE /api/v1/user/account
 * Delete user account (GDPR compliance)
 */
router.delete('/account',
  authMiddleware,
  validateBody(['confirmation']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { confirmation } = req.body;
    
    try {
      const userId = req.user?.id;
      const userAddress = req.user?.address;
      
      logger.info(`Account deletion request for user: ${userId}`);
      
      if (!userId || !userAddress) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          timestamp: Date.now()
        });
      }
      
      if (confirmation !== 'DELETE_MY_ACCOUNT') {
        return res.status(400).json({
          success: false,
          error: 'Invalid confirmation string',
          timestamp: Date.now()
        });
      }
      
      // In a real implementation, this would:
      // 1. Anonymize user data
      // 2. Delete personal information
      // 3. Keep transaction records for compliance
      // 4. Send confirmation email
      
      const deletionResult = {
        userId,
        deletedAt: new Date(),
        retentionPeriod: 90, // days
        dataRemaining: ['transaction_hashes', 'anonymized_metrics'],
        confirmationId: `del_${Date.now()}`
      };
      
      const response: ApiResponse<typeof deletionResult> = {
        success: true,
        data: deletionResult,
        message: 'Account deletion processed successfully',
        timestamp: Date.now()
      };
      
      logger.info(`Account deleted for user: ${userId}`, { confirmationId: deletionResult.confirmationId });
      res.json(response);
    } catch (error) {
      logger.error('Error deleting user account:', error);
      throw error;
    }
  })
);

// Helper functions

async function getOrCreateUser(address: string): Promise<User> {
  // Mock implementation - in production, this would interact with database
  return {
    id: `user_${Date.now()}`,
    address,
    username: `user_${address.slice(-6)}`,
    joinedAt: new Date(),
    lastActive: new Date(),
    preferences: getDefaultPreferences(),
    subscription: getDefaultSubscription(),
    isActive: true
  };
}

async function getUserById(userId: string): Promise<User | null> {
  // Mock implementation
  return {
    id: userId,
    address: '0x1234567890123456789012345678901234567890',
    username: 'mockuser',
    email: 'user@example.com',
    joinedAt: new Date('2024-01-01'),
    lastActive: new Date(),
    preferences: getDefaultPreferences(),
    subscription: getDefaultSubscription(),
    isActive: true
  };
}

async function getUserStats(userAddress: string, timeRange: string) {
  // Mock stats - in production, this would aggregate real data
  return {
    portfolio: {
      totalValue: 245000.50,
      totalStaked: 78.25,
      totalEarnings: 12450.75,
      positionsCount: 8,
      strategiesCount: 3
    },
    activity: {
      transactionsCount: 47,
      bridgeOperationsCount: 12,
      rebalancesCount: 5,
      lastTransactionDate: Date.now() - 86400000 // 1 day ago
    },
    risk: {
      averageRiskScore: 0.35,
      alertsCount: 2,
      slashingEvents: 0,
      maxDrawdown: -3.2
    },
    rewards: {
      totalClaimed: 8750.25,
      pendingRewards: 125.50,
      averageYield: 8.7,
      bestPerformingPosition: 'Swell Restaking'
    },
    period: timeRange,
    lastUpdated: Date.now()
  };
}

async function getUserActivity(userAddress: string) {
  // Mock activity feed
  return [
    {
      id: 'activity_1',
      type: 'deposit',
      description: 'Deposited 10.5 swETH to Swell Restaking',
      amount: 10.5,
      token: 'swETH',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'completed',
      transactionHash: '0x123...'
    },
    {
      id: 'activity_2',
      type: 'rebalance',
      description: 'Portfolio rebalanced across 3 protocols',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'completed',
      metadata: { strategiesAffected: 2, gasUsed: 250000 }
    },
    {
      id: 'activity_3',
      type: 'alert',
      description: 'Risk alert: High concentration risk detected',
      timestamp: Date.now() - 172800000, // 2 days ago
      status: 'dismissed',
      severity: 'medium'
    }
  ];
}

function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'dark',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      discord: false,
      telegram: false,
      riskAlerts: true,
      rebalanceNotifications: true,
      yieldUpdates: true,
      marketUpdates: false
    },
    privacy: {
      showPortfolio: false,
      showTransactions: false,
      allowAnalytics: true,
      shareData: false
    }
  };
}

function getDefaultSubscription(): UserSubscription {
  return {
    tier: 'free',
    isActive: true,
    features: ['basic_analytics', 'portfolio_tracking', 'risk_alerts'],
    limits: {
      maxPositions: 5,
      maxStrategies: 1,
      apiCalls: 1000,
      historicalData: 30,
      alerts: 10,
      customDashboards: 1
    }
  };
}

function getSubscriptionFeatures(tier: string): string[] {
  const features: Record<string, string[]> = {
    basic: [
      'basic_analytics',
      'portfolio_tracking', 
      'risk_alerts',
      'email_support'
    ],
    premium: [
      'advanced_analytics',
      'unlimited_positions',
      'custom_strategies',
      'real_time_alerts',
      'api_access',
      'priority_support'
    ],
    enterprise: [
      'white_label',
      'custom_integrations',
      'dedicated_support',
      'sla_guarantee',
      'bulk_operations',
      'advanced_reporting'
    ]
  };
  
  return features[tier] || features.basic;
}

export default router; 