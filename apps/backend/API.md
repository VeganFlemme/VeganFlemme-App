# VeganFlemme API Documentation

## Base URL
```
Production: https://veganflemme-engine.onrender.com/api
Development: http://localhost:3001/api
```

## Overview
VeganFlemme Engine API provides endpoints for vegan nutrition analysis, menu generation, and user profile management. The API is RESTful and returns JSON responses.

## Authentication
Currently, all endpoints are public. Authentication will be implemented in future versions.

## Error Handling
All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error description"
}
```

## API Endpoints

### Health Check

#### GET /health
Check API health status

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-07-30T10:00:00.000Z",
  "version": "1.0.0"
}
```

#### GET /health/detailed
Get detailed health information including system metrics

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-07-30T10:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "used": 45.2,
    "total": 512
  },
  "cpu": {
    "usage": 12.5
  }
}
```

### Menu Generation

#### POST /menu/generate
Generate a personalized vegan menu based on preferences

**Request Body:**
```json
{
  "people": 2,
  "budget": "medium",
  "cookingTime": "medium",
  "restrictions": 1,
  "daysCount": 7,
  "userId": "user123"
}
```

**Parameters:**
- `people` (number): Number of people (1-10)
- `budget` (string): Budget level ("low", "medium", "high")
- `cookingTime` (string): Cooking time preference ("quick", "medium", "slow")
- `restrictions` (number): Dietary restrictions level (0-5)
- `daysCount` (number): Number of days to generate (1-14)
- `userId` (string): User identifier

**Response:**
```json
{
  "success": true,
  "menu": {
    "id": "menu_123",
    "days": [
      {
        "day": 1,
        "date": "2024-07-30",
        "meals": {
          "breakfast": {
            "id": "breakfast_1",
            "name": "Porridge d'avoine aux fruits",
            "ingredients": ["avoine", "lait végétal", "banane"],
            "nutrition": {
              "calories": 350,
              "protein": 12,
              "carbs": 65,
              "fat": 8
            },
            "cookingTime": 15,
            "difficulty": "easy"
          }
        }
      }
    ],
    "summary": {
      "totalCost": 25.50,
      "avgCookingTime": 30,
      "nutritionScore": 85,
      "carbonFootprint": 2.1
    }
  }
}
```

#### GET /menu/recipes/:id
Get detailed information for a specific recipe

**Parameters:**
- `id` (string): Recipe identifier

**Response:**
```json
{
  "id": "breakfast_1",
  "name": "Porridge d'avoine aux fruits",
  "description": "Un petit-déjeuner nutritif et énergisant",
  "ingredients": [
    {
      "name": "avoine",
      "quantity": 50,
      "unit": "g",
      "nutrition": {
        "calories": 190,
        "protein": 6.9,
        "carbs": 34,
        "fat": 3.4
      }
    }
  ],
  "instructions": [
    "Faire chauffer le lait végétal",
    "Ajouter l'avoine et cuire 5 minutes",
    "Garnir avec les fruits"
  ],
  "nutrition": {
    "calories": 350,
    "protein": 12,
    "carbs": 65,
    "fat": 8,
    "fiber": 8,
    "vitamins": {
      "B1": 0.4,
      "B6": 0.1
    },
    "minerals": {
      "iron": 2.5,
      "magnesium": 75
    }
  },
  "cookingTime": 15,
  "difficulty": "easy",
  "tags": ["breakfast", "vegan", "healthy"]
}
```

#### POST /menu/swap-ingredient
Get ingredient swap recommendations

**Request Body:**
```json
{
  "recipeId": "breakfast_1",
  "ingredientToSwap": "avoine",
  "reason": "allergy"
}
```

**Response:**
```json
{
  "originalIngredient": "avoine",
  "alternatives": [
    {
      "name": "quinoa",
      "nutritionSimilarity": 85,
      "availabilityScore": 90,
      "recommendation": "Excellent alternative with complete proteins"
    },
    {
      "name": "sarrasin",
      "nutritionSimilarity": 78,
      "availabilityScore": 75,
      "recommendation": "Good option, gluten-free"
    }
  ]
}
```

### Nutrition Analysis

#### GET /nutrition/rnp-anses
Get ANSES RNP (French nutritional reference values) data

**Response:**
```json
{
  "macronutrients": {
    "protein": {
      "value": 0.83,
      "unit": "g/kg/day",
      "description": "Protein requirements per kg body weight"
    },
    "carbs": {
      "value": 130,
      "unit": "g/day",
      "description": "Minimum carbohydrate intake"
    }
  },
  "vitamins": {
    "B12": {
      "value": 2.4,
      "unit": "µg/day",
      "description": "Critical for vegans"
    }
  },
  "minerals": {
    "iron": {
      "value": 16,
      "unit": "mg/day",
      "description": "Higher needs for plant-based diets"
    }
  }
}
```

#### POST /nutrition/analyze
Analyze nutritional content of meals or ingredients

**Request Body:**
```json
{
  "items": [
    {
      "name": "avoine",
      "quantity": 50,
      "unit": "g"
    },
    {
      "name": "lait d'amande",
      "quantity": 200,
      "unit": "ml"
    }
  ]
}
```

**Response:**
```json
{
  "totalNutrition": {
    "calories": 250,
    "protein": 8,
    "carbs": 45,
    "fat": 6,
    "fiber": 6,
    "vitamins": {
      "B1": 0.3,
      "E": 2.1
    },
    "minerals": {
      "iron": 2.0,
      "calcium": 120
    }
  },
  "analysis": {
    "score": 82,
    "recommendations": [
      "Add vitamin B12 supplement",
      "Consider iron-rich foods"
    ],
    "strengths": ["High fiber", "Good protein content"],
    "warnings": ["Low in vitamin B12"]
  }
}
```

### User Profiles

#### POST /profile
Create or update user profile

**Request Body:**
```json
{
  "userId": "user123",
  "profile": {
    "age": 28,
    "gender": "female",
    "weight": 65,
    "height": 168,
    "activityLevel": "moderate",
    "goals": "maintain",
    "dietaryRestrictions": ["gluten-free"],
    "preferences": {
      "cuisineTypes": ["mediterranean", "asian"],
      "excludedIngredients": ["mushrooms"]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "profile_123",
    "userId": "user123",
    "createdAt": "2024-07-30T10:00:00.000Z",
    "updatedAt": "2024-07-30T10:00:00.000Z"
  }
}
```

#### GET /profile/:id
Get user profile information

**Response:**
```json
{
  "id": "profile_123",
  "userId": "user123",
  "age": 28,
  "gender": "female",
  "weight": 65,
  "height": 168,
  "activityLevel": "moderate",
  "goals": "maintain",
  "nutritionalNeeds": {
    "calories": 2000,
    "protein": 54,
    "carbs": 250,
    "fat": 67
  },
  "createdAt": "2024-07-30T10:00:00.000Z",
  "updatedAt": "2024-07-30T10:00:00.000Z"
}
```

#### POST /profile/:id/calculate-needs
Calculate nutritional needs based on profile

**Response:**
```json
{
  "userId": "user123",
  "calculatedNeeds": {
    "calories": 2000,
    "protein": 54,
    "carbs": 250,
    "fat": 67,
    "fiber": 25,
    "vitamins": {
      "B12": 2.4,
      "D": 15,
      "B1": 1.1
    },
    "minerals": {
      "iron": 16,
      "calcium": 1000,
      "zinc": 8
    }
  },
  "recommendations": [
    "Consider B12 supplementation",
    "Ensure adequate iron intake from legumes and fortified foods"
  ]
}
```

## Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Can be configured via environment variables

## CORS
The API supports CORS for frontend applications. Allowed origins can be configured via environment variables.

## Logging
All requests are logged with request ID for tracking and debugging purposes.

## Status Codes
- 200: Success
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Internal Server Error

## Example Usage

### Generate a menu with curl:
```bash
curl -X POST https://veganflemme-engine.onrender.com/api/menu/generate \
  -H "Content-Type: application/json" \
  -d '{
    "people": 2,
    "budget": "medium",
    "cookingTime": "medium",
    "restrictions": 1,
    "daysCount": 7,
    "userId": "demo_user"
  }'
```

### Check API health:
```bash
curl https://veganflemme-engine.onrender.com/api/health
```

## Support
For API support, please open an issue on the GitHub repository.