# Portfolio Management Guide

## Overview

SwellScope's portfolio management system provides automated restaking optimization with real-time risk assessment and yield maximization for Swellchain assets.

## Getting Started

### Connecting Your Wallet

1. **Visit SwellScope Dashboard**: Navigate to https://app.swellscope.io
2. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
3. **Network Setup**: Ensure you're connected to Swellchain (Chain ID: 1923)
4. **Asset Detection**: Your swETH and rswETH holdings will be automatically detected

### Initial Portfolio Setup

```typescript
// Example portfolio configuration
const portfolioConfig = {
  riskProfile: "moderate",     // conservative, moderate, aggressive
  targetYield: "4.0",         // Target APY percentage
  maxRiskScore: 75,           // Risk tolerance (0-100)
  autoRebalance: true,        // Enable automatic rebalancing
  emergencyExitThreshold: 90  // Risk score trigger for emergency exit
}
```

## Portfolio Dashboard

### Key Metrics Display

- **Total Portfolio Value**: Real-time USD value of all holdings
- **24h Change**: Portfolio performance over last 24 hours
- **Current APY**: Weighted average yield across all positions
- **Risk Score**: Composite risk assessment (0-100 scale)
- **Diversification Score**: Asset allocation optimization metric

### Asset Breakdown

View detailed breakdown of your restaking positions:

```javascript
// Portfolio positions structure
{
  "positions": [
    {
      "asset": "swETH",
      "amount": "45.25",
      "valueUSD": "112,500.00",
      "allocation": "90.0%",
      "currentAPY": "4.2%",
      "riskScore": 75,
      "strategy": "Conservative Restaking"
    },
    {
      "asset": "rswETH", 
      "amount": "5.15",
      "valueUSD": "12,500.00",
      "allocation": "10.0%",
      "currentAPY": "5.8%",
      "riskScore": 85,
      "strategy": "Aggressive Yield"
    }
  ]
}
```

## Risk Management

### Risk Profiles

**Conservative (Risk Score: 0-50)**
- Focus on stability and capital preservation
- Lower yield targets (3-4% APY)
- Minimal exposure to high-risk strategies
- Quick exit mechanisms

**Moderate (Risk Score: 30-70)**
- Balanced approach to risk and yield
- Target yields of 4-6% APY
- Diversified strategy allocation
- Automated rebalancing

**Aggressive (Risk Score: 50-100)**
- Maximum yield optimization
- Higher risk tolerance (6%+ APY targets)
- Exposure to newer AVS services
- Active strategy rotation

### Risk Monitoring

```typescript
// Risk thresholds configuration
const riskSettings = {
  highRiskAlert: 80,        // Alert when risk exceeds threshold
  emergencyExit: 95,        // Automatic exit trigger
  slashingRisk: 70,         // Validator slashing risk limit
  liquidityRisk: 30,        // Minimum liquidity requirement
  concentrationRisk: 60     // Maximum single asset allocation
}
```

## Automated Strategies

### Strategy Types

**1. Conservative Restaking**
- Primary focus on swETH staking
- Minimal AVS exposure
- Target APY: 3.5-4.5%
- Risk Score: 40-60

**2. Diversified Yield**
- Balanced swETH/rswETH allocation
- Multiple AVS service exposure
- Target APY: 4.5-5.5%
- Risk Score: 60-75

**3. Aggressive Growth**
- Maximum yield optimization
- High AVS participation
- Target APY: 5.5%+
- Risk Score: 75-90

### Strategy Configuration

```typescript
// Strategy selection and parameters
const strategyConfig = {
  strategyType: "diversified_yield",
  parameters: {
    targetAllocation: {
      swETH: 70,
      rswETH: 30
    },
    avsServices: ["mach", "vital"],
    rebalanceFrequency: "weekly",
    yieldThreshold: 0.5,      // Minimum yield improvement for rebalancing
    gasOptimization: true
  }
}
```

## Rebalancing

### Automatic Rebalancing

SwellScope automatically rebalances portfolios based on:
- **Yield Opportunities**: Higher yield strategies become available
- **Risk Changes**: Asset risk profiles change significantly
- **Market Conditions**: Optimal allocation shifts due to market movements
- **Time-based**: Scheduled rebalancing (daily, weekly, monthly)

### Manual Rebalancing

```typescript
// Manual rebalance trigger
const rebalanceRequest = {
  targetAllocation: {
    swETH: 80,
    rswETH: 20
  },
  maxSlippage: 0.5,          // Maximum acceptable slippage
  prioritizeGas: false,       // Optimize for gas costs vs speed
  executeImmediately: true
}
```

### Rebalancing Costs

| Operation | Estimated Gas | Cost (20 gwei) |
|-----------|---------------|-----------------|
| Standard Rebalance | 150,000 | 0.003 ETH |
| Cross-Strategy Move | 200,000 | 0.004 ETH |
| Emergency Exit | 300,000 | 0.006 ETH |

## Yield Optimization

### Yield Sources

**Base Staking Yield**
- Ethereum validator rewards
- Consensus layer rewards
- Execution layer tips

