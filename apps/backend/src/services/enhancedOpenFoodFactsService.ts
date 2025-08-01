import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  nutrition_grade_fr?: string;
  ecoscore_grade?: string;
  nova_group?: number;
  energy_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  salt_100g?: number;
  image_url?: string;
  _id?: string;
  code?: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

export interface OpenFoodFactsSearchResponse {
  status: number;
  products?: OpenFoodFactsProduct[];
  count?: number;
  page?: number;
  page_size?: number;
}

export interface OpenFoodFactsCategoryResponse {
  status: number;
  products?: OpenFoodFactsProduct[];
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

/**
 * Enhanced OpenFoodFacts Service with caching and improved error handling
 * Supports both production and staging environments with offline fallback
 */
export class EnhancedOpenFoodFactsService {
  private axiosInstance: AxiosInstance;
  private useStaging: boolean;
  private cache: Map<string, CacheEntry> = new Map();
  private cacheDir: string;
  private defaultCacheTTL: number = 24 * 60 * 60 * 1000; // 24 hours
  private isOnline: boolean = true;
  
  constructor(useStaging: boolean = process.env.NODE_ENV !== 'production') {
    this.useStaging = useStaging;
    this.cacheDir = path.join(process.cwd(), 'cache', 'openfoodfacts');
    
    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    
    const baseURL = useStaging 
      ? 'https://world.openfoodfacts.net/api/v0'  // Staging
      : 'https://world.openfoodfacts.org/api/v0'; // Production
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'User-Agent': 'VeganFlemme-App/1.0 (https://veganflemme-app.vercel.app)',
        'Accept': 'application/json',
      }
    });

    // Add Basic Auth for staging environment
    if (useStaging) {
      this.axiosInstance.defaults.headers.common['Authorization'] = 'Basic ' + Buffer.from('off:off').toString('base64');
    }

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.isOnline = true;
        return response;
      },
      (error) => {
        if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN' || error.code === 'ECONNREFUSED') {
          this.isOnline = false;
          logger.warn('OpenFoodFacts API is offline, using cached data');
        }
        throw error;
      }
    );

    // Load persistent cache on startup
    this.loadPersistentCache();

    logger.info('Enhanced OpenFoodFacts Service initialized', { 
      environment: useStaging ? 'staging' : 'production',
      baseUrl: baseURL,
      cacheEnabled: true
    });
  }

  /**
   * Get Product by Barcode with caching
   */
  async getProductByBarcode(barcode: string): Promise<OpenFoodFactsResponse> {
    const cacheKey = `barcode:${barcode}`;
    
    // Try cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.info('Retrieved product from cache', { barcode });
      return cached;
    }
    
    try {
      logger.info('Fetching product by barcode', { barcode });
      
      const response = await this.axiosInstance.get(`/product/${barcode}.json`);
      
      // Cache successful response
      this.setCache(cacheKey, response.data, this.defaultCacheTTL);
      this.saveToPersistentCache(cacheKey, response.data);
      
      logger.info('Product retrieved successfully', { 
        barcode, 
        productName: response.data.product?.product_name || 'Unknown',
        status: response.data.status 
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching product by barcode', { 
        barcode, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isOnline: this.isOnline
      });
      
      // Try to return cached data even if expired when offline
      if (!this.isOnline) {
        const expiredCached = this.getFromCache(cacheKey, true);
        if (expiredCached) {
          logger.info('Using expired cache data due to offline status', { barcode });
          return expiredCached;
        }
      }
      
      throw new Error(`Failed to fetch product with barcode ${barcode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search Products with caching
   */
  async searchProducts(query: string, page: number = 1, pageSize: number = 24): Promise<OpenFoodFactsSearchResponse> {
    const cacheKey = `search:${query}:${page}:${pageSize}`;
    
    // Try cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.info('Retrieved search results from cache', { query, page, pageSize });
      return cached;
    }
    
    try {
      logger.info('Searching products', { query, page, pageSize });
      
      const response = await this.axiosInstance.get('/products', {
        params: {
          search: query,
          page,
          page_size: pageSize,
          json: true
        }
      });
      
      // Cache successful response with shorter TTL for searches
      const searchCacheTTL = 60 * 60 * 1000; // 1 hour
      this.setCache(cacheKey, response.data, searchCacheTTL);
      this.saveToPersistentCache(cacheKey, response.data);
      
      logger.info('Product search completed successfully', { 
        query, 
        productsCount: response.data.products?.length || 0,
        totalCount: response.data.count || 0,
        status: response.data.status 
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error searching products', { 
        query, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isOnline: this.isOnline
      });
      
      // Try to return cached data when offline
      if (!this.isOnline) {
        const expiredCached = this.getFromCache(cacheKey, true);
        if (expiredCached) {
          logger.info('Using expired cache data due to offline status', { query });
          return expiredCached;
        }
      }
      
      throw new Error(`Failed to search products with query "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Products by Category with caching
   */
  async getProductsByCategory(category: string, page: number = 1, pageSize: number = 24): Promise<OpenFoodFactsCategoryResponse> {
    const cacheKey = `category:${category}:${page}:${pageSize}`;
    
    // Try cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.info('Retrieved category results from cache', { category, page, pageSize });
      return cached;
    }
    
    try {
      logger.info('Fetching products by category', { category, page, pageSize });
      
      const response = await this.axiosInstance.get(`/category/${category}.json`, {
        params: {
          page,
          page_size: pageSize
        }
      });
      
      // Cache successful response
      this.setCache(cacheKey, response.data, this.defaultCacheTTL);
      this.saveToPersistentCache(cacheKey, response.data);
      
      logger.info('Products by category retrieved successfully', { 
        category, 
        productsCount: response.data.products?.length || 0,
        status: response.data.status 
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching products by category', { 
        category, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isOnline: this.isOnline
      });
      
      // Try to return cached data when offline
      if (!this.isOnline) {
        const expiredCached = this.getFromCache(cacheKey, true);
        if (expiredCached) {
          logger.info('Using expired cache data due to offline status', { category });
          return expiredCached;
        }
      }
      
      throw new Error(`Failed to fetch products in category ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get vegan products from a specific category
   */
  async getVeganProductsByCategory(category: string, page: number = 1, pageSize: number = 24): Promise<OpenFoodFactsProduct[]> {
    try {
      logger.info('Fetching vegan products by category', { category, page, pageSize });
      
      const searchQuery = `categories:${category} labels:vegan`;
      const response = await this.searchProducts(searchQuery, page, pageSize);
      
      const veganProducts = response.products || [];
      
      logger.info('Vegan products retrieved', { 
        category, 
        veganProductsCount: veganProducts.length 
      });
      
      return veganProducts;
    } catch (error) {
      logger.error('Error fetching vegan products by category', { 
        category, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return [];
    }
  }

  /**
   * Get nutrition information for a product
   */
  extractNutritionInfo(product: OpenFoodFactsProduct) {
    return {
      energy: product.energy_100g || 0,
      protein: product.proteins_100g || 0,
      carbohydrates: product.carbohydrates_100g || 0,
      fat: product.fat_100g || 0,
      fiber: product.fiber_100g || 0,
      salt: product.salt_100g || 0,
      nutriScore: product.nutrition_grade_fr || null,
      ecoScore: product.ecoscore_grade || null,
      novaGroup: product.nova_group || null
    };
  }

  /**
   * Check if service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    if (!this.isOnline) {
      return false;
    }
    
    try {
      // Test with a known product barcode (Oat milk example)
      const testBarcode = '737628064502';
      const response = await this.getProductByBarcode(testBarcode);
      return response.status === 1;
    } catch (error) {
      logger.warn('OpenFoodFacts service unavailable', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string, allowExpired: boolean = false): any {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (!allowExpired && entry.expiry < now) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    this.cache.set(key, entry);
  }

  private saveToPersistentCache(key: string, data: any): void {
    try {
      const fileName = key.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
      const filePath = path.join(this.cacheDir, fileName);
      const cacheData = {
        data,
        timestamp: Date.now(),
        key
      };
      fs.writeFileSync(filePath, JSON.stringify(cacheData));
    } catch (error) {
      logger.warn('Failed to save to persistent cache', { key, error });
    }
  }

  private loadPersistentCache(): void {
    try {
      if (!fs.existsSync(this.cacheDir)) return;
      
      const files = fs.readdirSync(this.cacheDir);
      let loadedCount = 0;
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.cacheDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const cacheData = JSON.parse(content);
            
            // Load into memory cache with default TTL
            this.setCache(cacheData.key, cacheData.data, this.defaultCacheTTL);
            loadedCount++;
          } catch (error) {
            logger.warn('Failed to load cache file', { file, error });
          }
        }
      });
      
      if (loadedCount > 0) {
        logger.info('Loaded persistent cache', { filesLoaded: loadedCount });
      }
    } catch (error) {
      logger.warn('Failed to load persistent cache', { error });
    }
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      memoryEntries: this.cache.size,
      isOnline: this.isOnline,
      cacheDirectory: this.cacheDir
    };
  }
}

// Export singleton instance
export const enhancedOpenFoodFactsService = new EnhancedOpenFoodFactsService();