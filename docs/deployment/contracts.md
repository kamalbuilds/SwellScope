# Smart Contract Deployment

This guide provides comprehensive instructions for deploying SwellScope smart contracts to Swellchain mainnet and testnet.

## Prerequisites

Before deploying, ensure you have:

- **Foundry installed**: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- **Private key** with sufficient ETH for gas fees
- **RPC access** to Swellchain networks
- **Environment variables** properly configured

## Environment Setup

### 1. Configure Environment Variables

Create a `.env` file in the contracts directory:

```bash
# Network Configuration
PRIVATE_KEY=0x1234567890abcdef... # Your deployment private key
SWELLCHAIN_RPC_URL=https://swell-mainnet.alt.technology
SWELLCHAIN_TESTNET_RPC_URL=https://swell-testnet.alt.technology
ETHEREUM_RPC_URL=https://eth.llamarpc.com

# Contract Addresses (Testnet)
TESTNET_SWETH_ADDRESS=0x1111111111111111111111111111111111111111
TESTNET_RSWETH_ADDRESS=0x2222222222222222222222222222222222222222

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
SWELLCHAIN_ETHERSCAN_API_KEY=your_swellchain_api_key

# Security
DEPLOYER_ADDRESS=0x742d35Cc6635C0532925a3b8D4a6cC0e1b8e1 # Your deployer address
```

### 2. Network Configuration

Verify your `foundry.toml` configuration:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = [
    "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",
    "@forge-std/=lib/forge-std/src/",
]

# Compiler settings
solc_version = "0.8.21"
optimizer = true
optimizer_runs = 200
via_ir = true

# Network configurations
[rpc_endpoints]
swellchain = "${SWELLCHAIN_RPC_URL}"
swellchain_testnet = "${SWELLCHAIN_TESTNET_RPC_URL}"
ethereum = "${ETHEREUM_RPC_URL}"

[etherscan]
swellchain = { key = "${SWELLCHAIN_ETHERSCAN_API_KEY}", url = "https://explorer.swellnetwork.io/api" }
```

## Pre-Deployment Checklist

### 1. Code Compilation

```bash
# Clean previous builds
forge clean

# Compile contracts
forge build

# Verify compilation success
echo "✅ Compilation completed successfully"
```

### 2. Run Tests

```bash
# Run comprehensive test suite
forge test -vv

# Run with gas reporting
forge test --gas-report

# Expected output:
# Running 4 tests for test/Contract.t.sol:SwellScopeVaultTest
# [PASS] testBasicVaultOperations() (gas: 105703)
# [PASS] testRiskOracleDeployment() (gas: 21133)
# [PASS] testSwellChainIntegrationDeployment() (gas: 13364)
# [PASS] testVaultDeployment() (gas: 33847)
# Suite result: ok. 4 passed; 0 failed; 0 skipped
```

### 3. Security Verification

```bash
# Static analysis with Slither (optional)
slither src/

# Check for common vulnerabilities
forge script script/SecurityChecks.s.sol
```

## Deployment Process

### Testnet Deployment

#### 1. Deploy to Swellchain Testnet

```bash
# Set environment for testnet
export NETWORK=testnet

# Deploy contracts
forge script script/Deploy.s.sol \
  --rpc-url $SWELLCHAIN_TESTNET_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $SWELLCHAIN_ETHERSCAN_API_KEY

# Expected output:
# == Logs ==
# Deploying SwellScope contracts to Swellchain...
# Deployer address: 0x742d35Cc6635C0532925a3b8D4a6cC0e1b8e1
# Chain ID: 1924
# 
# === Deploying RiskOracle ===
# RiskOracle deployed at: 0xF2E246BB76DF876Cef8b38ae84130F4F55De395b
# 
# === Deploying SwellChainIntegration ===
# SwellChainIntegration deployed at: 0x2946259E0334f33A064106302415aD3391BeD384
# 
# === Deploying SwellScopeVault ===
# SwellScopeVault deployed at: 0xDe09E74d4888Bc4e65F589e8c13Bce9F71DdF4c7
```

#### 2. Verify Deployment

```bash
# Check contract verification status
forge verify-check --chain-id 1924 <deployment-guid>

