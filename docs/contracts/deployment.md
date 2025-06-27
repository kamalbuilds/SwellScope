# Smart Contract Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying SwellScope smart contracts to Swellchain networks. The deployment process covers contract compilation, deployment scripts, verification, and post-deployment configuration.

## Prerequisites

### Environment Setup

Ensure you have completed the [Development Setup](../development/setup.md) before proceeding with deployment.

#### Required Tools

- **Foundry**: Latest version with `forge` and `cast`
- **Git**: For version control and tag management
- **Node.js**: 18.x+ for deployment scripts
- **Private Keys**: Deployment wallet with sufficient ETH

#### Network Access

- **Swellchain Mainnet**: ETH for gas fees
- **Swellchain Testnet**: Testnet ETH from faucet
- **Ethereum Mainnet**: For cross-chain verification (optional)

### Environment Variables

Configure deployment environment in `contracts/.env`:

```bash
# Network Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
SWELLCHAIN_RPC_URL=https://swell-mainnet.alt.technology
SWELLCHAIN_TESTNET_RPC_URL=https://swell-testnet.alt.technology

# Deployment Keys
DEPLOYER_PRIVATE_KEY=0x...your_deployment_private_key
MULTISIG_ADDRESS=0x...your_multisig_address

# Contract Dependencies (Swellchain)
SWETH_ADDRESS=0x...sweth_token_address
RSWETH_ADDRESS=0x...rsweth_token_address
STANDARD_BRIDGE_ADDRESS=0x...bridge_address
MACH_SERVICE_MANAGER_ADDRESS=0x...mach_avs_address

# Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
VERIFY_CONTRACTS=true
```

## Network Configurations

### Swellchain Mainnet

```bash
# Network Details
Chain ID: 1923
RPC URL: https://swell-mainnet.alt.technology
Block Explorer: https://explorer.swellnetwork.io
Native Token: ETH
```

### Swellchain Testnet

```bash
# Network Details
Chain ID: 1924
RPC URL: https://swell-testnet.alt.technology
Block Explorer: https://swell-testnet-explorer.alt.technology
Native Token: ETH (testnet)
```

## Contract Dependencies

### Required Contracts

Before deploying SwellScope contracts, ensure these dependencies are available:

#### Swellchain Native Contracts

```solidity
// Core Swellchain contracts
IERC20 swETH = IERC20(0x...);                    // Swell Liquid Staking Token
IERC20 rswETH = IERC20(0x...);                   // Swell Restaking Token
address standardBridge = 0x...;                   // Swellchain Standard Bridge
address machServiceManager = 0x...;               // MACH AVS Service Manager
```

#### OpenZeppelin Dependencies

```solidity
// Automatically installed via forge install
@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol
@openzeppelin/contracts/access/AccessControl.sol
@openzeppelin/contracts/utils/ReentrancyGuard.sol
@openzeppelin/contracts/utils/Pausable.sol
```

## Deployment Scripts

### Core Deployment Script

