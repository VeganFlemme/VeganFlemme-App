import { logger } from '../utils/logger';
import { optimizedCiqualService, CiqualFood } from './optimizedCiqualService';
import { enhancedOpenFoodFactsService, OpenFoodFactsProduct } from './enhancedOpenFoodFactsService';

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
  dataSource: 'ciqual' | 'openfoodfacts' | 'hybrid';
  confidence: number; // 0-1 score for data quality
  barcode?: string;
}

export interface UnifiedSearchResult {
  items: UnifiedFoodItem[];
  total: number;
  dataSources: {
    ciqual: number;
    openfoodfacts: number;
    hybrid: number;
  };
}

/**
 * Unified Nutrition Service that intelligently combines CIQUAL and OpenFoodFacts data
 * This service provides the best of both worlds with smart fallback mechanisms
 */
export class UnifiedNutritionService {
  private ciqualInitialized: boolean = false;
  private openFoodFactsAvailable: boolean = false;

  constructor() {
    logger.info('Unified Nutrition Service initializing');
  }

  /**
   * Initialize all underlying services
   */
  async initialize(): Promise<void> {
    logger.info('Initializing nutrition databases');
    
    // Initialize CIQUAL (fast with optimized data)
    try {
      await optimizedCiqualService.initialize();
      this.ciqualInitialized = true;
      logger.info('CIQUAL database initialized successfully');
    } catch (error) {
      logger.error('CIQUAL initialization failed', { error });
      this.ciqualInitialized = false;
    }

    // Check OpenFoodFacts availability
    try {
      this.openFoodFactsAvailable = await enhancedOpenFoodFactsService.isServiceAvailable();
      logger.info('OpenFoodFacts availability checked', { available: this.openFoodFactsAvailable });
    } catch (error) {
      logger.warn('OpenFoodFacts availability check failed', { error });
      this.openFoodFactsAvailable = false;
    }

    logger.info('Unified Nutrition Service initialized', {
      ciqualAvailable: this.ciqualInitialized,
      openFoodFactsAvailable: this.openFoodFactsAvailable
    });
  }

