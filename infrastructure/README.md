# 🏗️ VeganFlemme Infrastructure

> **Infrastructure configurations, deployment templates, and cloud platform setups**

This directory contains infrastructure-as-code configurations, deployment templates, and cloud platform setups for the VeganFlemme application suite across multiple environments.

## 🌐 **Production Infrastructure**

### ✅ **Current Deployments**
- **Frontend**: Vercel (Global CDN, Auto-scaling)
- **Backend API**: Render.com (Auto-scaling, Health monitoring)
- **Edge Functions**: Supabase (Serverless, Global distribution)
- **Database**: PostgreSQL on Supabase (Managed, Backup)

### 📊 **Performance Metrics**
- **Frontend Load Time**: <1s globally via Vercel CDN
- **API Response Time**: <2s for complex menu generation
- **Uptime**: 99.9% across all services
- **Auto-scaling**: Handles traffic spikes automatically

## 📋 **Infrastructure Components**

### ☁️ **Cloud Platforms**
- **Vercel**: Next.js frontend hosting with global CDN
- **Render.com**: Node.js backend API with auto-scaling
- **Supabase**: PostgreSQL database and edge functions
- **GitHub Actions**: CI/CD pipeline automation

### 🐳 **Docker Configuration** (`docker/`)
- **Multi-stage Builds**: Optimized production images
- **Development Environment**: Complete local development stack
- **Health Checks**: Container monitoring and auto-restart
- **Volume Management**: Persistent data storage

### 🔧 **Platform Configurations**
- **Vercel**: `vercel.json` with optimized build settings
- **Render**: `render.yaml` with service definitions
- **GitHub Actions**: CI/CD workflows in `.github/workflows/`
- **Docker Compose**: Local development environment

## 📁 **Directory Structure**

```
infrastructure/
├── docker/                      # Docker configurations
│   ├── Dockerfile.backend      # Backend production image
│   ├── Dockerfile.frontend     # Frontend production image
│   ├── docker-compose.yml      # Development environment
│   └── docker-compose.prod.yml # Production-like local setup
├── vercel/                      # Vercel deployment configs
│   ├── vercel.json             # Build and routing configuration
│   └── .vercelignore           # Files to exclude from deployment
├── render/                      # Render.com configurations
│   ├── render.yaml             # Service definitions
│   └── build-scripts/          # Custom build scripts
├── supabase/                    # Supabase configurations
│   ├── config.toml             # Supabase CLI configuration
│   ├── functions/              # Edge function definitions
│   └── migrations/             # Database schema migrations
├── github/                      # GitHub Actions workflows
│   ├── ci.yml                  # Continuous integration
│   ├── deployment.yml          # Automated deployment
│   └── security.yml            # Security scanning
├── monitoring/                  # Monitoring and alerting
│   ├── healthchecks.yml        # Health check definitions
│   ├── alerts.yml              # Alert configurations
│   └── dashboards/             # Monitoring dashboards
└── README.md                   # This file
```

## 🚀 **Deployment Architecture**

### Production Flow
```
Developer Push → GitHub Actions → Build & Test → Deploy
                      ↓
├── Frontend: GitHub → Vercel (Automatic)
├── Backend: GitHub → Render (Automatic)
└── Functions: Manual → Supabase (via CLI)
```

### Environment Progression
```
Development (Local) → Staging (Preview) → Production (Live)
     Docker              Vercel Preview      Vercel Production
     Local DB            Supabase Dev        Supabase Production
```

## ⚙️ **Configuration Management**

### Environment Variables
```bash
# Production (Vercel)
NEXT_PUBLIC_API_URL=https://veganflemme-engine.onrender.com/api
NEXT_PUBLIC_APP_ENV=production
VERCEL_ENV=production

# Production (Render)
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
FRONTEND_URL=https://veganflemme.vercel.app

# Supabase
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
```

