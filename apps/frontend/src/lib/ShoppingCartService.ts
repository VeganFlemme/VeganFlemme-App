import { ShoppingList, ShoppingItem, AmazonProduct, GreenweezProduct } from '../types';
import { getShoppingListById, updateShoppingList } from './shoppingListService';
import AmazonService from './AmazonService';
import GreenweezService from './GreenweezService';

/**
 * Enhanced Shopping Cart Service
 * Connects menu generation to shopping lists with affiliate product integration
 */
class ShoppingCartService {
  /**
   * Generate shopping list from menu ingredients with affiliate product mappings
   * @param menuData - Generated menu from backend
   * @param userId - User ID
   * @param listName - Name for the shopping list
   */
  async generateShoppingListFromMenu(
    menuData: any,
    userId: string,
    listName: string = 'Weekly Menu Shopping List'
  ): Promise<ShoppingList> {
    try {
      // Extract ingredients from all meals in the menu
      const ingredients = this.extractIngredientsFromMenu(menuData);
      
      // Create shopping items with affiliate product suggestions
      const shoppingItems: ShoppingItem[] = [];
      
      for (const ingredient of ingredients) {
        // Create base shopping item
        const item: ShoppingItem = {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient.name,
          quantity: ingredient.totalQuantity,
          unit: ingredient.unit,
          category: this.categorizeIngredient(ingredient.name),
          isCompleted: false,
          notes: `Needed for: ${ingredient.usedInMeals.join(', ')}`
        };

        // Try to find affiliate products for this ingredient
        try {
          // First try Amazon (if configured)
          const amazonProducts = await AmazonService.searchProducts(ingredient.name, {
            category: 'Grocery',
            isVegan: true,
            isOrganic: true
          });
          
          if (amazonProducts.length > 0) {
            item.amazonProductId = amazonProducts[0].asin;
            item.amazonProductUrl = amazonProducts[0].affiliateUrl;
          }

          // Then try Greenweez (if configured)
          const greenweezResults = await GreenweezService.searchProducts(ingredient.name, {
            isOrganic: true
          });
          
          if (greenweezResults.products.length > 0) {
            item.greenweezProductId = greenweezResults.products[0].id;
            item.greenweezProductUrl = greenweezResults.products[0].affiliateUrl;
          }
        } catch (error) {
          console.warn(`Could not find affiliate products for ${ingredient.name}:`, error);
          // Continue without affiliate products - basic shopping list functionality still works
        }

        shoppingItems.push(item);
      }

      // Create the shopping list
      const shoppingList: ShoppingList = {
        id: `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        name: listName,
        items: shoppingItems,
        createdAt: new Date(),
        updatedAt: new Date(),
        isCompleted: false,
        totalEstimatedCost: await this.calculateEstimatedCost(shoppingItems),
        metadata: {
          generatedFromMenu: true,
          menuId: menuData.id || 'generated_menu',
          affiliatePartnersAvailable: {
            amazon: shoppingItems.some(item => item.amazonProductId),
            greenweez: shoppingItems.some(item => item.greenweezProductId)
          }
        }
      };

      return shoppingList;
    } catch (error) {
      console.error('Error generating shopping list from menu:', error);
      throw new Error('Failed to generate shopping list from menu');
    }
  }

  /**
   * Extract and consolidate ingredients from menu data
   */
  private extractIngredientsFromMenu(menuData: any): Array<{
    name: string;
    totalQuantity: number;
    unit: string;
    usedInMeals: string[];
  }> {
    const ingredientMap = new Map<string, {
      totalQuantity: number;
      unit: string;
      usedInMeals: string[];
    }>();

    // Process each day and meal
    for (const day of menuData.days || []) {
      const dayName = day.date || `Day ${day.dayNumber || 1}`;
      
      for (const [mealType, meal] of Object.entries(day.meals || {})) {
        if (!meal || !meal.ingredients) continue;

        for (const ingredient of meal.ingredients) {
          const key = ingredient.name.toLowerCase();
          const mealLabel = `${dayName} ${mealType}`;

          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            // Only add quantities if units match, otherwise keep separate entries
            if (existing.unit === ingredient.unit) {
              existing.totalQuantity += ingredient.quantity || 0;
              existing.usedInMeals.push(mealLabel);
            } else {
              // Create new entry with different unit
              const newKey = `${key}_${ingredient.unit}`;
              ingredientMap.set(newKey, {
                totalQuantity: ingredient.quantity || 0,
                unit: ingredient.unit || 'unit',
                usedInMeals: [mealLabel]
              });
            }
          } else {
            ingredientMap.set(key, {
              totalQuantity: ingredient.quantity || 0,
              unit: ingredient.unit || 'unit',
              usedInMeals: [mealLabel]
            });
          }
        }
      }
    }

    // Convert map to array
    return Array.from(ingredientMap.entries()).map(([name, data]) => ({
      name: name.replace(/_[^_]*$/, ''), // Remove unit suffix if added
      ...data
    }));
  }

  /**
   * Categorize ingredient for shopping organization
   */
  private categorizeIngredient(ingredientName: string): string {
    const name = ingredientName.toLowerCase();
    
    const categories = {
      'produce': ['tomato', 'lettuce', 'onion', 'carrot', 'pepper', 'cucumber', 'spinach', 'broccoli', 'potato', 'apple', 'banana', 'lemon', 'garlic', 'ginger'],
      'proteins': ['tofu', 'tempeh', 'seitan', 'beans', 'lentils', 'chickpeas', 'quinoa', 'nuts', 'seeds'],
      'grains': ['rice', 'pasta', 'bread', 'oats', 'flour', 'barley', 'wheat'],
      'dairy-alternatives': ['almond milk', 'soy milk', 'oat milk', 'coconut milk', 'vegan cheese', 'nutritional yeast'],
      'pantry': ['oil', 'vinegar', 'salt', 'pepper', 'herbs', 'spices', 'sauce', 'paste'],
      'frozen': ['frozen peas', 'frozen corn', 'frozen berries'],
      'snacks': ['crackers', 'chips', 'popcorn']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * Calculate estimated cost of shopping list items
   */
  private async calculateEstimatedCost(items: ShoppingItem[]): Promise<number> {
    let totalCost = 0;

    for (const item of items) {
      try {
        // Try to get price from Amazon first
        if (item.amazonProductId) {
          const amazonProduct = await AmazonService.getProductByASIN(item.amazonProductId);
          if (amazonProduct && amazonProduct.price > 0) {
            totalCost += amazonProduct.price * item.quantity;
            continue;
          }
        }

        // Try Greenweez if Amazon not available
        if (item.greenweezProductId) {
          const greenweezProduct = await GreenweezService.getProductById(item.greenweezProductId);
          if (greenweezProduct && greenweezProduct.price > 0) {
            totalCost += greenweezProduct.price * item.quantity;
            continue;
          }
        }

        // Fallback to estimated prices for common vegan ingredients
        const estimatedPrice = this.getEstimatedPrice(item.name, item.unit);
        totalCost += estimatedPrice * item.quantity;
      } catch (error) {
        console.warn(`Could not calculate cost for ${item.name}:`, error);
        // Use fallback estimate
        const estimatedPrice = this.getEstimatedPrice(item.name, item.unit);
        totalCost += estimatedPrice * item.quantity;
      }
    }

    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get estimated price for common ingredients when affiliate data is unavailable
   */
  private getEstimatedPrice(ingredientName: string, unit: string): number {
    const name = ingredientName.toLowerCase();
    
    // Price estimates in USD per unit
    const priceEstimates: Record<string, number> = {
      // Proteins (per unit/serving)
      'tofu': 3.50,
      'tempeh': 4.00,
      'lentils': 0.15,
      'chickpeas': 0.20,
      'beans': 0.18,
      'quinoa': 0.30,
      
      // Produce (per piece/serving)
      'tomato': 0.75,
      'onion': 0.50,
      'carrot': 0.25,
      'pepper': 1.50,
      'apple': 0.60,
      'banana': 0.25,
      'lemon': 0.50,
      
      // Grains (per serving)
      'rice': 0.20,
      'pasta': 0.25,
      'oats': 0.15,
      'bread': 0.30,
      
      // Dairy alternatives
      'almond milk': 4.50,
      'soy milk': 3.50,
      'oat milk': 4.00,
      
      // Default
      'default': 1.00
    };

    // Find matching ingredient
    for (const [ingredient, price] of Object.entries(priceEstimates)) {
      if (name.includes(ingredient)) {
        return price;
      }
    }

    return priceEstimates.default;
  }

  /**
   * Add affiliate products to existing shopping list item
   */
  async enhanceShoppingItemWithProducts(
    listId: string, 
    itemId: string
  ): Promise<{ amazon: AmazonProduct[], greenweez: GreenweezProduct[] }> {
    try {
      const shoppingList = await getShoppingListById(listId);
      const item = shoppingList.items.find(i => i.id === itemId);
      
      if (!item) {
        throw new Error('Shopping item not found');
      }

      // Search for products
      const [amazonProducts, greenweezResults] = await Promise.allSettled([
        AmazonService.searchProducts(item.name, {
          category: 'Grocery',
          isVegan: true
        }),
        GreenweezService.searchProducts(item.name, {
          isOrganic: true
        })
      ]);

      const amazon = amazonProducts.status === 'fulfilled' ? amazonProducts.value : [];
      const greenweez = greenweezResults.status === 'fulfilled' ? greenweezResults.value.products : [];

      return { amazon, greenweez };
    } catch (error) {
      console.error('Error enhancing shopping item with products:', error);
      return { amazon: [], greenweez: [] };
    }
  }

  /**
   * Generate complete shopping cart with affiliate links ready for checkout
   */
  async generateShoppingCart(shoppingListId: string): Promise<{
    amazonCart: AmazonProduct[];
    greenweezCart: GreenweezProduct[];
    totalEstimatedCost: number;
    affiliateLinks: {
      amazonCheckout: string;
      greenweezCheckout: string;
    };
  }> {
    try {
      const shoppingList = await getShoppingListById(shoppingListId);
      
      const amazonCart: AmazonProduct[] = [];
      const greenweezCart: GreenweezProduct[] = [];
      let totalCost = 0;

      for (const item of shoppingList.items) {
        if (!item.isCompleted) {
          // Add Amazon products
          if (item.amazonProductId) {
            const product = await AmazonService.getProductByASIN(item.amazonProductId);
            if (product) {
              amazonCart.push(product);
              totalCost += product.price * item.quantity;
            }
          }

          // Add Greenweez products
          if (item.greenweezProductId) {
            const product = await GreenweezService.getProductById(item.greenweezProductId);
            if (product) {
              greenweezCart.push(product);
              totalCost += product.price * item.quantity;
            }
          }
        }
      }

      // Generate checkout links
      const amazonCheckout = this.generateAmazonCartLink(amazonCart);
      const greenweezCheckout = this.generateGreenweezCartLink(greenweezCart);

      return {
        amazonCart,
        greenweezCart,
        totalEstimatedCost: Math.round(totalCost * 100) / 100,
        affiliateLinks: {
          amazonCheckout,
          greenweezCheckout
        }
      };
    } catch (error) {
      console.error('Error generating shopping cart:', error);
      throw new Error('Failed to generate shopping cart');
    }
  }

  /**
   * Generate Amazon cart link with multiple products
   */
  private generateAmazonCartLink(products: AmazonProduct[]): string {
    if (products.length === 0) return '';
    
    // For multiple products, we'll use the wishlist approach or individual links
    const associateTag = process.env.AMAZON_ASSOCIATE_TAG || '';
    const baseUrl = 'https://www.amazon.com/gp/aws/cart/add.html';
    
    // Create add-to-cart URL for first product (Amazon limits cart API)
    const firstProduct = products[0];
    return `${baseUrl}?ASIN.1=${firstProduct.asin}&Quantity.1=1&tag=${associateTag}`;
  }

  /**
   * Generate Greenweez cart link
   */
  private generateGreenweezCartLink(products: GreenweezProduct[]): string {
    if (products.length === 0) return '';
    
    // Greenweez cart implementation would depend on their specific API
    // For now, redirect to first product
    return products[0]?.affiliateUrl || '';
  }
}

export default new ShoppingCartService();