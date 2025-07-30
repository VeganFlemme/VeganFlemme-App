import * as _math from 'mathjs';
import _ from 'lodash';
import { logger } from '../utils/logger';
import { EnhancedMenuOptimizationService } from './enhancedMenuOptimizationService';
import { UserPreferences } from '../types';

// ANSES RNP (Références Nutritionnelles pour la Population) - Moyennes adultes
export const ANSES_RNP = {
  // Macronutriments (g/jour)
  protein: 0.83, // g/kg/jour - sera calculé selon le poids
  carbs: 130, // g/jour minimum
  fat: 35, // % de l'apport énergétique total
  fiber: 25, // g/jour
  
  // Micronutriments (mg/jour)
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

export interface NutritionProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: 'maintain' | 'lose' | 'gain';
}

export interface DietaryRestrictions {
  allergens: string[];
  intolerances: string[];
  preferences: string[];
  excludedIngredients: string[];
}

export interface MenuPreferences {
  people: number;
  budget: 'low' | 'medium' | 'high';
  cookingTime: 'quick' | 'medium' | 'elaborate';
  cuisineTypes: string[];
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  daysCount: number;
}

export interface NutritionData {
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
  folate: number;
  omega3: number;
  omega6: number;
  [key: string]: number; // Index signature for dynamic access
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  nutrition: NutritionData;
  sustainability: {
    carbonFootprint: number; // kg CO2 eq / 100g
    waterFootprint: number; // L / 100g
    ecoScore: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  };
  cost: {
    pricePerKg: number; // €/kg
    availability: 'common' | 'specialty' | 'rare';
    organic: boolean;
  };
  constraints: {
    cookingTime: number; // minutes
    difficulty: 'easy' | 'medium' | 'hard';
    storageTime: number; // days
  };
}

export interface MenuDay {
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
}

export interface OptimizedMenu {
  id?: string;
  days: MenuDay[];
  generatedAt?: string;
  parameters?: any;
}

export interface Recipe {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: {
    foodId: string;
    quantity: number; // grammes
    optional: boolean;
  }[];
  instructions: string[];
  servings: number;
  totalNutrition?: any;
  totalCookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export class MenuOptimizationService {
  private foodDatabase: Map<string, FoodItem> = new Map();
  private recipeDatabase: Map<string, Recipe> = new Map();

  constructor() {
    this.initializeFoodDatabase();
    this.initializeRecipeDatabase();
  }

  /**
   * Calculate daily nutritional requirements based on user profile
   */
  private calculateRequirements(profile: NutritionProfile): any {
    // Calcul du métabolisme de base (Harris-Benedict révisé)
    let bmr: number;
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }

    // Facteur d'activité
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * activityFactors[profile.activityLevel];
    
    // Ajustement selon les objectifs
    let calorieTarget = tdee;
    if (profile.goals === 'lose') calorieTarget *= 0.8;
    if (profile.goals === 'gain') calorieTarget *= 1.15;

    return {
      calories: Math.round(calorieTarget),
      protein: Math.round(ANSES_RNP.protein * profile.weight),
      carbs: Math.max(ANSES_RNP.carbs, Math.round(calorieTarget * 0.45 / 4)),
      fat: Math.round(calorieTarget * 0.30 / 9),
      fiber: ANSES_RNP.fiber,
      iron: profile.gender === 'female' ? 16 : 11,
      calcium: ANSES_RNP.calcium,
      magnesium: profile.gender === 'female' ? 300 : 375,
      zinc: profile.gender === 'female' ? 8 : 11,
      vitaminB12: ANSES_RNP.vitaminB12,
      vitaminD: ANSES_RNP.vitaminD,
      vitaminB6: ANSES_RNP.vitaminB6,
      folate: ANSES_RNP.folate,
      omega3: ANSES_RNP.omega3,
      omega6: ANSES_RNP.omega6
    };
  }

