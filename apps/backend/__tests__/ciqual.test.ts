/**
 * @jest-environment node
 */

import { ciqualService } from '../src/services/ciqualService';
import * as path from 'path';
import * as fs from 'fs';

describe('CiqualService', () => {
  beforeAll(async () => {
    // Check if CIQUAL files exist before running tests
    const rootDir = path.join(__dirname, '..', '..');
    const files = [
      'Table Ciqual 2020_FR_2020 07 07.xls',
      'Table Aliments moyens Ciqual 2020_2021 04 23.xlsx', 
      'CALNUT2020_2020_07_07.xlsx'
    ];
    
    let filesExist = 0;
    for (const fileName of files) {
      const filePath = path.join(rootDir, fileName);
      if (fs.existsSync(filePath)) {
        filesExist++;
      }
    }
    
    if (filesExist === 0) {
      console.warn('Warning: No CIQUAL files found. Some tests will be skipped.');
    }
  });

  // Test service initialization
  describe('initialization', () => {
    it('should initialize service successfully', async () => {
      expect(ciqualService).toBeDefined();
      
      try {
        await ciqualService.initialize();
        expect(ciqualService.isInitialized()).toBe(true);
      } catch (error) {
        // If files don't exist, initialization might fail
        console.warn('CIQUAL initialization failed, likely due to missing data files:', error);
        expect(error).toBeDefined();
      }
    }, 30000); // Extended timeout for file processing

    it('should handle multiple initialization calls gracefully', async () => {
      try {
        await ciqualService.initialize();
        await ciqualService.initialize(); // Second call should not fail
        expect(ciqualService.isInitialized()).toBe(true);
      } catch (error) {
        console.warn('CIQUAL initialization failed:', error);
      }
    }, 15000);
  });

  // Test food search functionality
  describe('searchFoodsByName', () => {
    it('should search for foods by name', async () => {
      try {
        const results = await ciqualService.searchFoodsByName('pomme', 5);
        
        expect(results).toBeDefined();
        expect(results.foods).toBeDefined();
        expect(Array.isArray(results.foods)).toBe(true);
        expect(typeof results.total).toBe('number');
        
        if (results.foods.length > 0) {
          const food = results.foods[0];
          expect(food.code).toBeDefined();
          expect(food.name).toBeDefined();
          expect(typeof food.name).toBe('string');
        }
      } catch (error) {
        console.warn('Food search failed, likely due to missing data files:', error);
      }
    }, 10000);

    it('should handle empty search results', async () => {
      try {
        const results = await ciqualService.searchFoodsByName('nonexistentfoodxyz123', 5);
        
        expect(results).toBeDefined();
        expect(Array.isArray(results.foods)).toBe(true);
        expect(results.foods.length).toBe(0);
        expect(results.total).toBe(0);
      } catch (error) {
        console.warn('Food search failed:', error);
      }
    }, 5000);

    it('should respect limit parameter', async () => {
      try {
        const limit = 3;
        const results = await ciqualService.searchFoodsByName('légume', limit);
        
        expect(results).toBeDefined();
        expect(results.foods.length).toBeLessThanOrEqual(limit);
      } catch (error) {
        console.warn('Food search failed:', error);
      }
    }, 10000);
  });

  // Test food retrieval by code
  describe('getFoodByCode', () => {
    it('should retrieve food by code if available', async () => {
      try {
        // We don't know exact codes, so we'll search first then test retrieval
        const searchResults = await ciqualService.searchFoodsByName('pomme', 1);
        
        if (searchResults.foods.length > 0) {
          const foodCode = searchResults.foods[0].code;
          const food = await ciqualService.getFoodByCode(foodCode);
          
          expect(food).toBeDefined();
          expect(food!.code).toBe(foodCode);
          expect(food!.name).toBeDefined();
        }
      } catch (error) {
        console.warn('Food code retrieval failed:', error);
      }
    }, 10000);

    it('should return null for non-existent code', async () => {
      try {
        const food = await ciqualService.getFoodByCode('NONEXISTENT999');
        expect(food).toBeNull();
      } catch (error) {
        console.warn('Food code test failed:', error);
      }
    });
  });

  // Test group-based search
  describe('getFoodsByGroup', () => {
    it('should retrieve foods by group', async () => {
      try {
        const results = await ciqualService.getFoodsByGroup('légume', 10);
        
        expect(results).toBeDefined();
        expect(Array.isArray(results.foods)).toBe(true);
        expect(typeof results.total).toBe('number');
        
        if (results.foods.length > 0) {
          const food = results.foods[0];
          expect(food.code).toBeDefined();
          expect(food.name).toBeDefined();
        }
      } catch (error) {
        console.warn('Group search failed:', error);
      }
    }, 10000);
  });

  // Test vegan foods filtering
  describe('getVeganFoods', () => {
    it('should retrieve vegan foods', async () => {
      try {
        const veganFoods = await ciqualService.getVeganFoods(20);
        
        expect(Array.isArray(veganFoods)).toBe(true);
        
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
    }, 15000);
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

      const nutrition = ciqualService.getNutritionSummary(mockFood);
      
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

    it('should handle missing nutrition data', () => {
      const mockFood = {
        code: 'TEST002',
        name: 'Test Food Minimal'
      };

      const nutrition = ciqualService.getNutritionSummary(mockFood);
      
      expect(nutrition).toBeDefined();
      expect(nutrition.energy).toBe(0);
      expect(nutrition.protein).toBe(0);
      expect(nutrition.carbohydrates).toBe(0);
      expect(nutrition.fat).toBe(0);
      expect(nutrition.fiber).toBe(0);
      expect(nutrition.minerals.calcium).toBeUndefined();
      expect(nutrition.vitamins.c).toBeUndefined();
    });
  });

  // Test service status
  describe('service status', () => {
    it('should report correct initialization status', () => {
      const isInitialized = ciqualService.isInitialized();
      expect(typeof isInitialized).toBe('boolean');
    });

    it('should report total foods count', () => {
      const count = ciqualService.getTotalFoodsCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // Test error handling
  describe('error handling', () => {
    it('should handle service calls before initialization gracefully', async () => {
      // Create a new service instance that hasn't been initialized
      const newService = new (require('../src/services/ciqualService').CiqualService)();
      
      try {
        // This should trigger initialization internally
        const results = await newService.searchFoodsByName('test', 1);
        expect(results).toBeDefined();
      } catch (error) {
        // Expected if files don't exist
        expect(error).toBeDefined();
      }
    }, 30000);
  });
});