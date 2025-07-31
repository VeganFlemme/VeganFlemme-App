import { EnhancedMenuOptimizationService } from '../src/services/enhancedMenuOptimizationService';
import { NutritionProfile, UserPreferences } from '../src/types';

describe('Enhanced Menu Optimization Service', () => {
  let service: EnhancedMenuOptimizationService;

  beforeEach(() => {
    service = new EnhancedMenuOptimizationService();
  });

  describe('generateOptimizedMenu', () => {
    it('should generate an optimized menu with basic preferences', async () => {
      const userProfile: NutritionProfile = {
        age: 30,
        gender: 'male',
        weight: 70,
        height: 175,
        activityLevel: 'moderate'
      };

      const preferences: UserPreferences = {
        people: 2,
        budget: 'medium',
        cookingTime: 'medium',
        daysCount: 3 // Shorter for testing
      };

      const menu = service.generateOptimizedMenu(userProfile, preferences, 3);

      expect(menu).toBeDefined();
      expect(menu.id).toBeDefined();
      expect(menu.days).toHaveLength(3);
      expect(menu.summary).toBeDefined();
      expect(menu.summary.dataSource).toContain('Enhanced AI Algorithm');

      // Check that each day has meals
      for (const day of menu.days) {
        expect(day.meals.breakfast).toBeDefined();
        expect(day.meals.lunch).toBeDefined();
        expect(day.meals.dinner).toBeDefined();
      }
    });

    it('should handle different budget preferences', async () => {
      const userProfile: NutritionProfile = {
        age: 25,
        gender: 'female',
        weight: 60,
        height: 165,
        activityLevel: 'light'
      };

      const highBudgetPrefs: UserPreferences = {
        people: 1,
        budget: 'high',
        cookingTime: 'quick',
        daysCount: 2
      };

      const menu = service.generateOptimizedMenu(userProfile, highBudgetPrefs, 2);

      expect(menu).toBeDefined();
      expect(menu.days).toHaveLength(2);
      expect(menu.summary.nutritionScore).toBeGreaterThan(0);
    });

    it('should include snacks when requested', async () => {
      const userProfile: NutritionProfile = {
        age: 35,
        gender: 'male',
        weight: 80,
        height: 180,
        activityLevel: 'active'
      };

      const preferences: UserPreferences = {
        people: 2,
        budget: 'medium',
        cookingTime: 'medium',
        daysCount: 2,
        includeSnacks: true
      };

      const menu = service.generateOptimizedMenu(userProfile, preferences, 2);

      expect(menu).toBeDefined();
      expect(menu.days).toHaveLength(2);

      // Check that at least some days have snacks
      const daysWithSnacks = menu.days.filter(day => 
        day.meals.morningSnack || day.meals.afternoonSnack
      );
      expect(daysWithSnacks.length).toBeGreaterThan(0);
    });

    it('should have reasonable nutrition scores', async () => {
      const userProfile: NutritionProfile = {
        age: 28,
        gender: 'female',
        weight: 65,
        height: 170,
        activityLevel: 'moderate'
      };

      const preferences: UserPreferences = {
        people: 2,
        budget: 'medium',
        cookingTime: 'medium',
        daysCount: 2
      };

      const menu = service.generateOptimizedMenu(userProfile, preferences, 2);

      expect(menu.summary.nutritionScore).toBeGreaterThanOrEqual(0);
      expect(menu.summary.nutritionScore).toBeLessThanOrEqual(100);
      expect(menu.summary.averageQualityScore).toBeGreaterThanOrEqual(0);
      expect(menu.summary.totalCost).toBeGreaterThan(0);
    });
  });
});