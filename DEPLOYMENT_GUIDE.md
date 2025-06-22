# SwellScope Deployment Guide

This guide provides comprehensive instructions for deploying SwellScope to production on Swellchain.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+
- Foundry (for smart contracts)

### Environment Setup

1. **Clone and Setup**
```bash
git clone https://github.com/kamalbuilds/swell-scope.git
cd swell-scope
cp env.example .env
```

2. **Configure Environment Variables**
Edit `.env` with your specific configuration:

```bash
# Essential Swellchain Configuration
SWELLCHAIN_RPC_URL=https://swell-mainnet.alt.technology
SWELLCHAIN_TESTNET_RPC_URL=https://swell-testnet.alt.technology
NEXT_PUBLIC_SWELLCHAIN_CHAIN_ID=1923

# Database & Cache
DATABASE_URL="postgresql://user:password@localhost:5432/swellscope"
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET="your-super-secure-jwt-secret-minimum-32-characters"
```

3. **Install Dependencies**
```bash
npm install
cd backend && npm install && cd ..
```

4. **Deploy Smart Contracts**
```bash
# Deploy to Swellchain testnet first
forge script script/Deploy.s.sol --rpc-url $SWELLCHAIN_TESTNET_RPC_URL --broadcast --verify

# Deploy to mainnet (after testing)
forge script script/Deploy.s.sol --rpc-url $SWELLCHAIN_RPC_URL --broadcast --verify
```

5. **Start Application**
```bash
# Development
npm run dev

# Production with Docker
docker-compose up -d
```

## 📋 Detailed Deployment Steps

### 1. Infrastructure Setup

#### Database Setup (PostgreSQL)
```sql
-- Create database and user
CREATE DATABASE swellscope;
CREATE USER swellscope_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE swellscope TO swellscope_user;

-- Connect to swellscope database
\c swellscope

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

#### Redis Configuration
```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf
# Set: maxmemory 1gb
# Set: maxmemory-policy allkeys-lru
# Set: save 900 1 300 10 60 10000

sudo systemctl restart redis-server
```

### 2. Smart Contract Deployment

#### Testnet Deployment
```bash
# Set up environment variables
export PRIVATE_KEY="0x..."
export SWELLCHAIN_TESTNET_RPC_URL="https://swell-testnet.alt.technology"
export TESTNET_SWETH_ADDRESS="0x..."
export TESTNET_RSWETH_ADDRESS="0x..."
export TESTNET_BRIDGE_ADDRESS="0x..."

# Deploy contracts
forge script script/Deploy.s.sol \
  --rpc-url $SWELLCHAIN_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

#### Mainnet Deployment
```bash
# IMPORTANT: Test thoroughly on testnet first!
export PRIVATE_KEY="0x..."
export SWELLCHAIN_RPC_URL="https://swell-mainnet.alt.technology"

# Deploy to mainnet
forge script script/Deploy.s.sol \
  --rpc-url $SWELLCHAIN_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --slow
```

### 3. Backend API Deployment

#### Database Migration
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

#### Service Configuration
```bash
# Create systemd service
sudo nano /etc/systemd/system/swellscope-backend.service
```

```ini
[Unit]
Description=SwellScope Backend API
After=network.target

[Service]
Type=simple
User=swellscope
WorkingDirectory=/opt/swellscope/backend
Environment=NODE_ENV=production
Environment=PORT=3001
EnvironmentFile=/opt/swellscope/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable swellscope-backend
sudo systemctl start swellscope-backend
sudo systemctl status swellscope-backend
```

### 4. Frontend Deployment

#### Build and Deploy
```bash
# Build Next.js application
npm run build

# Start production server
npm start
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/swellscope
server {
    listen 80;
    listen [::]:80;
    server_name swellscope.xyz www.swellscope.xyz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name swellscope.xyz www.swellscope.xyz;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/swellscope.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/swellscope.xyz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐳 Docker Deployment

### Development with Docker Compose
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f swellscope-backend
docker-compose logs -f swellscope-frontend
```

