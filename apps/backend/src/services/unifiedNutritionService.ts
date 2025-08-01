import { logger } from '../utils/logger';
import { enhancedOpenFoodFactsService, OpenFoodFactsProduct } from './enhancedOpenFoodFactsService';
import { spoonacularService, SpoonacularRecipe } from './spoonacularService';

export interface UnifiedNutritionData {
  energy: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  salt?: number;
  minerals: {
    calcium?: number;
    iron?: number;
    magnesium?: number;
    phosphorus?: number;
    potassium?: number;
    sodium?: number;
    zinc?: number;
  };
  vitamins: {
    c?: number;
    b1?: number;
    b2?: number;
    b3?: number;
    b6?: number;
    b9?: number;
    b12?: number;
    a?: number;
    d?: number;
    e?: number;
    k?: number;
  };
  qualityScores?: {
    nutriScore?: string;
    ecoScore?: string;
    novaGroup?: number;
  };
}

export interface UnifiedFoodItem {
  id: string;
  name: string;
  nameEn?: string;
  brands?: string;
  group?: string;
  subGroup?: string;
  ingredients?: string;
  image?: string;
  nutrition: UnifiedNutritionData;
  dataSource: 'openfoodfacts' | 'spoonacular' | 'user_input';
  confidence: number; // 0-1 score for data quality
  barcode?: string;
}

export interface UnifiedSearchResult {
  items: UnifiedFoodItem[];
  total: number;
  dataSources: {
    openfoodfacts: number;
    spoonacular: number;
    user_input: number;
  };
}

/**
 * Unified Nutrition Service that combines OpenFoodFacts and Spoonacular data
 * This service provides comprehensive nutrition data with smart fallback mechanisms
 */
export class UnifiedNutritionService {
  private openFoodFactsAvailable: boolean = false;
  private spoonacularAvailable: boolean = false;

  constructor() {
    logger.info('Unified Nutrition Service initializing');
  }

  /**
   * Initialize all underlying services
   */
  async initialize(): Promise<void> {
    logger.info('Initializing nutrition databases');
    
    // Check OpenFoodFacts availability
    try {
      this.openFoodFactsAvailable = await enhancedOpenFoodFactsService.isServiceAvailable();
      logger.info('OpenFoodFacts availability checked', { available: this.openFoodFactsAvailable });
    } catch (error) {
      logger.warn('OpenFoodFacts availability check failed', { error });
      this.openFoodFactsAvailable = false;
    }

    // Check Spoonacular availability
    try {
      this.spoonacularAvailable = await spoonacularService.isServiceAvailable();
      logger.info('Spoonacular availability checked', { available: this.spoonacularAvailable });
    } catch (error) {
      logger.warn('Spoonacular availability check failed', { error });
      this.spoonacularAvailable = false;
    }

    logger.info('Unified Nutrition Service initialized', {
      openFoodFactsAvailable: this.openFoodFactsAvailable,
      spoonacularAvailable: this.spoonacularAvailable
    });
  }

