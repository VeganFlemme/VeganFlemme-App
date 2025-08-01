import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
  servings: number;
  readyInMinutes: number;
  license?: string;
  sourceName?: string;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
  aggregateLikes?: number;
  healthScore?: number;
  spoonacularScore?: number;
  pricePerServing?: number;
  analyzedInstructions?: any[];
  cheap?: boolean;
  creditsText?: string;
  cuisines?: string[];
  dairyFree?: boolean;
  diets?: string[];
  gaps?: string;
  glutenFree?: boolean;
  instructions?: string;
  ketogenic?: boolean;
  lowFodmap?: boolean;
  occasions?: string[];
  sustainable?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  veryHealthy?: boolean;
  veryPopular?: boolean;
  whole30?: boolean;
  weightWatcherSmartPoints?: number;
  dishTypes?: string[];
  extendedIngredients?: SpoonacularIngredient[];
  summary?: string;
  nutrition?: SpoonacularNutrition;
}

export interface SpoonacularIngredient {
  id: number;
  aisle?: string;
  image?: string;
  consistency?: string;
  name: string;
  nameClean?: string;
  original: string;
  originalName?: string;
  amount: number;
  unit: string;
  meta?: string[];
  measures?: {
    us?: { amount: number; unitShort: string; unitLong: string };
    metric?: { amount: number; unitShort: string; unitLong: string };
  };
}

export interface SpoonacularNutrition {
  nutrients: SpoonacularNutrient[];
  properties?: SpoonacularNutrient[];
  flavonoids?: SpoonacularNutrient[];
  ingredients?: any[];
  caloricBreakdown?: {
    percentProtein: number;
    percentFat: number;
    percentCarbs: number;
  };
  weightPerServing?: {
    amount: number;
    unit: string;
  };
}

export interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds?: number;
}

export interface SpoonacularSearchResponse {
  results: SpoonacularRecipe[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface SpoonacularRecipeSearchParams {
  query?: string;
  diet?: string;
  excludeIngredients?: string;
  includeIngredients?: string;
  intolerances?: string;
  equipment?: string;
  type?: string;
  instructionsRequired?: boolean;
  fillIngredients?: boolean;
  addRecipeInformation?: boolean;
  addRecipeNutrition?: boolean;
  author?: string;
  tags?: string;
  number?: number;
  limitLicense?: boolean;
  ranking?: number;
  ignorePantry?: boolean;
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  minCarbs?: number;
  maxCarbs?: number;
  minProtein?: number;
  maxProtein?: number;
  minCalories?: number;
  maxCalories?: number;
  minFat?: number;
  maxFat?: number;
  minAlcohol?: number;
  maxAlcohol?: number;
  minCaffeine?: number;
  maxCaffeine?: number;
  minCopper?: number;
  maxCopper?: number;
  minCalcium?: number;
  maxCalcium?: number;
  minCholine?: number;
  maxCholine?: number;
  minCholesterol?: number;
  maxCholesterol?: number;
  minFluoride?: number;
  maxFluoride?: number;
  minSaturatedFat?: number;
  maxSaturatedFat?: number;
  minVitaminA?: number;
  maxVitaminA?: number;
  minVitaminC?: number;
  maxVitaminC?: number;
  minVitaminD?: number;
  maxVitaminD?: number;
  minVitaminE?: number;
  maxVitaminE?: number;
  minVitaminK?: number;
  maxVitaminK?: number;
  minVitaminB1?: number;
  maxVitaminB1?: number;
  minVitaminB2?: number;
  maxVitaminB2?: number;
  minVitaminB5?: number;
  maxVitaminB5?: number;
  minVitaminB3?: number;
  maxVitaminB3?: number;
  minVitaminB6?: number;
  maxVitaminB6?: number;
  minVitaminB12?: number;
  maxVitaminB12?: number;
  minFiber?: number;
  maxFiber?: number;
  minFolate?: number;
  maxFolate?: number;
  minFolicAcid?: number;
  maxFolicAcid?: number;
  minIodine?: number;
  maxIodine?: number;
  minIron?: number;
  maxIron?: number;
  minMagnesium?: number;
  maxMagnesium?: number;
  minManganese?: number;
  maxManganese?: number;
  minPhosphorus?: number;
  maxPhosphorus?: number;
  minPotassium?: number;
  maxPotassium?: number;
  minSelenium?: number;
  maxSelenium?: number;
  minSodium?: number;
  maxSodium?: number;
  minSugar?: number;
  maxSugar?: number;
  minZinc?: number;
  maxZinc?: number;
  offset?: number;
  maxReadyTime?: number;
  minReadyTime?: number;
}

/**
 * Enhanced Spoonacular Service for recipe search and nutritional data
 * Focused on vegan recipes with comprehensive nutritional information
 */
export class SpoonacularService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private cache: Map<string, any> = new Map();
  private defaultCacheTTL: number = 60 * 60 * 1000; // 1 hour

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SPOONACULAR_API_KEY || '';
    
    if (!this.apiKey) {
      logger.warn('Spoonacular API key not provided. Service will be limited.');
    }

    this.axiosInstance = axios.create({
      baseURL: 'https://api.spoonacular.com',
      timeout: 15000,
      headers: {
        'User-Agent': 'VeganFlemme-App/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to add API key
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.apiKey) {
        config.params = { ...config.params, apiKey: this.apiKey };
      }
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 402) {
          logger.error('Spoonacular API quota exceeded');
        } else if (error.response?.status === 401) {
          logger.error('Spoonacular API key invalid');
        }
        throw error;
      }
    );

