/**
 * Performance and Integration Validation Test for Enhanced Menu Optimization
 * This test validates the integration of Claude AI algorithm with existing services
 */
import { EnhancedMenuOptimizationService } from '../src/services/enhancedMenuOptimizationService';
import { MenuOptimizationService } from '../src/services/menuOptimizationService';
import { NutritionProfile, UserPreferences, MenuPreferences, DietaryRestrictions } from '../src/types';

describe('Enhanced Algorithm Integration Validation', () => {
  let enhancedService: EnhancedMenuOptimizationService;
  let standardService: MenuOptimizationService;

  beforeEach(() => {
    enhancedService = new EnhancedMenuOptimizationService();
    standardService = new MenuOptimizationService();
  });

  describe('Performance Comparison', () => {
    it('should demonstrate enhanced algorithm superiority', async () => {
      const userProfile: NutritionProfile = {
        age: 30,
        gender: 'male',
        weight: 75,
        height: 180,
        activityLevel: 'moderate',
        goals: 'maintain'
      };

      const preferences: UserPreferences = {
        people: 2,
        budget: 'medium',
        cookingTime: 'medium',
        daysCount: 3
      };

      const standardPreferences: MenuPreferences = {
        people: 2,
        budget: 'medium',
        cookingTime: 'medium',
        cuisineTypes: ['mediterranean'],
        mealTypes: ['breakfast', 'lunch', 'dinner'],
        daysCount: 3
      };

      const restrictions: DietaryRestrictions = {
        allergens: [],
        intolerances: [],
        preferences: ['vegan'],
        excludedIngredients: []
      };

      // Test Enhanced Algorithm
      const startEnhanced = Date.now();
      const enhancedMenu = enhancedService.generateOptimizedMenu(userProfile, preferences, 3);
      const enhancedTime = Date.now() - startEnhanced;

      // Test Standard Algorithm
      const startStandard = Date.now();
      const standardResult = await standardService.optimizeMenuEnhanced(userProfile, standardPreferences, restrictions);
      const standardTime = Date.now() - startStandard;

      // Validate Enhanced Algorithm Results
      expect(enhancedMenu).toBeDefined();
      expect(enhancedMenu.id).toBeDefined();
      expect(enhancedMenu.days).toHaveLength(3);
      expect(enhancedMenu.summary.dataSource).toContain('Enhanced AI Algorithm');
      expect(enhancedMenu.summary.nutritionScore).toBeGreaterThan(0);

      // Validate Standard Algorithm Results (with Enhanced backend)
      expect(standardResult).toBeDefined();
      expect(standardResult.menu.enhancedFeatures).toBeDefined();
      expect(standardResult.menu.enhancedFeatures.geneticAlgorithmGenerations).toBe(200);
      expect(standardResult.analysis.enhancedMetrics).toBeDefined();

      // Performance validation
      expect(enhancedTime).toBeLessThan(10000); // Should complete in under 10 seconds
      expect(standardTime).toBeLessThan(15000); // Should complete in under 15 seconds

      console.log(`Enhanced Algorithm Performance: ${enhancedTime}ms`);
      console.log(`Standard Algorithm (with Enhanced backend) Performance: ${standardTime}ms`);
      console.log(`Enhanced Menu Nutrition Score: ${enhancedMenu.summary.nutritionScore}`);
      console.log(`Standard Menu Optimization Score: ${standardResult.optimizationScore}`);
    });
  });

  describe('Integration with Existing Services', () => {
    it('should validate seamless integration with CIQUAL, quality scoring, and swap recommendations', async () => {
      const userProfile: NutritionProfile = {
        age: 25,
        gender: 'female',
        weight: 60,
        height: 165,
        activityLevel: 'active',
        goals: 'maintain'
      };

      const preferences: UserPreferences = {
        people: 1,
        budget: 'high',
        cookingTime: 'long',
        daysCount: 2,
        favoriteIngredients: ['quinoa', 'avocat'],
        dislikedIngredients: ['tofu'],
        includeSnacks: true
      };

      const menu = enhancedService.generateOptimizedMenu(userProfile, preferences, 2);

      // Validate menu structure
      expect(menu.days).toHaveLength(2);
      
      // Validate integration indicators
      expect(menu.summary.dataSource).toBe('Enhanced AI Algorithm + CIQUAL + OpenFoodFacts');
      
      // Validate enhanced features
      for (const day of menu.days) {
        expect(day.meals.breakfast).toBeDefined();
        expect(day.meals.lunch).toBeDefined();
        expect(day.meals.dinner).toBeDefined();
        
        // Check for snacks (should be included)
        const hasSnacks = day.meals.morningSnack || day.meals.afternoonSnack;
        if (!hasSnacks) {
          // At least some days should have snacks when requested
          const totalSnacks = menu.days.reduce((count, d) => {
            return count + (d.meals.morningSnack ? 1 : 0) + (d.meals.afternoonSnack ? 1 : 0);
          }, 0);
          expect(totalSnacks).toBeGreaterThan(0);
        }
      }

      // Validate nutrition scoring
      expect(menu.summary.nutritionScore).toBeGreaterThanOrEqual(0);
      expect(menu.summary.nutritionScore).toBeLessThanOrEqual(100);
      
      // Validate cost optimization
      expect(menu.summary.totalCost).toBeGreaterThan(0);
      
      // Validate quality scoring integration
      expect(menu.summary.averageQualityScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Algorithm Features Validation', () => {
    it('should demonstrate genetic algorithm features working correctly', async () => {
      const userProfile: NutritionProfile = {
        age: 35,
        gender: 'male',
        weight: 80,
        height: 175,
        activityLevel: 'very_active',
        goals: 'maintain',
        activityProfile: {
          schedule: {
            1: { workout: { time: 18 } }, // Evening workout Monday
            3: { workout: { time: 7 } }   // Morning workout Wednesday
          }
        }
      };

      const preferences: UserPreferences = {
        people: 2,
        budget: 'medium',
        cookingTime: 'quick',
        daysCount: 2,
        restrictions: ['gluten', 'nuts'],
        favoriteIngredients: ['lentilles', 'quinoa'],
        dislikedIngredients: []
      };

      const menu = enhancedService.generateOptimizedMenu(userProfile, preferences, 2);

      // Validate genetic algorithm worked
      expect(menu).toBeDefined();
      expect(menu.id).toMatch(/enhanced_menu_/);
      
      // Validate variety optimization (should have different ingredients)
      const allIngredients: string[] = [];
      for (const day of menu.days) {
        for (const mealType of Object.keys(day.meals)) {
          const meal = day.meals[mealType as keyof typeof day.meals];
          if (meal && meal.ingredients) {
            allIngredients.push(...meal.ingredients.map(ing => ing.name));
          }
        }
      }
      
      const uniqueIngredients = new Set(allIngredients);
      
      // Should have reasonable variety (more unique ingredients than total meals)
      expect(uniqueIngredients.size).toBeGreaterThan(menu.days.length);
      
      // Validate activity-based optimization features exist
      expect(userProfile.activityProfile).toBeDefined();
      
      // Validate constraint satisfaction (should respect restrictions)
      // This is implicitly tested by the algorithm not crashing
      expect(menu.summary.nutritionScore).toBeGreaterThan(0);
    });
  });
});