  /**
   * Smart search that combines results from both databases
   */
  async searchFoods(query: string, limit: number = 20): Promise<UnifiedSearchResult> {
    await this.ensureInitialized();
    
    const results: UnifiedFoodItem[] = [];
    const dataSources = { ciqual: 0, openfoodfacts: 0, hybrid: 0 };

    // Search CIQUAL first (authoritative nutritional data)
    if (this.ciqualInitialized) {
      try {
        const ciqualResults = await optimizedCiqualService.searchFoodsByName(query, Math.ceil(limit * 0.7));
        
        for (const food of ciqualResults.foods) {
          const unifiedItem = this.convertCiqualToUnified(food);
          results.push(unifiedItem);
          dataSources.ciqual++;
        }
        
        logger.info('CIQUAL search completed', { query, found: ciqualResults.foods.length });
      } catch (error) {
        logger.warn('CIQUAL search failed', { query, error });
      }
    }

    // Search OpenFoodFacts for additional results (commercial products)
    if (this.openFoodFactsAvailable && results.length < limit) {
      try {
        const remainingLimit = limit - results.length;
        const offResults = await enhancedOpenFoodFactsService.searchProducts(query, 1, remainingLimit);
        
        if (offResults.products) {
          for (const product of offResults.products) {
            // Avoid duplicates by checking if we already have similar items
            const isDuplicate = results.some(item => 
              this.areSimilarFoods(item.name, product.product_name || '')
            );
            
            if (!isDuplicate) {
              const unifiedItem = this.convertOpenFoodFactsToUnified(product);
              results.push(unifiedItem);
              dataSources.openfoodfacts++;
            }
          }
        }
        
        logger.info('OpenFoodFacts search completed', { 
          query, 
          found: offResults.products?.length || 0,
          addedToResults: dataSources.openfoodfacts
        });
      } catch (error) {
        logger.warn('OpenFoodFacts search failed', { query, error });
      }
    }

    // Sort results by confidence and relevance
    results.sort((a, b) => {
      // Prefer CIQUAL data for basic foods
      if (a.dataSource === 'ciqual' && b.dataSource !== 'ciqual') return -1;
      if (b.dataSource === 'ciqual' && a.dataSource !== 'ciqual') return 1;
      
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
   * Get food by barcode (OpenFoodFacts primary, CIQUAL fallback)
   */
  async getFoodByBarcode(barcode: string): Promise<UnifiedFoodItem | null> {
    await this.ensureInitialized();

    // Try OpenFoodFacts first (barcode is their strength)
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

    // CIQUAL doesn't have barcodes, so we can't help here
    logger.info('Barcode not found in any database', { barcode });
    return null;
  }

  /**
   * Get food by CIQUAL code
   */
  async getFoodByCiqualCode(code: string): Promise<UnifiedFoodItem | null> {
    await this.ensureInitialized();

    if (!this.ciqualInitialized) {
      return null;
    }

    try {
      const food = await optimizedCiqualService.getFoodByCode(code);
      
      if (food) {
        const unifiedItem = this.convertCiqualToUnified(food);
        logger.info('CIQUAL code found', { code, name: unifiedItem.name });
        return unifiedItem;
      }
    } catch (error) {
      logger.warn('CIQUAL code lookup failed', { code, error });
    }

    return null;
  }

  /**
   * Get vegan foods from both databases
   */
  async getVeganFoods(limit: number = 50): Promise<UnifiedSearchResult> {
    await this.ensureInitialized();

    const results: UnifiedFoodItem[] = [];
    const dataSources = { ciqual: 0, openfoodfacts: 0, hybrid: 0 };

    // Get vegan foods from CIQUAL
    if (this.ciqualInitialized) {
      try {
        const ciqualVegan = await optimizedCiqualService.getVeganFoods(Math.ceil(limit * 0.6));
        
        for (const food of ciqualVegan) {
          const unifiedItem = this.convertCiqualToUnified(food);
          results.push(unifiedItem);
          dataSources.ciqual++;
        }
        
        logger.info('CIQUAL vegan foods retrieved', { found: ciqualVegan.length });
      } catch (error) {
        logger.warn('CIQUAL vegan foods retrieval failed', { error });
      }
    }

    // Get vegan products from OpenFoodFacts
    if (this.openFoodFactsAvailable && results.length < limit) {
      try {
        const remainingLimit = limit - results.length;
        const offVegan = await enhancedOpenFoodFactsService.getVeganProductsByCategory(
          'plant-based-foods', 
          1, 
          remainingLimit
        );
        
        for (const product of offVegan) {
          // Avoid duplicates
          const isDuplicate = results.some(item => 
            this.areSimilarFoods(item.name, product.product_name || '')
          );
          
          if (!isDuplicate) {
            const unifiedItem = this.convertOpenFoodFactsToUnified(product);
            results.push(unifiedItem);
            dataSources.openfoodfacts++;
          }
        }
        
        logger.info('OpenFoodFacts vegan foods retrieved', { 
          found: offVegan.length,
          addedToResults: dataSources.openfoodfacts
        });
      } catch (error) {
        logger.warn('OpenFoodFacts vegan foods retrieval failed', { error });
      }
    }

    // Sort by data source preference and confidence
    results.sort((a, b) => {
      if (a.dataSource === 'ciqual' && b.dataSource !== 'ciqual') return -1;
      if (b.dataSource === 'ciqual' && a.dataSource !== 'ciqual') return 1;
      return b.confidence - a.confidence;
    });

    return {
      items: results.slice(0, limit),
      total: results.length,
      dataSources
    };
  }

  /**
   * Get service status and statistics
   */
  getStatus() {
    return {
      ciqual: {
        available: this.ciqualInitialized,
        totalFoods: this.ciqualInitialized ? optimizedCiqualService.getTotalFoodsCount() : 0,
        metadata: this.ciqualInitialized ? optimizedCiqualService.getMetadata() : null
      },
      openFoodFacts: {
        available: this.openFoodFactsAvailable,
        cacheStats: enhancedOpenFoodFactsService.getCacheStats()
      },
      unified: {
        initialized: this.ciqualInitialized || this.openFoodFactsAvailable,
        dataSources: {
          primary: this.ciqualInitialized ? 'ciqual' : 'openfoodfacts',
          fallback: this.ciqualInitialized && this.openFoodFactsAvailable ? 'both' : 'none'
        }
      }
    };
  }

  /**
   * Convert CIQUAL food to unified format
   */
  private convertCiqualToUnified(food: CiqualFood): UnifiedFoodItem {
    const nutrition = optimizedCiqualService.getNutritionSummary(food);
    
    return {
      id: `ciqual:${food.code}`,
      name: food.name,
      nameEn: food.nameEn,
      group: food.group,
      subGroup: food.subGroup,
      nutrition: {
        energy: nutrition.energy,
        protein: nutrition.protein,
        carbohydrates: nutrition.carbohydrates,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        minerals: nutrition.minerals,
        vitamins: nutrition.vitamins
      },
      dataSource: 'ciqual',
      confidence: 0.9 // High confidence for official data
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
   * Calculate confidence score for OpenFoodFacts products
   */
  private calculateOpenFoodFactsConfidence(product: OpenFoodFactsProduct): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on available data
    if (product.product_name) confidence += 0.1;
    if (product.ingredients_text) confidence += 0.1;
    if (product.nutrition_grade_fr) confidence += 0.1;
    if (product.energy_100g) confidence += 0.1;
    if (product.proteins_100g) confidence += 0.1;
    
    return Math.min(confidence, 0.8); // Cap at 0.8 (CIQUAL is more authoritative)
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
    
    // Levenshtein distance could be added here for more sophisticated matching
    return false;
  }

  /**
   * Ensure all services are initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.ciqualInitialized && !this.openFoodFactsAvailable) {
      await this.initialize();
    }
  }
}

// Export singleton instance
export const unifiedNutritionService = new UnifiedNutritionService();