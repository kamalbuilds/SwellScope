# Development Setup

## Overview

This guide provides comprehensive instructions for setting up a complete SwellScope development environment. SwellScope is built as a production-ready restaking analytics platform for Swellchain, requiring careful setup of smart contracts, backend services, and frontend components.

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **pnpm**: 8.x or higher (preferred package manager)
- **Python**: 3.9+ (for some development tools)
- **Git**: Latest version
- **Docker**: Latest version (for local blockchain nodes)

### Development Tools

```bash
# Install Foundry for smart contract development
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install pnpm globally
npm install -g pnpm

# Verify installations
node --version    # Should be 18.x+
pnpm --version    # Should be 8.x+
forge --version   # Foundry installation
```

### Required Accounts & Access

- **GitHub Account**: For repository access
- **Ethereum Wallet**: For testnet deployments
- **Alchemy/Infura**: For RPC endpoints
- **Swellchain Testnet**: ETH for gas fees

## Repository Setup

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/swell-scope.git
cd swell-scope

# Install all dependencies
pnpm install

# Install foundry dependencies
cd contracts
forge install
cd ..
```

### Environment Configuration

Create environment files for each component:

#### Root Environment (`.env`)

```bash
# Network Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
SWELLCHAIN_RPC_URL=https://swell-mainnet.alt.technology
SWELLCHAIN_TESTNET_RPC_URL=https://swell-testnet.alt.technology

# Development
NODE_ENV=development
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/swellscope_dev
REDIS_URL=redis://localhost:6379

# External APIs
COINGECKO_API_KEY=your_coingecko_key
DEFILLAMA_API_KEY=your_defillama_key
```

#### Frontend Environment (`frontend/.env.local`)

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME=SwellScope
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# Blockchain Configuration
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
NEXT_PUBLIC_SWELLCHAIN_RPC_URL=https://swell-mainnet.alt.technology
NEXT_PUBLIC_SWELLCHAIN_TESTNET_RPC_URL=https://swell-testnet.alt.technology

# Contract Addresses (Development)
NEXT_PUBLIC_SWELLSCOPE_VAULT_ADDRESS=0x...
NEXT_PUBLIC_RISK_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_SWELLCHAIN_INTEGRATION_ADDRESS=0x...

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

#### Backend Environment (`backend/.env`)

```bash
# Server Configuration
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/swellscope_dev
REDIS_URL=redis://localhost:6379

# Blockchain
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
SWELLCHAIN_RPC_URL=https://swell-mainnet.alt.technology
SWELLCHAIN_TESTNET_RPC_URL=https://swell-testnet.alt.technology

# Private Keys (Development only)
DEPLOYER_PRIVATE_KEY=0x...your_development_private_key
ORACLE_PRIVATE_KEY=0x...your_oracle_private_key

# External Services
COINGECKO_API_KEY=your_coingecko_key
DEFILLAMA_API_KEY=your_defillama_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h

# Monitoring
SENTRY_DSN=your_sentry_dsn (optional)
```

#### Smart Contracts Environment (`contracts/.env`)

```bash
# Network RPCs
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
SWELLCHAIN_RPC_URL=https://swell-mainnet.alt.technology
SWELLCHAIN_TESTNET_RPC_URL=https://swell-testnet.alt.technology

# Deployment Configuration
DEPLOYER_PRIVATE_KEY=0x...your_deployer_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Addresses (Swellchain)
SWETH_ADDRESS=0x...sweth_contract_address
RSWETH_ADDRESS=0x...rsweth_contract_address
STANDARD_BRIDGE_ADDRESS=0x...bridge_contract_address
MACH_SERVICE_MANAGER_ADDRESS=0x...mach_avs_address

# Verification
VERIFY_CONTRACTS=true
```

## Development Environment Setup

### Database Setup

#### PostgreSQL Installation

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start

# Create development database
createdb swellscope_dev
```

#### Redis Installation

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo service redis-server start
```

#### Database Migration

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Smart Contract Development

#### Foundry Setup

```bash
cd contracts

# Install dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test

# Run tests with verbosity
forge test -vvv

# Run specific test
forge test --match-test testVaultDeposit -vvv
```

#### Local Blockchain

```bash
# Start local Ethereum node (Anvil)
anvil --port 8545 --chain-id 31337

# In another terminal, deploy contracts
cd contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

#### Contract Verification Setup

```bash
# Install contract verification tools
forge install foundry-rs/forge-std

# Set up verification API keys in .env
ETHERSCAN_API_KEY=your_etherscan_key
```

### Backend Development

#### Service Setup

```bash
cd backend

# Install dependencies
pnpm install

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
pnpm dev

# Run in watch mode
pnpm dev:watch
```

#### Background Services

```bash
# Start Redis
redis-server

# Start worker processes
pnpm worker:dev

# Start scheduler
pnpm scheduler:dev
```

### Frontend Development

#### Next.js Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
open http://localhost:3000
```

#### Build and Test

```bash
# Build for production
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push branch
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Testing Strategy

#### Smart Contract Testing

```bash
cd contracts

# Run all tests
forge test

# Run tests with coverage
forge coverage

# Run gas reports
forge test --gas-report

# Run specific test file
forge test test/SwellScopeVault.t.sol -vvv
```

#### Backend Testing

```bash
cd backend

# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/services/risk-assessment.test.ts
```

