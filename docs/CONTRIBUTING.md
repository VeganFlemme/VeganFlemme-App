# Contributing to VeganFlemme

We welcome contributions to VeganFlemme! This document provides guidelines for contributing to the project.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/your-username/VeganFlemme-App.git`
3. **Install dependencies**: `npm install`
4. **Start development**: `./start.sh --build`

## 📋 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode required
- **ESLint**: Zero errors tolerance
- **Tests**: >80% coverage for new features
- **Commits**: Use conventional commit format

### Branch Naming
- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Pull Request Process
1. Create feature branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass: `npm run test`
4. Run linting: `npm run lint:fix`
5. Submit PR with clear description

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific workspace tests
npm run test:backend
npm run test:frontend

# Coverage reports
npm run test:coverage
```

## 📁 Project Structure

```
VeganFlemme-App/
├── apps/                    # Main applications
│   ├── backend/            # Express API
│   └── frontend/           # Next.js app
├── packages/               # Shared packages
│   ├── shared/            # Common utilities
│   └── data/              # Data processing
├── docs/                  # Documentation
└── tools/                # Development tools
```

## 🤝 Getting Help

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the `/docs` folder

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.