**AVS Rewards**
- MACH fast finality rewards
- VITAL state verification rewards
- SQUAD sequencing rewards

**DeFi Integration**
- Lending protocol yields
- Liquidity provision rewards
- Strategy-specific incentives

### Compound Yield Tracking

```typescript
// Yield calculation example
const yieldCalculation = {
  baseStakingAPY: 3.8,
  avsRewardsAPY: 0.6,
  defiYieldAPY: 0.4,
  compoundFrequency: "daily",
  effectiveAPY: 4.89,        // Includes compounding
  projectedAnnualReturns: "$4,890"  // Based on $100k portfolio
}
```

## Transaction Management

### Transaction Types

**Deposits**
```typescript
// Deposit swETH to portfolio
const depositTx = {
  asset: "swETH",
  amount: "10.0",
  strategy: "conservative_restaking",
  slippageTolerance: 0.5
}
```

**Withdrawals**
```typescript
// Withdraw from portfolio
const withdrawTx = {
  asset: "swETH", 
  amount: "5.0",
  recipient: "0x...",
  urgency: "standard"  // standard, fast, emergency
}
```

**Strategy Changes**
```typescript
// Change portfolio strategy
const strategyChange = {
  fromStrategy: "conservative_restaking",
  toStrategy: "diversified_yield",
  migrationSpeed: "gradual"  // immediate, gradual, scheduled
}
```

### Transaction History

Track all portfolio transactions:
- Deposits and withdrawals
- Strategy changes and rebalancing
- Yield distributions
- Gas costs and fees
- Performance impact

## Performance Analytics

### Portfolio Metrics

**Risk-Adjusted Returns**
- Sharpe Ratio calculation
- Maximum drawdown analysis
- Volatility measurements
- Risk-adjusted yield

**Comparative Performance**
- Benchmark comparisons
- Peer portfolio analysis
- Strategy performance ranking
- Market index correlation

### Performance Dashboard

```typescript
// Performance metrics display
const performanceMetrics = {
  totalReturn: "12.5%",        // Since inception
  annualizedReturn: "4.8%",    // Annualized performance
  volatility: "2.3%",          // Portfolio volatility
  sharpeRatio: 1.85,           // Risk-adjusted return
  maxDrawdown: "1.2%",         // Worst performance period
  winRate: "78%",              // Positive performance days
  alpha: "0.8%",               // Excess return vs benchmark
  beta: 0.92                   // Correlation to market
}
```

## Alerts and Notifications

### Alert Types

**Risk Alerts**
- High risk score warnings
- Slashing event notifications
- Liquidity shortage alerts
- Strategy underperformance

**Opportunity Alerts**
- New yield opportunities
- Strategy optimization suggestions
- Market condition changes
- Rebalancing recommendations

### Notification Channels

```typescript
// Notification preferences
const notificationConfig = {
  email: {
    enabled: true,
    frequency: "immediate",
    types: ["risk_alerts", "opportunities"]
  },
  discord: {
    enabled: true,
    webhook: "https://discord.com/api/webhooks/...",
    types: ["critical_alerts"]
  },
  telegram: {
    enabled: false
  }
}
```

## Advanced Features

### Custom Strategy Creation

```solidity
// Custom strategy interface
interface ICustomStrategy {
    function deposit(uint256 amount) external returns (uint256 shares);
    function withdraw(uint256 shares) external returns (uint256 amount);
    function getRiskScore() external view returns (uint256);
    function getExpectedYield() external view returns (uint256);
}
```

### API Integration

```typescript
// Portfolio API integration
const portfolioAPI = {
  getPortfolio: async (address) => {
    return await fetch(`/api/v1/portfolio/${address}`);
  },
  updateRiskProfile: async (profile) => {
    return await fetch('/api/v1/portfolio/risk-profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  },
  triggerRebalance: async (params) => {
    return await fetch('/api/v1/portfolio/rebalance', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
}
```

## Security Best Practices

### Wallet Security
- Use hardware wallets for large portfolios
- Enable transaction confirmations
- Regular security audits
- Multi-signature for institutional accounts

### Smart Contract Risks
- Understand strategy risks before investing
- Monitor contract upgrade announcements
- Keep emergency exit thresholds updated
- Regular portfolio health checks

## Troubleshooting

### Common Issues

**High Gas Costs**
- Use gas optimization features
- Time transactions during low network usage
- Batch multiple operations
- Consider layer 2 alternatives

**Strategy Underperformance**
- Review risk/yield targets
- Check market conditions
- Consider strategy adjustment
- Evaluate alternative approaches

**Liquidity Issues**
- Monitor withdrawal queues
- Plan exits in advance
- Use emergency exit sparingly
- Understand unlock periods

## Getting Help

- **Documentation**: [docs.swellscope.io](https://docs.swellscope.io)
- **Discord**: [discord.gg/swellscope](https://discord.gg/swellscope)
- **Email Support**: support@swellscope.io
- **Emergency Contact**: emergency@swellscope.io

---

*Last updated: January 2024* 