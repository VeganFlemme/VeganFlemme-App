import axios from 'axios';
import { GreenweezProduct } from '../types';

class GreenweezService {
  private baseUrl: string;
  private apiKey: string;
  private affiliateId: string;

  constructor() {
    this.baseUrl = process.env.GREENWEEZ_API_URL || '';
    this.apiKey = process.env.GREENWEEZ_API_KEY || '';
    this.affiliateId = process.env.GREENWEEZ_AFFILIATE_ID || '';
    
    if (!this.baseUrl || !this.apiKey || !this.affiliateId) {
      console.warn('Greenweez API configuration is incomplete. Some features may not work properly.');
    }
  }

  /**
   * Search products from Greenweez
   * @param query Search query
   * @param filters Optional filters (category, price range, etc.)
   * @param page Page number for pagination
   * @param limit Number of results per page
   */
  async searchProducts(
    query: string, 
    filters?: { 
      category?: string,
      minPrice?: number,
      maxPrice?: number,
      isOrganic?: boolean,
      brand?: string
    },
    page = 1,
    limit = 20
  ): Promise<{ products: GreenweezProduct[], totalCount: number }> {
    try {
      const response = await axios.get(`${this.baseUrl}/products/search`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          query,
          ...filters,
          page,
          limit,
          affiliate_id: this.affiliateId
        }
      });

      return {
        products: response.data.products.map(this.transformProduct),
        totalCount: response.data.totalCount
      };
    } catch (error) {
      console.error('Error searching Greenweez products:', error);
      throw new Error('Failed to search Greenweez products');
    }
  }

  /**
   * Get product details by ID
   * @param productId Greenweez product ID
   */
  async getProductById(productId: string): Promise<GreenweezProduct> {
    try {
      const response = await axios.get(`${this.baseUrl}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          affiliate_id: this.affiliateId
        }
      });

      return this.transformProduct(response.data);
    } catch (error) {
      console.error(`Error fetching Greenweez product ${productId}:`, error);
      throw new Error('Failed to fetch product details');
    }
  }

  /**
   * Get product recommendations based on user preferences
   * @param categories Categories to search in
   * @param preferences User dietary preferences
   */
  async getRecommendations(
    categories: string[],
    preferences: string[]
  ): Promise<GreenweezProduct[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/recommendations`,
        {
          categories,
          preferences,
          affiliate_id: this.affiliateId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.map(this.transformProduct);
    } catch (error) {
      console.error('Error fetching Greenweez recommendations:', error);
      throw new Error('Failed to fetch product recommendations');
    }
  }

  /**
   * Generate affiliate link for a product
   * @param productId Greenweez product ID
   */
  generateAffiliateLink(productId: string): string {
    return `https://www.greenweez.com/products/${productId}?aff=${this.affiliateId}`;
  }

  /**
   * Transform API response to our GreenweezProduct type
   * @param apiProduct Product data from API
   */
  private transformProduct(apiProduct: any): GreenweezProduct {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      description: apiProduct.description,
      price: apiProduct.price,
      imageUrl: apiProduct.image_url,
      category: apiProduct.category,
      subcategory: apiProduct.subcategory,
      tags: apiProduct.tags || [],
      nutritionalInfo: apiProduct.nutritional_info ? {
        calories: apiProduct.nutritional_info.calories,
        protein: apiProduct.nutritional_info.protein,
        carbs: apiProduct.nutritional_info.carbs,
        fat: apiProduct.nutritional_info.fat,
        fiber: apiProduct.nutritional_info.fiber,
        sugar: apiProduct.nutritional_info.sugar,
        sodium: apiProduct.nutritional_info.sodium
      } : undefined,
      ingredients: apiProduct.ingredients,
      isOrganic: apiProduct.is_organic || false,
      isFairTrade: apiProduct.is_fair_trade,
      brand: apiProduct.brand,
      packageSize: apiProduct.package_size,
      affiliateUrl: `https://www.greenweez.com/products/${apiProduct.id}?aff=${this.affiliateId}`
    };
  }
}

export default new GreenweezService();