  /**
   * Smart search that combines results from both databases
   */
  async searchFoods(query: string, limit: number = 20): Promise<UnifiedSearchResult> {
    await this.ensureInitialized();
    
    const results: UnifiedFoodItem[] = [];
    const dataSources = { openfoodfacts: 0, spoonacular: 0, user_input: 0 };

    // Search OpenFoodFacts first (ingredient verification)
    if (this.openFoodFactsAvailable) {
      try {
        const offResults = await enhancedOpenFoodFactsService.searchProducts(query, 1, Math.ceil(limit * 0.7));
        
        if (offResults.products) {
          for (const product of offResults.products) {
            const unifiedItem = this.convertOpenFoodFactsToUnified(product);
            results.push(unifiedItem);
            dataSources.openfoodfacts++;
          }
        }
        
        logger.info('OpenFoodFacts search completed', { 
          query, 
          found: offResults.products?.length || 0
        });
      } catch (error) {
        logger.warn('OpenFoodFacts search failed', { query, error });
      }
    }

    // Search Spoonacular for recipes if we have remaining capacity
    if (this.spoonacularAvailable && results.length < limit) {
      try {
        const remainingLimit = limit - results.length;
        const spoonacularResults = await spoonacularService.searchVeganRecipes({
          query,
          number: remainingLimit,
          addRecipeInformation: true,
          addRecipeNutrition: true
        });
        
        if (spoonacularResults.results) {
          for (const recipe of spoonacularResults.results) {
            // Convert recipe to food item format
            const unifiedItem = this.convertSpoonacularToUnified(recipe);
            results.push(unifiedItem);
            dataSources.spoonacular++;
          }
        }
        
        logger.info('Spoonacular search completed', { 
          query, 
          found: spoonacularResults.results?.length || 0
        });
      } catch (error) {
        logger.warn('Spoonacular search failed', { query, error });
      }
    }

    // Sort results by confidence and data source preference
    results.sort((a, b) => {
      // Prefer OpenFoodFacts for ingredients, Spoonacular for recipes
      if (a.dataSource === 'openfoodfacts' && b.dataSource !== 'openfoodfacts') return -1;
      if (b.dataSource === 'openfoodfacts' && a.dataSource !== 'openfoodfacts') return 1;
      
      // Then by confidence
      return b.confidence - a.confidence;
    });

    logger.info('Unified food search completed', {
      query,
      totalResults: results.length,
      dataSources
    });

    return {
      items: results.slice(0, limit),
      total: results.length,
      dataSources
    };
  }

  /**
   * Get food by barcode (OpenFoodFacts primary)
   */
  async getFoodByBarcode(barcode: string): Promise<UnifiedFoodItem | null> {
    await this.ensureInitialized();

    // Try OpenFoodFacts (barcode is their strength)
    if (this.openFoodFactsAvailable) {
      try {
        const result = await enhancedOpenFoodFactsService.getProductByBarcode(barcode);
        
        if (result.status === 1 && result.product) {
          const unifiedItem = this.convertOpenFoodFactsToUnified(result.product);
          unifiedItem.barcode = barcode;
          
          logger.info('Barcode found in OpenFoodFacts', { barcode, name: unifiedItem.name });
          return unifiedItem;
        }
      } catch (error) {
        logger.warn('OpenFoodFacts barcode lookup failed', { barcode, error });
      }
    }

    logger.info('Barcode not found in any database', { barcode });
    return null;
  }

  /**
   * Get recipe by Spoonacular ID
   */
  async getRecipeById(id: number): Promise<UnifiedFoodItem | null> {
    await this.ensureInitialized();

    if (!this.spoonacularAvailable) {
      return null;
    }

    try {
      const recipe = await spoonacularService.getRecipeById(id, true);
      
      if (recipe) {
        const unifiedItem = this.convertSpoonacularToUnified(recipe);
        logger.info('Recipe found in Spoonacular', { id, name: unifiedItem.name });
        return unifiedItem;
      }
    } catch (error) {
      logger.warn('Spoonacular recipe lookup failed', { id, error });
    }

    return null;
  }

