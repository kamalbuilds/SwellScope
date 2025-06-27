# First Steps with SwellScope

Congratulations on setting up SwellScope! This guide will walk you through your first interactions with the platform, from initial configuration to making your first restaking deposit.

## Overview

In this guide, you'll learn to:
- Configure your development environment for Swellchain
- Deploy smart contracts to testnet
- Connect to the SwellScope dashboard
- Make your first restaking deposit
- Monitor your portfolio performance

## Step 1: Environment Verification

### 1.1 Verify Installation

First, ensure all components are properly installed:

```bash
# Check Node.js version
node --version
# Expected: v18.0.0 or higher

# Check npm version
npm --version
# Expected: 8.0.0 or higher

# Check Foundry installation
forge --version
# Expected: forge 0.2.0 or higher

# Check Docker
docker --version
# Expected: Docker version 24.0.0 or higher
```

### 1.2 Verify SwellScope Installation

```bash
# Navigate to SwellScope directory
cd swell-scope

# Check project structure
ls -la
# Expected directories: backend/ contracts/ frontend/ docs/

# Verify dependencies
npm list --depth=0
```

### 1.3 Start Development Services

```bash
# Start database and cache services
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
# Expected: postgres and redis containers running

# Check service health
curl http://localhost:5432 || echo "PostgreSQL ready"
redis-cli ping || echo "Redis ready"
```

## Step 2: Smart Contract Setup

### 2.1 Configure Swellchain Network

Create a wallet configuration for Swellchain testnet:

```bash
# Create a new wallet for testnet (development only)
cast wallet new testnet-wallet

# Save the private key and address
# ⚠️  NEVER use this for mainnet or real funds
```

Add Swellchain testnet to your environment:

```bash
# Edit contracts/.env
cat >> contracts/.env << EOF
PRIVATE_KEY=0x...your_testnet_private_key
SWELLCHAIN_TESTNET_RPC=https://swell-testnet.alt.technology
DEPLOYER_ADDRESS=0x...your_testnet_address
EOF
```

### 2.2 Get Testnet ETH

```bash
# Check your testnet balance
cast balance $DEPLOYER_ADDRESS --rpc-url https://swell-testnet.alt.technology

# Get testnet ETH from faucet
echo "Visit https://faucet.swellnetwork.io"
echo "Connect wallet with address: $DEPLOYER_ADDRESS"
echo "Request testnet ETH"
```

### 2.3 Deploy Smart Contracts

```bash
cd contracts

# Compile contracts
forge build
# Expected: Compilation successful

# Run tests
forge test -vv
# Expected: All tests pass

# Deploy to Swellchain testnet
forge script script/Deploy.s.sol \
  --rpc-url https://swell-testnet.alt.technology \
  --broadcast \
  --verify \
  --legacy

# Save deployment addresses
echo "Deployment completed!"
echo "Check broadcast/ directory for contract addresses"
```

### 2.4 Record Contract Addresses

```bash
# Extract deployed addresses
VAULT_ADDRESS=$(jq -r '.receipts[0].contractAddress' broadcast/Deploy.s.sol/1924/run-latest.json)
ORACLE_ADDRESS=$(jq -r '.receipts[1].contractAddress' broadcast/Deploy.s.sol/1924/run-latest.json)
INTEGRATION_ADDRESS=$(jq -r '.receipts[2].contractAddress' broadcast/Deploy.s.sol/1924/run-latest.json)

echo "SwellScopeVault: $VAULT_ADDRESS"
echo "RiskOracle: $ORACLE_ADDRESS"
echo "SwellChainIntegration: $INTEGRATION_ADDRESS"

# Update frontend environment
cat >> ../frontend/.env.local << EOF
NEXT_PUBLIC_VAULT_ADDRESS=$VAULT_ADDRESS
NEXT_PUBLIC_RISK_ORACLE_ADDRESS=$ORACLE_ADDRESS
NEXT_PUBLIC_INTEGRATION_ADDRESS=$INTEGRATION_ADDRESS
EOF
```

## Step 3: Backend Configuration

### 3.1 Configure Database

```bash
cd ../backend

# Run database migrations
npx prisma migrate dev --name init
# Expected: Migration successful

# Generate Prisma client
npx prisma generate

# Seed initial data
npx prisma db seed
# Expected: Seed data created
```

### 3.2 Update Backend Configuration

```bash
# Add contract addresses to backend config
cat >> .env << EOF
# Contract Addresses
VAULT_ADDRESS=$VAULT_ADDRESS
RISK_ORACLE_ADDRESS=$ORACLE_ADDRESS
INTEGRATION_ADDRESS=$INTEGRATION_ADDRESS

# Swellchain Configuration
SWELLCHAIN_CHAIN_ID=1924
SWELLCHAIN_RPC_URL=https://swell-testnet.alt.technology
EOF
```

### 3.3 Start Backend Services