  /**
   * Multi-objective optimization for menu generation
   */
  public async optimizeMenu(
    profile: NutritionProfile,
    preferences: MenuPreferences,
    restrictions: DietaryRestrictions
  ): Promise<any> {
    try {
      logger.info('Starting menu optimization', { profile, preferences });

      const requirements = this.calculateRequirements(profile);
      const filteredRecipes = this.filterRecipes(preferences, restrictions);
      
      // Algorithme d'optimisation multi-objectif
      const optimizedMenu = this.solveMenuOptimization(
        filteredRecipes,
        requirements,
        preferences
      );

      const menuAnalysis = this.analyzeMenu(optimizedMenu, requirements);

      return {
        menu: optimizedMenu,
        analysis: menuAnalysis,
        requirements,
        optimizationScore: this.calculateScore(optimizedMenu, requirements, preferences)
      };

    } catch (error) {
      logger.error('Menu optimization failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced Multi-Objective Menu Optimization using Claude AI Algorithm
   * This method provides the highest level of intelligence and added value for users
   */
  public async optimizeMenuEnhanced(
    profile: NutritionProfile,
    preferences: MenuPreferences,
    restrictions: DietaryRestrictions
  ): Promise<any> {
    try {
      logger.info('Starting enhanced menu optimization with Claude AI algorithm', { 
        profile: { age: profile.age, gender: profile.gender, weight: profile.weight },
        preferences: { budget: preferences.budget, cookingTime: preferences.cookingTime },
        daysCount: preferences.daysCount
      });

      // Convert to enhanced algorithm format
      const enhancedPreferences: UserPreferences = {
        people: preferences.people,
        budget: preferences.budget as 'low' | 'medium' | 'high',
        cookingTime: preferences.cookingTime === 'elaborate' ? 'long' : preferences.cookingTime as 'quick' | 'medium',
        cuisineTypes: preferences.cuisineTypes,
        mealTypes: preferences.mealTypes,
        daysCount: preferences.daysCount,
        restrictions: restrictions.allergens.length + restrictions.intolerances.length,
        favoriteIngredients: [],
        dislikedIngredients: restrictions.excludedIngredients,
        includeSnacks: preferences.mealTypes.includes('snack')
      };

      // Initialize enhanced optimization service
      const enhancedService = new EnhancedMenuOptimizationService();
      
      // Generate optimized menu using advanced genetic algorithm
      const enhancedMenu = enhancedService.generateOptimizedMenu(
        profile,
        enhancedPreferences,
        preferences.daysCount
      );

      // Calculate requirements for compatibility
      const requirements = this.calculateRequirements(profile);
      
      // Convert enhanced menu format to existing API format
      const compatibleMenu = this.convertEnhancedMenuToCompatible(enhancedMenu);
      
      // Analyze the enhanced menu
      const menuAnalysis = this.analyzeMenu(compatibleMenu, requirements);
      
      // Calculate enhanced optimization score
      const optimizationScore = Math.max(
        this.calculateScore(compatibleMenu, requirements, preferences),
        enhancedMenu.summary.nutritionScore / 100
      );

      logger.info('Enhanced menu optimization completed successfully', {
        optimizationScore: Math.round(optimizationScore * 100),
        nutritionScore: enhancedMenu.summary.nutritionScore,
        totalCost: enhancedMenu.summary.totalCost,
        dataSource: enhancedMenu.summary.dataSource
      });

      return {
        menu: {
          ...compatibleMenu,
          id: enhancedMenu.id,
          generatedAt: new Date().toISOString(),
          parameters: {
            profile,
            preferences,
            restrictions,
            algorithm: 'Enhanced Claude AI Genetic Algorithm',
            version: '2.0'
          },
          enhancedFeatures: {
            geneticAlgorithmGenerations: 200,
            simulatedAnnealingApplied: true,
            constraintSatisfactionEnforced: true,
            multiObjectiveOptimization: true,
            activityBasedTiming: !!profile.activityLevel,
            varietyOptimization: true
          }
        },
        analysis: {
          ...menuAnalysis,
          enhancedMetrics: {
            algorithmType: 'Genetic Algorithm + Simulated Annealing',
            populationSize: 100,
            generations: 200,
            fitnessComponents: {
              nutrition: 40,
              variety: 20,
              quality: 15,
              cost: 15,
              preferences: 10
            },
            dataSource: enhancedMenu.summary.dataSource
          }
        },
        requirements,
        optimizationScore: Math.round(optimizationScore * 100) / 100
      };

    } catch (error) {
      logger.error('Enhanced menu optimization failed, falling back to standard algorithm:', error);
      
      // Fallback to standard optimization
      return this.optimizeMenu(profile, preferences, restrictions);
    }
  }

  /**
   * Convert enhanced menu format to existing API format for compatibility
   */
  private convertEnhancedMenuToCompatible(enhancedMenu: any): OptimizedMenu {
    const compatibleMenu: OptimizedMenu = {
      id: enhancedMenu.id,
      days: [],
      generatedAt: new Date().toISOString(),
      parameters: enhancedMenu.parameters
    };

    // Convert enhanced menu days to compatible format
    for (const enhancedDay of enhancedMenu.days) {
      const compatibleDay: MenuDay = {
        breakfast: this.convertEnhancedMealToRecipe(enhancedDay.meals.breakfast, 'breakfast'),
        lunch: this.convertEnhancedMealToRecipe(enhancedDay.meals.lunch, 'lunch'),
        dinner: this.convertEnhancedMealToRecipe(enhancedDay.meals.dinner, 'dinner')
      };

      compatibleMenu.days.push(compatibleDay);
    }

    return compatibleMenu;
  }

  /**
   * Convert enhanced meal format to recipe format
   */
  private convertEnhancedMealToRecipe(enhancedMeal: any, category: 'breakfast' | 'lunch' | 'dinner'): Recipe {
    if (!enhancedMeal) {
      // Generate a basic recipe if enhanced meal is missing
      return {
        id: `fallback_${category}_${Date.now()}`,
        name: `Plat ${category}`,
        category,
        ingredients: [],
        instructions: ['Recette générée automatiquement'],
        servings: 2,
        totalCookingTime: 20,
        difficulty: 'easy'
      };
    }

    return {
      id: enhancedMeal.id || `${category}_${Date.now()}`,
      name: enhancedMeal.name || `Plat ${category}`,
      category,
      ingredients: (enhancedMeal.ingredients || []).map((ing: any) => ({
        foodId: ing.name.toLowerCase().replace(/\s+/g, '_'),
        quantity: this.parseQuantityFromAmount(ing.amount),
        optional: false
      })),
      instructions: enhancedMeal.instructions || [
        'Préparer les ingrédients selon les quantités indiquées',
        'Suivre les techniques de cuisson appropriées',
        'Assaisonner selon les goûts'
      ],
      servings: enhancedMeal.servings || 2,
      totalCookingTime: enhancedMeal.cookingTime || 20,
      difficulty: enhancedMeal.difficulty || 'easy',
      totalNutrition: enhancedMeal.nutrition
    };
  }

  /**
   * Parse quantity from enhanced meal amount string
   */
  private parseQuantityFromAmount(amount: string): number {
    const numMatch = amount.match(/(\d+)/);
    return numMatch ? parseInt(numMatch[1]) : 100; // Default to 100g
  }

  /**
   * Genetic Algorithm pour l'optimisation de menu
   */
  private solveMenuOptimization(
    recipes: Recipe[],
    requirements: Record<string, number>,
    preferences: MenuPreferences
  ): OptimizedMenu {
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;
    const eliteRate = 0.2;

    // Génération de population initiale
    let population = this.generateInitialPopulation(recipes, preferences, populationSize);

    for (let gen = 0; gen < generations; gen++) {
      // Évaluation fitness
      const fitness = population.map(individual => 
        this.evaluateFitness(individual, requirements, preferences)
      );

      // Sélection élite
      const elite = this.selectElite(population, fitness, eliteRate);

      // Génération nouvelle population
      const newPopulation = [...elite];
      
      while (newPopulation.length < populationSize) {
        const parent1 = this.tournamentSelection(population, fitness);
        const parent2 = this.tournamentSelection(population, fitness);
        const offspring = this.crossover(parent1, parent2);
        
        if (Math.random() < mutationRate) {
          this.mutate(offspring, recipes);
        }
        
        newPopulation.push(offspring);
      }

      population = newPopulation;
    }

    // Retourner le meilleur individu
    const finalFitness = population.map(individual => 
      this.evaluateFitness(individual, requirements, preferences)
    );
    const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
    
    return this.formatMenu(population[bestIndex], preferences);
  }

  /**
   * Fonction d'évaluation multi-critères
   */
  private evaluateFitness(menu: OptimizedMenu, requirements: Record<string, number>, preferences: MenuPreferences): number {
    const nutrition = this.calculateMenuNutrition(menu);
    
    // Score nutritionnel (50% du score total)
    const nutritionScore = this.calculateNutritionScore(nutrition, requirements);
    
    // Score économique (20% du score total)
    const costScore = this.calculateCostScore(menu, preferences.budget);
    
    // Score environnemental (20% du score total)
    const ecoScore = this.calculateEcoScore(menu);
    
    // Score variété (10% du score total)
    const varietyScore = this.calculateVarietyScore(menu);

    return (
      nutritionScore * 0.5 +
      costScore * 0.2 +
      ecoScore * 0.2 +
      varietyScore * 0.1
    );
  }

  /**
   * Score nutritionnel basé sur la conformité aux RNP ANSES
   */
  private calculateNutritionScore(nutrition: NutritionData, requirements: Record<string, number>): number {
    const nutrients = Object.keys(requirements);
    let totalScore = 0;

    for (const nutrient of nutrients) {
      const actual = nutrition[nutrient] || 0;
      const target = requirements[nutrient];
      
      // Pénalité pour déficit, bonus pour atteinte optimale
      let score: number;
      if (actual < target * 0.8) {
        score = (actual / target) * 0.8; // Pénalité forte pour déficit
      } else if (actual >= target * 0.8 && actual <= target * 1.2) {
        score = 1.0; // Score parfait dans la plage optimale
      } else {
        score = Math.max(0.6, 1.2 - (actual / target - 1.2)); // Pénalité modérée pour excès
      }
      
      totalScore += score;
    }

    return totalScore / nutrients.length;
  }

  // Méthodes auxiliaires pour l'algorithme génétique
  private generateInitialPopulation(recipes: Recipe[], preferences: MenuPreferences, size: number): OptimizedMenu[] {
    const population: OptimizedMenu[] = [];
    
    for (let i = 0; i < size; i++) {
      const individual = this.generateRandomMenu(recipes, preferences);
      population.push(individual);
    }
    
    return population;
  }

  private generateRandomMenu(recipes: Recipe[], preferences: MenuPreferences): OptimizedMenu {
    const menu: OptimizedMenu = {
      days: []
    };

    for (let day = 0; day < preferences.daysCount; day++) {
      const dayMenu: MenuDay = {
        breakfast: this.selectRandomRecipe(recipes, 'breakfast'),
        lunch: this.selectRandomRecipe(recipes, 'lunch'),
        dinner: this.selectRandomRecipe(recipes, 'dinner')
      };
      menu.days.push(dayMenu);
    }

    return menu;
  }

  private selectRandomRecipe(recipes: Recipe[], category: string): Recipe {
    const categoryRecipes = recipes.filter(r => r.category === category);
    return categoryRecipes[Math.floor(Math.random() * categoryRecipes.length)];
  }

  private tournamentSelection(population: OptimizedMenu[], fitness: number[]): OptimizedMenu {
    const tournamentSize = 3;
    let best = 0;
    
    for (let i = 1; i < tournamentSize; i++) {
      const challenger = Math.floor(Math.random() * population.length);
      if (fitness[challenger] > fitness[best]) {
        best = challenger;
      }
    }
    
    return population[best];
  }

  private crossover(parent1: OptimizedMenu, parent2: OptimizedMenu): OptimizedMenu {
    const offspring: OptimizedMenu = { days: [] };
    
    for (let i = 0; i < parent1.days.length; i++) {
      const day: MenuDay = {
        breakfast: Math.random() < 0.5 ? parent1.days[i].breakfast : parent2.days[i].breakfast,
        lunch: Math.random() < 0.5 ? parent1.days[i].lunch : parent2.days[i].lunch,
        dinner: Math.random() < 0.5 ? parent1.days[i].dinner : parent2.days[i].dinner
      };
      offspring.days.push(day);
    }
    
    return offspring;
  }

  private mutate(individual: OptimizedMenu, recipes: Recipe[]): void {
    const dayIndex = Math.floor(Math.random() * individual.days.length);
    const mealTypes = ['breakfast', 'lunch', 'dinner'] as const;
    const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
    
    individual.days[dayIndex][mealType] = this.selectRandomRecipe(recipes, mealType);
  }

  private selectElite(population: OptimizedMenu[], fitness: number[], rate: number): OptimizedMenu[] {
    const eliteSize = Math.floor(population.length * rate);
    const indexed = fitness.map((f, i) => ({ fitness: f, index: i }));
    indexed.sort((a, b) => b.fitness - a.fitness);
    
    return indexed.slice(0, eliteSize).map(item => population[item.index]);
  }

  // Méthodes utilitaires
  private filterRecipes(preferences: MenuPreferences, restrictions: DietaryRestrictions): Recipe[] {
    return Array.from(this.recipeDatabase.values()).filter(recipe => {
      // Filtrage par temps de cuisson
      if (preferences.cookingTime === 'quick' && recipe.totalCookingTime > 20) return false;
      if (preferences.cookingTime === 'medium' && recipe.totalCookingTime > 45) return false;
      
      // Filtrage par allergènes et intolérances
      const recipeIngredients = recipe.ingredients.map(ing => 
        this.foodDatabase.get(ing.foodId)?.name || ''
      );
      
      for (const allergen of restrictions.allergens) {
        if (recipeIngredients.some(ing => ing.toLowerCase().includes(allergen.toLowerCase()))) {
          return false;
        }
      }
      
      return true;
    });
  }

  private calculateMenuNutrition(menu: OptimizedMenu): NutritionData {
    const totalNutrition: NutritionData = {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
      iron: 0, calcium: 0, magnesium: 0, zinc: 0,
      vitaminB12: 0, vitaminD: 0, vitaminB6: 0, folate: 0,
      omega3: 0, omega6: 0
    };

    for (const day of menu.days) {
      for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
        const recipe = day[mealType];
        if (recipe) {
          const recipeNutrition = this.calculateRecipeNutrition(recipe);
          for (const nutrient of Object.keys(totalNutrition)) {
            totalNutrition[nutrient] += recipeNutrition[nutrient] || 0;
          }
        }
      }
    }

    return totalNutrition;
  }

  private calculateRecipeNutrition(recipe: Recipe): NutritionData {
    const nutrition: NutritionData = {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
      iron: 0, calcium: 0, magnesium: 0, zinc: 0,
      vitaminB12: 0, vitaminD: 0, vitaminB6: 0, folate: 0,
      omega3: 0, omega6: 0
    };

    for (const ingredient of recipe.ingredients) {
      const food = this.foodDatabase.get(ingredient.foodId);
      if (food) {
        const factor = ingredient.quantity / 100; // conversion pour 100g de base
        for (const nutrient of Object.keys(nutrition)) {
          nutrition[nutrient] += (food.nutrition[nutrient] || 0) * factor;
        }
      }
    }

    return nutrition;
  }

  private calculateCostScore(menu: OptimizedMenu, budget: 'low' | 'medium' | 'high'): number {
    const totalCost = this.calculateMenuCost(menu);
    const budgetLimits: Record<string, number> = { low: 50, medium: 80, high: 120 };
    const limit = budgetLimits[budget];
    
    return Math.max(0, 1 - Math.max(0, totalCost - limit) / limit);
  }

  private calculateMenuCost(menu: OptimizedMenu): number {
    let totalCost = 0;
    
    for (const day of menu.days) {
      for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
        const recipe = day[mealType];
        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            const food = this.foodDatabase.get(ingredient.foodId);
            if (food) {
              totalCost += (food.cost.pricePerKg / 1000) * ingredient.quantity;
            }
          }
        }
      }
    }
    