# Test basic functionality
forge script script/PostDeploymentTests.s.sol \
  --rpc-url $SWELLCHAIN_TESTNET_RPC_URL
```

### Mainnet Deployment

#### 1. Final Pre-Deployment Checks

```bash
# Verify environment
echo "Deployer: $DEPLOYER_ADDRESS"
echo "Network: Swellchain Mainnet (1923)"
echo "RPC: $SWELLCHAIN_RPC_URL"

# Check deployer balance
cast balance $DEPLOYER_ADDRESS --rpc-url $SWELLCHAIN_RPC_URL

# Minimum required: 0.1 ETH for gas fees
```

#### 2. Deploy to Mainnet

```bash
# Deploy with extra verification
forge script script/Deploy.s.sol \
  --rpc-url $SWELLCHAIN_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $SWELLCHAIN_ETHERSCAN_API_KEY \
  --slow \
  --legacy

# The --slow flag adds delays between transactions
# The --legacy flag uses legacy transaction format if needed
```

#### 3. Post-Deployment Verification

```bash
# Verify all contracts are deployed correctly
forge script script/VerifyDeployment.s.sol \
  --rpc-url $SWELLCHAIN_RPC_URL

# Check contract initialization
forge script script/CheckInitialization.s.sol \
  --rpc-url $SWELLCHAIN_RPC_URL
```

## Contract Addresses

After successful deployment, record the contract addresses:

### Testnet Addresses

```yaml
Network: Swellchain Testnet (1924)
RPC: https://swell-testnet.alt.technology
Explorer: https://explorer.swellnetwork.io

Contracts:
  RiskOracle: "0xF2E246BB76DF876Cef8b38ae84130F4F55De395b"
  SwellChainIntegration: "0x2946259E0334f33A064106302415aD3391BeD384"
  SwellScopeVault: "0xDe09E74d4888Bc4e65F589e8c13Bce9F71DdF4c7"

External Dependencies:
  swETH: "0x1111111111111111111111111111111111111111"
  rswETH: "0x2222222222222222222222222222222222222222"
  Standard Bridge: "0x4200000000000000000000000000000000000010"
```

### Mainnet Addresses

```yaml
Network: Swellchain Mainnet (1923)
RPC: https://swell-mainnet.alt.technology
Explorer: https://explorer.swellnetwork.io

Contracts:
  RiskOracle: "TBD"
  SwellChainIntegration: "TBD"
  SwellScopeVault: "TBD"

External Dependencies:
  swETH: "0xf951E335afb289353dc249e82926178EaC7DEd78"
  rswETH: "TBD"
  Nucleus BoringVault: "0x9Ed15383940CC380fAEF0a75edacE507cC775f22"
  Nucleus Manager: "0x69FC700226E9e12D8c5E46a4b50A78efB64F50C0"
  Standard Bridge: "0x4200000000000000000000000000000000000010"
  MACH Service Manager: "0x289Dbe6573D6a1dAF00110b5B1b2D8F0a34099C2" # Ethereum
```

## Deployment Script Details

### Core Deployment Logic

The deployment script (`script/Deploy.s.sol`) follows this sequence:

1. **Validation**: Verify network and environment
2. **RiskOracle**: Deploy risk assessment system
3. **SwellChainIntegration**: Deploy Swellchain integration layer
4. **SwellScopeVault**: Deploy main vault contract
5. **Initialization**: Set up roles and initial parameters
6. **Verification**: Generate verification commands

### Key Features

- **Network Detection**: Automatically detects testnet vs mainnet
- **Real Address Integration**: Uses actual deployed contract addresses
- **Role Setup**: Configures proper access control
- **Gas Optimization**: Uses efficient deployment patterns
- **Verification Ready**: Generates verification commands

## Gas Costs

### Estimated Deployment Costs

| Contract | Gas Used | ETH Cost* | USD Cost** |
|----------|----------|-----------|------------|
| RiskOracle | 1,200,000 | 0.024 | $48 |
| SwellChainIntegration | 1,800,000 | 0.036 | $72 |
| SwellScopeVault | 2,500,000 | 0.050 | $100 |
| **Total** | **5,500,000** | **0.110** | **$220** |

*Based on 20 gwei gas price
**Based on $2000 ETH

### Gas Optimization Tips

1. **Use `via_ir`**: Enables advanced optimizations
2. **Batch Operations**: Deploy multiple contracts in one transaction
3. **Constructor Optimization**: Minimize constructor complexity
4. **Storage Packing**: Use packed structs for storage efficiency

## Troubleshooting

### Common Issues

#### 1. "Insufficient funds for gas"

```bash
# Check balance
cast balance $DEPLOYER_ADDRESS --rpc-url $SWELLCHAIN_RPC_URL

