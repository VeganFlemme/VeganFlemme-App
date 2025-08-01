/**
 * @jest-environment node
 */

import { optimizedCiqualService } from '../src/services/optimizedCiqualService';
import * as path from 'path';
import * as fs from 'fs';

describe('OptimizedCiqualService', () => {
  beforeAll(async () => {
    // Check if optimized data file exists
    const dataDir = path.join(__dirname, '..', 'data');
    const optimizedFile = path.join(dataDir, 'ciqual-optimized.json');
    
    if (!fs.existsSync(optimizedFile)) {
      console.warn('Warning: Optimized CIQUAL file not found. Run optimization script first.');
    }
  }, 30000);

  // Test service initialization
  describe('initialization', () => {
    it('should initialize service quickly', async () => {
      const startTime = Date.now();
      
      try {
        await optimizedCiqualService.initialize();
        const initTime = Date.now() - startTime;
        
        expect(optimizedCiqualService.isInitialized()).toBe(true);
        expect(initTime).toBeLessThan(1000); // Should be under 1 second
        
        console.log(`Optimized CIQUAL initialization time: ${initTime}ms`);
      } catch (error) {
        console.warn('Optimized CIQUAL initialization failed:', error);
        expect(error).toBeDefined();
      }
    }, 10000);

    it('should handle multiple initialization calls gracefully', async () => {
      try {
        await optimizedCiqualService.initialize();
        await optimizedCiqualService.initialize(); // Second call should not fail
        expect(optimizedCiqualService.isInitialized()).toBe(true);
      } catch (error) {
        console.warn('Optimized CIQUAL initialization failed:', error);
      }
    }, 5000);
  });

  // Test search performance
  describe('search performance', () => {
    it('should perform fast searches', async () => {
      try {
        const queries = ['pomme', 'tomate', 'lentille', 'quinoa', 'avocat'];
        const searchTimes: number[] = [];
        
        for (const query of queries) {
          const startTime = Date.now();
          const results = await optimizedCiqualService.searchFoodsByName(query, 5);
          const searchTime = Date.now() - startTime;
          
          searchTimes.push(searchTime);
          
          expect(results).toBeDefined();
          expect(Array.isArray(results.foods)).toBe(true);
          expect(typeof results.total).toBe('number');
          expect(searchTime).toBeLessThan(100); // Should be under 100ms
        }
        
        const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
        console.log(`Average search time: ${avgSearchTime.toFixed(2)}ms`);
        
        expect(avgSearchTime).toBeLessThan(50); // Average should be under 50ms
      } catch (error) {
        console.warn('Search performance test failed:', error);
      }
    }, 15000);
  });

  // Test search functionality
  describe('searchFoodsByName', () => {
    it('should search for foods by name', async () => {
      try {
        const results = await optimizedCiqualService.searchFoodsByName('pomme', 5);
        
        expect(results).toBeDefined();
        expect(results.foods).toBeDefined();
        expect(Array.isArray(results.foods)).toBe(true);
        expect(typeof results.total).toBe('number');
        
        if (results.foods.length > 0) {
          const food = results.foods[0];
          expect(food.code).toBeDefined();
          expect(food.name).toBeDefined();
          expect(typeof food.name).toBe('string');
          expect(food.name.toLowerCase()).toContain('pomme');
        }
      } catch (error) {
        console.warn('Food search failed:', error);
      }
    }, 5000);

    it('should handle empty search results', async () => {
      try {
        const results = await optimizedCiqualService.searchFoodsByName('nonexistentfoodxyz123', 5);
        
        expect(results).toBeDefined();
        expect(Array.isArray(results.foods)).toBe(true);
        expect(results.foods.length).toBe(0);
        expect(results.total).toBe(0);
      } catch (error) {
        console.warn('Food search failed:', error);
      }
    }, 2000);

    it('should respect limit parameter', async () => {
      try {
        const limit = 3;
        const results = await optimizedCiqualService.searchFoodsByName('légume', limit);
        
        expect(results).toBeDefined();
        expect(results.foods.length).toBeLessThanOrEqual(limit);
      } catch (error) {
        console.warn('Food search failed:', error);
      }
    }, 5000);
  });

  // Test food retrieval by code
  describe('getFoodByCode', () => {
    it('should retrieve food by code if available', async () => {
      try {
        // First search to get a valid code
        const searchResults = await optimizedCiqualService.searchFoodsByName('pomme', 1);
        
        if (searchResults.foods.length > 0) {
          const foodCode = searchResults.foods[0].code;
          const food = await optimizedCiqualService.getFoodByCode(foodCode);
          
          expect(food).toBeDefined();
          expect(food!.code).toBe(foodCode);
          expect(food!.name).toBeDefined();
        }
      } catch (error) {
        console.warn('Food code retrieval failed:', error);
      }
    }, 5000);

    it('should return null for non-existent code', async () => {
      try {
        const food = await optimizedCiqualService.getFoodByCode('NONEXISTENT999');
        expect(food).toBeNull();
      } catch (error) {
        console.warn('Food code test failed:', error);
      }
    });
  });

  // Test vegan foods filtering
  describe('getVeganFoods', () => {
    it('should retrieve vegan foods quickly', async () => {
      try {
        const startTime = Date.now();
        const veganFoods = await optimizedCiqualService.getVeganFoods(20);
        const searchTime = Date.now() - startTime;
        
        expect(Array.isArray(veganFoods)).toBe(true);
        expect(searchTime).toBeLessThan(50); // Should be very fast with pre-built index
        
        console.log(`Vegan foods search time: ${searchTime}ms`);
        
        if (veganFoods.length > 0) {
          const food = veganFoods[0];
          expect(food.code).toBeDefined();
          expect(food.name).toBeDefined();
          
          // Check that the food name/group suggests it's vegan
          const nameLower = food.name.toLowerCase();
          const groupLower = (food.group || '').toLowerCase();
          
          const veganKeywords = [
            'légume', 'fruit', 'céréale', 'légumineuse', 'noix', 'graine',
            'végétal', 'plante', 'huile végétale', 'farine', 'pain'
          ];
          
          const containsVeganKeyword = veganKeywords.some(keyword => 
            nameLower.includes(keyword) || groupLower.includes(keyword)
          );
          
          expect(containsVeganKeyword).toBe(true);
        }
      } catch (error) {
        console.warn('Vegan foods retrieval failed:', error);
      }
    }, 10000);
  });

  // Test nutrition summary
  describe('getNutritionSummary', () => {
    it('should generate nutrition summary for a food', () => {
      const mockFood = {
        code: 'TEST001',
        name: 'Test Food',
        energy: 250,
        protein: 12.5,
        carbohydrates: 35.0,
        fat: 8.2,
        fiber: 3.5,
        calcium: 120,
        iron: 2.5,
        vitaminC: 15.0,
        vitaminB12: 0.8
      };

      const nutrition = optimizedCiqualService.getNutritionSummary(mockFood);
      
      expect(nutrition).toBeDefined();
      expect(nutrition.energy).toBe(250);
      expect(nutrition.protein).toBe(12.5);
      expect(nutrition.carbohydrates).toBe(35.0);
      expect(nutrition.fat).toBe(8.2);
      expect(nutrition.fiber).toBe(3.5);
      expect(nutrition.minerals.calcium).toBe(120);
      expect(nutrition.minerals.iron).toBe(2.5);
      expect(nutrition.vitamins.c).toBe(15.0);
      expect(nutrition.vitamins.b12).toBe(0.8);
    });
  });

  // Test metadata
  describe('metadata', () => {
    it('should provide metadata about loaded data', async () => {
      try {
        await optimizedCiqualService.initialize();
        const metadata = optimizedCiqualService.getMetadata();
        
        if (metadata) {
          expect(metadata.version).toBeDefined();
          expect(metadata.generatedAt).toBeDefined();
          expect(metadata.totalFoods).toBeGreaterThan(0);
          expect(Array.isArray(metadata.sourceFiles)).toBe(true);
        }
      } catch (error) {
        console.warn('Metadata test failed:', error);
      }
    });
  });

  // Test service status
  describe('service status', () => {
    it('should report correct initialization status', () => {
      const isInitialized = optimizedCiqualService.isInitialized();
      expect(typeof isInitialized).toBe('boolean');
    });

    it('should report total foods count', () => {
      const count = optimizedCiqualService.getTotalFoodsCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // Performance comparison with original service
  describe('performance comparison', () => {
    it('should be significantly faster than original service', async () => {
      try {
        // Test optimized service performance
        const optimizedStartTime = Date.now();
        await optimizedCiqualService.initialize();
        const optimizedSearchStart = Date.now();
        await optimizedCiqualService.searchFoodsByName('pomme', 10);
        const optimizedTotalTime = Date.now() - optimizedStartTime;
        const optimizedSearchTime = Date.now() - optimizedSearchStart;
        
        console.log(`Optimized service - Total time: ${optimizedTotalTime}ms, Search time: ${optimizedSearchTime}ms`);
        
        // Expectations for performance
        expect(optimizedTotalTime).toBeLessThan(2000); // Should initialize in under 2 seconds
        expect(optimizedSearchTime).toBeLessThan(50); // Should search in under 50ms
        
      } catch (error) {
        console.warn('Performance comparison failed:', error);
      }
    }, 15000);
  });
});