# 📦 VeganFlemme Shared Package

> **Common utilities, types, and functions shared across VeganFlemme applications**

This package contains TypeScript utilities, type definitions, constants, and helper functions that are used by both the frontend and backend applications in the VeganFlemme monorepo.

## 🎯 **Purpose**

The shared package ensures:
- **Type Safety**: Common TypeScript interfaces and types
- **Code Reuse**: Utilities used across multiple applications  
- **Consistency**: Standardized constants and configurations
- **Maintainability**: Single source of truth for shared logic

## 📋 **Package Contents**

### 🔧 **Utilities** (`src/utils/`)
- **Validation Helpers**: Input validation and sanitization functions
- **Data Transformers**: Format converters and data normalizers
- **Math Utilities**: Nutritional calculations and statistical functions
- **Date/Time Helpers**: Date formatting and timezone utilities

### 📊 **Types** (`src/types/`)
- **API Types**: Request/response interfaces for backend communication
- **Nutrition Types**: Food, nutrient, and meal planning data structures
- **User Types**: Profile, preferences, and authentication interfaces
- **Common Types**: Shared enums, constants, and utility types

### 🎛️ **Constants** (`src/constants/`)
- **Nutrition Standards**: ANSES RNP values and nutritional guidelines
- **Application Config**: Feature flags, API endpoints, and settings
- **Validation Rules**: Input validation patterns and constraints
- **Error Messages**: Standardized error codes and messages

## 🔨 **Development**

### Build Commands
```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run build:watch

# Type checking only
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Usage in Other Packages

```typescript
// In backend or frontend applications
import { 
  NutritionProfile, 
  MenuGenerationRequest,
  validateEmail,
  formatNutrientValue,
  ANSES_RNP_VALUES 
} from '@veganflemme/shared';

// Use shared types
const profile: NutritionProfile = {
  age: 30,
  gender: 'female',
  activityLevel: 'moderate'
};

// Use shared utilities
const isValid = validateEmail('user@example.com');
const formatted = formatNutrientValue(1250, 'mg');

// Use shared constants
const vitaminB12RNP = ANSES_RNP_VALUES.vitaminB12.adult;
```

## 📁 **Project Structure**

```
packages/shared/
├── src/
│   ├── types/           # TypeScript type definitions
│   │   ├── api.ts      # API request/response types
│   │   ├── nutrition.ts # Nutrition-related types
│   │   ├── user.ts     # User and profile types
│   │   └── index.ts    # Type exports
│   ├── utils/          # Utility functions
│   │   ├── validation.ts # Input validation helpers
│   │   ├── formatting.ts # Data formatting utilities
│   │   ├── calculations.ts # Mathematical utilities
│   │   └── index.ts    # Utility exports
│   ├── constants/      # Application constants
│   │   ├── nutrition.ts # Nutrition standards and RNP values
│   │   ├── config.ts   # Application configuration
│   │   └── index.ts    # Constants exports
│   └── index.ts        # Main package exports
├── dist/               # Compiled JavaScript (generated)
├── package.json        # Package configuration
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## 🏗️ **Build & Distribution**

This package is built automatically during the monorepo build process:

```bash
# From monorepo root
npm run build  # Builds all packages including shared

# From this package
npm run build  # Builds only this package
```

The compiled JavaScript is output to the `dist/` directory and can be imported by other packages in the monorepo.

## 🔄 **Version Management**

The shared package follows semantic versioning:
- **Major**: Breaking changes to types or APIs
- **Minor**: New utilities or non-breaking type additions  
- **Patch**: Bug fixes and improvements

When making changes that affect other packages, ensure backward compatibility or coordinate updates across the monorepo.

## 🤝 **Contributing**

1. **Add New Types**: Place in appropriate files under `src/types/`
2. **Add Utilities**: Include comprehensive tests and documentation
3. **Update Constants**: Ensure accuracy of nutritional data
4. **Build & Test**: Verify all dependent packages still build correctly
5. **Documentation**: Update this README for significant additions

## 📄 **Dependencies**

This package has minimal dependencies to avoid conflicts:
- **TypeScript**: For type definitions and compilation
- **ESLint**: For code quality and consistency

---

**Part of the VeganFlemme monorepo** - Enabling code reuse and consistency across applications.