```bash
# Start backend in development mode
npm run dev

# In another terminal, verify backend is running
curl http://localhost:8000/health
# Expected: {"status":"ok","timestamp":"..."}

# Test contract integration
curl http://localhost:8000/api/v1/contracts/status
# Expected: Contract status information
```

## Step 4: Frontend Setup

### 4.1 Configure Frontend

```bash
cd ../frontend

# Install additional dependencies if needed
npm install

# Update configuration with deployed contracts
cat >> .env.local << EOF
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=1924
NEXT_PUBLIC_CHAIN_NAME="Swellchain Testnet"

# Feature Flags
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_RISK_MANAGEMENT=true
EOF
```

### 4.2 Start Frontend

```bash
# Start Next.js development server
npm run dev

# Verify frontend is accessible
curl http://localhost:3000
# Expected: HTML response with SwellScope content

echo "Frontend available at: http://localhost:3000"
```

## Step 5: Connect Your Wallet

### 5.1 Configure MetaMask

Add Swellchain testnet to MetaMask:

1. Open MetaMask
2. Click Networks dropdown
3. Click "Add Network"
4. Enter these details:

```
Network Name: Swellchain Testnet
New RPC URL: https://swell-testnet.alt.technology
Chain ID: 1924
Currency Symbol: ETH
Block Explorer URL: https://explorer.swellnetwork.io
```

### 5.2 Import Test Account

```bash
# Import your testnet account to MetaMask
echo "Private Key: $PRIVATE_KEY"
echo "⚠️  Only use this for testnet development"
```

1. Click MetaMask account menu
2. Select "Import Account"
3. Paste the private key
4. Click "Import"

### 5.3 Connect to SwellScope

1. Visit http://localhost:3000
2. Click "Connect Wallet"
3. Select MetaMask
4. Approve connection request
5. Sign authentication message

Expected result: Dashboard loads with your wallet connected.

## Step 6: First Interaction

### 6.1 Check Contract Integration

In the SwellScope dashboard:

1. Navigate to "Contracts" section
2. Verify all contracts show "Connected" status
3. Check contract addresses match deployment

### 6.2 Get Test Tokens

For testing purposes, get some swETH on testnet:

```bash
# Check if testnet swETH faucet is available
curl -X POST https://api-testnet.swellnetwork.io/faucet \
  -H "Content-Type: application/json" \
  -d '{"address":"'$DEPLOYER_ADDRESS'","amount":"1000000000000000000"}'

# Or interact with swETH contract directly
cast send 0x...swETH_testnet_address \
  "mint(address,uint256)" \
  $DEPLOYER_ADDRESS \
  1000000000000000000 \
  --rpc-url https://swell-testnet.alt.technology \
  --private-key $PRIVATE_KEY
```

### 6.3 Make Your First Deposit

1. In SwellScope dashboard, click "Deposit"
2. Select "ETH" as the asset
3. Enter amount: "0.1" (0.1 ETH)
4. Review transaction details
5. Click "Deposit" and confirm in MetaMask

Expected result: Transaction successful, shares received in your portfolio.

### 6.4 Verify Transaction

```bash
# Check transaction on block explorer
echo "Visit: https://explorer.swellnetwork.io/tx/$TRANSACTION_HASH"

# Check vault balance
cast call $VAULT_ADDRESS \
  "balanceOf(address)(uint256)" \
  $DEPLOYER_ADDRESS \
  --rpc-url https://swell-testnet.alt.technology

# Check total assets in vault
cast call $VAULT_ADDRESS \
  "totalAssets()(uint256)" \
  --rpc-url https://swell-testnet.alt.technology
```

## Step 7: Explore Core Features

### 7.1 Portfolio Dashboard

Explore your portfolio dashboard:
- **Total Value**: View your total portfolio value
- **Asset Allocation**: See how assets are distributed
- **Performance**: Check 24h, 7d returns
- **Risk Score**: Monitor your portfolio risk level

### 7.2 Risk Management

Set up risk management:
1. Go to "Settings" → "Risk Profile"
2. Set maximum risk tolerance: 75
3. Enable auto-rebalancing: Yes
4. Set emergency exit threshold: 90
5. Save settings

### 7.3 Create Your First Strategy

1. Click "Create Strategy"
2. Name: "Test Strategy"
3. Allocation:
   - 70% swETH
   - 20% rswETH 
   - 10% cash
4. Risk tolerance: Medium
5. Auto-rebalance: Weekly
6. Create strategy

### 7.4 Monitor Real-Time Data

Check real-time monitoring:
- Portfolio value updates
- Risk score changes
- Yield generation
- Market conditions

## Step 8: Test Advanced Features

### 8.1 Risk Assessment

Test risk assessment functionality:

```bash
# Get current risk score via API
curl http://localhost:8000/api/v1/analytics/risk/$VAULT_ADDRESS

# Expected response:
# {
#   "success": true,
#   "data": {
#     "riskScore": 35,
#     "riskLevel": "Medium",
#     "components": {...}
#   }
# }
```