Create `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import "../src/SwellScopeVault.sol";
import "../src/RiskOracle.sol";
import "../src/SwellChainIntegration.sol";

contract DeployScript is Script {
    // Configuration constants
    uint256 public constant INITIAL_MANAGEMENT_FEE = 50; // 0.5%
    uint256 public constant INITIAL_PERFORMANCE_FEE = 1000; // 10%
    
    // Deployment addresses
    address public deployer;
    address public multisig;
    
    // Contract instances
    RiskOracle public riskOracle;
    SwellChainIntegration public swellIntegration;
    SwellScopeVault public vault;
    
    function setUp() public {
        deployer = vm.envAddress("DEPLOYER_ADDRESS");
        multisig = vm.envAddress("MULTISIG_ADDRESS");
    }
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contracts in dependency order
        deployRiskOracle();
        deploySwellChainIntegration();
        deploySwellScopeVault();
        
        // Configure contracts
        configureContracts();
        
        // Transfer ownership to multisig
        transferOwnership();
        
        vm.stopBroadcast();
        
        // Log deployment addresses
        logDeploymentInfo();
    }
    
    function deployRiskOracle() internal {
        console.log("Deploying RiskOracle...");
        
        riskOracle = new RiskOracle(
            deployer, // Initial admin
            deployer  // Initial oracle
        );
        
        console.log("RiskOracle deployed at:", address(riskOracle));
    }
    
    function deploySwellChainIntegration() internal {
        console.log("Deploying SwellChainIntegration...");
        
        address swETH = vm.envAddress("SWETH_ADDRESS");
        address rswETH = vm.envAddress("RSWETH_ADDRESS");
        address standardBridge = vm.envAddress("STANDARD_BRIDGE_ADDRESS");
        address machServiceManager = vm.envAddress("MACH_SERVICE_MANAGER_ADDRESS");
        
        swellIntegration = new SwellChainIntegration(
            deployer,
            swETH,
            rswETH,
            standardBridge,
            machServiceManager,
            address(0), // nucleusBoringVault - to be set later
            address(0)  // nucleusManager - to be set later
        );
        
        console.log("SwellChainIntegration deployed at:", address(swellIntegration));
    }
    
    function deploySwellScopeVault() internal {
        console.log("Deploying SwellScopeVault...");
        
        address swETH = vm.envAddress("SWETH_ADDRESS");
        
        vault = new SwellScopeVault(
            IERC20(swETH),
            "SwellScope swETH Vault",
            "ssSwETH",
            address(riskOracle),
            address(swellIntegration)
        );
        
        console.log("SwellScopeVault deployed at:", address(vault));
    }
    
    function configureContracts() internal {
        console.log("Configuring contracts...");
        
        // Configure RiskOracle weights
        // (weights are set in constructor, no additional config needed)
        
        // Configure SwellChainIntegration
        // (initial configuration done in constructor)
        
        // Configure SwellScopeVault fees
        vault.updateFees(INITIAL_MANAGEMENT_FEE, INITIAL_PERFORMANCE_FEE);
        
        console.log("Contract configuration complete");
    }
    
    function transferOwnership() internal {
        console.log("Transferring ownership to multisig...");
        
        // Transfer admin roles to multisig
        riskOracle.grantRole(riskOracle.DEFAULT_ADMIN_ROLE(), multisig);
        swellIntegration.grantRole(swellIntegration.DEFAULT_ADMIN_ROLE(), multisig);
        vault.grantRole(vault.DEFAULT_ADMIN_ROLE(), multisig);
        
        // Revoke deployer admin roles (optional - keep for initial setup)
        // riskOracle.revokeRole(riskOracle.DEFAULT_ADMIN_ROLE(), deployer);
        // swellIntegration.revokeRole(swellIntegration.DEFAULT_ADMIN_ROLE(), deployer);
        // vault.revokeRole(vault.DEFAULT_ADMIN_ROLE(), deployer);
        
        console.log("Ownership transfer complete");
    }
    
    function logDeploymentInfo() internal view {
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Multisig:", multisig);
        console.log("\nContract Addresses:");
        console.log("RiskOracle:", address(riskOracle));
        console.log("SwellChainIntegration:", address(swellIntegration));
        console.log("SwellScopeVault:", address(vault));
        console.log("========================\n");
    }
}
```

### Environment-Specific Scripts

#### Testnet Deployment

Create `script/DeployTestnet.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Deploy.s.sol";

contract DeployTestnetScript is DeployScript {
    function run() public override {
        require(block.chainid == 1924, "This script is for Swellchain Testnet only");
        
        console.log("Deploying to Swellchain Testnet (Chain ID: 1924)");
        super.run();
        
        // Testnet-specific configuration
        configureTestnetSettings();
    }
    
    function configureTestnetSettings() internal {
        console.log("Applying testnet-specific configuration...");
        
        // Lower thresholds for testing
        // Add any testnet-specific settings here
        
        console.log("Testnet configuration complete");
    }
}
```

#### Mainnet Deployment

Create `script/DeployMainnet.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Deploy.s.sol";

contract DeployMainnetScript is DeployScript {
    function run() public override {
        require(block.chainid == 1923, "This script is for Swellchain Mainnet only");
        
        console.log("Deploying to Swellchain Mainnet (Chain ID: 1923)");
        
        // Additional mainnet safety checks
        require(multisig != address(0), "Multisig address required for mainnet");
        require(multisig != deployer, "Multisig must be different from deployer");
        
        super.run();
        
        // Mainnet-specific configuration
        configureMainnetSettings();
    }
    
    function configureMainnetSettings() internal {
        console.log("Applying mainnet-specific configuration...");
        
        // Production settings
        // Add any mainnet-specific settings here
        
        console.log("Mainnet configuration complete");
    }
}
```

## Deployment Process

### Pre-deployment Checklist

```bash
# 1. Verify environment configuration
cd contracts
cat .env | grep -E "(RPC_URL|PRIVATE_KEY|ADDRESS)"

# 2. Compile contracts
forge build

# 3. Run tests
forge test

# 4. Check gas estimates
forge test --gas-report

# 5. Verify network connectivity
cast chain-id --rpc-url $SWELLCHAIN_TESTNET_RPC_URL
```

### Testnet Deployment

