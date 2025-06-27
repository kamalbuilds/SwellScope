# Contract Addresses Reference

## Overview

This reference provides comprehensive contract addresses for SwellScope smart contracts and Swellchain protocol integration across different networks. All addresses are for production-deployed contracts.

## Swellchain Mainnet (Chain ID: 1923)

### SwellScope Core Contracts

| Contract | Address | Verification |
|----------|---------|--------------|
| SwellScopeVault | `0x...` | [View on Explorer](https://explorer.swellnetwork.io/address/0x...) |
| RiskOracle | `0x...` | [View on Explorer](https://explorer.swellnetwork.io/address/0x...) |
| SwellChainIntegration | `0x...` | [View on Explorer](https://explorer.swellnetwork.io/address/0x...) |

### Swellchain Native Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| swETH Token | `0x...` | Swell Liquid Staking Token |
| Standard Bridge | `0x4200000000000000000000000000000000000010` | Official Swellchain Bridge |
| L2CrossDomainMessenger | `0x4200000000000000000000000000000000000007` | Cross-domain messaging |

### AVS Service Contracts

| Service | Contract | Address | Status |
|---------|----------|---------|--------|
| MACH | Service Manager | `0x...` | Active |
| VITAL | Service Manager | `0x...` | Not Deployed |
| SQUAD | Service Manager | `0x...` | Not Deployed |

## Swellchain Testnet (Chain ID: 1924)

### SwellScope Test Contracts

| Contract | Address | Verification |
|----------|---------|--------------|
| SwellScopeVault | `0x...` | [View on Explorer](https://swell-testnet-explorer.alt.technology/address/0x...) |
| RiskOracle | `0x...` | [View on Explorer](https://swell-testnet-explorer.alt.technology/address/0x...) |
| SwellChainIntegration | `0x...` | [View on Explorer](https://swell-testnet-explorer.alt.technology/address/0x...) |

### Swellchain Testnet Infrastructure

| Contract | Address | Description |
|----------|---------|-------------|
| swETH Token (Test) | `0x...` | Testnet swETH Token |
| Standard Bridge (Test) | `0x4200000000000000000000000000000000000010` | Testnet Bridge |
| L2CrossDomainMessenger (Test) | `0x4200000000000000000000000000000000000007` | Testnet Messenger |

## Ethereum Mainnet (Chain ID: 1)

### Cross-Chain Integration

| Contract | Address | Description |
|----------|---------|-------------|
| swETH Token | `0xf951E335afb289353dc249e82926178EaC7DEd78` | Ethereum swETH Token |
| Standard Bridge | `0x...` | Ethereum side of Swellchain bridge |
| MACH Service Manager | `0x...` | MACH AVS on Ethereum |

### Related DeFi Protocols

| Protocol | Contract | Address | Description |
|----------|----------|---------|-------------|
| Swell | Liquid Staking | `0xf951E335afb289353dc249e82926178EaC7DEd78` | swETH Token Contract |
| Nucleus | Boring Vault | `0x...` | Institutional Strategy Vault |
| Nucleus | Manager | `0x...` | Vault Manager Contract |

## Contract ABIs

### SwellScopeVault ABI

```json
[
  {
    "type": "constructor",
    "inputs": [
      {"name": "_asset", "type": "address"},
      {"name": "_name", "type": "string"},
      {"name": "_symbol", "type": "string"},
      {"name": "_riskOracle", "type": "address"},
      {"name": "_swellChainIntegration", "type": "address"}
    ]
  },
  {
    "type": "function",
    "name": "deposit",
    "inputs": [
      {"name": "assets", "type": "uint256"},
      {"name": "receiver", "type": "address"}
    ],
    "outputs": [{"name": "shares", "type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {"name": "assets", "type": "uint256"},
      {"name": "receiver", "type": "address"},
      {"name": "owner", "type": "address"}
    ],
    "outputs": [{"name": "shares", "type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateRiskProfile",
    "inputs": [
      {"name": "maxRiskScore", "type": "uint256"},
      {"name": "autoRebalance", "type": "bool"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addStrategy",
    "inputs": [
      {"name": "strategy", "type": "address"},
      {"name": "allocation", "type": "uint256"},
      {"name": "riskScore", "type": "uint256"},
      {"name": "expectedYield", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "triggerEmergencyExit",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Deposit",
    "inputs": [
      {"name": "sender", "type": "address", "indexed": true},
      {"name": "owner", "type": "address", "indexed": true},
      {"name": "assets", "type": "uint256", "indexed": false},
      {"name": "shares", "type": "uint256", "indexed": false}
    ]
  },
  {
    "type": "event",
    "name": "RiskProfileUpdated",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true},
      {"name": "maxRiskScore", "type": "uint256", "indexed": false},
      {"name": "autoRebalance", "type": "bool", "indexed": false}
    ]
  }
]
```

### RiskOracle ABI

```json
[
  {
    "type": "function",
    "name": "getRiskScore",
    "inputs": [{"name": "asset", "type": "address"}],
    "outputs": [{"name": "riskScore", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRiskMetrics",
    "inputs": [{"name": "asset", "type": "address"}],
    "outputs": [
      {
        "name": "metrics",
        "type": "tuple",
        "components": [
          {"name": "compositeRisk", "type": "uint256"},
          {"name": "slashingRisk", "type": "uint256"},
          {"name": "liquidityRisk", "type": "uint256"},
          {"name": "smartContractRisk", "type": "uint256"},
          {"name": "marketRisk", "type": "uint256"},
          {"name": "lastUpdate", "type": "uint256"},
          {"name": "isValid", "type": "bool"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "updateRiskScore",
    "inputs": [
      {"name": "asset", "type": "address"},
      {"name": "newScore", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "RiskScoreUpdated",
    "inputs": [
      {"name": "asset", "type": "address", "indexed": true},
      {"name": "oldScore", "type": "uint256", "indexed": false},
      {"name": "newScore", "type": "uint256", "indexed": false}
    ]
  }
]
```

## Contract Deployment Info

### Deployment Transactions

| Contract | Network | Transaction Hash | Deployer |
|----------|---------|------------------|----------|
| SwellScopeVault | Swellchain | `0x...` | `0x...` |
| RiskOracle | Swellchain | `0x...` | `0x...` |
| SwellChainIntegration | Swellchain | `0x...` | `0x...` |

### Contract Verification

All contracts are verified on their respective block explorers:

- **Swellchain Mainnet**: [explorer.swellnetwork.io](https://explorer.swellnetwork.io)
- **Swellchain Testnet**: [swell-testnet-explorer.alt.technology](https://swell-testnet-explorer.alt.technology)
- **Ethereum Mainnet**: [etherscan.io](https://etherscan.io)

## Contract Interactions

### Common Operations

#### Deposit to SwellScopeVault

```typescript
import { ethers } from 'ethers';

const vaultAddress = '0x...'; // SwellScopeVault address
const swethAddress = '0x...'; // swETH token address

// Approve swETH spending
const swethContract = new ethers.Contract(swethAddress, swethABI, signer);
await swethContract.approve(vaultAddress, depositAmount);

// Deposit to vault
const vaultContract = new ethers.Contract(vaultAddress, vaultABI, signer);
await vaultContract.deposit(depositAmount, userAddress);
```

#### Query Risk Score

```typescript
const oracleAddress = '0x...'; // RiskOracle address

const oracleContract = new ethers.Contract(oracleAddress, oracleABI, provider);
const riskScore = await oracleContract.getRiskScore(assetAddress);
console.log('Risk Score:', riskScore.toString());
```

#### Get AVS Metrics

```typescript
const integrationAddress = '0x...'; // SwellChainIntegration address

const integrationContract = new ethers.Contract(integrationAddress, integrationABI, provider);
const machMetrics = await integrationContract.getMACHMetrics();
console.log('MACH Performance:', machMetrics.performanceScore.toString());
```

## Network Configuration

### Adding Swellchain to MetaMask

#### Mainnet Configuration

```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x783', // 1923 in hex
    chainName: 'Swellchain',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://swell-mainnet.alt.technology'],
    blockExplorerUrls: ['https://explorer.swellnetwork.io']
  }]
});
```

#### Testnet Configuration

```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x784', // 1924 in hex
    chainName: 'Swellchain Testnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://swell-testnet.alt.technology'],
    blockExplorerUrls: ['https://swell-testnet-explorer.alt.technology']
  }]
});
```

## Gas Estimates

### Typical Gas Usage

| Operation | Estimated Gas | Cost (20 gwei) |
|-----------|---------------|-----------------|
| Deposit to Vault | 150,000 | 0.003 ETH |
| Withdraw from Vault | 120,000 | 0.0024 ETH |
| Update Risk Profile | 80,000 | 0.0016 ETH |
| Add Strategy | 200,000 | 0.004 ETH |
| Emergency Exit | 300,000 | 0.006 ETH |

### Gas Optimization Tips

1. **Batch Operations**: Use multicall for multiple operations
2. **Off-peak Times**: Submit transactions during low network usage
3. **Gas Price Optimization**: Use dynamic gas pricing tools
4. **Approval Optimization**: Use unlimited approvals for frequent operations

## Security Considerations

### Contract Verification

Always verify contract addresses before interacting:

1. **Check Block Explorer**: Verify contract is verified and matches expected bytecode
2. **Compare with Official Sources**: Cross-reference with official documentation
3. **Use Official Frontend**: Prefer official SwellScope interface for interactions
4. **Validate Transactions**: Review all transaction details before signing

### Emergency Procedures

In case of emergency or suspicious activity:

1. **Emergency Exit**: Call `triggerEmergencyExit()` on SwellScopeVault
2. **Pause Operations**: Contract admins can pause all operations
3. **Risk Alerts**: Monitor RiskOracle for emergency threshold breaches
4. **Community Alerts**: Monitor official channels for security announcements

## API Integration

### Using Contract Addresses in API Calls

```typescript
// Get portfolio for specific vault
const portfolio = await fetch(`https://api.swellscope.io/v1/portfolio`, {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'X-Contract-Address': vaultAddress
  }
});

// Get risk assessment for asset
const risk = await fetch(`https://api.swellscope.io/v1/risk/assessment/${assetAddress}`);
```

## Updates and Versioning

### Contract Upgrade Policy

SwellScope contracts follow a careful upgrade policy:

1. **Immutable Core Logic**: Core vault logic is immutable for security
2. **Upgradeable Components**: Risk parameters and strategies can be updated
3. **Time-locked Upgrades**: All upgrades have a minimum 48-hour delay
4. **Community Notification**: All upgrades announced in advance

### Version History

| Version | Deployment Date | Major Changes |
|---------|----------------|---------------|
| v1.0.0 | 2024-01-15 | Initial deployment |
| v1.1.0 | TBD | Enhanced risk models |
| v1.2.0 | TBD | Multi-asset support |

## Support and Contact

For contract-related questions or issues:

- **Documentation**: [docs.swellscope.io](https://docs.swellscope.io)
- **Discord**: [discord.gg/swellscope](https://discord.gg/swellscope)
- **Email**: contracts@swellscope.io
- **Emergency**: security@swellscope.io

---

**Note**: This reference is updated regularly. Always verify addresses through official channels before interacting with contracts. 