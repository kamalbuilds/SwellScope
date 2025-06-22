import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { 
  RiskMetrics, 
  RiskAlert, 
  RiskProfile, 
  SlashingEvent, 
  ValidatorRisk,
  RiskAssessmentResult,
  PortfolioRisk,
  AVSRiskMetrics
} from '../types';

export class RiskService {
  private prisma: PrismaClient;
  private redis: Redis;
  private riskThresholds = {
    high: 0.7,
    medium: 0.4,
    low: 0.2
  };

  constructor(prisma: PrismaClient, redis: Redis) {
    this.prisma = prisma;
    this.redis = redis;
  }

  /**
   * Get comprehensive risk metrics for a user's portfolio
   */
  async getRiskMetrics(userAddress: string): Promise<RiskMetrics> {
    try {
      const cacheKey = `risk:metrics:${userAddress}`;
      
      // Try to get from cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        logger.debug('Risk metrics served from cache', { userAddress });
        return JSON.parse(cached);
      }

      logger.risk('Calculating risk metrics', { userAddress });

      const [
        overallRisk,
        slashingRisk,
        liquidityRisk,
        concentrationRisk,
        validatorRisks,
        avsRisks
      ] = await Promise.all([
        this.calculateOverallRisk(userAddress),
        this.calculateSlashingRisk(userAddress),
        this.calculateLiquidityRisk(userAddress),
        this.calculateConcentrationRisk(userAddress),
        this.getValidatorRisks(userAddress),
        this.getAVSRisks(userAddress)
      ]);

      const riskMetrics: RiskMetrics = {
        userAddress,
        overallRiskScore: overallRisk.score,
        riskLevel: this.getRiskLevel(overallRisk.score),
        slashingRisk: {
          probability: slashingRisk.probability,
          potentialLoss: slashingRisk.potentialLoss,
          riskScore: slashingRisk.score,
          timeHorizon: '30d',
          confidenceLevel: 0.95
        },
        liquidityRisk: {
          availableLiquidity: liquidityRisk.available,
          utilizationRate: liquidityRisk.utilization,
          withdrawalDelay: liquidityRisk.delay,
          riskScore: liquidityRisk.score
        },
        concentrationRisk: {
          protocolConcentration: concentrationRisk.protocol,
          operatorConcentration: concentrationRisk.operator,
          avsConcentration: concentrationRisk.avs,
          diversificationScore: concentrationRisk.diversification
        },
        validatorRisks,
        avsRisks,
        lastUpdated: Date.now(),
        metadata: {
          calculationVersion: '1.0',
          dataQuality: overallRisk.dataQuality,
          uncertaintyLevel: overallRisk.uncertainty
        }
      };

      // Cache for 5 minutes
      await this.redis.setex(cacheKey, 300, JSON.stringify(riskMetrics));
      
      logger.risk('Risk metrics calculated', { 
        userAddress, 
        overallScore: riskMetrics.overallRiskScore,
        riskLevel: riskMetrics.riskLevel
      });

      return riskMetrics;
    } catch (error) {
      logger.error('Error calculating risk metrics', error);
      throw error;
    }
  }

  /**
   * Get active risk alerts for a user
   */
  async getRiskAlerts(userAddress: string): Promise<RiskAlert[]> {
    try {
      const cacheKey = `risk:alerts:${userAddress}`;
      
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      logger.risk('Fetching risk alerts', { userAddress });

      const alerts: RiskAlert[] = [];

      // Check for high risk validators
      const highRiskValidators = await this.getHighRiskValidators(userAddress);
      highRiskValidators.forEach(validator => {
        alerts.push({
          id: `validator-risk-${validator.address}`,
          type: 'validator_risk',
          severity: validator.riskScore > 0.8 ? 'critical' : 'high',
          title: 'High Risk Validator Detected',
          message: `Validator ${validator.address} has elevated slashing risk (${(validator.riskScore * 100).toFixed(1)}%)`,
          timestamp: Date.now(),
          data: { validator },
          actionRequired: true,
          suggestedActions: [
            'Consider reducing stake with this validator',
            'Monitor validator performance closely',
            'Diversify stake across multiple validators'
          ]
        });
      });

      // Check for concentration risk
      const concentrationRisk = await this.calculateConcentrationRisk(userAddress);
      if (concentrationRisk.protocol > 0.5) {
        alerts.push({
          id: `concentration-protocol-${userAddress}`,
          type: 'concentration_risk',
          severity: 'medium',
          title: 'High Protocol Concentration',
          message: `Over 50% of stake concentrated in single protocol`,
          timestamp: Date.now(),
          data: { concentration: concentrationRisk.protocol },
          actionRequired: true,
          suggestedActions: [
            'Diversify across multiple protocols',
            'Consider rebalancing portfolio'
          ]
        });
      }

      // Check for slashing events
      const recentSlashingEvents = await this.getRecentSlashingEvents(userAddress, 7);
      recentSlashingEvents.forEach(event => {
        alerts.push({
          id: `slashing-${event.id}`,
          type: 'slashing_event',
          severity: 'critical',
          title: 'Slashing Event Detected',
          message: `Slashing event occurred: ${event.amount} ETH lost`,
          timestamp: event.timestamp,
          data: { event },
          actionRequired: true,
          suggestedActions: [
            'Review validator selection',
            'Consider unstaking from affected validator',
            'Update risk parameters'
          ]
        });
      });

      // Cache for 2 minutes
      await this.redis.setex(cacheKey, 120, JSON.stringify(alerts));

      return alerts;
    } catch (error) {
      logger.error('Error fetching risk alerts', error);
      throw error;
    }
  }

  /**
   * Calculate overall risk score
   */
  private async calculateOverallRisk(userAddress: string): Promise<{
    score: number;
    dataQuality: number;
    uncertainty: number;
  }> {
    // Fetch user's staking positions and calculate weighted risk
    const positions = await this.getUserStakingPositions(userAddress);
    
    if (!positions.length) {
      return { score: 0, dataQuality: 1, uncertainty: 0 };
    }

    let weightedRisk = 0;
    let totalValue = 0;
    let dataQualitySum = 0;

    for (const position of positions) {
      const protocolRisk = await this.getProtocolRisk(position.protocol);
      const validatorRisk = await this.getValidatorRisk(position.validator);
      const avsRisk = await this.getAVSRisk(position.avs);

      // Combined risk calculation
      const positionRisk = Math.sqrt(
        Math.pow(protocolRisk.score, 2) + 
        Math.pow(validatorRisk.score, 2) + 
        Math.pow(avsRisk.score, 2)
      ) / Math.sqrt(3);

      weightedRisk += positionRisk * position.value;
      totalValue += position.value;
      dataQualitySum += protocolRisk.dataQuality;
    }

    const overallScore = totalValue > 0 ? weightedRisk / totalValue : 0;
    const avgDataQuality = dataQualitySum / positions.length;
    
    return {
      score: Math.min(overallScore, 1),
      dataQuality: avgDataQuality,
      uncertainty: 1 - avgDataQuality
    };
  }

  /**
   * Calculate slashing risk
   */
  private async calculateSlashingRisk(userAddress: string): Promise<{
    probability: number;
    potentialLoss: number;
    score: number;
  }> {
    const positions = await this.getUserStakingPositions(userAddress);
    
    let totalStaked = 0;
    let totalSlashingRisk = 0;
    let potentialLoss = 0;

    for (const position of positions) {
      const validatorHistory = await this.getValidatorSlashingHistory(position.validator);
      const avsSlashingRisk = await this.getAVSSlashingRisk(position.avs);
      
      // Calculate probability based on historical data and current risk factors
      const historicalProbability = validatorHistory.slashingEvents / Math.max(validatorHistory.totalEpochs, 1);
      const currentRiskFactors = await this.getCurrentRiskFactors(position.validator, position.avs);
      
      const positionSlashingProbability = Math.min(
        historicalProbability * currentRiskFactors.multiplier + avsSlashingRisk.baseProbability,
        0.1 // Cap at 10% probability
      );

      totalSlashingRisk += positionSlashingProbability * position.value;
      potentialLoss += position.value * avsSlashingRisk.maxSlashingPercent;
      totalStaked += position.value;
    }

    const avgProbability = totalStaked > 0 ? totalSlashingRisk / totalStaked : 0;
    
    return {
      probability: avgProbability,
      potentialLoss,
      score: Math.min(avgProbability * 10, 1) // Scale to 0-1
    };
  }

  /**
   * Calculate liquidity risk
   */
  private async calculateLiquidityRisk(userAddress: string): Promise<{
    available: number;
    utilization: number;
    delay: number;
    score: number;
  }> {
    const positions = await this.getUserStakingPositions(userAddress);
    
    let totalStaked = 0;
    let availableLiquidity = 0;
    let weightedDelay = 0;

    for (const position of positions) {
      const protocolLiquidity = await this.getProtocolLiquidity(position.protocol);
      const withdrawalDelay = await this.getWithdrawalDelay(position.protocol, position.validator);
      
      totalStaked += position.value;
      availableLiquidity += Math.min(position.value, protocolLiquidity.available);
      weightedDelay += withdrawalDelay * position.value;
    }

    const utilization = totalStaked > 0 ? 1 - (availableLiquidity / totalStaked) : 0;
    const avgDelay = totalStaked > 0 ? weightedDelay / totalStaked : 0;
    
    // Liquidity risk score based on utilization and delay
    const score = Math.min(utilization + (avgDelay / (7 * 24 * 60 * 60 * 1000)), 1); // Normalize delay to days

    return {
      available: availableLiquidity,
      utilization,
      delay: avgDelay,
      score
    };
  }

  /**
   * Calculate concentration risk
   */
  private async calculateConcentrationRisk(userAddress: string): Promise<{
    protocol: number;
    operator: number;
    avs: number;
    diversification: number;
  }> {
    const positions = await this.getUserStakingPositions(userAddress);
    
    const protocolDistribution = new Map<string, number>();
    const operatorDistribution = new Map<string, number>();
    const avsDistribution = new Map<string, number>();
    
    let totalValue = 0;

    positions.forEach(position => {
      totalValue += position.value;
      
      protocolDistribution.set(
        position.protocol, 
        (protocolDistribution.get(position.protocol) || 0) + position.value
      );
      
      operatorDistribution.set(
        position.operator, 
        (operatorDistribution.get(position.operator) || 0) + position.value
      );
      
      avsDistribution.set(
        position.avs, 
        (avsDistribution.get(position.avs) || 0) + position.value
      );
    });

    // Calculate Herfindahl-Hirschman Index for concentration
    const protocolHHI = this.calculateHHI(protocolDistribution, totalValue);
    const operatorHHI = this.calculateHHI(operatorDistribution, totalValue);
    const avsHHI = this.calculateHHI(avsDistribution, totalValue);

    return {
      protocol: protocolHHI,
      operator: operatorHHI,
      avs: avsHHI,
      diversification: 1 - ((protocolHHI + operatorHHI + avsHHI) / 3)
    };
  }

  /**
   * Calculate Herfindahl-Hirschman Index
   */
  private calculateHHI(distribution: Map<string, number>, total: number): number {
    let hhi = 0;
    distribution.forEach(value => {
      const share = value / total;
      hhi += Math.pow(share, 2);
    });
    return hhi;
  }

  /**
   * Get validator risks for user's positions
   */
  private async getValidatorRisks(userAddress: string): Promise<ValidatorRisk[]> {
    const positions = await this.getUserStakingPositions(userAddress);
    const validatorRisks: ValidatorRisk[] = [];

    for (const position of positions) {
      const validatorRisk = await this.getValidatorRisk(position.validator);
      validatorRisks.push({
        validatorAddress: position.validator,
        riskScore: validatorRisk.score,
        slashingHistory: validatorRisk.slashingHistory,
        performance: validatorRisk.performance,
        uptime: validatorRisk.uptime,
        commission: validatorRisk.commission,
        stakedAmount: position.value,
        lastUpdated: Date.now()
      });
    }

    return validatorRisks;
  }

  /**
   * Get AVS risks for user's positions
   */
  private async getAVSRisks(userAddress: string): Promise<AVSRiskMetrics[]> {
    const positions = await this.getUserStakingPositions(userAddress);
    const avsRisks: AVSRiskMetrics[] = [];

    for (const position of positions) {
      const avsRisk = await this.getAVSRisk(position.avs);
      avsRisks.push({
        avsId: position.avs,
        name: avsRisk.name,
        riskScore: avsRisk.score,
        slashingConditions: avsRisk.slashingConditions,
        operatorCount: avsRisk.operatorCount,
        totalStaked: avsRisk.totalStaked,
        auditScore: avsRisk.auditScore,
        governanceRisk: avsRisk.governanceRisk,
        lastUpdated: Date.now()
      });
    }

    return avsRisks;
  }

  /**
   * Get risk level based on score
   */
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.8) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    return 'low';
  }

  // Helper methods for data fetching (these would connect to real Swellchain data sources)
  private async getUserStakingPositions(userAddress: string) {
    // This would fetch real staking positions from Swellchain
    // For now, implementing with placeholder structure
    return [
      {
        protocol: 'swell',
        validator: '0x123...',
        operator: '0x456...',
        avs: 'MACH',
        value: 32 // ETH
      }
    ];
  }

  private async getProtocolRisk(protocol: string) {
    return { score: 0.3, dataQuality: 0.9 };
  }

  private async getValidatorRisk(validator: string) {
    return { 
      score: 0.2, 
      slashingHistory: [],
      performance: 0.98,
      uptime: 0.995,
      commission: 0.05
    };
  }

  private async getAVSRisk(avs: string) {
    return { 
      score: 0.25,
      name: avs,
      slashingConditions: [],
      operatorCount: 50,
      totalStaked: 1000,
      auditScore: 0.85,
      governanceRisk: 0.3,
      baseProbability: 0.01,
      maxSlashingPercent: 0.05
    };
  }

  private async getValidatorSlashingHistory(validator: string) {
    return { slashingEvents: 0, totalEpochs: 1000 };
  }

  private async getCurrentRiskFactors(validator: string, avs: string) {
    return { multiplier: 1.0 };
  }

  private async getProtocolLiquidity(protocol: string) {
    return { available: 1000 };
  }

  private async getWithdrawalDelay(protocol: string, validator: string) {
    return 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  }

  private async getHighRiskValidators(userAddress: string): Promise<{ address: string; riskScore: number }[]> {
    // This would fetch real high-risk validators from Swellchain data
    // For now, returning empty array but with proper type
    return [];
  }

  private async getRecentSlashingEvents(userAddress: string, days: number): Promise<SlashingEvent[]> {
    return [];
  }

  private async getAVSSlashingRisk(avs: string) {
    return { baseProbability: 0.01, maxSlashingPercent: 0.05 };
  }
} 