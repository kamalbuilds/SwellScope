---
icon: bullseye-arrow
---

# Quick Start Guide

Welcome to SwellScope! This guide will help you get up and running with SwellScope in minutes. By the end of this guide, you'll have a local development environment set up and understand the basic concepts.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (optional, for full stack) - [Download here](https://docker.com/)
- **Foundry** (for smart contracts) - [Install guide](https://book.getfoundry.sh/getting-started/installation)

## Step 1: Clone the Repository

```bash
git clone https://github.com/kamalbuilds/swell-scope.git
cd swell-scope
```

## Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install contract dependencies
cd contracts && npm install && cd ..
```

## Step 3: Environment Setup

Create environment files for each component:

```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### Configure Environment Variables

Edit the `.env` files with your configuration:

```bash
# Root .env
SWELLCHAIN_RPC_URL=https://swell-testnet.alt.technology
ETHEREUM_RPC_URL=https://eth.llamarpc.com
PRIVATE_KEY=your_private_key_here

# Frontend .env.local
NEXT_PUBLIC_SWELLCHAIN_RPC=https://swell-testnet.alt.technology
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Backend .env
DATABASE_URL=postgresql://user:pass@localhost:5432/swellscope
REDIS_URL=redis://localhost:6379
```

## Step 4: Start the Development Environment

### Option A: Full Stack with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# This starts:
# - PostgreSQL database
# - Redis cache
# - Backend API server
# - Frontend Next.js app
```

### Option B: Manual Setup

```bash
# Terminal 1: Start database and cache
docker-compose up -d postgres redis

# Terminal 2: Start backend
cd backend && npm run dev

# Terminal 3: Start frontend
cd frontend && npm run dev

# Terminal 4: Smart contract development
cd contracts && forge build
```

## Step 5: Deploy Smart Contracts (Testnet)

```bash
cd contracts

# Compile contracts
forge build

# Run tests
forge test -vv

# Deploy to Swellchain testnet
forge script script/Deploy.s.sol \
  --rpc-url https://swell-testnet.alt.technology \
  --broadcast \
  --verify
```

## Step 6: Access the Application

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database Admin**: http://localhost:5432 (if using pgAdmin)

## Basic Usage

### 1. Connect Your Wallet

1. Open the frontend at http://localhost:3000
2. Click "Connect Wallet"
3. Select your preferred wallet (MetaMask recommended)
4. Switch to Swellchain testnet

### 2. View Analytics Dashboard

The main dashboard provides:
- **Portfolio Overview**: Your restaking positions across protocols
- **Risk Assessment**: Real-time risk scores for your assets
- **Yield Tracking**: Historical and projected yields
- **AVS Performance**: MACH, VITAL, and SQUAD service metrics

### 3. Set Up Risk Monitoring

```javascript
// Example: Set up risk alerts
const riskProfile = {
  maxRiskScore: 75, // Maximum acceptable risk (0-100)
  autoRebalance: true, // Enable automatic rebalancing
  emergencyExitThreshold: 90 // Trigger emergency exit at 90% risk
};

await swellScope.updateRiskProfile(riskProfile);
```

### 4. Deploy Your First Strategy

```javascript
// Example: Create a conservative restaking strategy
const strategy = {
  name: "Conservative Restaking",
  allocation: {
    swETH: 60,    // 60% in swETH
    rswETH: 30,   // 30% in rswETH
    cash: 10      // 10% cash buffer
  },
  riskTolerance: "low",
  rebalanceFrequency: "weekly"
};

await swellScope.createStrategy(strategy);
```

## Next Steps

Now that you have SwellScope running locally, explore these areas:

### Learn the Architecture
- [System Architecture](../architecture/overview.md) - Understand how SwellScope works
- [Smart Contracts](../contracts/overview.md) - Deep dive into our contract system
- [Risk Framework](../architecture/risk-framework.md) - Learn about our risk models

### Integrate with APIs
- [REST API](../api/rest-api.md) - HTTP API for analytics and management
- [WebSocket API](../api/websocket.md) - Real-time data streaming
- [SDK Documentation](../api/sdk.md) - JavaScript/TypeScript SDK

### Deploy to Production
- [Smart Contract Deployment](../deployment/contracts.md) - Deploy to mainnet
- [Infrastructure Setup](../deployment/infrastructure.md) - Production infrastructure
- [Security Considerations](../security/overview.md) - Security best practices

## Common Issues & Solutions

### Issue: "Network not supported"
**Solution**: Ensure you're connected to Swellchain testnet (Chain ID: 1924)
```bash
# Add Swellchain testnet to MetaMask
Network Name: Swellchain Testnet
RPC URL: https://swell-testnet.alt.technology
Chain ID: 1924
Currency Symbol: ETH
Block Explorer: https://explorer.swellnetwork.io
```

### Issue: "Insufficient funds for gas"
**Solution**: Get testnet ETH from the faucet
- Visit: https://faucet.swellnetwork.io
- Connect your wallet and request testnet ETH

### Issue: Contract deployment fails
**Solution**: Check your private key and RPC configuration
```bash
# Verify your setup
forge script script/Deploy.s.sol --rpc-url $SWELLCHAIN_RPC_URL
```

### Issue: Frontend won't connect to backend
**Solution**: Check backend is running and CORS is configured
```bash
# Check backend status
curl http://localhost:8000/health

# Check CORS configuration in backend/.env
CORS_ORIGIN=http://localhost:3000
```

## Getting Help

If you encounter issues:

1. **Check the logs**: Each service logs to console with detailed error messages
2. **Review documentation**: Most issues are covered in our detailed guides
3. **Join our Discord**: [https://discord.gg/swellscope](https://discord.gg/swellscope)
4. **Open an issue**: [GitHub Issues](https://github.com/kamalbuilds/swell-scope/issues)

## What's Next?

- **Explore Analytics**: Learn about our [risk assessment models](../analytics/risk-models.md)
- **Build Integrations**: Check out our [integration guides](../integrations/swellchain.md)
- **Contribute**: See our [contributing guide](../development/contributing.md)
- **Deploy to Mainnet**: Follow our [production deployment guide](../deployment/production.md)

---

**Congratulations!** 🎉 You now have SwellScope running locally. Start exploring the platform and building amazing restaking applications!
