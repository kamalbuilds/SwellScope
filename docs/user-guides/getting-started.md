# Getting Started with SwellScope

Welcome to SwellScope! This guide will walk you through everything you need to know to start using SwellScope for restaking analytics and portfolio management on Swellchain.

## What is SwellScope?

SwellScope is a comprehensive analytics and risk management platform specifically designed for Swellchain's restaking ecosystem. It provides:

- **Real-time Portfolio Analytics**: Track your restaking positions across protocols
- **Advanced Risk Management**: ML-powered risk assessment and automated protection
- **Yield Optimization**: Maximize returns through intelligent strategy allocation
- **Cross-Chain Monitoring**: Monitor positions across Ethereum and Swellchain
- **AVS Performance Tracking**: Monitor MACH, VITAL, and SQUAD service performance

## Before You Start

### Prerequisites

1. **Ethereum Wallet**: MetaMask, WalletConnect, or compatible wallet
2. **ETH for Gas**: Small amount for transaction fees
3. **Restaking Assets**: swETH, rswETH, or ETH to get started
4. **Basic Understanding**: Familiarity with DeFi and restaking concepts

### Supported Networks

- **Swellchain Mainnet** (Chain ID: 1923)
- **Swellchain Testnet** (Chain ID: 1924) - For testing
- **Ethereum Mainnet** - For cross-chain monitoring

## Step 1: Connect Your Wallet

### 1.1 Access SwellScope

