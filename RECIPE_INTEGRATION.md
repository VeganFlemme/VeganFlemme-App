# RecipeIntegrationService Documentation

## Overview

The RecipeIntegrationService provides seamless integration between the Spoonacular Recipe API and the VeganFlemme menu optimization algorithm. It allows dynamic recipe fetching based on nutritional targets, user preferences, and vegan requirements.

## Features

### Core Functionality

1. **Recipe Search & Validation**
   - Searches for vegan recipes based on nutritional parameters
   - Validates recipes to ensure they are truly vegan
   - Caches results for performance optimization

2. **Menu Enhancement**
   - Enriches generated menus with detailed recipe information
   - Matches recipes to nutritional targets
   - Provides cooking instructions and ingredient lists

3. **Quality Scoring**
   - Calculates Nutri-Score (A-E rating)
   - Estimates Eco-Score for environmental impact
   - Determines NOVA classification for processing level
   - Provides overall quality score (0-100)

4. **Smart Matching**
   - Converts nutritional targets to API parameters
   - Considers user preferences and restrictions
   - Optimizes for cooking time and ingredient preferences

## API Endpoints

### 1. Search Recipes
```
GET /api/recipe/search
```

**Parameters:**
- `query` - Search term (optional)
- `type` - Meal type (breakfast, main course, snack)
- `maxReadyTime` - Maximum cooking time in minutes
- `minProtein` - Minimum protein content
- `maxCalories` - Maximum calories
- `includeIngredients` - Comma-separated favorite ingredients
- `excludeIngredients` - Comma-separated disliked ingredients
- `intolerances` - Dietary restrictions

**Example:**
```bash
curl "http://localhost:3001/api/recipe/search?query=tofu&type=main%20course&maxReadyTime=30&minProtein=15"
```

### 2. Get Recipe Details
```
GET /api/recipe/details/:id
```

**Parameters:**
- `id` - Spoonacular recipe ID

**Response includes:**
- Complete recipe information
- Parsed instructions and ingredients
- Nutritional analysis
- Quality scores

### 3. Enhance Menu with Recipes
```
POST /api/recipe/enhance-menu
```

**Body:**
```json
{
  "menu": { /* Menu object */ },
  "userId": "user123"
}
```

**Features:**
- Enriches existing menu with detailed recipes
- Maintains nutritional balance
- Respects user preferences and restrictions

### 4. Suggest Recipes
```
GET /api/recipe/suggest
```

**Parameters:**
- `userId` - User identifier
- `mealType` - Type of meal (breakfast, lunch, dinner, snack)
- `count` - Number of suggestions (default: 5)

## Service Methods

### Public Methods

#### `enrichMenuWithRecipes(menu, userProfile, preferences)`
Enriches a generated menu with detailed recipes from the Spoonacular API.

#### `searchRecipes(params)`
Searches for recipes matching the given parameters.

#### `getRecipeDetails(recipeId)`
Gets detailed recipe information by ID.

#### `validateVeganRecipe(recipe)`
Validates that a recipe is truly vegan by analyzing ingredients.

#### `parseInstructions(recipe)`
Parses recipe instructions into a structured format.

#### `parseIngredients(recipe)`
Parses recipe ingredients with categorization.

#### `parseNutrition(recipe)`
Parses nutrition data into standardized format.

#### `calculateQualityScores(recipe)`
Calculates comprehensive quality scores for a recipe.

## Configuration

### Environment Variables

Add to your `.env` file:
```bash
SPOONACULAR_API_KEY=your_api_key_here
```

### Rate Limiting

The service includes built-in rate limiting to respect Spoonacular API limits:
- Default: 150 requests per day
- Automatic queuing when limits are reached
- Intelligent caching to minimize API calls

## Quality Scoring System

### Nutri-Score (A-E)
Based on nutritional composition:
- **A**: Excellent nutritional quality
- **B**: Good nutritional quality  
- **C**: Average nutritional quality
- **D**: Poor nutritional quality
- **E**: Very poor nutritional quality

### Eco-Score (A-E)
Environmental impact assessment:
- Considers ingredient carbon footprint
- Evaluates packaging and transport
- Promotes local and organic ingredients

### NOVA Classification (1-4)
Food processing level:
- **1**: Unprocessed/minimally processed
- **2**: Processed culinary ingredients
- **3**: Processed foods
- **4**: Ultra-processed foods

## Ingredient Categorization

The service automatically categorizes ingredients:
- **Protein**: tofu, tempeh, seitan, legumes
- **Grains**: rice, pasta, quinoa, oats
- **Leafy Greens**: spinach, kale, lettuce, arugula
- **Vegetables**: carrots, peppers, tomatoes, onions
- **Fruits**: apples, berries, citrus fruits
- **Nuts**: almonds, cashews, walnuts
- **Fats**: oils, plant-based butters

## Testing

Run the test suite:
```bash
npm test -- __tests__/recipeIntegration.test.ts
```

Tests cover:
- Service initialization
- Recipe parsing and validation
- Quality score calculations
- BMR calculations
- Ingredient categorization

## Integration with Existing Services

The RecipeIntegrationService integrates with:

- **MenuOptimizationService**: Enhances generated menus
- **ProfileService**: Uses user profiles for personalization
- **QualityScorerService**: Leverages quality assessment algorithms
- **ApiRateLimiter**: Manages external API call limits

## Error Handling

The service includes comprehensive error handling:
- Graceful API failure recovery
- Invalid recipe filtering
- Fallback to cached results
- Detailed error logging

## Performance Optimizations

- **Intelligent Caching**: Reduces API calls for repeated requests
- **Batch Processing**: Efficiently handles multiple recipe requests
- **Smart Matching**: Optimizes recipe selection algorithms
- **Rate Limiting**: Prevents API quota exhaustion

## Future Enhancements

Potential improvements:
- Machine learning-based recipe recommendations
- Enhanced nutritional analysis with micronutrients
- Integration with local grocery store APIs
- Recipe complexity scoring
- Seasonal ingredient preferences
- Community recipe sharing features