```bash
# Deploy to Swellchain Testnet
forge script script/DeployTestnet.s.sol \
    --rpc-url $SWELLCHAIN_TESTNET_RPC_URL \
    --broadcast \
    --verify \
    -vvv

# Save deployment artifacts
mkdir -p deployments/testnet
cp broadcast/DeployTestnet.s.sol/1924/run-latest.json deployments/testnet/
```

### Mainnet Deployment

```bash
# Deploy to Swellchain Mainnet (with extra confirmation)
forge script script/DeployMainnet.s.sol \
    --rpc-url $SWELLCHAIN_RPC_URL \
    --broadcast \
    --verify \
    --slow \
    -vvv

# Save deployment artifacts
mkdir -p deployments/mainnet
cp broadcast/DeployMainnet.s.sol/1923/run-latest.json deployments/mainnet/
```

## Contract Verification

### Automatic Verification

Verification is included in deployment scripts, but can be run separately:

```bash
# Verify individual contracts
forge verify-contract \
    --chain-id 1923 \
    --watch \
    <CONTRACT_ADDRESS> \
    src/SwellScopeVault.sol:SwellScopeVault \
    --constructor-args $(cast abi-encode "constructor(address,string,string,address,address)" \
        $SWETH_ADDRESS \
        "SwellScope swETH Vault" \
        "ssSwETH" \
        $RISK_ORACLE_ADDRESS \
        $SWELLCHAIN_INTEGRATION_ADDRESS)
```

### Manual Verification

If automatic verification fails:

```bash
# Flatten contracts for manual verification
forge flatten src/SwellScopeVault.sol > flattened/SwellScopeVault.sol

# Submit to block explorer manually
# Upload flattened/SwellScopeVault.sol to https://explorer.swellnetwork.io
```

## Post-Deployment Configuration

### Initial Setup

```bash
# Create post-deployment configuration script
cat > scripts/configure-deployment.sh << 'EOF'
#!/bin/bash

# Load environment
source contracts/.env

# Contract addresses from deployment
RISK_ORACLE_ADDRESS="0x..."
SWELLCHAIN_INTEGRATION_ADDRESS="0x..."
SWELLSCOPE_VAULT_ADDRESS="0x..."

echo "Configuring deployed contracts..."

# Grant operator roles
cast send $SWELLCHAIN_INTEGRATION_ADDRESS \
    "grantRole(bytes32,address)" \
    $(cast keccak256 "OPERATOR_ROLE") \
    $OPERATOR_ADDRESS \
    --rpc-url $SWELLCHAIN_RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY

# Set up risk thresholds
cast send $RISK_ORACLE_ADDRESS \
    "updateEmergencyThreshold(uint256)" \
    9000 \
    --rpc-url $SWELLCHAIN_RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY

echo "Configuration complete!"
EOF

chmod +x scripts/configure-deployment.sh
./scripts/configure-deployment.sh
```

### Role Management

```bash
# Grant roles to operational addresses
# Risk Manager Role
cast send $SWELLSCOPE_VAULT_ADDRESS \
    "grantRole(bytes32,address)" \
    $(cast keccak256 "RISK_MANAGER_ROLE") \
    $RISK_MANAGER_ADDRESS \
    --rpc-url $SWELLCHAIN_RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY

# Strategist Role
cast send $SWELLSCOPE_VAULT_ADDRESS \
    "grantRole(bytes32,address)" \
    $(cast keccak256 "STRATEGIST_ROLE") \
    $STRATEGIST_ADDRESS \
    --rpc-url $SWELLCHAIN_RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY

# Emergency Role
cast send $SWELLSCOPE_VAULT_ADDRESS \
    "grantRole(bytes32,address)" \
    $(cast keccak256 "EMERGENCY_ROLE") \
    $EMERGENCY_RESPONDER_ADDRESS \
    --rpc-url $SWELLCHAIN_RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY
```

## Deployment Validation

### Contract Verification Tests

