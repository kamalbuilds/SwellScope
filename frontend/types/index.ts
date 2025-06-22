// SwellScope Type Definitions
// Comprehensive types for Swellchain restaking analytics platform

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
  category: 'restaking' | 'defi' | 'bridge' | 'avs';
  isActive: boolean;
}

export interface TransactionData {
  id: string;
  hash: string;
  type: 'deposit' | 'withdraw' | 'rebalance' | 'claim';
  amount: number;
  token: string;
  user: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  gasPrice?: number;
}

// Risk Management Types
export interface RiskMetrics {
  compositeRisk: number;
  slashingRisk: number;
  liquidityRisk: number;
  smartContractRisk: number;
  marketRisk: number;
  correlationRisk: number;
  lastUpdate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  alerts: RiskAlert[];
  riskFactors: RiskFactor[];
}

export interface RiskAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'slashing' | 'liquidity' | 'smart_contract' | 'market' | 'correlation';
  actionRequired: boolean;
  relatedAssets: string[];
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  lastUpdate: number;
}

export interface RiskProfile {
  userId: string;
  maxRiskScore: number;
  preferredYield: number;
  autoRebalance: boolean;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  emergencyExitThreshold: number;
  rebalanceFrequency: 'daily' | 'weekly' | 'monthly';
  notifications: NotificationPreferences;
  lastUpdate: number;
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

// Portfolio Management Types
export interface PortfolioData {
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
  lastUpdate: number;
  apy: number;
  lockupPeriod?: number;
  unlockDate?: number;
}

export interface Strategy {
  id: string;
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
}

// AVS and Swellchain Specific Types
export interface AVSMetrics {
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
}

export interface AVSRewards {
  totalRewards: number;
  userRewards: number;
  rewardRate: number;
  lastDistribution: number;
  nextDistribution: number;
  claimableRewards: number;
}

// Cross-chain and Bridge Types
export interface CrossChainPosition {
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
}

export interface BridgeOperation {
  id: string;
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
}

// Swellchain Token Types
export interface SwellTokenMetrics {
  token: 'swETH' | 'rswETH';
  address: string;
  totalSupply: number;
  totalStaked: number;
  exchangeRate: number;
  yieldRate: number;
  slashingRisk: number;
  validators: number;
  averageUptime: number;
  pendingRewards: number;
  unstakingQueue: number;
  unstakingTime: number;
  fees: TokenFees;
}

export interface TokenFees {
  depositFee: number;
  withdrawalFee: number;
  managementFee: number;
  performanceFee: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

export interface SubscriptionData {
  type: 'risk_updates' | 'portfolio_updates' | 'avs_updates' | 'market_data';
  address?: string;
  filters?: Record<string, any>;
}

// User and Authentication Types
export interface User {
  id: string;
  address: string;
  email?: string;
  username?: string;
  avatar?: string;
  joinedAt: number;
  lastActive: number;
  preferences: UserPreferences;
  subscription: UserSubscription;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  currency: 'USD' | 'ETH' | 'EUR';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
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
  expiresAt?: number;
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
}

// Error Types
export interface SwellScopeError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  stack?: string;
}

// Component Props Types
export interface DashboardProps {
  address?: string;
  chainId?: number;
}

export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type SortDirection = 'asc' | 'desc';
export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
export type TokenSymbol = 'ETH' | 'swETH' | 'rswETH' | 'USDC' | 'USDT' | 'DAI';

// Export all types as a namespace
export namespace SwellScope {
  export type Analytics = AnalyticsData;
  export type Risk = RiskMetrics;
  export type Portfolio = PortfolioData;
  export type AVS = AVSMetrics;
  export type UserData = User;
  export type Error = SwellScopeError;
} 