Visit [https://app.swellscope.io](https://app.swellscope.io) in your browser.

### 1.2 Connect Wallet

1. Click **"Connect Wallet"** in the top right corner
2. Select your preferred wallet (MetaMask recommended)
3. Approve the connection request
4. Sign the authentication message

### 1.3 Add Swellchain Network

If Swellchain isn't in your wallet, add it manually:

**Network Details:**
```
Network Name: Swellchain
RPC URL: https://swell-mainnet.alt.technology
Chain ID: 1923
Currency Symbol: ETH
Block Explorer: https://explorer.swellnetwork.io
```

**For MetaMask:**
1. Open MetaMask → Networks → Add Network
2. Enter the details above
3. Click "Save"

## Step 2: Explore Your Dashboard

### 2.1 Portfolio Overview

Your dashboard shows:
- **Total Portfolio Value**: Combined value across all positions
- **Asset Breakdown**: Distribution of your restaking assets
- **Performance Metrics**: 24h, 7d, 30d returns
- **Risk Score**: Overall portfolio risk assessment

### 2.2 Key Metrics

- **TVL (Total Value Locked)**: Your total staked value
- **APY (Annual Percentage Yield)**: Current earning rate
- **Risk Score**: 0-100 scale (lower is safer)
- **Diversification**: Spread across protocols and validators

## Step 3: Understand Risk Assessment

### 3.1 Risk Components

SwellScope evaluates four key risk factors:

1. **Slashing Risk** (0-25 points)
   - Validator performance and history
   - Operator reputation
   - Slashing probability

2. **Liquidity Risk** (0-25 points)
   - Exit queue length
   - Market liquidity depth
   - Utilization rates

3. **Smart Contract Risk** (0-25 points)
   - Audit status and findings
   - Time since deployment
   - Bug bounty programs

4. **Market Risk** (0-25 points)
   - Price volatility
   - Correlation with ETH
   - Market conditions

### 3.2 Risk Levels

- **Low Risk (0-30)**: Conservative, stable returns
- **Medium Risk (31-60)**: Balanced risk/reward
- **High Risk (61-80)**: Aggressive growth potential
- **Very High Risk (81-100)**: Maximum risk, emergency consideration

### 3.3 Setting Risk Preferences

1. Go to **Settings → Risk Profile**
2. Set your **Maximum Risk Tolerance** (recommended: 75)
3. Enable **Auto-Rebalancing** for automatic risk management
4. Set **Emergency Exit Threshold** (recommended: 90)

## Step 4: Create Your First Strategy

### 4.1 Strategy Types

**Conservative Strategy**
- 70% swETH (low risk)
- 20% rswETH (medium risk)
- 10% cash buffer
- Target APY: 4-6%

**Balanced Strategy**
- 50% swETH
- 40% rswETH
- 10% Nucleus protocol
- Target APY: 6-8%

**Aggressive Strategy**
- 30% swETH
- 50% rswETH
- 20% High-yield protocols
- Target APY: 8-12%

### 4.2 Create Strategy

1. Click **"Create Strategy"** on your dashboard
2. Choose a **Strategy Name** (e.g., "Conservative Growth")
3. Set **Asset Allocation** percentages
4. Configure **Risk Parameters**:
   - Maximum risk score
   - Auto-rebalancing frequency
   - Emergency exit threshold
5. Review and **Confirm Strategy**

### 4.3 Strategy Execution

Once created, your strategy will:
- Automatically allocate funds according to your preferences
- Monitor risk levels continuously
- Rebalance when risk thresholds are exceeded
- Generate alerts for important events

## Step 5: Deposit and Start Earning

### 5.1 Supported Assets

- **ETH**: Automatically converted to swETH
- **swETH**: Liquid staking token
- **rswETH**: Restaked liquid staking token
- **WETH**: Wrapped Ethereum

### 5.2 Making Your First Deposit

1. Click **"Deposit"** on your dashboard
2. Select the **Asset** you want to deposit
3. Enter the **Amount**
4. Review the **Transaction Details**:
   - Estimated shares received
   - Current exchange rate
   - Gas fees
5. Click **"Deposit"** and confirm in your wallet

### 5.3 Transaction Confirmation

- **Pending**: Transaction submitted to network
- **Confirmed**: Transaction included in block
- **Completed**: Shares added to your portfolio

## Step 6: Monitor Your Portfolio

### 6.1 Real-Time Monitoring

SwellScope provides real-time updates on:
- Portfolio value changes
- Yield generation
- Risk score fluctuations
- Strategy performance

### 6.2 Performance Tracking

Track your performance with:
- **Total Return**: Absolute gains/losses
- **Percentage Return**: Performance relative to initial investment
- **APY Tracking**: Current and historical yield rates
- **Benchmark Comparison**: Performance vs. simple staking

### 6.3 Risk Monitoring

Monitor risk through:
- **Risk Score Dashboard**: Real-time risk assessment
- **Risk Alerts**: Notifications when thresholds are exceeded
- **Trend Analysis**: Historical risk patterns
- **Component Breakdown**: Detailed risk factor analysis

## Step 7: Advanced Features

### 7.1 Cross-Chain Positions

Monitor positions across multiple chains:
1. Go to **Portfolio → Cross-Chain View**
2. See your positions on Ethereum and Swellchain
3. Track bridge operations and timing
4. Optimize cross-chain yield opportunities

### 7.2 AVS Performance Monitoring

Track AVS service performance:
- **MACH AVS**: Fast finality metrics
- **VITAL AVS**: State verification performance (coming soon)
- **SQUAD AVS**: Decentralized sequencing metrics (coming soon)

### 7.3 Yield Optimization

Maximize your returns:
1. **Strategy Comparison**: Compare different allocation strategies
2. **Yield Forecasting**: Predict future returns based on current trends
3. **Rebalancing Suggestions**: Get recommendations for portfolio optimization
4. **Market Opportunities**: Discover new yield farming opportunities

## Step 8: Withdrawals and Exit Strategies

### 8.1 Partial Withdrawals

1. Go to **Portfolio → Withdraw**
2. Select the **Amount** to withdraw
3. Choose **Withdrawal Method**:
   - Instant (may have fees)
   - Standard (queue-based)
4. Confirm transaction

### 8.2 Emergency Exit

If risk levels become too high:
1. SwellScope can automatically trigger emergency exit
2. Manual emergency exit available in **Settings → Emergency**
3. All positions liquidated to minimize losses

### 8.3 Withdrawal Timeline

- **Instant Withdrawals**: Available immediately (fees apply)
- **Standard Withdrawals**: 1-7 days depending on protocol
- **Emergency Exits**: Immediate but may incur higher slippage

## Best Practices

### Security

1. **Never share your private keys** or seed phrases
2. **Use hardware wallets** for large amounts
3. **Enable 2FA** on your email and exchange accounts
4. **Verify contract addresses** before interacting
5. **Keep software updated** (wallet, browser)

### Risk Management

1. **Start small** while learning the platform
2. **Diversify across protocols** and validators
3. **Set appropriate risk limits** based on your tolerance
4. **Monitor regularly** but avoid overtrading
5. **Keep some ETH** for gas fees

### Optimization

1. **Review strategies monthly** and adjust as needed
2. **Take advantage of rebalancing** opportunities
3. **Stay informed** about protocol updates
4. **Use dollar-cost averaging** for regular deposits
5. **Consider tax implications** of your trading

## Troubleshooting

### Common Issues

#### "Transaction Failed"
- **Cause**: Insufficient gas or slippage
- **Solution**: Increase gas limit or try again

#### "High Risk Warning"
- **Cause**: Portfolio risk above your threshold
- **Solution**: Rebalance to safer assets or adjust risk settings

#### "Withdrawal Delayed"
- **Cause**: High network congestion or protocol queues
- **Solution**: Wait for network conditions to improve

#### "Can't Connect Wallet"
- **Cause**: Network issues or wrong network selected
- **Solution**: Check network settings and refresh page

### Getting Help

1. **In-App Help**: Click the "?" icon for contextual help
2. **Documentation**: Visit [docs.swellscope.io](https://docs.swellscope.io)
3. **Discord Community**: Join our [Discord server](https://discord.gg/swellscope)
4. **Support Email**: Contact support@swellscope.io
5. **Twitter**: Follow [@SwellScope](https://twitter.com/swellscope) for updates

## Next Steps

### Intermediate Users

- Explore **Advanced Analytics** features
- Set up **Custom Alerts** for portfolio events
- Try **Strategy Backtesting** to optimize performance
- Join the **Community Discord** for strategy discussions

### Advanced Users

- Use the **API** for automated portfolio management
- Integrate with **DeFi protocols** for advanced strategies
- Participate in **Governance** decisions
- Contribute to **Strategy Development**

### Developers

- Explore the **SwellScope SDK** for building integrations
- Check out **Smart Contract Documentation**
- Join **Developer Discussions** on GitHub
- Contribute to **Open Source** development

## Conclusion

Congratulations! You're now ready to start using SwellScope for advanced restaking portfolio management. Remember to:

- Start with small amounts while learning
- Monitor your risk levels regularly
- Take advantage of automated features
- Stay engaged with the community

SwellScope is constantly evolving with new features and improvements. Keep your app updated and check our documentation regularly for the latest features and best practices.

**Happy restaking!** 🚀

---

**Need more help?**
- [Advanced Features Guide](advanced-features.md)
- [Risk Management Deep Dive](risk-management.md)
- [Strategy Optimization Guide](strategy-optimization.md)
- [API Integration Guide](../api/rest-api.md) 