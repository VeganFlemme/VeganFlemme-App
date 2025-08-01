import axios from 'axios';
import { AmazonProduct } from '../types';

/**
 * Amazon Product Advertising API Service
 * Integrates with Amazon PA API for product search and affiliate links
 */
class AmazonService {
  private baseUrl: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private associateTag: string;
  private region: string;

  constructor() {
    this.baseUrl = 'https://webservices.amazon.fr/paapi5';
    this.accessKeyId = process.env.AMAZON_ACCESS_KEY_ID || '';
    this.secretAccessKey = process.env.AMAZON_SECRET_ACCESS_KEY || '';
    this.associateTag = process.env.AMAZON_ASSOCIATE_TAG || '';
    this.region = process.env.AMAZON_REGION || 'eu-west-1';
    
    if (!this.accessKeyId || !this.secretAccessKey || !this.associateTag) {
      console.warn('Amazon API configuration is incomplete. Some features may not work properly.');
    }
  }

  /**
   * Search for products on Amazon
   * @param query - Search query (ingredient/product name)
   * @param options - Search options (category, filters, etc.)
   */
  async searchProducts(
    query: string,
    options?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      isVegan?: boolean;
      isOrganic?: boolean;
      brand?: string;
    }
  ): Promise<AmazonProduct[]> {
    try {
      // Build search parameters
      const searchParams = {
        keywords: query,
        searchIndex: options?.category || 'Grocery',
        itemCount: 10,
        resources: [
          'Images.Primary.Medium',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ContentInfo',
          'Offers.Listings.Price',
          'CustomerReviews.StarRating',
          'CustomerReviews.Count'
        ]
      };

      // Add vegan/organic filters to search query if specified
      if (options?.isVegan) {
        searchParams.keywords += ' vegan';
      }
      if (options?.isOrganic) {
        searchParams.keywords += ' organic';
      }
      if (options?.brand) {
        searchParams.keywords += ` ${options.brand}`;
      }

      // Call Amazon PA API through our backend proxy to handle authentication
      const response = await axios.post('/api/amazon/search', {
        ...searchParams,
        associateTag: this.associateTag
      });

      return response.data.searchResult?.items?.map(this.transformAmazonProduct) || [];
    } catch (error) {
      console.error('Error searching Amazon products:', error);
      // Return fallback data or empty array
      return this.getFallbackProducts(query, options);
    }
  }

  /**
   * Get product details by ASIN
   * @param asin - Amazon Standard Identification Number
   */
  async getProductByASIN(asin: string): Promise<AmazonProduct | null> {
    try {
      const response = await axios.post('/api/amazon/getItems', {
        itemIds: [asin],
        itemIdType: 'ASIN',
        resources: [
          'Images.Primary.Medium',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ContentInfo',
          'Offers.Listings.Price',
          'CustomerReviews.StarRating',
          'CustomerReviews.Count'
        ],
        associateTag: this.associateTag
      });

      const item = response.data.itemsResult?.items?.[0];
      return item ? this.transformAmazonProduct(item) : null;
    } catch (error) {
      console.error(`Error fetching Amazon product ${asin}:`, error);
      return null;
    }
  }

  /**
   * Get product recommendations for ingredients
   * @param ingredients - List of ingredient names
   */
  async getRecommendationsForIngredients(ingredients: string[]): Promise<AmazonProduct[]> {
    const recommendations: AmazonProduct[] = [];
    
    for (const ingredient of ingredients.slice(0, 5)) { // Limit to 5 ingredients to avoid rate limits
      try {
        const products = await this.searchProducts(ingredient, {
          category: 'Grocery',
          isVegan: true
        });
        recommendations.push(...products.slice(0, 2)); // Top 2 products per ingredient
      } catch (error) {
        console.error(`Error getting recommendations for ${ingredient}:`, error);
      }
    }

    return recommendations;
  }

  /**
   * Generate affiliate link for a product
   * @param asin - Amazon Standard Identification Number
   */
  generateAffiliateLink(asin: string): string {
    return `https://www.amazon.fr/dp/${asin}?tag=${this.associateTag}`;
  }

  /**
   * Transform Amazon API response to our AmazonProduct type
   */
  private transformAmazonProduct(apiProduct: any): AmazonProduct {
    const title = apiProduct.ItemInfo?.Title?.DisplayValue || 'Unknown Product';
    const asin = apiProduct.ASIN || '';
    
    return {
      id: `amazon_${asin}`,
      asin,
      title,
      description: apiProduct.ItemInfo?.Features?.DisplayValues?.join('. ') || '',
      price: apiProduct.Offers?.Listings?.[0]?.Price?.Amount || 0,
      currency: apiProduct.Offers?.Listings?.[0]?.Price?.Currency || 'EUR',
      imageUrl: apiProduct.Images?.Primary?.Medium?.URL || '',
      category: 'Grocery',
      brand: apiProduct.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
      rating: apiProduct.CustomerReviews?.StarRating?.Value,
      reviewCount: apiProduct.CustomerReviews?.Count,
      availability: apiProduct.Offers?.Listings?.[0]?.Availability?.Message || 'Available',
      affiliateUrl: this.generateAffiliateLink(asin),
      features: apiProduct.ItemInfo?.Features?.DisplayValues || [],
      isVegan: this.detectVeganProduct(title, apiProduct.ItemInfo?.Features?.DisplayValues),
      isOrganic: this.detectOrganicProduct(title, apiProduct.ItemInfo?.Features?.DisplayValues)
    };
  }

  /**
   * Detect if a product is likely vegan based on title and features
   */
  private detectVeganProduct(title: string, features?: string[]): boolean {
    const veganKeywords = ['vegan', 'plant-based', 'dairy-free', 'egg-free', 'plant based'];
    const nonVeganKeywords = ['dairy', 'milk', 'cheese', 'egg', 'meat', 'chicken', 'beef', 'pork', 'fish'];
    
    const allText = [title, ...(features || [])].join(' ').toLowerCase();
    
    const hasVeganKeywords = veganKeywords.some(keyword => allText.includes(keyword));
    const hasNonVeganKeywords = nonVeganKeywords.some(keyword => allText.includes(keyword));
    
    return hasVeganKeywords && !hasNonVeganKeywords;
  }

  /**
   * Detect if a product is organic
   */
  private detectOrganicProduct(title: string, features?: string[]): boolean {
    const organicKeywords = ['organic', 'usda organic', 'certified organic'];
    const allText = [title, ...(features || [])].join(' ').toLowerCase();
    
    return organicKeywords.some(keyword => allText.includes(keyword));
  }

  /**
   * Provide fallback products when API is unavailable
   */
  private getFallbackProducts(query: string, options?: any): AmazonProduct[] {
    // Return static fallback data for common vegan ingredients
    const fallbackData: Record<string, AmazonProduct> = {
      'tofu': {
        id: 'amazon_fallback_tofu',
        asin: 'B000000000',
        title: 'Organic Extra Firm Tofu',
        description: 'Premium organic tofu, perfect for all your vegan cooking needs.',
        price: 3.99,
        currency: 'EUR',
        imageUrl: 'https://via.placeholder.com/300x200?text=Organic+Tofu',
        category: 'Grocery',
        brand: 'Organic Valley',
        rating: 4.5,
        reviewCount: 245,
        availability: 'Available',
        affiliateUrl: `https://www.amazon.fr/dp/B000000000?tag=${this.associateTag}`,
        features: ['USDA Organic', 'Non-GMO', 'Plant-Based Protein'],
        isVegan: true,
        isOrganic: true
      },
      'oats': {
        id: 'amazon_fallback_oats',
        asin: 'B000000001',
        title: 'Organic Rolled Oats',
        description: 'Wholesome organic rolled oats for nutritious breakfast meals.',
        price: 5.49,
        currency: 'EUR',
        imageUrl: 'https://via.placeholder.com/300x200?text=Organic+Oats',
        category: 'Grocery',
        brand: 'Bob\'s Red Mill',
        rating: 4.7,
        reviewCount: 892,
        availability: 'Available',
        affiliateUrl: `https://www.amazon.fr/dp/B000000001?tag=${this.associateTag}`,
        features: ['USDA Organic', 'Whole Grain', 'High Fiber'],
        isVegan: true,
        isOrganic: true
      }
    };

    const matchingProduct = fallbackData[query.toLowerCase()];
    return matchingProduct ? [matchingProduct] : [];
  }
}

export default new AmazonService();