### 8.2 AVS Monitoring

Check AVS service integration:

1. Navigate to "AVS Performance"
2. View MACH AVS metrics
3. Check service status
4. Monitor performance scores

### 8.3 Cross-Chain Monitoring

Test cross-chain functionality:

1. Go to "Cross-Chain" view
2. Add an Ethereum address to monitor
3. View positions across both networks
4. Check bridge operation status

## Step 9: API Integration

### 9.1 Generate API Key

1. Go to "Settings" → "API Keys"
2. Click "Generate New Key"
3. Set permissions: Read/Write
4. Save the API key securely

### 9.2 Test API Access

```bash
# Set API key
export API_KEY="your_generated_api_key"

# Test portfolio endpoint
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8000/api/v1/analytics/portfolio/$DEPLOYER_ADDRESS

# Test risk assessment
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:8000/api/v1/analytics/risk/$VAULT_ADDRESS
```

### 9.3 WebSocket Connection

Test real-time data streaming:

```javascript
// In browser console or Node.js
const ws = new WebSocket('ws://localhost:8000');

ws.onopen = () => {
  console.log('Connected to SwellScope WebSocket');
  
  // Subscribe to portfolio updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'portfolio',
    address: 'YOUR_ADDRESS'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

## Step 10: Testing and Validation

### 10.1 Run Comprehensive Tests

```bash
# Test smart contracts
cd contracts
forge test -vv --gas-report

# Test backend
cd ../backend
npm test

# Test frontend components
cd ../frontend
npm run test
```

### 10.2 Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: http://localhost:8000
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/v1/analytics/portfolio/$DEPLOYER_ADDRESS"
          headers:
            Authorization: "Bearer $API_KEY"
EOF

# Run load test
artillery run load-test.yml
```

### 10.3 Security Validation

```bash
# Check for common security issues
cd contracts
slither src/ || echo "Install slither for security analysis"

# Check for exposed secrets
cd ..
git secrets --scan || echo "Install git-secrets for secret scanning"

# Validate HTTPS redirects
curl -I http://localhost:3000
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Reset database
cd backend && npx prisma migrate reset
```

#### Issue: "Contract deployment failed"
```bash
# Check network connection
cast chain-id --rpc-url https://swell-testnet.alt.technology

# Check account balance
cast balance $DEPLOYER_ADDRESS --rpc-url https://swell-testnet.alt.technology

# Retry deployment with higher gas
forge script script/Deploy.s.sol \
  --rpc-url https://swell-testnet.alt.technology \
  --broadcast \
  --gas-limit 3000000
```

#### Issue: "Frontend not loading"
```bash
# Check backend connection
curl http://localhost:8000/health

# Check environment variables
cat frontend/.env.local

# Clear Next.js cache
cd frontend && rm -rf .next && npm run dev
```

#### Issue: "Wallet connection failed"
```bash
# Verify network configuration in MetaMask
# Chain ID should be 1924
# RPC URL should be https://swell-testnet.alt.technology

# Clear MetaMask cache
# Settings → Advanced → Reset Account
```

## Next Steps

Congratulations! You've successfully:
✅ Set up your development environment
✅ Deployed smart contracts to Swellchain testnet
✅ Connected your wallet
✅ Made your first deposit
✅ Explored core features

### What's Next?

1. **Explore Advanced Features**: [User Guide](../user-guides/platform-overview.md)
2. **Learn Risk Management**: [Risk Assessment](../user-guides/risk-assessment.md)
3. **Build Integrations**: [API Documentation](../api/overview.md)
4. **Deploy to Mainnet**: [Production Deployment](../deployment/production.md)
5. **Join the Community**: [Discord](https://discord.gg/swellscope)

### Continue Learning

- **Architecture Deep Dive**: [System Architecture](../architecture/overview.md)
- **Smart Contract Details**: [Contract Overview](../contracts/overview.md)
- **Integration Guides**: [Swellchain Integration](../integrations/swellchain.md)
- **Development Workflow**: [Contributing Guide](../development/contributing.md)

## Getting Help

If you encounter any issues:

1. **Check Documentation**: Search these docs for solutions
2. **Review Logs**: Check console output for error details
3. **GitHub Issues**: Report bugs or ask questions
4. **Discord Community**: Get help from other developers
5. **Email Support**: Contact support@swellscope.io

## Feedback

We'd love to hear about your first experience with SwellScope:

- **Was this guide helpful?**
- **What could be improved?**
- **Did you encounter any issues?**

Share your feedback on [Discord](https://discord.gg/swellscope) or [GitHub](https://github.com/kamalbuilds/swell-scope/issues).

---

**Congratulations on completing your first steps with SwellScope!** 🎉

You're now ready to build amazing restaking applications on Swellchain. 