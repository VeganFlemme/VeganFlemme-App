# 🛠️ VeganFlemme Development Tools

> **Development utilities, scripts, and automation tools for the VeganFlemme monorepo**

This directory contains development tools, scripts, and utilities that help with building, testing, deploying, and maintaining the VeganFlemme application suite.

## 📋 **Tools Overview**

### 🐳 **Docker Tools** (`scripts/docker/`)
- **Development Environment**: Docker Compose setup and management scripts
- **Container Health Checks**: Service monitoring and health validation
- **Data Volume Management**: Database and cache volume utilities
- **Multi-stage Builds**: Optimized production Docker images

### 🚀 **Deployment Scripts** (`scripts/deployment/`)
- **Vercel Deployment**: Frontend deployment automation
- **Render Deployment**: Backend API deployment scripts
- **Supabase Functions**: Edge function deployment utilities
- **Environment Management**: Configuration and secrets management

### 📊 **Data Tools** (`scripts/data/`)
- **CIQUAL Processing**: French nutritional database optimization
- **Data Validation**: Quality assurance and integrity checks
- **Search Index Building**: Full-text search optimization
- **Database Seeding**: Initial data loading utilities

### 🧪 **Testing Tools** (`scripts/testing/`)
- **Test Runners**: Automated test execution across packages
- **Coverage Reports**: Test coverage analysis and reporting
- **Performance Testing**: Load testing and benchmarking tools
- **Integration Testing**: End-to-end test automation

## 🔧 **Usage**

### Docker Development Environment
```bash
# Start all services with Docker
./start.sh --build

# Start in detached mode
./start.sh --detach

# View logs
./start.sh --logs

# Clean up containers and volumes
./start.sh --clean
```

### Deployment Scripts
```bash
# Deploy to production (from CI/CD)
./tools/scripts/deployment/deploy-production.sh

# Deploy Supabase functions
./tools/scripts/deployment/deploy-supabase-functions.sh

# Verify deployment health
./tools/scripts/deployment/verify-deployment.sh
```

### Data Processing
```bash
# Optimize CIQUAL database
./tools/scripts/data/optimize-ciqual.sh

# Validate data integrity
./tools/scripts/data/validate-data.sh

# Build search indexes
./tools/scripts/data/build-search-indexes.sh
```

### Testing Utilities
```bash
# Run all tests with coverage
./tools/scripts/testing/run-all-tests.sh

# Performance testing
./tools/scripts/testing/performance-test.sh

# Integration tests
./tools/scripts/testing/integration-test.sh
```

## 📁 **Directory Structure**

```
tools/
├── scripts/                    # Automation scripts
│   ├── docker/                # Docker utilities
│   │   ├── health-check.sh    # Container health monitoring
│   │   ├── setup-volumes.sh   # Volume management
│   │   └── cleanup.sh         # Container cleanup
│   ├── deployment/            # Deployment automation
│   │   ├── deploy-production.sh
│   │   ├── deploy-supabase-functions.sh
│   │   └── verify-deployment.sh
│   ├── data/                  # Data processing
│   │   ├── optimize-ciqual.sh
│   │   ├── validate-data.sh
│   │   └── build-search-indexes.sh
│   ├── testing/               # Testing utilities
│   │   ├── run-all-tests.sh
│   │   ├── performance-test.sh
│   │   └── integration-test.sh
│   └── maintenance/           # Maintenance scripts
│       ├── backup-database.sh
│       ├── update-dependencies.sh
│       └── security-audit.sh
├── configs/                   # Configuration templates
│   ├── docker/               # Docker configurations
│   ├── nginx/                # Web server configs
│   └── monitoring/           # Monitoring setup
├── templates/                 # Code and config templates
│   ├── component.tsx.template
│   ├── service.ts.template
│   └── test.spec.ts.template
└── README.md                 # This file
```

## 🎯 **Development Workflow**

### Local Development Setup
1. **Clone Repository**: `git clone [repo-url]`
2. **Install Dependencies**: `npm install`
3. **Start Services**: `./start.sh --build`
4. **Run Tests**: `npm test`

### Production Deployment
1. **Build All Packages**: `npm run build`
2. **Run Tests**: `npm run test`
3. **Deploy Frontend**: Automatic via Vercel
4. **Deploy Backend**: Automatic via Render
5. **Deploy Functions**: `./tools/scripts/deployment/deploy-supabase-functions.sh`

### Data Updates
1. **Download New CIQUAL**: From ANSES website
2. **Process Data**: `./tools/scripts/data/optimize-ciqual.sh`
3. **Validate Results**: `./tools/scripts/data/validate-data.sh`
4. **Update Indexes**: `./tools/scripts/data/build-search-indexes.sh`
5. **Deploy Changes**: Standard deployment process

## 🔧 **Tool Configuration**

### Environment Variables
```bash
# Docker configuration
COMPOSE_PROJECT_NAME=veganflemme
DOCKER_BUILDKIT=1

# Deployment configuration
VERCEL_TOKEN=your_vercel_token
RENDER_API_KEY=your_render_key
SUPABASE_ACCESS_TOKEN=your_supabase_token

# Testing configuration
TEST_DATABASE_URL=postgresql://test:test@localhost:5433/veganflemme_test
PERFORMANCE_TEST_DURATION=60s
```

### Script Permissions
```bash
# Make all scripts executable
chmod +x tools/scripts/**/*.sh

# Individual script permissions
chmod +x start.sh
chmod +x tools/scripts/deployment/deploy-production.sh
```

## 🚀 **Continuous Integration**

### GitHub Actions Integration
The development tools integrate with GitHub Actions for automated:
- **Testing**: Run tests on pull requests
- **Building**: Build all packages on push
- **Deployment**: Deploy to production on main branch
- **Quality Checks**: Linting, type checking, security audits

### Quality Gates
- **Test Coverage**: Minimum 80% coverage required
- **Type Safety**: Zero TypeScript errors
- **Linting**: ESLint rules enforced
- **Security**: npm audit and Snyk scanning
- **Performance**: Bundle size limits enforced

## 📊 **Monitoring & Maintenance**

### Health Monitoring
```bash
# Check all service health
./tools/scripts/maintenance/health-check.sh

# Monitor database performance
./tools/scripts/maintenance/db-performance.sh

# Check deployment status
./tools/scripts/deployment/verify-deployment.sh
```

### Regular Maintenance
- **Weekly**: Dependency updates and security patches
- **Monthly**: Performance optimization and cleanup
- **Quarterly**: Major dependency upgrades
- **Annually**: Architecture review and improvements

## 🤝 **Contributing**

### Adding New Tools
1. **Create Script**: Add to appropriate subdirectory
2. **Make Executable**: `chmod +x your-script.sh`
3. **Add Documentation**: Update this README
4. **Test Thoroughly**: Verify in development environment
5. **Submit PR**: Include tests and documentation

### Script Standards
- **Bash Scripts**: Use `#!/bin/bash` shebang
- **Error Handling**: Include proper error checking
- **Documentation**: Add comments and usage examples
- **Idempotency**: Scripts should be safe to re-run
- **Dependencies**: Check for required tools/packages

---

**Part of the VeganFlemme monorepo** - Streamlining development, testing, and deployment workflows.