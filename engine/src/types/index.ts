/**
 * Centralized type definitions for VeganFlemme Menu Optimization System
 * Compatible with both current implementation and enhanced genetic algorithm
 */

// User and Profile Types
export interface NutritionProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals?: 'maintain' | 'lose' | 'gain';
  activityProfile?: {
    schedule?: Record<number, { workout?: { time: number } }>;
  };
}

export interface UserPreferences {
  people: number;
  budget: 'low' | 'medium' | 'high';
  cookingTime: 'quick' | 'medium' | 'long';
  cuisineTypes?: string[];
  mealTypes?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  daysCount?: number;
  restrictions?: number | string[];
  favoriteIngredients?: string[];
  dislikedIngredients?: string[];
  includeSnacks?: boolean;
}

export interface DietaryRestrictions {
  allergens: string[];
  intolerances: string[];
  preferences: string[];
  excludedIngredients: string[];
}

// Food and Nutrition Types
export interface NutrientProfile {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  magnesium: number;
  zinc: number;
  vitaminB12: number;
  vitaminD: number;
  vitaminB6: number;
  vitaminC?: number;
  folate: number;
  omega3: number;
  omega6: number;
  [key: string]: number | undefined;
}

export interface FoodItem {
  id: string;
  name: string;
  category?: string;
  categories?: string[];
  nutrition?: NutrientProfile;
  sustainability?: {
    carbonFootprint: number; // kg CO2 eq / 100g
    waterFootprint: number; // L / 100g
    ecoScore: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  };
  cost?: {
    pricePerKg: number; // €/kg
    availability: 'common' | 'specialty' | 'rare';
    organic: boolean;
  };
  constraints?: {
    cookingTime: number; // minutes
    difficulty: 'easy' | 'medium' | 'hard';
    storageTime: number; // days
  };
}

export interface Ingredient {
  name: string;
  amount: string;
  categories?: string[];
}

// Meal and Menu Types
export interface Meal {
  id: string;
  name: string;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutrition?: NutrientProfile;
  ingredients?: Ingredient[];
  instructions?: string[];
  servings?: number;
  cost?: number;
  carbonFootprint?: number;
  cookingTime?: number;
  preparationMethod?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  qualityScore?: {
    overallScore: number;
    nutriScore?: string;
    ecoScore?: string;
    novaGroup?: number;
  };
  recipeDetails?: {
    id: number;
    title: string;
    image?: string;
    sourceUrl?: string;
    servings?: number;
    readyInMinutes?: number;
    instructions?: any[];
    ingredients?: any[];
    nutrition?: Record<string, number>;
  };
}

export interface MenuDay {
  day: number;
  date: string;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
    morningSnack?: Meal;
    afternoonSnack?: Meal;
    [key: string]: Meal | undefined;
  };
}

export interface Menu {
  id: string;
  days: MenuDay[];
  summary: {
    totalCost: number;
    nutritionScore: number;
    carbonFootprint: number;
    averageQualityScore: number;
    dataSource?: string;
    nutritionBalance?: Record<string, any>;
  };
  generatedAt?: string;
  parameters?: any;
}

// Recipe Types (for backward compatibility)
export interface Recipe extends Meal {
  totalCookingTime?: number;
  totalNutrition?: NutrientProfile;
}

export interface OptimizedMenu {
  id?: string;
  days: MenuDay[];
  generatedAt?: string;
  parameters?: any;
}

// Menu Preferences (for backward compatibility)
export interface MenuPreferences {
  people: number;
  budget: 'low' | 'medium' | 'high';
  cookingTime: 'quick' | 'medium' | 'elaborate';
  cuisineTypes: string[];
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  daysCount: number;
}

// Optimization Types
export interface OptimizationResult {
  menu: Menu;
  analysis: {
    nutritionSummary: NutrientProfile;
    rnpCoverage: Record<string, number>;
    sustainability: {
      carbonFootprint: number;
      ecoRating: string;
    };
    totalCost: number;
    warnings: string[];
  };
  requirements: Record<string, number>;
  optimizationScore: number;
}

// ANSES RNP (for backward compatibility)
export const ANSES_RNP = {
  // Macronutriments (g/jour)
  protein: 0.83, // g/kg/jour - sera calculé selon le poids
  carbs: 130, // g/jour minimum
  fat: 35, // % de l'apport énergétique total
  fiber: 25, // g/jour
  
  // Micronutrients (mg/jour)
  iron: 11, // mg/jour (hommes), 16 (femmes)
  calcium: 950, // mg/jour
  magnesium: 375, // mg/jour (hommes), 300 (femmes)
  zinc: 11, // mg/jour (hommes), 8 (femmes)
  
  // Vitamines
  vitaminB12: 4, // μg/jour
  vitaminD: 15, // μg/jour
  vitaminB6: 1.4, // mg/jour
  folate: 330, // μg/jour
  
  // Acides gras essentiels
  omega3: 2.5, // g/jour (ALA)
  omega6: 10, // g/jour
  
  // Calories (kcal/jour) - sera calculé selon le profil
  calories: 2000 // valeur de base, ajustée selon le métabolisme
};

// Utility Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'morningSnack' | 'afternoonSnack';
export type BudgetLevel = 'low' | 'medium' | 'high';
export type CookingTimeLevel = 'quick' | 'medium' | 'long' | 'elaborate';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Gender = 'male' | 'female';
export type Goal = 'maintain' | 'lose' | 'gain';
export type QualityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Availability = 'common' | 'specialty' | 'rare';