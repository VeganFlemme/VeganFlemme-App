/**
 * @jest-environment node
 */

import { openFoodFactsService } from '../src/services/openFoodFactsService';

// Use staging environment for tests
const testService = new (require('../src/services/openFoodFactsService').OpenFoodFactsService)(true);

describe('OpenFoodFactsService', () => {
  // Test basic product search
  describe('searchProducts', () => {
    it('should search for vegan products successfully', async () => {
      const query = 'oat milk';
      const results = await testService.searchProducts(query, 1, 5);
      
      expect(results).toBeDefined();
      expect(results.status).toBe(1);
      expect(Array.isArray(results.products)).toBe(true);
      
      if (results.products && results.products.length > 0) {
        const product = results.products[0];
        expect(product.product_name).toBeDefined();
        expect(typeof product.product_name).toBe('string');
      }
    }, 15000); // Extended timeout for API call

    it('should handle empty search results gracefully', async () => {
      const query = 'nonexistentproductxyz123456';
      const results = await testService.searchProducts(query, 1, 5);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results.products)).toBe(true);
    }, 10000);
  });

  // Test product lookup by barcode
  describe('getProductByBarcode', () => {
    it('should retrieve product by barcode successfully', async () => {
      // Use a known vegan product barcode - Oat milk example from documentation
      const barcode = '737628064502';
      const result = await testService.getProductByBarcode(barcode);
      
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      
      if (result.status === 1) {
        expect(result.product).toBeDefined();
        expect(result.product!.product_name).toBeDefined();
      }
    }, 10000);

    it('should handle invalid barcode gracefully', async () => {
      const invalidBarcode = '999999999999999999999';
      
      try {
        const result = await testService.getProductByBarcode(invalidBarcode);
        // API might return status 0 for not found instead of throwing
        expect(result).toBeDefined();
        expect([0, 1]).toContain(result.status);
      } catch (error) {
        // It's also acceptable to throw an error for invalid barcodes
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  // Test category search
  describe('getProductsByCategory', () => {
    it('should retrieve products by category successfully', async () => {
      const category = 'plant-based-foods';
      const results = await testService.getProductsByCategory(category, 1, 5);
      
      expect(results).toBeDefined();
      expect(results.status).toBeDefined();
      expect(Array.isArray(results.products)).toBe(true);
      
      if (results.products && results.products.length > 0) {
        const product = results.products[0];
        expect(product.product_name).toBeDefined();
      }
    }, 10000);
  });

  // Test vegan product filtering
  describe('getVeganProductsByCategory', () => {
    it('should retrieve vegan products successfully', async () => {
      const category = 'plant-based-foods';
      const veganProducts = await testService.getVeganProductsByCategory(category, 1, 5);
      
      expect(Array.isArray(veganProducts)).toBe(true);
      
      if (veganProducts.length > 0) {
        const product = veganProducts[0];
        expect(product.product_name).toBeDefined();
        expect(typeof product.product_name).toBe('string');
      }
    }, 15000);
  });

  // Test nutrition extraction
  describe('extractNutritionInfo', () => {
    it('should extract nutrition information correctly', () => {
      const mockProduct = {
        energy_100g: 250,
        proteins_100g: 3.5,
        carbohydrates_100g: 8.2,
        fat_100g: 1.8,
        fiber_100g: 0.5,
        salt_100g: 0.12,
        nutrition_grade_fr: 'b',
        ecoscore_grade: 'a',
        nova_group: 3
      };

      const nutrition = testService.extractNutritionInfo(mockProduct);
      
      expect(nutrition.energy).toBe(250);
      expect(nutrition.protein).toBe(3.5);
      expect(nutrition.carbohydrates).toBe(8.2);
      expect(nutrition.fat).toBe(1.8);
      expect(nutrition.fiber).toBe(0.5);
      expect(nutrition.salt).toBe(0.12);
      expect(nutrition.nutriScore).toBe('b');
      expect(nutrition.ecoScore).toBe('a');
      expect(nutrition.novaGroup).toBe(3);
    });

    it('should handle missing nutrition data gracefully', () => {
      const mockProduct = {
        product_name: 'Test Product'
      };

      const nutrition = testService.extractNutritionInfo(mockProduct);
      
      expect(nutrition.energy).toBe(0);
      expect(nutrition.protein).toBe(0);
      expect(nutrition.carbohydrates).toBe(0);
      expect(nutrition.fat).toBe(0);
      expect(nutrition.fiber).toBe(0);
      expect(nutrition.salt).toBe(0);
      expect(nutrition.nutriScore).toBeNull();
      expect(nutrition.ecoScore).toBeNull();
      expect(nutrition.novaGroup).toBeNull();
    });
  });

  // Test service availability
  describe('isServiceAvailable', () => {
    it('should check service availability', async () => {
      const isAvailable = await testService.isServiceAvailable();
      
      expect(typeof isAvailable).toBe('boolean');
      // In staging environment, service should be available
      expect(isAvailable).toBe(true);
    }, 10000);
  });

  // Test constructor and environment setup
  describe('constructor', () => {
    it('should initialize with staging environment', () => {
      const stagingService = new (require('../src/services/openFoodFactsService').OpenFoodFactsService)(true);
      expect(stagingService).toBeDefined();
    });

    it('should initialize with production environment', () => {
      const prodService = new (require('../src/services/openFoodFactsService').OpenFoodFactsService)(false);
      expect(prodService).toBeDefined();
    });
  });
});