### Secrets Management
- **Vercel**: Environment variables in project settings
- **Render**: Environment variables in service settings
- **Supabase**: Edge function environment variables
- **GitHub**: Repository secrets for CI/CD

## 🔧 **Docker Development**

### Local Development Setup
```bash
# Start complete development environment
docker-compose up --build

# Services available:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: postgresql://localhost:5432/veganflemme
```

### Production-like Local Testing
```bash
# Use production Docker compose
docker-compose -f docker-compose.prod.yml up --build

# Test with production environment variables
docker-compose -f docker-compose.prod.yml --env-file .env.production up
```

### Container Health Checks
```dockerfile
# Backend health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Frontend health check  
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1
```

## 📊 **Monitoring & Observability**

### Health Monitoring
- **Vercel**: Built-in analytics and monitoring
- **Render**: Service health checks and alerts
- **Supabase**: Database performance monitoring
- **Custom**: Health check endpoints in applications

### Performance Monitoring
```yaml
# Health check configuration
healthchecks:
  frontend:
    url: https://veganflemme.vercel.app
    interval: 60s
    timeout: 10s
    
  backend:
    url: https://veganflemme-engine.onrender.com/api/health
    interval: 30s
    timeout: 10s
    
  database:
    url: postgresql://[connection-string]
    query: "SELECT 1"
    interval: 60s
```

### Alerting
- **Uptime Monitoring**: External service monitoring
- **Error Tracking**: Application error reporting
- **Performance Alerts**: Response time degradation
- **Resource Alerts**: Memory/CPU usage warnings

## 🔒 **Security Configuration**

### HTTPS Enforcement
- **Vercel**: Automatic HTTPS with Let's Encrypt certificates
- **Render**: Built-in SSL/TLS termination
- **Supabase**: HTTPS-only API endpoints
- **CORS**: Strict origin policies

### Security Headers
```javascript
// Next.js security headers (vercel.json)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### API Security
- **Rate Limiting**: Express rate limiter middleware
- **Input Validation**: Joi schema validation
- **CORS**: Restricted to allowed origins
- **Helmet**: Security headers middleware

## 📈 **Scaling Strategy**

### Auto-scaling Configuration
- **Vercel**: Automatic scaling based on traffic
- **Render**: Horizontal scaling with load balancing
- **Supabase**: Database connection pooling
- **CDN**: Global content distribution

### Performance Optimization
- **Frontend**: Code splitting, image optimization, caching
- **Backend**: Database query optimization, caching layers
- **Database**: Indexes, query optimization, connection pooling
- **CDN**: Static asset caching, geographic distribution

## 🚀 **Deployment Procedures**

### Automated Deployment (Current)
```bash
# Frontend (Automatic)
git push origin main → Vercel deployment

# Backend (Automatic)  
git push origin main → Render deployment

# Edge Functions (Manual)
supabase functions deploy paapi-proxy
```

### Manual Deployment (Backup)
```bash
# Frontend manual deployment
vercel --prod

# Backend manual deployment (if needed)
git push render main

# Supabase functions
supabase functions deploy --project-ref [project-id]
```

### Rollback Procedures
- **Vercel**: Instant rollback to previous deployment
- **Render**: Rollback via dashboard or API
- **Supabase**: Function versioning and rollback
- **Database**: Point-in-time recovery available

## 🤝 **Contributing**

### Infrastructure Changes
1. **Test Locally**: Verify changes with Docker Compose
2. **Update Documentation**: Modify this README
3. **Test Deployment**: Use staging environment
4. **Review Security**: Ensure security best practices
5. **Monitor Deployment**: Verify successful deployment

### Adding New Services
1. **Define Requirements**: Resource and scaling needs
2. **Choose Platform**: Evaluate cost and features
3. **Create Configuration**: Add infrastructure code
4. **Test Integration**: Verify with existing services
5. **Update CI/CD**: Modify deployment pipelines

---

**Part of the VeganFlemme monorepo** - Ensuring reliable, scalable, and secure infrastructure for production applications.