    return totalCost;
  }

  private calculateEcoScore(menu: OptimizedMenu): number {
    let totalCarbon = 0;
    let itemCount = 0;
    
    for (const day of menu.days) {
      for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
        const recipe = day[mealType];
        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            const food = this.foodDatabase.get(ingredient.foodId);
            if (food) {
              totalCarbon += food.sustainability.carbonFootprint * (ingredient.quantity / 100);
              itemCount++;
            }
          }
        }
      }
    }
    
    const avgCarbon = totalCarbon / itemCount;
    return Math.max(0, 1 - avgCarbon / 5); // Normalisation autour de 5kg CO2/100g
  }

  private calculateVarietyScore(menu: OptimizedMenu): number {
    const uniqueRecipes = new Set();
    const uniqueIngredients = new Set();
    
    for (const day of menu.days) {
      for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
        const recipe = day[mealType];
        if (recipe) {
          uniqueRecipes.add(recipe.id);
          for (const ingredient of recipe.ingredients) {
            uniqueIngredients.add(ingredient.foodId);
          }
        }
      }
    }
    
    const totalMeals = menu.days.length * 3;
    const varietyScore = (uniqueRecipes.size / totalMeals) * 0.6 + 
                        (uniqueIngredients.size / 50) * 0.4; // Normalisation
    
    return Math.min(1, varietyScore);
  }

  private analyzeMenu(menu: OptimizedMenu, requirements: Record<string, number>): any {
    const nutrition = this.calculateMenuNutrition(menu);
    const rnpCoverage: Record<string, number> = {};
    
    for (const [nutrient, value] of Object.entries(nutrition)) {
      const requirement = requirements[nutrient] || 1;
      rnpCoverage[nutrient] = Math.round((value / requirement) * 100);
    }
    
    return {
      nutritionSummary: nutrition,
      rnpCoverage,
      totalCost: this.calculateMenuCost(menu),
      sustainability: {
        carbonFootprint: this.calculateTotalCarbon(menu),
        ecoRating: this.getAverageEcoRating(menu)
      },
      warnings: this.generateNutritionalWarnings(rnpCoverage)
    };
  }

  private generateNutritionalWarnings(coverage: Record<string, number>): string[] {
    const warnings = [];
    
    for (const [nutrient, percentage] of Object.entries(coverage)) {
      if (percentage < 80) {
        warnings.push(`Apport insuffisant en ${nutrient} (${percentage}% des RNP)`);
      } else if (percentage > 150) {
        warnings.push(`Apport excessif en ${nutrient} (${percentage}% des RNP)`);
      }
    }
    
    return warnings;
  }

  private calculateTotalCarbon(menu: OptimizedMenu): number {
    let totalCarbon = 0;
    
    for (const day of menu.days) {
      for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
        const recipe = day[mealType];
        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            const food = this.foodDatabase.get(ingredient.foodId);
            if (food) {
              totalCarbon += food.sustainability.carbonFootprint * (ingredient.quantity / 100);
            }
          }
        }
      }
    }
    
    return Math.round(totalCarbon * 100) / 100;
  }

  private getAverageEcoRating(menu: OptimizedMenu): string {
    const scores = { 'A+': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0 };
    let totalScore = 0;
    let count = 0;
    
    for (const day of menu.days) {
      for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
        const recipe = day[mealType];
        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            const food = this.foodDatabase.get(ingredient.foodId);
            if (food) {
              totalScore += scores[food.sustainability.ecoScore];
              count++;
            }
          }
        }
      }
    }
    
    const avgScore = totalScore / count;
    const ratings = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    for (const [rating, score] of ratings) {
      if (avgScore >= score - 0.5) return rating;
    }
    
    return 'E';
  }

  private calculateScore(menu: OptimizedMenu, requirements: Record<string, number>, preferences: MenuPreferences): number {
    return this.evaluateFitness(menu, requirements, preferences);
  }

  private formatMenu(optimizedMenu: OptimizedMenu, preferences: MenuPreferences): any {
    const formattedMenu = {
      id: `menu_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      parameters: preferences,
      days: [] as any[]
    };

    for (let i = 0; i < optimizedMenu.days.length; i++) {
      const day = optimizedMenu.days[i];
      formattedMenu.days.push({
        dayNumber: i + 1,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        meals: {
          breakfast: this.formatMeal(day.breakfast),
          lunch: this.formatMeal(day.lunch),
          dinner: this.formatMeal(day.dinner)
        }
      });
    }

    return formattedMenu;
  }

  private formatMeal(recipe: Recipe): any {
    if (!recipe) return null;
    
    return {
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      cookingTime: recipe.totalCookingTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      nutrition: this.calculateRecipeNutrition(recipe),
      ingredients: recipe.ingredients.map(ing => {
        const food = this.foodDatabase.get(ing.foodId);
        return {
          name: food?.name || 'Unknown',
          quantity: ing.quantity,
          unit: 'g',
          organic: food?.cost.organic || false
        };
      }),
      instructions: recipe.instructions
    };
  }

  // Base de données d'aliments (version simplifiée pour démo)
  private initializeFoodDatabase(): void {
    const foods: FoodItem[] = [
      {
        id: 'avoine',
        name: 'Flocons d\'avoine',
        category: 'cereals',
        nutrition: {
          calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6,
          iron: 4.7, calcium: 54, magnesium: 177, zinc: 4.0,
          vitaminB12: 0, vitaminD: 0, vitaminB6: 0.12, folate: 56,
          omega3: 0.11, omega6: 2.4
        },
        sustainability: { carbonFootprint: 0.9, waterFootprint: 1700, ecoScore: 'A' },
        cost: { pricePerKg: 3.2, availability: 'common', organic: true },
        constraints: { cookingTime: 5, difficulty: 'easy', storageTime: 365 }
      },
      {
        id: 'quinoa',
        name: 'Quinoa',
        category: 'cereals',
        nutrition: {
          calories: 368, protein: 14.1, carbs: 64.2, fat: 6.1, fiber: 7.0,
          iron: 4.6, calcium: 47, magnesium: 197, zinc: 3.1,
          vitaminB12: 0, vitaminD: 0, vitaminB6: 0.49, folate: 184,
          omega3: 0.26, omega6: 2.98
        },
        sustainability: { carbonFootprint: 1.2, waterFootprint: 3500, ecoScore: 'B' },
        cost: { pricePerKg: 8.5, availability: 'common', organic: true },
        constraints: { cookingTime: 15, difficulty: 'easy', storageTime: 730 }
      },
      {
        id: 'lentilles_corail',
        name: 'Lentilles corail',
        category: 'legumes',
        nutrition: {
          calories: 325, protein: 23.9, carbs: 56.3, fat: 1.1, fiber: 10.7,
          iron: 7.6, calcium: 35, magnesium: 122, zinc: 2.4,
          vitaminB12: 0, vitaminD: 0, vitaminB6: 0.54, folate: 181,
          omega3: 0.07, omega6: 0.63
        },
        sustainability: { carbonFootprint: 0.7, waterFootprint: 1250, ecoScore: 'A+' },
        cost: { pricePerKg: 4.8, availability: 'common', organic: true },
        constraints: { cookingTime: 15, difficulty: 'easy', storageTime: 730 }
      },
      {
        id: 'tofu_ferme',
        name: 'Tofu ferme',
        category: 'proteines',
        nutrition: {
          calories: 144, protein: 17.3, carbs: 0.8, fat: 8.7, fiber: 2.3,
          iron: 2.7, calcium: 350, magnesium: 58, zinc: 1.6,
          vitaminB12: 0, vitaminD: 0, vitaminB6: 0.1, folate: 15,
          omega3: 0.6, omega6: 4.2
        },
        sustainability: { carbonFootprint: 1.0, waterFootprint: 300, ecoScore: 'A' },
        cost: { pricePerKg: 7.2, availability: 'common', organic: true },
        constraints: { cookingTime: 10, difficulty: 'easy', storageTime: 7 }
      },
      {
        id: 'epinards',
        name: 'Épinards frais',
        category: 'legumes_verts',
        nutrition: {
          calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2,
          iron: 2.7, calcium: 99, magnesium: 79, zinc: 0.5,
          vitaminB12: 0, vitaminD: 0, vitaminB6: 0.2, folate: 194,
          omega3: 0.14, omega6: 0.03
        },
        sustainability: { carbonFootprint: 0.2, waterFootprint: 20, ecoScore: 'A+' },
        cost: { pricePerKg: 6.5, availability: 'common', organic: true },
        constraints: { cookingTime: 3, difficulty: 'easy', storageTime: 3 }
      },
      {
        id: 'avocat',
        name: 'Avocat',
        category: 'fruits',
        nutrition: {
          calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7,
          iron: 0.6, calcium: 12, magnesium: 29, zinc: 0.6,
          vitaminB12: 0, vitaminD: 0, vitaminB6: 0.3, folate: 20,
          omega3: 0.11, omega6: 1.7
        },
        sustainability: { carbonFootprint: 0.6, waterFootprint: 320, ecoScore: 'B' },
        cost: { pricePerKg: 8.9, availability: 'common', organic: true },
        constraints: { cookingTime: 0, difficulty: 'easy', storageTime: 5 }
      }
    ];

    foods.forEach(food => this.foodDatabase.set(food.id, food));
  }

  private initializeRecipeDatabase(): void {
    const recipes: Recipe[] = [
      {
        id: 'porridge_avoine',
        name: 'Porridge avoine aux fruits rouges',
        category: 'breakfast',
        ingredients: [
          { foodId: 'avoine', quantity: 80, optional: false }
        ],
        instructions: [
          'Porter le lait végétal à ébullition',
          'Ajouter les flocons d\'avoine et cuire 5 minutes',
          'Incorporer les fruits et servir'
        ],
        servings: 2,
        totalCookingTime: 10,
        difficulty: 'easy'
      },
      {
        id: 'bowl_quinoa',
        name: 'Bowl Buddha quinoa et légumes',
        category: 'lunch',
        ingredients: [
          { foodId: 'quinoa', quantity: 100, optional: false },
          { foodId: 'tofu_ferme', quantity: 150, optional: false },
          { foodId: 'avocat', quantity: 100, optional: false },
          { foodId: 'epinards', quantity: 80, optional: false }
        ],
        instructions: [
          'Cuire le quinoa selon les instructions',
          'Faire griller le tofu en dés',
          'Dresser le bowl avec tous les ingrédients'
        ],
        servings: 2,
        totalCookingTime: 25,
        difficulty: 'medium'
      },
      {
        id: 'curry_lentilles',
        name: 'Curry de lentilles corail',
        category: 'dinner',
        ingredients: [
          { foodId: 'lentilles_corail', quantity: 200, optional: false },
          { foodId: 'epinards', quantity: 100, optional: false }
        ],
        instructions: [
          'Cuire les lentilles avec du lait de coco',
          'Ajouter les épices et les épinards',
          'Laisser mijoter 10 minutes'
        ],
        servings: 2,
        totalCookingTime: 20,
        difficulty: 'easy'
      }
    ];

    recipes.forEach(recipe => this.recipeDatabase.set(recipe.id, recipe));
  }
}