# Solution: Add more ETH to deployer address
```

#### 2. "Contract creation failed"

```bash
# Check if contract already exists at address
cast code <contract_address> --rpc-url $SWELLCHAIN_RPC_URL

# Solution: Use different salt or redeploy
```

#### 3. "Verification failed"

```bash
# Manually verify contract
forge verify-contract <contract_address> \
  src/SwellScopeVault.sol:SwellScopeVault \
  --chain-id 1923 \
  --constructor-args $(cast abi-encode "constructor(address,string,string,address,address)" \
    0xf951E335afb289353dc249e82926178EaC7DEd78 \
    "SwellScope Restaking Vault" \
    "ssVault" \
    0xF2E246BB76DF876Cef8b38ae84130F4F55De395b \
    0x2946259E0334f33A064106302415aD3391BeD384)
```

#### 4. "RPC connection failed"

```bash
# Test RPC connection
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  $SWELLCHAIN_RPC_URL

# Expected response: {"jsonrpc":"2.0","id":1,"result":"0x783"}
```

## Security Considerations

### 1. Private Key Management

- **Never commit private keys** to version control
- Use hardware wallets for mainnet deployments
- Consider using multi-sig for admin functions

### 2. Contract Verification

- Always verify contracts on block explorers
- Double-check constructor parameters
- Verify source code matches deployed bytecode

### 3. Access Control

- Set up proper role-based permissions
- Use timelock for critical parameter changes
- Implement emergency pause mechanisms

## Post-Deployment Tasks

### 1. Update Frontend Configuration

```typescript
// Update frontend/src/config/contracts.ts
export const CONTRACTS = {
  swellchain: {
    chainId: 1923,
    riskOracle: "0x...",
    swellChainIntegration: "0x...",
    swellScopeVault: "0x..."
  }
};
```

### 2. Update Backend Configuration

```yaml
# Update backend/config/production.yml
contracts:
  swellchain:
    risk_oracle: "0x..."
    integration: "0x..."
    vault: "0x..."
```

### 3. Documentation Updates

- Update contract addresses in documentation
- Create deployment announcement
- Update API documentation with new addresses

### 4. Monitoring Setup

```bash
# Set up contract monitoring
npm run setup-monitoring -- --network swellchain --contracts contracts.json
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Contracts compiled successfully
- [ ] All tests passing
- [ ] Deployer has sufficient ETH
- [ ] Network configuration verified
- [ ] Deployment script tested on testnet
- [ ] Security review completed
- [ ] Deploy to mainnet
- [ ] Verify all contracts
- [ ] Test basic functionality
- [ ] Update frontend/backend configs
- [ ] Update documentation
- [ ] Set up monitoring
- [ ] Announce deployment

## Continuous Deployment

For automated deployments, use GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy Contracts

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1
      - name: Deploy
        run: |
          forge script script/Deploy.s.sol \
            --rpc-url ${{ secrets.SWELLCHAIN_RPC_URL }} \
            --broadcast \
            --verify
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
```

---

For more deployment information:
- [Infrastructure Setup](infrastructure.md)
- [Production Configuration](production.md)
- [Monitoring & Alerting](monitoring.md) 