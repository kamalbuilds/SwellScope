import { Request } from 'express';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
  cached?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Database Models
export interface User {
  id: string;
  address: string;
  email?: string;
  username?: string;
  avatar?: string;
  joinedAt: Date;
  lastActive: Date;
  preferences: UserPreferences;
  subscription: UserSubscription;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  currency: 'USD' | 'ETH' | 'EUR';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  discord: boolean;
  telegram: boolean;
  riskAlerts: boolean;
  rebalanceNotifications: boolean;
  yieldUpdates: boolean;
  marketUpdates: boolean;
}

export interface PrivacySettings {
  showPortfolio: boolean;
  showTransactions: boolean;
  allowAnalytics: boolean;
  shareData: boolean;
}

export interface UserSubscription {
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  isActive: boolean;
  expiresAt?: Date;
  features: string[];
  limits: SubscriptionLimits;
}

export interface SubscriptionLimits {
  maxPositions: number;
  maxStrategies: number;
  apiCalls: number;
  historicalData: number; // days
  alerts: number;
  customDashboards: number;
}

// Analytics Types
export interface AnalyticsData {
  totalTVL: number;
  totalUsers: number;
  averageYield: number;
  totalProtocols: number;
  tvlChange24h: number;
  usersChange24h: number;
  yieldChange24h: number;
  protocolsChange24h: number;
  chartData: ChartDataPoint[];
  topProtocols: ProtocolData[];
  recentTransactions: TransactionData[];
}

export interface ChartDataPoint {
  timestamp: number;
  tvl: number;
  yield: number;
  users: number;
  volume: number;
}

export interface ProtocolData {
  id: string;
  name: string;
  address: string;
  tvl: number;
  yield: number;
  riskScore: number;
  users: number;
  logo: string;
  category: 'restaking' | 'defi' | 'bridge' | 'avs' | 'yield-farming';
  isActive: boolean;
  chainId: number;
  deployedAt: Date;
  lastUpdate: Date;
}

export interface TransactionData {
  id: string;
  hash: string;
  type: 'deposit' | 'withdraw' | 'rebalance' | 'claim' | 'bridge';
  amount: number;
  token: string;
  user: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  gasPrice?: number;
  blockNumber?: number;
  chainId: number;
}

// Risk Management Types
export interface RiskMetrics {
  userAddress: string;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  slashingRisk: SlashingRiskData;
  liquidityRisk: LiquidityRiskData;
  concentrationRisk: ConcentrationRiskData;
  validatorRisks: ValidatorRisk[];
  avsRisks: AVSRiskMetrics[];
  lastUpdated: number;
  metadata: RiskMetadata;
}

export interface SlashingRiskData {
  probability: number;
  potentialLoss: number;
  riskScore: number;
  timeHorizon: string;
  confidenceLevel: number;
}

export interface LiquidityRiskData {
  availableLiquidity: number;
  utilizationRate: number;
  withdrawalDelay: number;
  riskScore: number;
}

export interface ConcentrationRiskData {
  protocolConcentration: number;
  operatorConcentration: number;
  avsConcentration: number;
  diversificationScore: number;
}

export interface RiskMetadata {
  calculationVersion: string;
  dataQuality: number;
  uncertaintyLevel: number;
}