    logger.info('Spoonacular Service initialized', { 
      hasApiKey: !!this.apiKey 
    });
  }

  /**
   * Search for vegan recipes with comprehensive filters
   */
  async searchVeganRecipes(params: SpoonacularRecipeSearchParams): Promise<SpoonacularSearchResponse> {
    if (!this.apiKey) {
      throw new Error('Spoonacular API key required for recipe search');
    }

    const cacheKey = `search:${JSON.stringify(params)}`;
    
    // Try cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.info('Retrieved search results from cache', { paramsKeys: Object.keys(params) });
      return cached;
    }

    try {
      // Ensure we're searching for vegan recipes
      const searchParams: SpoonacularRecipeSearchParams = {
        ...params,
        diet: 'vegan',
        addRecipeInformation: true,
        addRecipeNutrition: true,
        instructionsRequired: true,
        number: params.number || 12,
        sort: params.sort || 'healthiness',
        fillIngredients: true
      };

      logger.info('Searching vegan recipes', { searchParams: Object.keys(searchParams) });

      const response = await this.axiosInstance.get('/recipes/complexSearch', {
        params: searchParams
      });

      // Cache results
      this.setCache(cacheKey, response.data);

      logger.info('Vegan recipes search completed', {
        totalResults: response.data.totalResults,
        returnedResults: response.data.results?.length || 0
      });

      return response.data;
    } catch (error) {
      logger.error('Error searching vegan recipes', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params: Object.keys(params)
      });
      throw new Error(`Failed to search vegan recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed recipe information by ID
   */
  async getRecipeById(id: number, includeNutrition: boolean = true): Promise<SpoonacularRecipe> {
    if (!this.apiKey) {
      throw new Error('Spoonacular API key required');
    }

    const cacheKey = `recipe:${id}:${includeNutrition}`;
    
    // Try cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.info('Retrieved recipe from cache', { id });
      return cached;
    }

    try {
      logger.info('Fetching recipe details', { id, includeNutrition });

      const response = await this.axiosInstance.get(`/recipes/${id}/information`, {
        params: {
          includeNutrition
        }
      });

      // Validate recipe is actually vegan
      if (!this.validateVeganRecipe(response.data)) {
        logger.warn('Recipe marked as vegan but contains non-vegan ingredients', { id });
      }

      // Cache results
      this.setCache(cacheKey, response.data);

      logger.info('Recipe details retrieved', {
        id,
        title: response.data.title,
        servings: response.data.servings,
        readyInMinutes: response.data.readyInMinutes,
        vegan: response.data.vegan
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching recipe details', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to fetch recipe ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get multiple recipes by IDs (bulk fetch)
   */
  async getRecipesByIds(ids: number[], includeNutrition: boolean = true): Promise<SpoonacularRecipe[]> {
    if (!this.apiKey) {
      throw new Error('Spoonacular API key required');
    }

    if (ids.length === 0) {
      return [];
    }

    try {
      logger.info('Fetching multiple recipes', { count: ids.length, includeNutrition });

      const response = await this.axiosInstance.get('/recipes/informationBulk', {
        params: {
          ids: ids.join(','),
          includeNutrition
        }
      });

      const recipes = response.data;

      // Validate each recipe is vegan
      const veganRecipes = recipes.filter((recipe: SpoonacularRecipe) => {
        const isVegan = this.validateVeganRecipe(recipe);
        if (!isVegan) {
          logger.warn('Recipe marked as vegan but contains non-vegan ingredients', { 
            id: recipe.id, 
            title: recipe.title 
          });
        }
        return isVegan;
      });

      logger.info('Multiple recipes retrieved', {
        requested: ids.length,
        received: recipes.length,
        veganValidated: veganRecipes.length
      });

      return veganRecipes;
    } catch (error) {
      logger.error('Error fetching multiple recipes', {
        ids,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to fetch recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search recipes by nutrients (for meal planning)
   */
  async searchRecipesByNutrients(
    minCalories?: number,
    maxCalories?: number,
    minProtein?: number,
    maxProtein?: number,
    minCarbs?: number,
    maxCarbs?: number,
    minFat?: number,
    maxFat?: number,
    type?: string,
    number: number = 10
  ): Promise<SpoonacularSearchResponse> {
    const params: SpoonacularRecipeSearchParams = {
      diet: 'vegan',
      type,
      number,
      addRecipeInformation: true,
      addRecipeNutrition: true,
      instructionsRequired: true,
      sort: 'healthiness'
    };

    if (minCalories) params.minCalories = minCalories;
    if (maxCalories) params.maxCalories = maxCalories;
    if (minProtein) params.minProtein = minProtein;
    if (maxProtein) params.maxProtein = maxProtein;
    if (minCarbs) params.minCarbs = minCarbs;
    if (maxCarbs) params.maxCarbs = maxCarbs;
    if (minFat) params.minFat = minFat;
    if (maxFat) params.maxFat = maxFat;

    return this.searchVeganRecipes(params);
  }

  /**
   * Get random vegan recipes
   */
  async getRandomVeganRecipes(
    number: number = 10,
    tags?: string[],
    excludeIngredients?: string[]
  ): Promise<{ recipes: SpoonacularRecipe[] }> {
    if (!this.apiKey) {
      throw new Error('Spoonacular API key required');
    }

    const cacheKey = `random:${number}:${tags?.join(',')}:${excludeIngredients?.join(',')}`;
    
    // Try cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.info('Retrieved random recipes from cache', { number });
      return cached;
    }

    try {
      const params: any = {
        limitLicense: true,
        tags: tags ? ['vegan', ...tags].join(',') : 'vegan',
        number,
        include_nutrition: true
      };

      if (excludeIngredients && excludeIngredients.length > 0) {
        params['exclude-ingredients'] = excludeIngredients.join(',');
      }

      logger.info('Fetching random vegan recipes', { number, tags, excludeIngredients });

      const response = await this.axiosInstance.get('/recipes/random', {
        params
      });

      // Filter to ensure all recipes are truly vegan
      const veganRecipes = response.data.recipes.filter((recipe: SpoonacularRecipe) => 
        this.validateVeganRecipe(recipe)
      );

      const result = { recipes: veganRecipes };

      // Cache results
      this.setCache(cacheKey, result);

      logger.info('Random vegan recipes retrieved', {
        requested: number,
        received: response.data.recipes?.length || 0,
        veganValidated: veganRecipes.length
      });

      return result;
    } catch (error) {
      logger.error('Error fetching random vegan recipes', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to fetch random vegan recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that a recipe is truly vegan
   */
  public validateVeganRecipe(recipe: SpoonacularRecipe): boolean {
    if (!recipe) return false;

    // First check the vegan flag
    if (recipe.vegan === false) return false;

    // Check ingredients for non-vegan items
    if (recipe.extendedIngredients) {
      const nonVeganKeywords = [
        'meat', 'beef', 'chicken', 'pork', 'lamb', 'fish', 'seafood', 'salmon',
        'tuna', 'milk', 'cream', 'cheese', 'butter', 'yogurt', 'egg', 'honey',
        'gelatin', 'lard', 'whey', 'casein', 'lactose', 'ghee', 'mayo', 'mayonnaise'
      ];

      for (const ingredient of recipe.extendedIngredients) {
        const name = ingredient.name.toLowerCase();
        const original = ingredient.original.toLowerCase();

        // Skip if it's explicitly a vegan alternative
        if (name.includes('vegan') || 
            name.includes('plant-based') || 
            name.includes('dairy-free') ||
            name.includes('non-dairy') ||
            original.includes('vegan') || 
            original.includes('plant-based')) {
          continue;
        }

        // Check for non-vegan keywords
        for (const keyword of nonVeganKeywords) {
          if (name.includes(keyword) || original.includes(keyword)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Extract standardized nutrition information from Spoonacular recipe
   */
  public extractNutritionInfo(recipe: SpoonacularRecipe): Record<string, number> {
    if (!recipe.nutrition?.nutrients) {
      return {};
    }

    const nutrition: Record<string, number> = {};
    
    // Map Spoonacular nutrient names to standardized names
    const nutrientMap: Record<string, string> = {
      'Calories': 'calories',
      'Protein': 'protein',
      'Fat': 'fat',
      'Carbohydrates': 'carbohydrates',
      'Fiber': 'fiber',
      'Sugar': 'sugar',
      'Sodium': 'sodium',
      'Calcium': 'calcium',
      'Iron': 'iron',
      'Magnesium': 'magnesium',
      'Phosphorus': 'phosphorus',
      'Potassium': 'potassium',
      'Zinc': 'zinc',
      'Vitamin A': 'vitaminA',
      'Vitamin C': 'vitaminC',
      'Vitamin D': 'vitaminD',
      'Vitamin E': 'vitaminE',
      'Vitamin K': 'vitaminK',
      'Vitamin B1': 'vitaminB1',
      'Vitamin B2': 'vitaminB2',
      'Vitamin B3': 'vitaminB3',
      'Vitamin B6': 'vitaminB6',
      'Vitamin B12': 'vitaminB12',
      'Folate': 'vitaminB9',
      'Selenium': 'selenium',
      'Manganese': 'manganese',
      'Copper': 'copper',
      'Saturated Fat': 'saturatedFat',
      'Mono Unsaturated Fat': 'monounsaturatedFat',
      'Poly Unsaturated Fat': 'polyunsaturatedFat'
    };

    for (const nutrient of recipe.nutrition.nutrients) {
      const standardName = nutrientMap[nutrient.name];
      if (standardName) {
        nutrition[standardName] = nutrient.amount;
      }
    }

    return nutrition;
  }

  /**
   * Check if service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      // Simple test request
      await this.axiosInstance.get('/recipes/random', {
        params: { number: 1, tags: 'vegan' }
      });
      return true;
    } catch (error) {
      logger.warn('Spoonacular service unavailable', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (entry.expiry < now) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache(key: string, data: any): void {
    const entry = {
      data,
      expiry: Date.now() + this.defaultCacheTTL
    };
    this.cache.set(key, entry);
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Spoonacular cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      entries: this.cache.size,
      hasApiKey: !!this.apiKey
    };
  }
}

// Export singleton instance
export const spoonacularService = new SpoonacularService();