import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

export interface CiqualFood {
  code: string;
  name: string;
  nameEn?: string;
  group?: string;
  subGroup?: string;
  source?: string;
  // Nutritional values per 100g
  energy?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  sodium?: number;
  zinc?: number;
  vitaminC?: number;
  vitaminB1?: number;
  vitaminB2?: number;
  vitaminB3?: number;
  vitaminB6?: number;
  vitaminB9?: number;
  vitaminB12?: number;
  vitaminA?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
}

export interface CiqualSearchResult {
  foods: CiqualFood[];
  total: number;
}

interface OptimizedCiqualData {
  metadata: {
    version: string;
    generatedAt: string;
    totalFoods: number;
    sourceFiles: string[];
    description: string;
  };
  foods: CiqualFood[];
  indices: {
    nameIndex: { [word: string]: number[] };
    groupIndex: { [group: string]: number[] };
    veganFoods: number[];
  };
}

/**
 * Optimized CIQUAL Service using pre-processed JSON data for fast loading
 * This version loads in milliseconds instead of seconds
 */
export class OptimizedCiqualService {
  private data: OptimizedCiqualData | null = null;
  private foods: CiqualFood[] = [];
  private initialized: boolean = false;
  
  constructor() {
    logger.info('Optimized CIQUAL Service initializing');
  }

  /**
   * Initialize the service by loading optimized JSON data
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const startTime = Date.now();
      logger.info('Loading optimized CIQUAL data');
      
      const dataDir = process.env.CIQUAL_DATA_DIR || path.join(process.cwd(), 'data');
      const optimizedFilePath = path.join(dataDir, 'ciqual-optimized.json');
      
      // Check if optimized file exists
      if (!fs.existsSync(optimizedFilePath)) {
        throw new Error(`Optimized CIQUAL data file not found at ${optimizedFilePath}. Please run the optimization script first.`);
      }
      
      // Load optimized data
      const rawData = fs.readFileSync(optimizedFilePath, 'utf8');
      this.data = JSON.parse(rawData);
      this.foods = this.data!.foods;
      
      const loadTime = Date.now() - startTime;
      this.initialized = true;
      
      logger.info('Optimized CIQUAL Service initialized successfully', { 
        totalFoods: this.foods.length,
        loadTimeMs: loadTime,
        version: this.data!.metadata.version,
        generatedAt: this.data!.metadata.generatedAt
      });
      
    } catch (error) {
      logger.error('Failed to initialize Optimized CIQUAL Service', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error(`Optimized CIQUAL Service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get food by CIQUAL code - O(n) lookup but very fast due to small dataset
   */
  async getFoodByCode(code: string): Promise<CiqualFood | null> {
    await this.ensureInitialized();
    
    const food = this.foods.find(f => f.code === code);
    return food || null;
  }

  /**
   * Search foods by name using pre-built indices - Much faster than original
   */
  async searchFoodsByName(query: string, limit: number = 20): Promise<CiqualSearchResult> {
    await this.ensureInitialized();
    
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    
    if (queryWords.length === 0) {
      return { foods: [], total: 0 };
    }
    
    const matchingIndices = new Set<number>();
    
    // Use word-based index for fast searching
    queryWords.forEach(word => {
      // Exact word match
      if (this.data!.indices.nameIndex[word]) {
        this.data!.indices.nameIndex[word].forEach(index => matchingIndices.add(index));
      }
      
      // Partial word matches
      Object.keys(this.data!.indices.nameIndex).forEach(indexWord => {
        if (indexWord.includes(word)) {
          this.data!.indices.nameIndex[indexWord].forEach(index => matchingIndices.add(index));
        }
      });
    });
    
    // Convert indices to foods and sort by relevance
    const results = Array.from(matchingIndices)
      .map(index => this.foods[index])
      .filter(food => food) // Ensure food exists
      .sort((a, b) => {
        // Sort by name similarity
        const aNameLower = a.name.toLowerCase();
        const bNameLower = b.name.toLowerCase();
        
        // Exact match first
        if (aNameLower.includes(queryLower)) return -1;
        if (bNameLower.includes(queryLower)) return 1;
        
        // Then by length (shorter names more relevant)
        return a.name.length - b.name.length;
      });
    
    logger.info('Optimized CIQUAL search completed', { 
      query, 
      resultsCount: Math.min(results.length, limit),
      totalMatches: results.length 
    });
    
    return {
      foods: results.slice(0, limit),
      total: results.length
    };
  }

  /**
   * Get foods by category/group using pre-built index
   */
  async getFoodsByGroup(group: string, limit: number = 50): Promise<CiqualSearchResult> {
    await this.ensureInitialized();
    
    const groupLower = group.toLowerCase();
    const matchingIndices: number[] = [];
    
    // Use group index for fast lookup
    Object.keys(this.data!.indices.groupIndex).forEach(indexGroup => {
      if (indexGroup.includes(groupLower)) {
        matchingIndices.push(...this.data!.indices.groupIndex[indexGroup]);
      }
    });
    
    const results = matchingIndices
      .map(index => this.foods[index])
      .filter(food => food)
      .slice(0, limit);
    
    logger.info('Optimized CIQUAL group search completed', { 
      group, 
      resultsCount: results.length 
    });
    
    return {
      foods: results,
      total: results.length
    };
  }

  /**
   * Get foods suitable for vegan diet using pre-built index
   */
  async getVeganFoods(limit: number = 100): Promise<CiqualFood[]> {
    await this.ensureInitialized();
    
    const veganFoodIndices = this.data!.indices.veganFoods.slice(0, limit);
    const results = veganFoodIndices.map(index => this.foods[index]).filter(food => food);
    
    logger.info('Optimized CIQUAL vegan foods retrieved', { 
      veganFoodsCount: results.length 
    });
    
    return results;
  }

  /**
   * Get nutrition information for a food
   */
  getNutritionSummary(food: CiqualFood) {
    return {
      energy: food.energy || 0,
      protein: food.protein || 0,
      carbohydrates: food.carbohydrates || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0,
      minerals: {
        calcium: food.calcium,
        iron: food.iron,
        magnesium: food.magnesium,
        phosphorus: food.phosphorus,
        potassium: food.potassium,
        sodium: food.sodium,
        zinc: food.zinc
      },
      vitamins: {
        c: food.vitaminC,
        b1: food.vitaminB1,
        b2: food.vitaminB2,
        b3: food.vitaminB3,
        b6: food.vitaminB6,
        b9: food.vitaminB9,
        b12: food.vitaminB12,
        a: food.vitaminA,
        d: food.vitaminD,
        e: food.vitaminE,
        k: food.vitaminK
      }
    };
  }

  /**
   * Check if service is ready
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get total number of foods loaded
   */
  getTotalFoodsCount(): number {
    return this.foods.length;
  }

  /**
   * Get metadata about the loaded data
   */
  getMetadata() {
    return this.data?.metadata || null;
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// Export singleton instance
export const optimizedCiqualService = new OptimizedCiqualService();