export interface RiskProfile {
  userId: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  maxSlashingRisk: number;
  maxLiquidityRisk: number;
  maxConcentration: number;
  rebalanceThreshold: number;
  autoRebalance: boolean;
  alertThresholds: AlertThresholds;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertThresholds {
  slashing: number;
  liquidity: number;
  concentration: number;
  performance: number;
}

export interface SlashingEvent {
  id: string;
  validatorAddress: string;
  avsId: string;
  amount: number;
  timestamp: number;
  reason: string;
  blockNumber: number;
  transactionHash: string;
  affectedUsers: string[];
}

export interface ValidatorRisk {
  validatorAddress: string;
  riskScore: number;
  slashingHistory: SlashingEvent[];
  performance: number;
  uptime: number;
  commission: number;
  stakedAmount: number;
  lastUpdated: number;
}

export interface AVSRiskMetrics {
  avsId: string;
  name: string;
  riskScore: number;
  slashingConditions: SlashingCondition[];
  operatorCount: number;
  totalStaked: number;
  auditScore: number;
  governanceRisk: number;
  lastUpdated: number;
}

export interface SlashingCondition {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  maxSlashingPercent: number;
}

export interface RiskAssessmentResult {
  userAddress: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: RiskRecommendation[];
  timestamp: number;
}

export interface RiskRecommendation {
  type: 'diversify' | 'reduce_exposure' | 'rebalance' | 'monitor';
  priority: 'low' | 'medium' | 'high';
  description: string;
  estimatedImpact: number;
}

export interface PortfolioRisk {
  totalValue: number;
  riskScore: number;
  diversificationScore: number;
  positions: PositionRisk[];
  correlations: RiskCorrelation[];
}

export interface PositionRisk {
  positionId: string;
  protocol: string;
  riskScore: number;
  contribution: number;
  recommendations: string[];
}

export interface RiskCorrelation {
  asset1: string;
  asset2: string;
  correlation: number;
  significance: number;
}

export interface RiskAlert {
  id: string;
  type: 'validator_risk' | 'concentration_risk' | 'slashing_event' | 'liquidity_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  data?: any;
  actionRequired: boolean;
  suggestedActions?: string[];
}

// Portfolio Types
export interface PortfolioData {
  userId: string;
  totalValue: number;
  totalStaked: number;
  totalEarnings: number;
  averageYield: number;
  riskScore: number;
  lastRebalance: number;
  positions: Position[];
  strategies: Strategy[];
  performance: PerformanceData;
  recommendations: Recommendation[];
}

export interface Position {
  id: string;
  userId: string;
  protocol: string;
  protocolName: string;
  token: string;
  amount: number;
  value: number;
  yield: number;
  riskScore: number;
  allocation: number;
  earnings: number;
  earningsChange24h: number;
  isActive: boolean;
  lastUpdate: Date;
  apy: number;
  lockupPeriod?: number;
  unlockDate?: Date;
  chainId: number;
  contractAddress: string;
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description: string;
  riskScore: number;
  expectedYield: number;
  tvl: number;
  allocation: number;
  isActive: boolean;
  autoExecute: boolean;
  minAmount: number;
  maxAmount: number;
  fees: StrategyFees;
  performance: StrategyPerformance;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyFees {
  managementFee: number;
  performanceFee: number;
  withdrawalFee: number;
  depositFee: number;
}

export interface StrategyPerformance {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  alpha: number;
  beta: number;
}

export interface PerformanceData {
  totalReturn: number;
  totalReturnUSD: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  bestDay: number;
  worstDay: number;
  winRate: number;
  profitFactor: number;
  chartData: PerformanceDataPoint[];
}

export interface PerformanceDataPoint {
  timestamp: number;
  value: number;
  return: number;
  cumulativeReturn: number;
  drawdown: number;
}

export interface Recommendation {
  id: string;
  userId: string;
  type: 'rebalance' | 'strategy_change' | 'risk_adjustment' | 'yield_optimization';
  title: string;
  description: string;
  impact: string;
  priority: 'low' | 'medium' | 'high';
  estimatedGain: number;
  estimatedRisk: number;
  actionRequired: boolean;
  autoExecutable: boolean;
  deadline?: number;
  relatedPositions: string[];
  createdAt: Date;
  executedAt?: Date;
  status: 'pending' | 'executed' | 'rejected' | 'expired';
}

// AVS and Swellchain Types
export interface AVSMetrics {
  id: string;
  name: string;
  address: string;
  totalStaked: number;
  operatorCount: number;
  performanceScore: number;
  slashingEvents: number;
  slashingRisk: number;
  averageCommission: number;
  uptime: number;
  lastSlashing?: number;
  isActive: boolean;
  services: AVSService[];
  operators: AVSOperator[];
  rewards: AVSRewards;
  chainId: number;
  deployedAt: Date;
  lastUpdate: Date;
}

export interface AVSService {
  name: string;
  description: string;
  isActive: boolean;
  performanceMetrics: {
    responseTime: number;
    accuracy: number;
    availability: number;
  };
  deployedAt: Date;
  version: string;
}

export interface AVSOperator {
  address: string;
  name?: string;
  stake: number;
  commission: number;
  performanceScore: number;
  slashingHistory: number;
  isActive: boolean;
  services: string[];
  joinedAt: Date;
  lastActive: Date;
  metadata?: Record<string, any>;
}

export interface AVSRewards {
  totalRewards: number;
  userRewards: number;
  rewardRate: number;
  lastDistribution: number;
  nextDistribution: number;
  claimableRewards: number;
  distributionHistory: RewardDistribution[];
}

export interface RewardDistribution {
  id: string;
  amount: number;
  recipients: number;
  timestamp: number;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
}

// Cross-chain Types
export interface CrossChainPosition {
  id: string;
  userId: string;
  chainId: number;
  chainName: string;
  token: string;
  amount: number;
  value: number;
  bridge: string;
  status: 'active' | 'pending' | 'failed';
  lastUpdate: number;
  canBridge: boolean;
  bridgeFee: number;
  estimatedTime: number;
  contractAddress: string;
}

export interface BridgeOperation {
  id: string;
  userId: string;
  fromChain: number;
  toChain: number;
  token: string;
  amount: number;
  recipient: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  transactionHash?: string;
  destinationHash?: string;
  fee: number;
  estimatedTime: number;
  actualTime?: number;
  timestamp: number;
  error?: string;
  metadata?: Record<string, any>;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
  userId?: string;
  room?: string;
}

export interface SubscriptionData {
  type: 'risk_updates' | 'portfolio_updates' | 'avs_updates' | 'market_data';
  address?: string;
  filters?: Record<string, any>;
}

// Configuration Types
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: Record<string, string>;
  isTestnet: boolean;
  blockTime: number;
  finalityBlocks: number;
}

// Error Types
export interface SwellScopeError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  stack?: string;
  userId?: string;
  requestId?: string;
}

// Request/Response Types
export interface AuthRequest {
  address: string;
  signature: string;
  message: string;
  timestamp: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  timeRange?: string;
  protocol?: string;
  token?: string;
  chainId?: number;
  status?: string;
  category?: string;
}

// Service Interfaces
export interface CacheData {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
}

export interface RateLimitData {
  key: string;
  count: number;
  resetTime: number;
}

export interface MetricsData {
  key: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type SortDirection = 'asc' | 'desc';
export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
export type TokenSymbol = 'ETH' | 'swETH' | 'rswETH' | 'USDC' | 'USDT' | 'DAI';

// Environment Types
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  SWELLCHAIN_RPC_URL: string;
  ETHEREUM_RPC_URL: string;
  ALCHEMY_API_KEY: string;
  MORALIS_API_KEY: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
  LOG_LEVEL: string;
  SENTRY_DSN?: string;
}

// Express Types
export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
} 