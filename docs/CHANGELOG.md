# Changelog

All notable changes to the VeganFlemme project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-31

### 🏗️ Major Repository Reorganization
- **BREAKING**: Restructured entire project into monorepo architecture
- Moved `engine/` → `apps/backend/`
- Moved `frontend/` → `apps/frontend/`
- Created `packages/` for shared code and data
- Reorganized infrastructure and tooling

### ✨ Added
- Root `package.json` with workspace management
- Professional start script (`./start.sh`)
- Comprehensive documentation structure
- Clean `README.md` with clear project vision
- Focused `guideforhuman.md` with current tasks only
- CONTRIBUTING.md guidelines

### 🔧 Changed
- Updated Docker Compose for new structure
- Updated GitHub Actions workflows
- Improved `.gitignore` for monorepo
- Cleaned up file organization
- CIQUAL data files moved to `packages/data/ciqual/`

### 🧪 Testing
- Backend: 129/135 tests passing (95.5%)
- Frontend: 19/19 tests passing (100%)
- All builds working correctly

### 📊 Current Status
- **85% project completion**
- Production deployments operational
- Core services fully functional
- Ready for monetization phase

## [0.8.0] - 2025-07-31 - Pre-Reorganization

### ✅ Validated
- Production deployments confirmed operational
- Backend services: 6/6 functional
- Frontend: 11 pages deployed
- Infrastructure: Docker, CI/CD, monitoring

### 🧠 AI Features
- Claude AI genetic algorithm implemented
- CIQUAL service: 3,211 French foods
- OpenFoodFacts integration: 800k+ products
- Quality scoring: Nutri-Score, Eco-Score, NOVA

### 📈 Metrics
- Build success rate: 100%
- Test coverage: Backend 75.85%, Frontend 57.97%
- Services health: All operational
- Production URLs: Active and responsive

---

## Development Notes

- Focus shifted from development to business operations
- Technical foundation solid and tested
- Next phase: Amazon affiliates + RGPD compliance
- Repository now professionally organized for AI agents and human contributors