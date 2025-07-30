import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

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

/**
 * Service for integrating with OpenFoodFacts API
 * Supports both production and staging environments
 */
export class OpenFoodFactsService {
  private axiosInstance: AxiosInstance;
  private useStaging: boolean;
  
  constructor(useStaging: boolean = process.env.NODE_ENV !== 'production') {
    this.useStaging = useStaging;
    
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

    logger.info('OpenFoodFacts Service initialized', { 
      environment: useStaging ? 'staging' : 'production',
      baseUrl: baseURL 
    });
  }

  /**
   * Get Product by Barcode
   * Retrieve information about a specific food product by providing its barcode.
   * 
   * @param barcode - The barcode of the product to retrieve information for
   * @returns Promise<OpenFoodFactsResponse>
   */
  async getProductByBarcode(barcode: string): Promise<OpenFoodFactsResponse> {
    try {
      logger.info('Fetching product by barcode', { barcode });
      
      const response = await this.axiosInstance.get(`/product/${barcode}.json`);
      
      logger.info('Product retrieved successfully', { 
        barcode, 
        productName: response.data.product?.product_name || 'Unknown',
        status: response.data.status 
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching product by barcode', { 
        barcode, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error(`Failed to fetch product with barcode ${barcode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Products by Category
   * Retrieve a list of food products within a specific category.
   * 
   * @param category - The category of products to retrieve
   * @param page - Page number for pagination (optional)
   * @param pageSize - Number of products per page (optional)
   * @returns Promise<OpenFoodFactsCategoryResponse>
   */
  async getProductsByCategory(category: string, page: number = 1, pageSize: number = 24): Promise<OpenFoodFactsCategoryResponse> {
    try {
      logger.info('Fetching products by category', { category, page, pageSize });
      
      const response = await this.axiosInstance.get(`/category/${category}.json`, {
        params: {
          page,
          page_size: pageSize
        }
      });
      
      logger.info('Products by category retrieved successfully', { 
        category, 
        productsCount: response.data.products?.length || 0,
        status: response.data.status 
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching products by category', { 
        category, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error(`Failed to fetch products in category ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search Products
   * Search for food products based on specific keywords.
   * 
   * @param query - The keyword(s) to search for in product names, brands, etc.
   * @param page - Page number for pagination (optional)
   * @param pageSize - Number of products per page (optional)
   * @returns Promise<OpenFoodFactsSearchResponse>
   */
  async searchProducts(query: string, page: number = 1, pageSize: number = 24): Promise<OpenFoodFactsSearchResponse> {
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
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error(`Failed to search products with query "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get vegan products from a specific category
   * Helper method to filter vegan products
   * 
   * @param category - Product category to search in
   * @param page - Page number
   * @param pageSize - Results per page
   * @returns Promise<OpenFoodFactsProduct[]>
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
   * Helper method to extract standardized nutrition data
   * 
   * @param product - OpenFoodFacts product data
   * @returns Standardized nutrition object
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
   * Test method for health checks
   * 
   * @returns Promise<boolean>
   */
  async isServiceAvailable(): Promise<boolean> {
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
}

// Export singleton instance
export const openFoodFactsService = new OpenFoodFactsService();