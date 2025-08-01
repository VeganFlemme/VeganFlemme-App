# 📊 VeganFlemme Data Package

> **French nutritional databases, food composition data, and data processing utilities**

This package contains the French nutritional databases (CIQUAL), food composition data, and data processing utilities that power VeganFlemme's nutrition analysis and meal planning algorithms.

## 🎯 **Purpose**

The data package provides:
- **🇫🇷 French Food Database**: 3,211+ foods from CIQUAL 2020 with complete nutritional profiles
- **📊 Processing Tools**: Data optimization, validation, and transformation utilities
- **🔍 Search Capabilities**: Fast food lookup and filtering functionality
- **📋 Standards Compliance**: ANSES RNP (French nutritional guidelines) integration

## 📋 **Package Contents**

### 🗃️ **CIQUAL Database** (`ciqual/`)
- **Primary Data**: `Table Ciqual 2020_FR_2020 07 07.xls` (3,186 foods)
- **Nutritional Data**: `CALNUT2020_2020_07_07.xlsx` (complete nutrient profiles)
- **Food Groupings**: `Table Aliments moyens Ciqual 2020_2021 04 23.xlsx`
- **Optimized Data**: Pre-processed JSON files for fast application loading

### 🏥 **Database Schema** (`database/`)
- **Initialization Scripts**: SQL scripts for PostgreSQL database setup
- **Migration Files**: Database schema evolution and updates
- **Seed Data**: Initial data loading and indexing scripts

### ⚙️ **Processing Tools** (`src/`)
- **Data Optimizers**: Tools to compress and optimize CIQUAL data
- **Validators**: Data integrity and quality checking utilities
- **Transformers**: Format converters and data normalizers
- **Search Indexers**: Full-text search and filtering capabilities

## 🔨 **Development**

### Build Commands
```bash
# Build TypeScript processors
npm run build

# Optimize CIQUAL data files
npm run optimize-data

# Validate data integrity
npm run validate-data

# Generate search indexes
npm run build-indexes
```

### Data Processing Pipeline

```bash
# 1. Load raw CIQUAL Excel files
npm run load-ciqual

# 2. Process and validate data
npm run process-data

# 3. Optimize for production use
npm run optimize-data

# 4. Generate search indexes
npm run build-indexes
```

## 📊 **CIQUAL Database Details**

### 🍎 **Food Categories**
- **Fruits & Vegetables**: 800+ items with seasonal variations
- **Cereals & Grains**: 400+ items including ancient grains
- **Legumes & Nuts**: 300+ items with protein profiles
- **Plant-based Products**: 200+ items including processed foods
- **Beverages**: 150+ items including plant milks
- **And many more**: Complete French food composition database

### 🧪 **Nutritional Data**
- **Macronutrients**: Proteins, carbohydrates, fats with detailed breakdown
- **Micronutrients**: 50+ vitamins and minerals per food item
- **Quality Indicators**: Nutri-Score, NOVA classification when available
- **Dietary Information**: Allergens, additives, processing levels

### 🔍 **Search Capabilities**
```typescript
// Example usage in applications
import { CiqualService } from '@veganflemme/data';

const ciqualService = new CiqualService();

// Search by name
const tofuResults = await ciqualService.searchByName('tofu');

// Search by nutrient content
const highProteinFoods = await ciqualService.searchByNutrient('protein', '>20g');

// Get food by ID
const food = await ciqualService.getFoodById('25005');

// Search vegan foods only
const veganFoods = await ciqualService.getVeganFoods();
```

## 📁 **Project Structure**

```
packages/data/
├── ciqual/                    # CIQUAL database files
│   ├── Table Ciqual 2020_FR_2020 07 07.xls
│   ├── CALNUT2020_2020_07_07.xlsx
│   ├── Table Aliments moyens Ciqual 2020_2021 04 23.xlsx
│   └── optimized/            # Pre-processed data files
│       ├── foods.json        # Optimized food database
│       ├── nutrients.json    # Nutrient profiles
│       └── search-index.json # Search index
├── database/                 # Database schemas and scripts
│   ├── init/                # Database initialization
│   ├── migrations/          # Schema migrations
│   └── seeds/               # Initial data loading
├── src/                     # Data processing utilities
│   ├── processors/          # Data transformation tools
│   ├── validators/          # Data quality checkers
│   ├── optimizers/          # Performance optimization tools
│   └── services/            # Data access services
├── scripts/                 # Build and processing scripts
│   ├── optimize-ciqual-data.js
│   ├── validate-data.js
│   └── build-indexes.js
├── dist/                    # Compiled JavaScript
├── package.json             # Package configuration
├── tsconfig.json            # TypeScript configuration
└── README.md               # This file
```

