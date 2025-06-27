# Cross-Chain Operations Guide

## Overview

SwellScope enables seamless cross-chain restaking operations between Ethereum mainnet and Swellchain, leveraging the official Swellchain bridge and SuperchainERC20 standards for secure asset transfers.

## Supported Networks

### Ethereum Mainnet
- **Chain ID**: 1
- **Native Asset**: ETH
- **Key Tokens**: swETH, SWELL
- **Bridge Contract**: `0x...` (L1StandardBridge)

### Swellchain 
- **Chain ID**: 1923
- **Native Asset**: ETH
- **Key Tokens**: swETH, rswETH
- **Bridge Contract**: `0x4200000000000000000000000000000000000010` (L2StandardBridge)
- **RPC**: `https://swell-mainnet.alt.technology`

### Swellchain Testnet
- **Chain ID**: 1924
- **RPC**: `https://swell-testnet.alt.technology`
- **Explorer**: `https://swell-testnet-explorer.alt.technology`

## Bridge Operations

### Deposit (Ethereum → Swellchain)

```typescript
// Deposit swETH from Ethereum to Swellchain
const depositConfig = {
  amount: "10.0",           // Amount in swETH
  token: "swETH",
  from: "ethereum",
  to: "swellchain",
  recipient: "0x...",       // Recipient address on Swellchain
  gasLimit: 200000          // L2 gas limit
}

// Using SwellScope API
const deposit = await swellScope.bridge.deposit({
  tokenAddress: "0xf951E335afb289353dc249e82926178EaC7DEd78", // swETH on Ethereum
  amount: ethers.parseEther("10.0"),
  l2GasLimit: 200000,
  recipient: userAddress
});
```

### Withdrawal (Swellchain → Ethereum)

```typescript
// Withdraw swETH from Swellchain to Ethereum
const withdrawal = await swellScope.bridge.withdraw({
  tokenAddress: "0x...",    // swETH on Swellchain
  amount: ethers.parseEther("5.0"),
  recipient: userAddress
});
```

## Cross-Chain Portfolio Management

### Unified Portfolio View

SwellScope provides a unified view of assets across both Ethereum and Swellchain:

- **Total Portfolio Value**: Aggregated value across all networks
- **Network Breakdown**: Asset distribution by network
- **Yield Comparison**: Real-time yield rates on each network
- **Bridge Operations**: Pending transfers and status

### Cross-Chain Rebalancing

Automated rebalancing considers:
- Yield differentials between networks
- Bridge costs and timing
- Gas optimization strategies
- Risk diversification across networks

## Bridge Economics

### Fee Structure

**Deposits (Ethereum → Swellchain)**
- L1 Gas: ~0.002 ETH (Ethereum transaction)
- L2 Gas: ~0.0001 ETH (Swellchain transaction)
- Bridge Fee: 0 (No additional fee)
- **Total**: ~0.0021 ETH

**Withdrawals (Swellchain → Ethereum)**
- L2 Gas: ~0.0001 ETH (Swellchain transaction)
- L1 Gas: ~0.003 ETH (Ethereum finalization)
- Proving Fee: ~0.001 ETH
- **Total**: ~0.0041 ETH

### Timing

- **Deposits**: ~15 minutes (standard)
- **Withdrawals**: ~7 days (challenge period)

## Best Practices

### Bridge Operation Guidelines

1. **Plan Ahead**: Withdrawals take 7 days to complete
2. **Batch Operations**: Combine multiple transfers to save gas
3. **Monitor Gas**: Use gas optimization features during low-cost periods
4. **Verify Addresses**: Double-check recipient addresses
5. **Track Progress**: Monitor bridge transactions closely

### Risk Management

1. **Diversify Exposure**: Don't put all assets on one chain
2. **Understand Timing**: Factor in withdrawal delays for liquidity needs
3. **Monitor Bridge Health**: Stay informed about bridge status
4. **Emergency Planning**: Have contingency plans for bridge issues

### Cost Optimization

1. **Gas Timing**: Bridge during low gas periods (typically 02:00-06:00 UTC)
2. **Yield Thresholds**: Set minimum yield differentials (>0.5%) for bridging
3. **Long-term Planning**: Consider bridge costs in strategy selection

## Bridge Monitoring

### Real-Time Status

SwellScope provides real-time monitoring of:
- Bridge operational status
- Average processing times
- Queue depths for deposits/withdrawals
- Network congestion levels

### Alerts and Notifications

- Bridge transaction completion notifications
- Network status changes
- Gas price optimization alerts
- Emergency bridge status updates

## SuperchainERC20 Integration

SwellScope leverages SuperchainERC20 standards for seamless token transfers:

- **Native Cross-Chain Support**: Tokens designed for multi-chain operations
- **Reduced Complexity**: Simplified bridging mechanisms
- **Enhanced Security**: Built-in cross-chain validation
- **Future Compatibility**: Ready for upcoming Superchain features

## Troubleshooting

### Common Issues

**Bridge Transaction Delayed**
- Verify transaction status on both networks
- Check if network congestion is causing delays
- Ensure sufficient gas was provided

**High Bridge Costs**
- Wait for lower gas periods
- Consider if yield differential justifies costs
- Use batch operations when possible

### Support Resources

- **Bridge Status Page**: Real-time bridge and network status
- **Documentation**: Detailed technical guides
- **Community Discord**: User support and discussion
- **Emergency Support**: For critical bridge issues

---

*Cross-chain operations involve additional risks and costs. Always verify transaction details and understand timing implications before proceeding.* 