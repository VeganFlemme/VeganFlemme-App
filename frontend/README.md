# 🌱 VeganFlemme Frontend

> **Modern React web application for vegan nutrition and meal planning**

The VeganFlemme Frontend is a Next.js application that provides an intuitive interface for vegan meal planning, nutrition tracking, and personalized recipe recommendations. Built with modern React patterns and styled with Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [NPM Scripts](#npm-scripts)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [Testing](#testing)
- [Deployment](#deployment)

## 🎯 Overview

### Key Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS ✅
- **Basic Pages**: Homepage, dashboard, profile, menu generation ✅
- **Menu Planning**: Basic form structure (backend integration needed) 🟡
- **Component Structure**: Modern React architecture with Next.js 14 ✅
- **Testing Setup**: Jest + React Testing Library configured ✅

### Tech Stack
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18.0.0
- npm ≥8.0.0

### Installation
```bash
# Clone the repository
cd frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### First Run
1. The app will connect to the backend API (ensure engine is running)
2. Navigate through the onboarding flow
3. Generate your first vegan menu
4. Explore nutrition tracking features

## 📜 NPM Scripts

### Development
```bash
npm run dev     # Start Next.js development server
npm run build   # Build production application
npm run start   # Start production server
```

### Quality Assurance
```bash
npm run lint           # Run Next.js ESLint
npm run test           # Run Jest tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   ├── images/            # Images and illustrations
│   └── favicon.ico        # Favicon
├── src/                   # Source code
│   ├── app/               # Next.js 13+ App Router
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   ├── menu/          # Menu planning pages
│   │   ├── profile/       # User profile pages
│   │   └── nutrition/     # Nutrition tracking pages
│   ├── components/        # Reusable components
│   │   ├── ui/            # Base UI components
│   │   ├── layout/        # Layout components
│   │   ├── forms/         # Form components
│   │   └── charts/        # Chart components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configurations
│   │   ├── api.ts         # API client
│   │   ├── utils.ts       # Helper functions
│   │   └── constants.ts   # App constants
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Additional styles
├── __tests__/             # Test files
│   └── HomePage.test.tsx  # Homepage tests
├── .env.example           # Environment variables template
├── .eslintrc.js          # ESLint configuration
├── jest.config.js        # Jest configuration
├── jest.setup.js         # Jest setup
├── next.config.js        # Next.js configuration
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies and scripts
```

## 🔧 Environment Variables

### Core Configuration
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # Backend API URL
NEXT_PUBLIC_APP_ENV=development                # Environment

# PWA Configuration
NEXT_PUBLIC_PWA_ENABLED=true                   # Enable PWA features
NEXT_PUBLIC_APP_NAME=VeganFlemme               # App display name
NEXT_PUBLIC_APP_SHORT_NAME=VeganFlemme         # Short name for PWA
NEXT_PUBLIC_APP_DESCRIPTION=Votre transition vegan simplifiée
```

### Feature Toggles
```bash
# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false            # Enable analytics
NEXT_PUBLIC_ENABLE_CART_BUILDER=true          # Shopping cart features
NEXT_PUBLIC_ENABLE_AFFILIATE_LINKS=true       # Affiliate links
```

### Analytics & Tracking (Optional)
```bash
# Analytics Services
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX    # Google Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token         # Mixpanel

# External Services
NEXT_PUBLIC_MAPS_API_KEY=your_key             # Google Maps API
```

### Affiliate Partners (Optional)
```bash
# Affiliate Programs
NEXT_PUBLIC_GREENWEEZ_PARTNER_ID=your_id      # Greenweez affiliate
NEXT_PUBLIC_AMAZON_PARTNER_ID=your_id         # Amazon affiliate
```

### Production Deployment
```bash
# Vercel Deployment
VERCEL_URL=veganflemme.vercel.app             # Vercel domain
NEXT_PUBLIC_VERCEL_URL=https://veganflemme.vercel.app
```

### ⚠️ Security Notes
- Only `NEXT_PUBLIC_*` variables are exposed to the browser
- Never put sensitive data in public environment variables
- Use Vercel's secure environment variables for sensitive config
- Review all public variables before deployment

## ✨ Features

### 🏠 Homepage
- ✅ Hero section with clear value proposition
- ✅ Basic responsive design
- 🔴 Newsletter signup form (not implemented)
- ✅ Modern layout structure

### 🍽️ Menu Planning  
- ✅ Basic form structure for menu generation
- 🔴 Interactive wizard (static form only)
- 🔴 Recipe details display (not implemented) 
- 🔴 Ingredient swap interface (not implemented)
- 🔴 Shopping list generation (not implemented)

### 📊 Nutrition Dashboard
- ✅ Dashboard page structure created
- 🔴 Daily nutrition tracking (not implemented)
- 🔴 Progress charts (not implemented)
- 🔴 Goal monitoring (not implemented)
- 🔴 Visual indicators (not implemented)

### 👤 User Profile
- ✅ Profile page basic structure
- 🔴 Personal information management (forms not functional)
- 🔴 Preferences configuration (not implemented)
- 🔴 Goals tracking (not implemented)
- 🔴 Favorite recipes (not implemented)

### 📱 Progressive Web App
- 🔴 PWA configuration (not implemented)
- 🔴 Offline functionality (not implemented)
- 🔴 Push notifications (not implemented)
- 🔴 Installation capability (not implemented)

## 🧪 Testing

### Test Strategy
- **Unit Tests**: Component behavior and utilities
- **Integration Tests**: User workflows and API interactions
- **Accessibility Tests**: WCAG compliance checks
- **Visual Regression**: Component visual consistency

### Running Tests
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test
npm test HomePage.test.tsx
```

### Test Coverage
Current coverage (actual measurements):
- **Statements**: 57.97% 🔴 (needs improvement)
- **Branches**: 11.11% 🔴 (very low)
- **Functions**: 46.66% 🔴 (insufficient) 
- **Lines**: 54.54% 🔴 (insufficient)

**Actual test status:**
- ✅ Basic HomePage rendering test
- ✅ Utility functions (analytics, supabase) 
- 🔴 Component interaction tests missing
- 🔴 Page integration tests missing
- 🔴 Custom hooks not tested

### Testing Best Practices
- Use React Testing Library for component tests
- Test user interactions, not implementation details
- Mock API calls for consistent test results
- Test accessibility with screen readers

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--color-primary: #10b981;      /* Emerald green */
--color-primary-dark: #059669; /* Dark emerald */

/* Secondary Colors */
--color-secondary: #f59e0b;    /* Amber */
--color-accent: #8b5cf6;       /* Purple */

/* Neutral Colors */
--color-gray-50: #f9fafb;
--color-gray-900: #111827;
```

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)
- **Scale**: Tailwind's default type scale

### Components
- Consistent spacing using Tailwind's scale
- Rounded corners for modern look
- Hover states and transitions
- Focus states for accessibility

## 🚀 Deployment

### Vercel (Production)
The frontend is deployed on Vercel with automatic deployments from the `main` branch.

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Build Optimization
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Static generation for improved performance
- Bundle analysis with Next.js Bundle Analyzer

### Performance Monitoring
- Core Web Vitals tracking
- Real User Monitoring (RUM) with Vercel Analytics
- Lighthouse CI integration
- Performance budgets enforcement

## 🔍 Troubleshooting

### Common Issues

**Hydration mismatch errors**
```bash
# Check for server/client differences
# Ensure consistent data between SSR and client
```

**Build failures**
```bash
# Type check manually
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next
```

**API connection issues**
```bash
# Check API URL in environment variables
# Verify backend is running
# Check CORS configuration
```

### Development Tips
- Use React DevTools for debugging
- Enable TypeScript strict mode
- Use Next.js built-in debugging
- Monitor bundle size regularly

## 🔧 Customization

### Theming
Customize the design by modifying:
- `tailwind.config.js` for colors and spacing
- `src/app/globals.css` for global styles
- Component-specific styles in component files

### Adding New Features
1. Create components in `src/components/`
2. Add pages in `src/app/`
3. Define types in `src/types/`
4. Add API calls in `src/lib/api.ts`
5. Write tests for new functionality

## 🤝 Contributing

1. Follow React and Next.js best practices
2. Use TypeScript for all new code
3. Maintain component documentation
4. Write tests for new features
5. Follow the established file structure
6. Update this README for significant changes

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

> **VeganFlemme Frontend** - Beautiful, accessible vegan nutrition interface 🌱