## 🔄 **Data Updates**

### CIQUAL Database Updates
The CIQUAL database is updated annually by ANSES (French health agency):

1. **Download**: New CIQUAL data from https://ciqual.anses.fr/
2. **Validate**: Check data integrity and format consistency
3. **Process**: Run optimization and indexing scripts
4. **Test**: Verify applications still work with new data
5. **Deploy**: Update production databases

### Data Quality Assurance
- **Validation Scripts**: Automated data integrity checks
- **Unit Tests**: Comprehensive testing of data processing functions
- **Performance Tests**: Ensure optimized data loads quickly
- **Regression Tests**: Compare results with previous data versions

## 🏗️ **Database Integration**

### PostgreSQL Schema
```sql
-- Core food items table
CREATE TABLE foods (
  id VARCHAR(10) PRIMARY KEY,
  name_fr VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  group_code VARCHAR(10),
  group_name VARCHAR(100),
  is_vegan BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Nutritional data table
CREATE TABLE nutrients (
  food_id VARCHAR(10) REFERENCES foods(id),
  nutrient_code VARCHAR(10),
  nutrient_name VARCHAR(100),
  value_per_100g DECIMAL(10,3),
  unit VARCHAR(10),
  PRIMARY KEY (food_id, nutrient_code)
);

-- Search indexes
CREATE INDEX idx_foods_name_fr ON foods USING gin(to_tsvector('french', name_fr));
CREATE INDEX idx_foods_vegan ON foods(is_vegan) WHERE is_vegan = true;
CREATE INDEX idx_nutrients_value ON nutrients(nutrient_code, value_per_100g);
```

### Supabase Integration
The data package is compatible with Supabase for cloud deployment:

```javascript
// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Use with CIQUAL service
const ciqualService = new CiqualService(supabase);
```

## 📊 **Performance Optimizations**

### Data Compression
- **JSON Optimization**: Reduced file sizes by 60% through smart compression
- **Index Pre-computation**: Search indexes built at compile time
- **Lazy Loading**: Load data sections on demand
- **Cached Results**: In-memory caching for frequently accessed data

### Search Performance
- **Full-text Indexing**: PostgreSQL GIN indexes for fast text search
- **Nutrient Indexing**: B-tree indexes for numerical range queries
- **Composite Indexes**: Multi-column indexes for complex queries
- **Query Optimization**: Efficient SQL queries with proper EXPLAIN analysis

## 🤝 **Contributing**

### Adding New Data Sources
1. **Validate Format**: Ensure data follows CIQUAL standards
2. **Create Processor**: Write data transformation scripts
3. **Add Tests**: Comprehensive validation and unit tests
4. **Update Schema**: Modify database schema if needed
5. **Document Changes**: Update this README and API docs

### Data Quality Guidelines
- **Accuracy**: All nutritional data must be from reliable sources
- **Completeness**: Minimize missing values through careful processing
- **Consistency**: Standardize units, naming, and formatting
- **Performance**: Optimize for fast loading and searching

## 📄 **Data Sources & Licenses**

### CIQUAL (French Food Composition Database)
- **Source**: ANSES (French Agency for Food, Environmental and Occupational Health & Safety)
- **License**: Public domain (French government data)
- **URL**: https://ciqual.anses.fr/
- **Version**: CIQUAL 2020 (updated July 2020)

### Additional Sources
- **OpenFoodFacts**: Product database integration (Open Database License)
- **USDA FoodData Central**: Supplementary nutritional data (Public domain)
- **EU Food Information Regulation**: Nutritional standards and guidelines

---

**Part of the VeganFlemme monorepo** - Powering accurate French nutritional analysis and meal planning.