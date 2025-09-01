# 🚀 Deployment Guide

This guide provides comprehensive instructions for deploying the Showcase micro-frontend architecture in various environments.

## 📋 Prerequisites

### Required Software
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Node.js** (v16+ for development)
- **Git**

### System Requirements
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 10GB free space
- **CPU:** 2 cores minimum, 4 cores recommended
- **Network:** Open ports 3000-3006, 5000, 27017, 80, 443

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 Nginx Load Balancer                │
│                  (Port 80/443)                     │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌────▼────┐   ┌────▼────┐
│ Shell │    │ Remotes │   │   API   │
│ Vue   │    │ Apps    │   │Express  │
│ 3000  │    │3001-3006│   │  5000   │
└───────┘    └─────────┘   └────┬────┘
                                │
                           ┌────▼────┐
                           │MongoDB  │
                           │ 27017   │
                           └─────────┘
```

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd showcase
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` file with your settings:
```bash
# Update critical settings
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long
MONGODB_URI=mongodb://admin:your-password@mongodb:27017/showcase?authSource=admin
```

### 3. Deploy with Scripts

#### Linux/macOS
```bash
# Make script executable
chmod +x deploy.sh

# Build and start all services
./deploy.sh build
./deploy.sh start

# Check health
./deploy.sh health
```

#### Windows (PowerShell)
```powershell
# Build and start all services
.\deploy.ps1 -Command build
.\deploy.ps1 -Command start

# Check health
.\deploy.ps1 -Command health
```

### 4. Access Applications
- **Main Application:** http://localhost:3000
- **API Documentation:** http://localhost:5000/api-docs
- **Individual Remotes:** http://localhost:3001-3006

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Service Build
```bash
# Build specific service
docker build -t showcase-express ./express
docker build -t showcase-shell ./shell-vue
docker build -t showcase-react ./react-remote
```

## 🔧 Configuration

### Environment Variables

#### Core Configuration
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: JWT signing secret (min 32 chars)
- `MONGODB_URI`: Database connection string

#### Service Ports
- `EXPRESS_PORT`: API server port (default: 5000)
- `SHELL_PORT`: Shell host port (default: 3000)
- `REACT_PORT`: React remote port (default: 3001)
- `VUE_PORT`: Vue remote port (default: 3002)
- `ANGULAR_PORT`: Angular remote port (default: 3004)
- `TS_PORT`: TypeScript remote port (default: 3005)
- `JS_PORT`: JavaScript remote port (default: 3006)

#### Security Settings
- `BCRYPT_ROUNDS`: Password hashing rounds (default: 12)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window
- `CORS_ORIGINS`: Allowed CORS origins

### Database Configuration

#### MongoDB Setup
```bash
# Using Docker
docker run -d \
  --name showcase-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=showcase \
  mongo:7-jammy
```

#### Connection String Format
```
mongodb://username:password@host:port/database?authSource=admin
```

## 🌐 Production Deployment

### 1. Update Environment
```bash
# Production environment
NODE_ENV=production

# Secure secrets
JWT_SECRET=<generate-secure-32-char-key>
MONGODB_URI=mongodb://admin:<secure-password>@mongodb:27017/showcase?authSource=admin
SESSION_SECRET=<generate-different-secret>

# Performance settings
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. SSL Configuration
Update `nginx.conf` for SSL:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    
    # ... rest of configuration
}
```

### 3. Resource Limits
Update `docker-compose.yml`:
```yaml
services:
  express:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## 🔍 Monitoring & Logging

### Health Checks
All services include built-in health checks:
- **Express API:** `GET /health`
- **Frontend Apps:** `GET /` (200 OK)

### Log Management
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f express
docker-compose logs -f shell-vue

# Follow logs with timestamps
docker-compose logs -f -t
```

### Monitoring Commands
```bash
# Service status
docker-compose ps

# Resource usage
docker stats

# System information
docker system info
docker system df
```

## 🛠️ Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000
lsof -i :3000

# Kill process using port
kill -9 <PID>
```

#### Container Issues
```bash
# Restart specific service
docker-compose restart express

# Rebuild service
docker-compose up -d --build express

# Clean rebuild
docker-compose down
docker system prune -f
docker-compose up -d --build
```

#### Database Connection Issues
```bash
# Check MongoDB container
docker-compose logs mongodb

# Connect to MongoDB
docker exec -it showcase-mongodb mongosh \
  --authenticationDatabase admin \
  -u admin -p password123
```

#### Memory Issues
```bash
# Check memory usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Clean unused resources
docker system prune -f
docker volume prune -f
```

### Debug Mode
Enable debug logging:
```bash
# Set in .env
LOG_LEVEL=debug
DEV_ENABLE_DEBUG_ROUTES=true
```

## 📊 Performance Optimization

### 1. Database Indexing
```javascript
// Add indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.tasks.createIndex({ "userId": 1 })
db.tasks.createIndex({ "status": 1, "createdAt": -1 })
```

### 2. Nginx Caching
```nginx
# Add to nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|svg)$ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}
```

### 3. Docker Optimization
```dockerfile
# Multi-stage builds for smaller images
FROM node:18-alpine as build
# ... build stage

FROM node:18-alpine as production
# ... production stage with minimal dependencies
```

## 🔐 Security Best Practices

### 1. Environment Security
- Use strong, unique secrets for production
- Never commit `.env` files to version control
- Regularly rotate JWT and session secrets

### 2. Container Security
- Use non-root users in containers
- Keep base images updated
- Scan images for vulnerabilities

### 3. Network Security
- Use Docker networks for service isolation
- Configure firewall rules appropriately
- Enable SSL/TLS in production

### 4. Database Security
- Use authentication for MongoDB
- Enable MongoDB authorization
- Regular backups and monitoring

## 📈 Scaling

### Horizontal Scaling
```yaml
# Scale services
services:
  shell-vue:
    deploy:
      replicas: 3
  express:
    deploy:
      replicas: 2
```

### Load Balancing
Update nginx configuration for multiple instances:
```nginx
upstream express_backend {
    server express_1:5000;
    server express_2:5000;
}

upstream shell_backend {
    server shell_1:3000;
    server shell_2:3000;
    server shell_3:3000;
}
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          docker-compose -f docker-compose.prod.yml up -d --build
```

### Automated Testing
```bash
# Run tests before deployment
npm run test:all
./deploy.sh health
```

## 📝 Maintenance

### Regular Tasks
1. **Update Dependencies:** Monthly security updates
2. **Database Maintenance:** Weekly backups, index optimization
3. **Log Rotation:** Configure log rotation to prevent disk space issues
4. **Security Patches:** Apply OS and container updates regularly

### Backup Strategy
```bash
# MongoDB backup
docker exec showcase-mongodb mongodump \
  --authenticationDatabase admin \
  -u admin -p password123 \
  --out /backup/$(date +%Y%m%d)

# Volume backup
docker run --rm -v showcase_mongodb_data:/data \
  -v $(pwd)/backup:/backup \
  ubuntu tar czf /backup/mongodb_data.tar.gz /data
```

## 🆘 Support

### Log Collection
```bash
# Collect all logs for support
mkdir support_logs
docker-compose logs --no-color > support_logs/compose.log
docker system info > support_logs/system.log
docker images > support_logs/images.log
```

### Diagnostic Commands
```bash
# System diagnostics
./deploy.sh status
./deploy.sh health
docker system df
docker system events --since 1h
```

---

For additional support or questions, please check the main README.md or create an issue in the project repository.