  /**
   * Get vegan foods from both databases
   */
  async getVeganFoods(limit: number = 50): Promise<UnifiedSearchResult> {
    await this.ensureInitialized();

    const results: UnifiedFoodItem[] = [];
    const dataSources = { openfoodfacts: 0, spoonacular: 0, user_input: 0 };

    // Get vegan products from OpenFoodFacts
    if (this.openFoodFactsAvailable) {
      try {
        const offVegan = await enhancedOpenFoodFactsService.getVeganProductsByCategory(
          'plant-based-foods', 
          1, 
          Math.ceil(limit * 0.6)
        );
        
        for (const product of offVegan) {
          const unifiedItem = this.convertOpenFoodFactsToUnified(product);
          results.push(unifiedItem);
          dataSources.openfoodfacts++;
        }
        
        logger.info('OpenFoodFacts vegan foods retrieved', { found: offVegan.length });
      } catch (error) {
        logger.warn('OpenFoodFacts vegan foods retrieval failed', { error });
      }
    }

    // Get vegan recipes from Spoonacular
    if (this.spoonacularAvailable && results.length < limit) {
      try {
        const remainingLimit = limit - results.length;
        const spoonacularVegan = await spoonacularService.getRandomVeganRecipes(remainingLimit);
        
        for (const recipe of spoonacularVegan.recipes) {
          const unifiedItem = this.convertSpoonacularToUnified(recipe);
          results.push(unifiedItem);
          dataSources.spoonacular++;
        }
        
        logger.info('Spoonacular vegan recipes retrieved', { 
          found: spoonacularVegan.recipes.length
        });
      } catch (error) {
        logger.warn('Spoonacular vegan recipes retrieval failed', { error });
      }
    }

    // Sort by data source preference and confidence
    results.sort((a, b) => {
      if (a.dataSource === 'openfoodfacts' && b.dataSource !== 'openfoodfacts') return -1;
      if (b.dataSource === 'openfoodfacts' && a.dataSource !== 'openfoodfacts') return 1;
      return b.confidence - a.confidence;
    });

    return {
      items: results.slice(0, limit),
      total: results.length,
      dataSources
    };
  }

  /**
   * Search recipes by nutritional criteria
   */
  async searchRecipesByNutrition(
    minCalories?: number,
    maxCalories?: number,
    minProtein?: number,
    maxProtein?: number
  ): Promise<UnifiedSearchResult> {
    await this.ensureInitialized();

    const results: UnifiedFoodItem[] = [];
    const dataSources = { openfoodfacts: 0, spoonacular: 0, user_input: 0 };

    if (this.spoonacularAvailable) {
      try {
        const searchResult = await spoonacularService.searchRecipesByNutrients(
          minCalories,
          maxCalories,
          minProtein,
          maxProtein
        );

        for (const recipe of searchResult.results) {
          const unifiedItem = this.convertSpoonacularToUnified(recipe);
          results.push(unifiedItem);
          dataSources.spoonacular++;
        }

        logger.info('Nutritional recipe search completed', {
          criteria: { minCalories, maxCalories, minProtein, maxProtein },
          found: results.length
        });
      } catch (error) {
        logger.warn('Nutritional recipe search failed', { error });
      }
    }

    return {
      items: results,
      total: results.length,
      dataSources
    };
  }

  /**
   * Get service status and statistics
   */
  getStatus() {
    return {
      openFoodFacts: {
        available: this.openFoodFactsAvailable,
        cacheStats: enhancedOpenFoodFactsService.getCacheStats()
      },
      spoonacular: {
        available: this.spoonacularAvailable,
        cacheStats: spoonacularService.getCacheStats()
      },
      unified: {
        initialized: this.openFoodFactsAvailable || this.spoonacularAvailable,
        dataSources: {
          primary: this.openFoodFactsAvailable ? 'openfoodfacts' : 'spoonacular',
          secondary: this.openFoodFactsAvailable && this.spoonacularAvailable ? 'both' : 'none'
        }
      }
    };
  }

  /**
   * Convert OpenFoodFacts product to unified format
   */
  private convertOpenFoodFactsToUnified(product: OpenFoodFactsProduct): UnifiedFoodItem {
    const nutrition = enhancedOpenFoodFactsService.extractNutritionInfo(product);
    
    return {
      id: `off:${product._id || product.code || Math.random().toString()}`,
      name: product.product_name || 'Unknown Product',
      brands: product.brands,
      ingredients: product.ingredients_text,
      image: product.image_url,
      nutrition: {
        energy: nutrition.energy,
        protein: nutrition.protein,
        carbohydrates: nutrition.carbohydrates,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        salt: nutrition.salt,
        minerals: {
          sodium: nutrition.salt ? nutrition.salt * 400 : undefined // Convert salt to sodium (rough)
        },
        vitamins: {},
        qualityScores: {
          nutriScore: nutrition.nutriScore || undefined,
          ecoScore: nutrition.ecoScore || undefined,
          novaGroup: nutrition.novaGroup || undefined
        }
      },
      dataSource: 'openfoodfacts',
      confidence: this.calculateOpenFoodFactsConfidence(product)
    };
  }

