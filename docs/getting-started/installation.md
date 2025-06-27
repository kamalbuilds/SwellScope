# Installation Guide

This guide provides detailed instructions for setting up SwellScope development environment across different operating systems and deployment scenarios.

## System Requirements

### Minimum Requirements
- **OS**: macOS 10.15+, Ubuntu 20.04+, Windows 10+ (with WSL2)
- **Node.js**: v18.0+ (LTS recommended)
- **Memory**: 8GB RAM
- **Storage**: 20GB free space
- **Network**: Stable internet connection for blockchain interactions

### Recommended Requirements
- **OS**: macOS 12+, Ubuntu 22.04+
- **Node.js**: v20.0+ (Latest LTS)
- **Memory**: 16GB RAM
- **Storage**: 50GB free space (SSD preferred)
- **Network**: High-speed internet for real-time data streaming

## Prerequisites Installation

### 1. Node.js and npm

#### macOS (using Homebrew)
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20
```

#### Ubuntu/Debian
```bash
# Update package index
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Windows (using Chocolatey)
```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs
```

### 2. Git
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt install git

# Windows
choco install git
```

### 3. Docker and Docker Compose

#### macOS
```bash
# Install Docker Desktop for Mac
brew install --cask docker
```

#### Ubuntu
```bash
# Install Docker
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Windows
```powershell
# Install Docker Desktop for Windows
choco install docker-desktop
```

### 4. Foundry (for Smart Contract Development)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Restart terminal or run:
source ~/.bashrc

# Install foundry tools
foundryup

# Verify installation
forge --version
cast --version
anvil --version
```

## SwellScope Installation

### 1. Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/kamalbuilds/swell-scope.git
cd swell-scope

# Verify repository structure
ls -la
# Expected: backend/ contracts/ frontend/ docs/ ...
```

### 2. Install Dependencies

#### Root Dependencies
```bash
# Install root level dependencies
npm install

# This installs workspace management tools and shared dependencies
```

#### Frontend Dependencies
```bash
cd frontend
npm install

# Install specific packages for Next.js app
npm install @wagmi/core @wagmi/connectors viem
npm install @tanstack/react-query zustand
npm install recharts @radix-ui/react-* class-variance-authority
npm install lucide-react tailwindcss-animate

cd ..
```

#### Backend Dependencies
```bash
cd backend
npm install

# Install Express.js and related packages
npm install express cors helmet morgan
npm install prisma @prisma/client
npm install ioredis bull
npm install ethers

# Install development dependencies
npm install -D typescript @types/node @types/express
npm install -D nodemon ts-node jest supertest

cd ..
```

#### Smart Contract Dependencies
```bash
cd contracts

# Foundry handles dependencies automatically, but we can install them manually
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts

# Build contracts to verify setup
forge build

cd ..
```

## Environment Configuration

### 1. Create Environment Files

```bash
# Copy template files
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 2. Configure Root Environment

Edit `.env`:
```bash
# Network Configuration
SWELLCHAIN_RPC_URL=https://swell-mainnet.alt.technology
SWELLCHAIN_TESTNET_RPC_URL=https://swell-testnet.alt.technology
ETHEREUM_RPC_URL=https://eth.llamarpc.com

# Private Keys (use test keys for development)
PRIVATE_KEY=0x...your_private_key_here

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
SWELLCHAIN_ETHERSCAN_API_KEY=your_swellchain_api_key

# Database
DATABASE_URL=postgresql://swellscope:password@localhost:5432/swellscope_dev
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

### 3. Configure Frontend Environment

Edit `frontend/.env.local`:
```bash
# Public environment variables (safe for client-side)
NEXT_PUBLIC_SWELLCHAIN_RPC=https://swell-mainnet.alt.technology
NEXT_PUBLIC_SWELLCHAIN_TESTNET_RPC=https://swell-testnet.alt.technology
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Contract Addresses (will be populated after deployment)
NEXT_PUBLIC_VAULT_ADDRESS=
NEXT_PUBLIC_RISK_ORACLE_ADDRESS=
NEXT_PUBLIC_INTEGRATION_ADDRESS=
```

### 4. Configure Backend Environment

Edit `backend/.env`:
```bash
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://swellscope:password@localhost:5432/swellscope_dev
DATABASE_POOL_SIZE=10

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600

# Blockchain Configuration
SWELLCHAIN_RPC_URL=https://swell-mainnet.alt.technology
ETHEREUM_RPC_URL=https://eth.llamarpc.com
PRIVATE_KEY=0x...your_private_key_here

# External APIs
COINGECKO_API_KEY=your_coingecko_api_key
SWELLCHAIN_API_KEY=your_swellchain_api_key

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## Database Setup

### 1. Start PostgreSQL

#### Using Docker (Recommended)
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready
docker-compose logs postgres
docker-compose logs redis
```

