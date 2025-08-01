import { Request, Response } from 'express';
import amazonService from '../services/amazonService';
import { logger } from '../utils/logger';

/**
 * Amazon Product Search Controller
 * Handles search requests to Amazon PA API
 */
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keywords, searchIndex, itemCount, resources, associateTag } = req.body;

    // Validate required parameters
    if (!keywords || !associateTag) {
      res.status(400).json({ 
        error: 'Missing required parameters: keywords and associateTag are required' 
      });
      return;
    }

    // Check if Amazon service is configured
    if (!amazonService.isConfigured()) {
      // Return empty results in demo mode without logging warning
      res.json({ searchResult: { items: [] } });
      return;
    }

    const searchRequest = {
      keywords,
      searchIndex: searchIndex || 'Grocery',
      itemCount: itemCount || 10,
      resources: resources || [
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price'
      ],
      associateTag
    };

    logger.info('Amazon product search', { keywords, searchIndex });

    const results = await amazonService.searchProducts(searchRequest);
    
    res.json(results);
  } catch (error) {
    logger.error('Amazon search error:', error);
    
    // Return fallback empty result instead of error to avoid breaking the UI
    res.json({ 
      searchResult: { 
        items: [],
        error: 'Amazon search temporarily unavailable'
      } 
    });
  }
};

/**
 * Get Amazon products by ASIN
 */
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemIds, itemIdType, resources, associateTag } = req.body;

    // Validate required parameters
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0 || !associateTag) {
      res.status(400).json({ 
        error: 'Missing required parameters: itemIds (array) and associateTag are required' 
      });
      return;
    }

    // Check if Amazon service is configured
    if (!amazonService.isConfigured()) {
      res.json({ itemsResult: { items: [] } });
      return;
    }

    const getItemsRequest = {
      itemIds,
      itemIdType: itemIdType || 'ASIN',
      resources: resources || [
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price'
      ],
      associateTag
    };

    logger.info('Amazon get items', { itemIds, itemIdType });

    const results = await amazonService.getItems(getItemsRequest);
    
    res.json(results);
  } catch (error) {
    logger.error('Amazon get items error:', error);
    
    // Return fallback empty result instead of error to avoid breaking the UI
    res.json({ 
      itemsResult: { 
        items: [],
        error: 'Amazon get items temporarily unavailable'
      } 
    });
  }
};

/**
 * Get product recommendations for shopping list ingredients
 */
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ingredients, associateTag } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || !associateTag) {
      res.status(400).json({ 
        error: 'Missing required parameters: ingredients (array) and associateTag are required' 
      });
      return;
    }

    if (!amazonService.isConfigured()) {
      res.json({ recommendations: [] });
      return;
    }

    const recommendations = [];

    // Search for each ingredient (limit to first 5 to avoid rate limits)
    for (const ingredient of ingredients.slice(0, 5)) {
      try {
        const searchRequest = {
          keywords: `${ingredient} vegan organic`,
          searchIndex: 'Grocery',
          itemCount: 3,
          resources: [
            'Images.Primary.Medium',
            'ItemInfo.Title',
            'ItemInfo.Features',
            'Offers.Listings.Price',
            'CustomerReviews.StarRating'
          ],
          associateTag
        };

        const results = await amazonService.searchProducts(searchRequest);
        
        if (results.searchResult?.items) {
          recommendations.push({
            ingredient,
            products: results.searchResult.items.slice(0, 2) // Top 2 products per ingredient
          });
        }
      } catch (error) {
        logger.error(`Error getting recommendations for ${ingredient}:`, error);
        // Continue with other ingredients even if one fails
      }
    }

    logger.info('Amazon recommendations generated', { 
      ingredientCount: ingredients.length, 
      recommendationCount: recommendations.length 
    });

    res.json({ recommendations });
  } catch (error) {
    logger.error('Amazon recommendations error:', error);
    res.json({ recommendations: [] });
  }
};