Create `script/ValidateDeployment.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import "../src/SwellScopeVault.sol";
import "../src/RiskOracle.sol";
import "../src/SwellChainIntegration.sol";

contract ValidateDeploymentScript is Script {
    function run() public view {
        address vaultAddress = vm.envAddress("SWELLSCOPE_VAULT_ADDRESS");
        address oracleAddress = vm.envAddress("RISK_ORACLE_ADDRESS");
        address integrationAddress = vm.envAddress("SWELLCHAIN_INTEGRATION_ADDRESS");
        
        SwellScopeVault vault = SwellScopeVault(vaultAddress);
        RiskOracle oracle = RiskOracle(oracleAddress);
        SwellChainIntegration integration = SwellChainIntegration(integrationAddress);
        
        // Validate vault configuration
        console.log("=== Vault Validation ===");
        console.log("Vault address:", address(vault));
        console.log("Vault name:", vault.name());
        console.log("Vault symbol:", vault.symbol());
        console.log("Management fee:", vault.managementFee());
        console.log("Performance fee:", vault.performanceFee());
        
        // Validate oracle configuration
        console.log("\n=== Oracle Validation ===");
        console.log("Oracle address:", address(oracle));
        console.log("Max risk score:", oracle.MAX_RISK_SCORE());
        console.log("Emergency threshold:", oracle.EMERGENCY_THRESHOLD());
        
        // Validate integration configuration
        console.log("\n=== Integration Validation ===");
        console.log("Integration address:", address(integration));
        console.log("swETH address:", address(integration.swETH()));
        console.log("Standard bridge:", integration.standardBridge());
        
        console.log("\n=== Validation Complete ===");
    }
}
```

Run validation:

```bash
forge script script/ValidateDeployment.s.sol \
    --rpc-url $SWELLCHAIN_RPC_URL \
    -vvv
```

### Functional Tests

```bash
# Test basic vault operations
cast call $SWELLSCOPE_VAULT_ADDRESS \
    "totalAssets()" \
    --rpc-url $SWELLCHAIN_RPC_URL

# Test risk oracle
cast call $RISK_ORACLE_ADDRESS \
    "calculateCompositeRisk(address)" \
    $SWETH_ADDRESS \
    --rpc-url $SWELLCHAIN_RPC_URL

# Test integration
cast call $SWELLCHAIN_INTEGRATION_ADDRESS \
    "getMACHMetrics()" \
    --rpc-url $SWELLCHAIN_RPC_URL
```

## Upgrade Procedures

### Proxy Patterns

For upgradeable contracts, use OpenZeppelin's proxy patterns:

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract SwellScopeVaultUpgradeable is 
    Initializable, 
    UUPSUpgradeable, 
    SwellScopeVault 
{
    function initialize(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _riskOracle,
        address _swellChainIntegration
    ) public initializer {
        // Initialize implementation
    }
    
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {}
}
```

### Deployment Artifacts

Save deployment information:

```bash
# Create deployment record
cat > deployments/mainnet/deployment-$(date +%Y%m%d).json << EOF
{
  "network": "swellchain-mainnet",
  "chainId": 1923,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployer": "$DEPLOYER_ADDRESS",
  "multisig": "$MULTISIG_ADDRESS",
  "contracts": {
    "RiskOracle": "$RISK_ORACLE_ADDRESS",
    "SwellChainIntegration": "$SWELLCHAIN_INTEGRATION_ADDRESS",
    "SwellScopeVault": "$SWELLSCOPE_VAULT_ADDRESS"
  },
  "dependencies": {
    "swETH": "$SWETH_ADDRESS",
    "rswETH": "$RSWETH_ADDRESS",
    "standardBridge": "$STANDARD_BRIDGE_ADDRESS",
    "machServiceManager": "$MACH_SERVICE_MANAGER_ADDRESS"
  }
}
EOF
```

## Monitoring Setup

### Contract Events

Set up event monitoring:

```bash
# Monitor vault events
cast logs \
    --from-block latest \
    --address $SWELLSCOPE_VAULT_ADDRESS \
    --rpc-url $SWELLCHAIN_RPC_URL

# Monitor risk oracle events
cast logs \
    --from-block latest \
    --address $RISK_ORACLE_ADDRESS \
    --rpc-url $SWELLCHAIN_RPC_URL
```

### Health Checks

```bash
#!/bin/bash
# scripts/health-check.sh

# Check contract responsiveness
forge script script/ValidateDeployment.s.sol --rpc-url $SWELLCHAIN_RPC_URL

# Check balances
cast balance $SWELLSCOPE_VAULT_ADDRESS --rpc-url $SWELLCHAIN_RPC_URL

# Check total assets
cast call $SWELLSCOPE_VAULT_ADDRESS "totalAssets()" --rpc-url $SWELLCHAIN_RPC_URL
```

## Security Considerations

### Deployment Security

- Use hardware wallets for mainnet deployments
- Verify all constructor parameters before deployment
- Use time-locked multisig for admin operations
- Implement emergency pause mechanisms

### Post-Deployment Security

- Monitor contract events continuously
- Set up alerting for emergency conditions
- Regular security audits and reviews
- Incident response procedures

This comprehensive deployment guide ensures secure and reliable deployment of SwellScope smart contracts to Swellchain networks. 