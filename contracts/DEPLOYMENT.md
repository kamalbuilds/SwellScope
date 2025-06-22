# SwellScope Contract Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying SwellScope contracts to Swellchain testnet and mainnet.

## Prerequisites

1. **Node.js and npm** installed
2. **Foundry** installed (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
3. **Private key** with testnet ETH for deployment
4. **RPC access** to Swellchain networks

## Network Configuration

### Swellchain Testnet
- **Chain ID**: 1924
- **RPC URL**: https://swell-testnet.alt.technology
- **Explorer**: https://swellchainscan.io

### Swellchain Mainnet
- **Chain ID**: 1923
- **RPC URL**: https://swell-mainnet.alt.technology
- **Explorer**: https://swellchainscan.io

## Environment Setup

Create a `.env` file in the contracts directory:

```bash
# Network Configuration
PRIVATE_KEY=your_private_key_here
SWELLCHAIN_RPC_URL=https://swell-testnet.alt.technology
SWELLCHAIN_MAINNET_RPC_URL=https://swell-mainnet.alt.technology

# Testnet Token Addresses (replace with real addresses)
TESTNET_SWETH_ADDRESS=0x0000000000000000000000000000000000000000
TESTNET_RSWETH_ADDRESS=0x0000000000000000000000000000000000000000

# Real Contract Addresses
NUCLEUS_BORING_VAULT=0x9Ed15383940CC380fAEF0a75edacE507cC775f22
NUCLEUS_MANAGER=0x69FC700226E9e12D8c5E46a4b50A78efB64F50C0
MACH_SERVICE_MANAGER=0x289Dbe6573D6a1dAF00110b5B1b2D8F0a34099C2
```

## Compilation

Compile the contracts:

```bash
forge build
```

## Testing

Run the test suite:

```bash
forge test -vv
```

## Deployment Commands

### Deploy to Swellchain Testnet

```bash
# Deploy to testnet
forge script script/Deploy.s.sol \
  --rpc-url $SWELLCHAIN_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --chain-id 1924

# Alternative with environment file
forge script script/Deploy.s.sol \
  --rpc-url https://swell-testnet.alt.technology \
  --broadcast \
  --verify
```

### Deploy to Swellchain Mainnet

```bash
# Deploy to mainnet
forge script script/Deploy.s.sol \
  --rpc-url $SWELLCHAIN_MAINNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --chain-id 1923
```

## Contract Verification

If automatic verification fails, manually verify using:

```bash
# Verify RiskOracle
forge verify-contract <RISK_ORACLE_ADDRESS> \
  src/RiskOracle.sol:RiskOracle \
  --chain-id 1924 \
  --constructor-args $(cast abi-encode "constructor(address,address)" <ADMIN> <ORACLE>)

# Verify SwellChainIntegration
forge verify-contract <INTEGRATION_ADDRESS> \
  src/SwellChainIntegration.sol:SwellChainIntegration \
  --chain-id 1924 \
  --constructor-args $(cast abi-encode "constructor(address,address,address,address,address,address,address)" <ADMIN> <SWETH> <RSWETH> <BRIDGE> <MACH> <NUCLEUS_VAULT> <NUCLEUS_MANAGER>)

# Verify SwellScopeVault
forge verify-contract <VAULT_ADDRESS> \
  src/SwellScopeVault.sol:SwellScopeVault \
  --chain-id 1924 \
  --constructor-args $(cast abi-encode "constructor(address,string,string,address,address)" <ASSET> "SwellScope Restaking Vault" "ssVault" <RISK_ORACLE> <INTEGRATION>)
```

## Post-Deployment Setup

After successful deployment:

1. **Grant Roles**: Assign appropriate roles to operators and managers
2. **Set Risk Parameters**: Configure risk thresholds for different assets
3. **Initialize Integrations**: Set up AVS and protocol integrations
4. **Test Functionality**: Perform basic operations to ensure everything works

## Contract Addresses

After deployment, the script will output contract addresses and save them to `deployment-info.md`.

### Real Protocol Integrations

The contracts integrate with:

- **MACH AVS**: 0x289Dbe6573D6a1dAF00110b5B1b2D8F0a34099C2 (Ethereum)
- **Nucleus BoringVault**: 0x9Ed15383940CC380fAEF0a75edacE507cC775f22 (Swellchain)
- **Nucleus Manager**: 0x69FC700226E9e12D8c5E46a4b50A78efB64F50C0 (Swellchain)
- **Standard Bridge**: 0x4200000000000000000000000000000000000010 (Swellchain)

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Increase gas limit in foundry.toml
2. **RPC Errors**: Verify network connectivity and RPC URL
3. **Verification Failures**: Check constructor arguments and contract source

### Gas Optimization

- Use `via_ir = true` for complex contracts
- Optimize constructor parameters
- Consider proxy patterns for large contracts

## Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Testnet First**: Always test on testnet before mainnet deployment
- **Contract Verification**: Verify all contracts on block explorer
- **Role Management**: Use multi-sig for admin roles in production

## Support

For deployment issues:
- Check the [Foundry documentation](https://book.getfoundry.sh/)
- Review [Swellchain docs](https://build.swellnetwork.io)
- Join the Swell Discord for community support 