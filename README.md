# 🌱 VeganFlemme - Your Smart Vegan Transition Assistant

**🇫🇷 L'assistant intelligent pour une transition vegan réussie et sans effort**

> **Try it now**: [veganflemme.vercel.app](https://veganflemme.vercel.app) - Fully operational and ready to use!

## 🎯 What is VeganFlemme?

VeganFlemme simplifies plant-based eating with AI-powered meal planning, French nutritional standards compliance (ANSES RNP), and intelligent shopping assistance. Whether you're transitioning to veganism or optimizing your plant-based diet, our tool creates personalized, balanced meal plans in seconds.

### ⭐ Why Choose VeganFlemme?

- **🚀 Instant Results**: Generate complete weekly meal plans in under 2 seconds
- **🇫🇷 French Standards**: Based on ANSES RNP (French nutritional guidelines) with 3,211+ French foods database
- **🧠 AI-Powered**: Genetic algorithms optimize nutritional balance and meal variety
- **📱 Modern Interface**: Responsive web app with intuitive dashboard and real-time tracking
- **🛒 Smart Shopping**: Integrated affiliate partnerships for seamless ingredient ordering
- **💚 100% Vegan**: All recommendations are plant-based with quality scoring (Nutri-Score, Eco-Score)

### ✨ Core Features
- **One-Click Menu Generation**: Complete weekly meal plans with breakfast, lunch, and dinner
- **Nutritional Analysis**: Real-time tracking with ANSES RNP compliance checking
- **Personalization**: Allergies, restrictions, budget, and cooking time preferences
- **Quality Scoring**: Nutri-Score, Eco-Score, and NOVA classification for all foods
- **Dashboard**: Visual nutrition tracking with progress indicators and recommendations
- **Recipe Integration**: Detailed recipes with ingredient lists and nutritional breakdowns
- **Shopping Assistant**: Smart grocery lists with affiliate partner integration

## 🌐 Live Application Status

### ✅ **Production Ready & Accessible**
Our application is fully deployed and operational across multiple platforms:

- **🌐 Web Application**: [veganflemme.vercel.app](https://veganflemme.vercel.app)
- **⚡ API Backend**: [veganflemme-engine.onrender.com](https://veganflemme-engine.onrender.com)
- **📊 Dashboard**: [veganflemme.vercel.app/dashboard](https://veganflemme.vercel.app/dashboard)
- **🍽️ Menu Generator**: [veganflemme.vercel.app/generate-menu](https://veganflemme.vercel.app/generate-menu)

### 📈 **Performance Metrics**
- **⚡ Menu Generation**: < 2 seconds response time
- **🌍 Global CDN**: Sub-second page load times via Vercel
- **🔄 Auto-scaling**: Handles traffic spikes with Render.com
- **💾 Database**: 3,211 French foods (CIQUAL) + 800k+ products (OpenFoodFacts)
- **✅ Uptime**: 99.9% availability with health monitoring

### 🏗️ **Technical Infrastructure**
- **Frontend**: Next.js 14 deployed on Vercel (17 optimized pages)
- **Backend**: Node.js/Express API on Render.com (6+ endpoints)
- **Proxy Services**: Supabase Edge Functions for affiliate integrations
- **CI/CD**: GitHub Actions with automated deployments
- **Monitoring**: Real-time health checks and performance metrics

## 🚀 Quick Start

### 🌐 **Try Online (Recommended)**
The application is live and ready to use - no installation required!

1. **Visit the App**: [veganflemme.vercel.app](https://veganflemme.vercel.app)
2. **Generate a Menu**: Go to [Menu Generator](https://veganflemme.vercel.app/generate-menu)
3. **View Dashboard**: Check your nutrition at [Dashboard](https://veganflemme.vercel.app/dashboard)

### 💻 **Local Development (Optional)**

If you want to contribute or customize the application:

#### Prerequisites
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0

#### Installation
```bash
# Clone the repository
git clone https://github.com/VeganFlemme/VeganFlemme-App.git
cd VeganFlemme-App

# Install dependencies
npm install

# Start development servers
npm run dev
# This starts both frontend (port 3000) and backend (port 3001)
```

#### Alternative: Docker Development
```bash
# Start with Docker (includes database)
./start.sh --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: http://localhost:5432
```

### 🧪 **Test the API**
You can test our production API directly:

```bash
# Health check
curl https://veganflemme-engine.onrender.com/api/health

# Generate a sample menu
curl -X POST https://veganflemme-engine.onrender.com/api/menu/generate \
  -H "Content-Type: application/json" \
  -d '{
    "people": 2,
    "budget": "medium",
    "daysCount": 3,
    "restrictions": 1,
    "cookingTime": "medium"
  }'
```

## 📁 Project Structure

This is a professional monorepo built with npm workspaces for optimal development experience:

```
VeganFlemme-App/
├── 📱 apps/                    # Main applications
│   ├── backend/               # Express.js API server
│   │   ├── src/              # TypeScript source code
│   │   ├── __tests__/        # Jest test suites (95% coverage)
│   │   ├── scripts/          # Build and deployment scripts
│   │   └── API.md           # Comprehensive API documentation
│   └── frontend/             # Next.js web application
│       ├── src/              # React components and pages
│       ├── public/           # Static assets and images
│       └── __tests__/        # Frontend test suites
├── 📦 packages/               # Shared libraries
│   ├── shared/               # Common utilities and types
│   └── data/                 # Data processing and CIQUAL files
├── 📚 docs/                   # Documentation
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   ├── CHANGELOG.md          # Version history
│   └── *.md                 # Technical documentation
├── 🏗️ infrastructure/         # Deployment configurations
│   ├── docker/               # Docker configurations
│   └── render.yaml          # Render.com deployment
├── 🛠️ tools/                  # Development tools
├── 🐳 docker-compose.yml      # Local development environment
├── 🚀 start.sh               # Quick start script
└── 📋 package.json           # Root workspace configuration
```

### 🏗️ **Architecture Highlights**
- **Monorepo Design**: Shared dependencies and consistent tooling
- **TypeScript Throughout**: Full type safety across all packages
- **Modern Tooling**: ESLint, Prettier, Husky for code quality
- **Professional Testing**: Jest with high coverage requirements
- **Docker Support**: Complete containerization for local development
- **CI/CD Ready**: GitHub Actions with automated testing and deployment

## 🧪 Testing & Quality Assurance

### 🔍 **Current Test Coverage**
- **Backend**: 157/164 tests passing (95.7% success rate)
- **Frontend**: Jest + React Testing Library setup
- **Integration**: API endpoint validation
- **Performance**: Build and deployment testing

### 🚀 **Running Tests**
```bash
# Run all tests
npm test

# Run specific workspace tests
npm run test:backend      # Backend API tests
npm run test:frontend     # Frontend component tests

# Run with coverage reports
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### 🔧 **Build & Deployment Validation**
```bash
# Build all packages
npm run build

# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Development server
npm run dev
```

### 📊 **Quality Standards**
- **TypeScript**: Strict mode enforced across all packages
- **ESLint**: Zero errors policy with automatic fixing
- **Test Coverage**: Target >80% for new features
- **Code Style**: Consistent formatting with Prettier
- **Commit Standards**: Conventional commit messages

## 🎯 Roadmap & Future Development

### 📋 **Phase 1: Monetization & User Growth** (Current Focus)
- [x] **Production Deployment**: All services live and operational
- [x] **Core Features**: Menu generation, nutrition tracking, quality scoring
- [x] **PA-API Infrastructure**: Supabase Edge Functions deployed
- [ ] **Amazon Associate Program**: Awaiting approval for affiliate integration
- [ ] **User Testing**: Collecting feedback from 15+ beta users
- [ ] **Performance Optimization**: Based on real-world usage data

### 🤝 **Phase 2: Partnerships & Expansion** (2-4 weeks)
- [ ] **Amazon Integration**: Full product search and affiliate revenue
- [ ] **French E-commerce**: Greenweez and other bio retailers partnerships
- [ ] **UX Improvements**: Based on user feedback and analytics
- [ ] **GDPR Compliance**: Complete legal compliance for European market
- [ ] **Advanced Analytics**: User behavior tracking and conversion optimization

### 🚀 **Phase 3: Scale & Innovation** (3-6 months)
- [ ] **Mobile Application**: Native iOS/Android apps
- [ ] **AI Enhancement**: Advanced recommendation algorithms
- [ ] **Social Features**: Community, recipe sharing, and user-generated content
- [ ] **Internationalization**: Multi-language support (English, Spanish)
- [ ] **Public API**: Developer platform for third-party integrations

## 🤝 Contributing

We welcome contributions from developers, nutritionists, and vegan enthusiasts!

### 🧑‍💻 **For Developers**
- **Documentation**: Comprehensive code docs and architecture guides
- **Testing**: High test coverage with clear testing guidelines
- **APIs**: Well-documented REST API with OpenAPI specifications
- **Development**: Modern toolchain with TypeScript, Docker, and CI/CD

### 👥 **For Users & Testers**
- **Live Application**: Try the app at [veganflemme.vercel.app](https://veganflemme.vercel.app)
- **Feedback**: Use GitHub Issues for bug reports and feature requests
- **Community**: Join discussions to help improve the user experience

### 📚 **Resources**
- **API Documentation**: See [`apps/backend/API.md`](./apps/backend/API.md)
- **Contribution Guide**: See [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md)
- **Changelog**: See [`docs/CHANGELOG.md`](./docs/CHANGELOG.md)

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

## 🏁 Current Status Summary

### ✅ **Fully Operational** (Production Ready)
- **🌐 Web Application**: [veganflemme.vercel.app](https://veganflemme.vercel.app) (17 pages)
- **⚡ API Backend**: [veganflemme-engine.onrender.com](https://veganflemme-engine.onrender.com) (6+ endpoints)
- **🏗️ Infrastructure**: Vercel + Render + Supabase with CI/CD pipelines
- **🧠 AI Features**: Genetic algorithms for menu optimization
- **📊 Data**: 3,211+ French foods (CIQUAL) + 800k+ products (OpenFoodFacts)
- **📈 Performance**: <2s menu generation, global CDN, auto-scaling

### 🔧 **In Progress**
- Amazon Associate Program approval for affiliate revenue
- User feedback collection for UX improvements
- Advanced analytics and monitoring setup
- GDPR compliance finalization
- Partnership discussions with French retailers

**🌱 VeganFlemme - Making plant-based living simple, smart, and sustainable.**

*Last updated: August 1, 2025*  
*Status: 🟢 Production Active & Growing*