### Production Deployment
```bash
# Build production images
docker build -t swellscope:latest .

# Run with docker-compose
docker-compose up -d

# Health check
docker-compose exec swellscope ./docker-entrypoint.sh health-check
```

### Kubernetes Deployment
```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: swellscope
  namespace: swellscope
spec:
  replicas: 3
  selector:
    matchLabels:
      app: swellscope
  template:
    metadata:
      labels:
        app: swellscope
    spec:
      containers:
      - name: swellscope
        image: swellscope:latest
        ports:
        - containerPort: 3000
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: swellscope-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: swellscope-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🔒 Security Configuration

### Environment Variables Security
```bash
# Create secure environment file
sudo nano /opt/swellscope/.env.production
sudo chown swellscope:swellscope /opt/swellscope/.env.production
sudo chmod 600 /opt/swellscope/.env.production
```

### Firewall Setup
```bash
# UFW configuration
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp
sudo ufw deny 3001/tcp
sudo ufw deny 5432/tcp
sudo ufw deny 6379/tcp
sudo ufw --force enable
```

### SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d swellscope.xyz -d www.swellscope.xyz

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'swellscope-backend',
      script: 'backend/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'swellscope-frontend',
      script: 'server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
```

### System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/swellscope
```

```
/opt/swellscope/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 swellscope swellscope
    postrotate
        systemctl reload swellscope-backend
    endscript
}
```

## 🚀 Production Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Smart contracts deployed and verified
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

### Smart Contract Security
- [ ] Contracts audited by security firm
- [ ] Multi-signature wallet configured
- [ ] Emergency pause mechanisms tested
- [ ] Role-based access control verified
- [ ] Upgrade paths secured

### Infrastructure Security
- [ ] Server hardened (fail2ban, automatic updates)
- [ ] Database secured (encrypted connections, restricted access)
- [ ] Redis secured (authentication, network isolation)
- [ ] Load balancer configured
- [ ] CDN setup for static assets
- [ ] DDoS protection enabled

### Performance Optimization
- [ ] Database indexes optimized
- [ ] Redis caching configured
- [ ] API rate limiting enabled
- [ ] Frontend assets optimized
- [ ] WebSocket connections optimized
- [ ] Monitoring dashboards setup

## 🔄 Maintenance & Updates

### Regular Maintenance
```bash
# Weekly tasks
sudo apt update && sudo apt upgrade -y
docker system prune -f
pm2 restart all

# Monthly tasks
sudo certbot renew
npm audit fix
docker pull swellscope:latest
```

### Database Maintenance
```sql
-- Weekly database maintenance
VACUUM ANALYZE;
REINDEX DATABASE swellscope;

-- Check database size
SELECT pg_size_pretty(pg_database_size('swellscope'));
```

### Backup Strategy
```bash
# Database backup
pg_dump -h localhost -U swellscope_user -d swellscope | gzip > backup-$(date +%Y%m%d).sql.gz

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://swellscope-backups/

# Environment backup
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env ecosystem.config.js
```

## 🆘 Troubleshooting

### Common Issues

#### Backend Connection Issues
```bash
# Check service status
sudo systemctl status swellscope-backend

# Check logs
journalctl -u swellscope-backend -f

# Test database connection
psql -h localhost -U swellscope_user -d swellscope -c "SELECT 1;"

# Test Redis connection
redis-cli ping
```

#### Smart Contract Issues
```bash
# Check contract deployment
cast call $VAULT_ADDRESS "name()" --rpc-url $SWELLCHAIN_RPC_URL

# Verify on explorer
curl "https://explorer.swellnetwork.io/api/v1/address/$VAULT_ADDRESS"
```

#### Performance Issues
```bash
# Check resource usage
htop
iotop
docker stats

# Check database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

## 📞 Support

For deployment support:
- GitHub Issues: https://github.com/kamalbuilds/swell-scope/issues
- Discord: https://discord.gg/swellscope
- Email: support@swellscope.xyz

## 📜 License

MIT License - see LICENSE file for details. 