#### Frontend Testing

```bash
cd frontend

# Run component tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage

# Run visual regression tests
pnpm test:visual
```

### Code Quality

#### Pre-commit Hooks

```bash
# Install husky
pnpm add -D husky

# Set up pre-commit hooks
npx husky add .husky/pre-commit "pnpm lint-staged"
```

#### Linting and Formatting

```bash
# Lint all code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm type-check
```

## Development Scripts

### Package.json Scripts

#### Root Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:contracts\" \"pnpm dev:backend\" \"pnpm dev:frontend\"",
    "dev:contracts": "cd contracts && forge build --watch",
    "dev:backend": "cd backend && pnpm dev",
    "dev:frontend": "cd frontend && pnpm dev",
    "build": "pnpm build:contracts && pnpm build:backend && pnpm build:frontend",
    "test": "pnpm test:contracts && pnpm test:backend && pnpm test:frontend",
    "deploy": "cd contracts && forge script script/Deploy.s.sol --broadcast",
    "setup": "pnpm install && pnpm setup:db && pnpm setup:contracts",
    "setup:db": "cd backend && npx prisma migrate dev && npx prisma generate",
    "setup:contracts": "cd contracts && forge install && forge build"
  }
}
```

### Development Shortcuts

```bash
# Full development setup from scratch
pnpm setup

# Start all development servers
pnpm dev

# Run all tests
pnpm test

# Build everything
pnpm build

# Deploy contracts to testnet
pnpm deploy
```

## IDE Configuration

### VS Code Setup

#### Required Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "juanblanco.solidity",
    "ms-vscode.vscode-json"
  ]
}
```

#### Settings Configuration

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "solidity.compileUsingRemoteVersion": "v0.8.21",
  "solidity.formatter": "prettier"
}
```

### Workspace Configuration

```json
{
  "folders": [
    {
      "name": "Root",
      "path": "."
    },
    {
      "name": "Contracts",
      "path": "./contracts"
    },
    {
      "name": "Backend",
      "path": "./backend"
    },
    {
      "name": "Frontend",
      "path": "./frontend"
    }
  ]
}
```

## Debugging Setup

### Smart Contract Debugging

```bash
# Debug failed transaction
forge debug --debug <tx_hash>

# Debug test
forge test --debug test_function_name

# Trace transaction
forge run --debug <tx_hash>
```

### Backend Debugging

```bash
# Debug with Node.js inspector
node --inspect-brk backend/dist/index.js

# Debug with VS Code
# Add launch configuration in .vscode/launch.json
```

### Frontend Debugging

```bash
# Debug with React DevTools
# Install React DevTools browser extension

# Debug with Next.js
pnpm dev
# Open http://localhost:3000 with browser DevTools
```

## Performance Optimization

### Development Performance

```bash
# Use faster TypeScript compiler
pnpm add -D typescript@beta

# Enable SWC for faster builds
# Configure in next.config.js: swcMinify: true

# Use esbuild for faster bundling
pnpm add -D esbuild
```

### Smart Contract Optimization

```bash
# Optimize contract compilation
forge build --optimize

# Set optimizer runs in foundry.toml
[profile.default]
optimizer = true
optimizer_runs = 200
```

## Troubleshooting

### Common Issues

#### Node Version Conflicts

```bash
# Use nvm to manage Node versions
nvm install 18
nvm use 18
```

#### Port Conflicts

```bash
# Check what's using port 3000
lsof -ti:3000

# Kill process using port
kill -9 $(lsof -ti:3000)
```

#### Database Connection Issues

```bash
# Reset database
dropdb swellscope_dev
createdb swellscope_dev
cd backend && npx prisma migrate dev
```

#### Contract Compilation Errors

```bash
# Clean and rebuild
forge clean
forge build

# Update dependencies
forge update
```

### Debug Commands

```bash
# Check environment variables
printenv | grep SWELLCHAIN

# Test database connection
cd backend && npx prisma db push --preview-feature

# Test RPC connections
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $SWELLCHAIN_RPC_URL
```

## Advanced Development

### Custom Scripts

Create custom development scripts in `scripts/` directory:

```bash
#!/bin/bash
# scripts/reset-dev-env.sh

echo "Resetting development environment..."

# Reset database
dropdb swellscope_dev 2>/dev/null || true
createdb swellscope_dev

# Reset Redis
redis-cli FLUSHALL

# Rebuild contracts
cd contracts && forge clean && forge build

# Reset backend
cd backend && npx prisma migrate dev --name reset

echo "Development environment reset complete!"
```

### Docker Development

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: swellscope_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Testing Networks

#### Swellchain Testnet Setup

```bash
# Add Swellchain Testnet to MetaMask
# Network Name: Swellchain Testnet
# RPC URL: https://swell-testnet.alt.technology
# Chain ID: 1924
# Currency Symbol: ETH
# Block Explorer: https://swell-testnet-explorer.alt.technology

# Get testnet ETH
# Visit Swellchain testnet faucet
```

### Monitoring Setup

```bash
# Install monitoring tools
pnpm add -D @prometheus/client
pnpm add -D grafana

# Set up metrics collection
# Configure in backend/src/monitoring/
```

This comprehensive development setup guide provides everything needed to start developing with SwellScope, from initial environment setup to advanced debugging and monitoring configurations. 