  /**
   * Convert Spoonacular recipe to unified format
   */
  private convertSpoonacularToUnified(recipe: SpoonacularRecipe): UnifiedFoodItem {
    const nutrition = spoonacularService.extractNutritionInfo(recipe);
    
    return {
      id: `spoon:${recipe.id}`,
      name: recipe.title,
      nameEn: recipe.title, // Spoonacular is primarily English
      group: 'Recipe',
      subGroup: recipe.dishTypes?.join(', '),
      ingredients: recipe.extendedIngredients?.map(ing => ing.original).join(', '),
      image: recipe.image,
      nutrition: {
        energy: nutrition.calories,
        protein: nutrition.protein,
        carbohydrates: nutrition.carbohydrates,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        minerals: {
          calcium: nutrition.calcium,
          iron: nutrition.iron,
          magnesium: nutrition.magnesium,
          phosphorus: nutrition.phosphorus,
          potassium: nutrition.potassium,
          sodium: nutrition.sodium,
          zinc: nutrition.zinc
        },
        vitamins: {
          c: nutrition.vitaminC,
          b1: nutrition.vitaminB1,
          b2: nutrition.vitaminB2,
          b3: nutrition.vitaminB3,
          b6: nutrition.vitaminB6,
          b9: nutrition.vitaminB9,
          b12: nutrition.vitaminB12,
          a: nutrition.vitaminA,
          d: nutrition.vitaminD,
          e: nutrition.vitaminE,
          k: nutrition.vitaminK
        }
      },
      dataSource: 'spoonacular',
      confidence: this.calculateSpoonacularConfidence(recipe)
    };
  }

  /**
   * Calculate confidence score for Spoonacular recipes
   */
  private calculateSpoonacularConfidence(recipe: SpoonacularRecipe): number {
    let confidence = 0.7; // Base confidence for recipes
    
    // Boost confidence based on available data
    if (recipe.nutrition?.nutrients && recipe.nutrition.nutrients.length > 5) confidence += 0.1;
    if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) confidence += 0.1;
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) confidence += 0.05;
    if (recipe.healthScore && recipe.healthScore > 50) confidence += 0.05;
    
    return Math.min(confidence, 0.9);
  }

  /**
   * Check if two food names are similar (to avoid duplicates)
   */
  private areSimilarFoods(name1: string, name2: string): boolean {
    const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const n1 = normalize(name1);
    const n2 = normalize(name2);
    
    // Simple similarity check
    if (n1 === n2) return true;
    if (n1.includes(n2) || n2.includes(n1)) return true;
    
    // Check for partial matches
    const words1 = n1.split(/\s+/);
    const words2 = n2.split(/\s+/);
    let commonWords = 0;
    
    for (const word1 of words1) {
      if (word1.length > 2 && words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        commonWords++;
      }
    }
    
    return commonWords >= Math.min(words1.length, words2.length) * 0.5;
  }

  /**
   * Calculate confidence score for OpenFoodFacts products
   */
  private calculateOpenFoodFactsConfidence(product: OpenFoodFactsProduct): number {
    let confidence = 0.6; // Base confidence for ingredient data
    
    // Boost confidence based on available data
    if (product.product_name) confidence += 0.1;
    if (product.ingredients_text) confidence += 0.1;
    if (product.nutrition_grade_fr) confidence += 0.1;
    if (product.energy_100g) confidence += 0.1;
    if (product.proteins_100g) confidence += 0.1;
    
    return Math.min(confidence, 0.9);
  }

  /**
   * Ensure all services are initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.openFoodFactsAvailable && !this.spoonacularAvailable) {
      await this.initialize();
    }
  }
}

// Export singleton instance
export const unifiedNutritionService = new UnifiedNutritionService();