#### Local Installation
```bash
# macOS
brew install postgresql redis
brew services start postgresql redis

# Ubuntu
sudo apt install postgresql redis-server
sudo systemctl start postgresql redis-server

# Create database
createdb swellscope_dev
```

### 2. Run Database Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with initial data
npx prisma db seed

cd ..
```

## Development Server Setup

### 1. Start All Services

#### Option A: Using Docker Compose (Recommended)
```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# This starts:
# - PostgreSQL database
# - Redis cache
# - Backend API server
# - Frontend Next.js app
# - All configured with hot reload
```

#### Option B: Manual Setup
```bash
# Terminal 1: Start database and cache
docker-compose up -d postgres redis

# Terminal 2: Start backend
cd backend && npm run dev

# Terminal 3: Start frontend
cd frontend && npm run dev

# Terminal 4: Contract development (optional)
cd contracts && forge test --watch
```

### 2. Verify Installation

#### Check Services
```bash
# Check backend API
curl http://localhost:8000/health
# Expected: {"status":"ok","timestamp":"..."}

# Check frontend
curl http://localhost:3000
# Expected: HTML response

# Check database connection
cd backend && npx prisma studio
# Opens Prisma Studio in browser
```

#### Check Smart Contracts
```bash
cd contracts

# Compile contracts
forge build

# Run tests
forge test -vv

# Expected output:
# [PASS] testBasicVaultOperations() (gas: 105703)
# [PASS] testRiskOracleDeployment() (gas: 21133)
# [PASS] testSwellChainIntegrationDeployment() (gas: 13364)
# [PASS] testVaultDeployment() (gas: 33847)
```

## IDE Setup

### Visual Studio Code (Recommended)

#### Install Extensions
```bash
# Install VS Code extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension JuanBlanco.solidity
code --install-extension ms-vscode.vscode-docker
```

#### Configure Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "solidity.defaultCompiler": "localNodeModule",
  "solidity.compileUsingRemoteVersion": "v0.8.21",
  "files.exclude": {
    "**/node_modules": true,
    "**/out": true,
    "**/cache": true
  }
}
```

## Troubleshooting Common Issues

### Node.js Issues

#### "npm ERR! peer dep missing"
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### "Module not found"
```bash
# Ensure you're using the correct Node.js version
node --version
# Should be 18.0+ or 20.0+

# Install missing dependencies
npm install
```

### Docker Issues

#### "Cannot connect to Docker daemon"
```bash
# Start Docker service
# macOS: Start Docker Desktop
# Linux:
sudo systemctl start docker

# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

#### "Port already in use"
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Or use different ports in .env files
```

### Foundry Issues

#### "forge: command not found"
```bash
# Reinstall Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Add to PATH
echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### "Compilation failed"
```bash
# Update Foundry
foundryup

# Clean and rebuild
forge clean
forge build
```

### Database Issues

#### "Connection refused"
```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Or for local installation
sudo systemctl status postgresql

# Reset database
docker-compose down
docker-compose up -d postgres
cd backend && npx prisma migrate reset
```

#### "Migration failed"
```bash
# Reset database schema
cd backend
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

## Performance Optimization

### Development Mode Optimizations

```bash
# Use faster package manager
npm install -g pnpm

# Replace npm commands with pnpm
pnpm install
pnpm run dev

# Or use yarn
npm install -g yarn
yarn install
yarn dev
```

### Memory Optimization

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"

# Add to .bashrc or .zshrc for persistence
echo 'export NODE_OPTIONS="--max-old-space-size=8192"' >> ~/.bashrc
```

## Next Steps

After successful installation:

1. **Read the Quick Start Guide**: [Quick Start](quickstart.md)
2. **Complete First Steps**: [First Steps](first-steps.md)
3. **Explore the Architecture**: [System Overview](../architecture/overview.md)
4. **Deploy Smart Contracts**: [Contract Deployment](../deployment/contracts.md)
5. **Join the Community**: [Discord](https://discord.gg/swellscope)

## Getting Help

If you encounter issues during installation:

1. **Check Logs**: Review terminal output for specific error messages
2. **Search Documentation**: Use the search function in these docs
3. **GitHub Issues**: Check [existing issues](https://github.com/kamalbuilds/swell-scope/issues)
4. **Discord Support**: Join our [Discord community](https://discord.gg/swellscope)
5. **Email Support**: Contact support@swellscope.io

## Version Information

This installation guide is for:
- **SwellScope**: v1.0.0
- **Node.js**: v20.0+
- **Foundry**: Latest stable
- **Docker**: v24.0+
- **PostgreSQL**: v15+
- **Redis**: v7.0+

Keep this guide bookmarked and check for updates as SwellScope evolves! 