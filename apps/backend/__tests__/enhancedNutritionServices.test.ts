import { ansesRNPService } from '../src/services/ansesRNPService';
import { spoonacularService } from '../src/services/spoonacularService';
import { realTimeNutritionalTrackingService } from '../src/services/realTimeNutritionalTrackingService';
import { unifiedNutritionService } from '../src/services/unifiedNutritionService';

describe('Enhanced Nutrition Services', () => {
  describe('ANSES RNP Service', () => {
    it('should initialize successfully', async () => {
      await ansesRNPService.initialize();
      const status = ansesRNPService.getStatus();
      
      expect(status.initialized).toBe(true);
      expect(status.baseRecommendations).toBeGreaterThan(0);
      expect(status.veganAdjustments).toBeGreaterThan(0);
      expect(status.source).toBe('ANSES France');
    });

    it('should provide critical vegan nutrients list', () => {
      const criticalNutrients = ansesRNPService.getCriticalVeganNutrients();
      
      expect(criticalNutrients).toContain('vitaminB12');
      expect(criticalNutrients).toContain('iron');
      expect(criticalNutrients).toContain('zinc');
      expect(criticalNutrients).toContain('calcium');
      expect(criticalNutrients).toContain('vitaminD');
      expect(criticalNutrients).toContain('omega3');
    });

    it('should calculate energy needs for different profiles', () => {
      const maleProfile = {
        age: 30,
        gender: 'male' as const,
        weight: 75,
        height: 180,
        activityLevel: 'moderate' as const
      };

      const femaleProfile = {
        age: 28,
        gender: 'female' as const,
        weight: 65,
        height: 165,
        activityLevel: 'moderate' as const
      };

      const maleEnergy = ansesRNPService.calculateEnergyNeeds(maleProfile);
      const femaleEnergy = ansesRNPService.calculateEnergyNeeds(femaleProfile);

      expect(maleEnergy).toBeGreaterThan(2000);
      expect(femaleEnergy).toBeGreaterThan(1600);
      expect(maleEnergy).toBeGreaterThan(femaleEnergy);
    });

    it('should generate personalized recommendations', async () => {
      await ansesRNPService.initialize();
      
      const profile = {
        age: 30,
        gender: 'female' as const,
        weight: 65,
        height: 165,
        activityLevel: 'moderate' as const
      };

      const recommendations = await ansesRNPService.getRecommendations(profile);

      expect(recommendations.profile).toEqual(profile);
      expect(recommendations.dailyRecommendations).toBeDefined();
      expect(recommendations.veganSpecificAdjustments).toBeDefined();
      expect(recommendations.criticalNutrients).toContain('vitaminB12');
      expect(recommendations.monitoringAdvice).toBeDefined();
    });

    it('should assess nutritional adequacy', async () => {
      await ansesRNPService.initialize();
      
      const profile = {
        age: 30,
        gender: 'female' as const,
        weight: 65,
        height: 165,
        activityLevel: 'moderate' as const
      };

      const dailyIntake = {
        calories: 1800,
        protein: 60,
        iron: 12,
        calcium: 800,
        vitaminB12: 2.0,
        vitaminD: 10
      };

      const assessment = await ansesRNPService.assessNutritionalAdequacy(profile, dailyIntake);

      expect(assessment.overall_score).toBeGreaterThan(0);
      expect(assessment.adequacy_percentage).toBeGreaterThan(0);
      expect(assessment.gaps).toBeDefined();
      expect(assessment.strengths).toBeDefined();
      expect(assessment.improvements).toBeDefined();
    });
  });

  describe('Spoonacular Service', () => {
    it('should initialize with proper configuration', () => {
      const status = spoonacularService.getCacheStats();
      expect(status).toHaveProperty('entries');
      expect(status).toHaveProperty('hasApiKey');
    });

    it('should validate vegan recipes correctly', () => {
      const veganRecipe = {
        id: 1,
        title: 'Vegan Pasta',
        vegan: true,
        extendedIngredients: [
          { name: 'pasta', original: 'whole wheat pasta' },
          { name: 'tomatoes', original: 'fresh tomatoes' },
          { name: 'olive oil', original: 'extra virgin olive oil' }
        ]
      };

      const nonVeganRecipe = {
        id: 2,
        title: 'Pasta with Cheese',
        vegan: false,
        extendedIngredients: [
          { name: 'pasta', original: 'whole wheat pasta' },
          { name: 'cheese', original: 'parmesan cheese' },
          { name: 'milk', original: 'whole milk' }
        ]
      };

      expect(spoonacularService.validateVeganRecipe(veganRecipe)).toBe(true);
      expect(spoonacularService.validateVeganRecipe(nonVeganRecipe)).toBe(false);
    });

    it('should extract nutrition information correctly', () => {
      const recipe = {
        id: 1,
        title: 'Test Recipe',
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 300, unit: 'kcal' },
            { name: 'Protein', amount: 15, unit: 'g' },
            { name: 'Carbohydrates', amount: 45, unit: 'g' },
            { name: 'Fat', amount: 8, unit: 'g' },
            { name: 'Fiber', amount: 6, unit: 'g' },
            { name: 'Iron', amount: 3.2, unit: 'mg' },
            { name: 'Calcium', amount: 120, unit: 'mg' },
            { name: 'Vitamin C', amount: 25, unit: 'mg' }
          ]
        }
      };

      const nutrition = spoonacularService.extractNutritionInfo(recipe);

      expect(nutrition.calories).toBe(300);
      expect(nutrition.protein).toBe(15);
      expect(nutrition.carbohydrates).toBe(45);
      expect(nutrition.fat).toBe(8);
      expect(nutrition.fiber).toBe(6);
      expect(nutrition.iron).toBe(3.2);
      expect(nutrition.calcium).toBe(120);
      expect(nutrition.vitaminC).toBe(25);
    });
  });

  describe('Real-time Nutritional Tracking Service', () => {
    it('should initialize successfully', async () => {
      await realTimeNutritionalTrackingService.initialize();
      const status = realTimeNutritionalTrackingService.getStatus();
      
      expect(status.initialized).toBe(true);
      expect(status.userProfiles).toBe(0); // No users initially
      expect(status.totalFoodEntries).toBe(0);
      expect(status.dailySummaries).toBe(0);
    });

    it('should handle user profile updates', async () => {
      await realTimeNutritionalTrackingService.initialize();

      const profile = {
        userId: 'test-user-1',
        age: 28,
        gender: 'female' as const,
        weight: 60,
        height: 165,
        activityLevel: 'moderate' as const,
        goals: {
          focus_nutrients: ['vitaminB12', 'iron', 'calcium']
        },
        preferences: {
          meal_frequency: 3,
          cooking_time: 'medium' as const,
          favorite_ingredients: ['tofu', 'quinoa', 'spinach'],
          disliked_ingredients: [],
          preferred_cuisines: ['mediterranean', 'asian'],
          supplement_preference: 'targeted' as const
        },
        restrictions: [],
        trackingStartDate: new Date(),
        lastUpdated: new Date()
      };

      await realTimeNutritionalTrackingService.updateUserProfile(profile);
      const status = realTimeNutritionalTrackingService.getStatus();
      
      expect(status.userProfiles).toBe(1);
    });
  });

  describe('Unified Nutrition Service', () => {
    it('should initialize and provide status', async () => {
      await unifiedNutritionService.initialize();
      const status = unifiedNutritionService.getStatus();

      expect(status.unified.initialized).toBeDefined();
      expect(status.openFoodFacts).toBeDefined();
      expect(status.spoonacular).toBeDefined();
    });

    it('should search for vegan foods', async () => {
      await unifiedNutritionService.initialize();
      
      const results = await unifiedNutritionService.getVeganFoods(10);
      
      expect(results.items).toBeDefined();
      expect(results.total).toBeDefined();
      expect(results.dataSources).toBeDefined();
      expect(results.dataSources).toHaveProperty('openfoodfacts');
      expect(results.dataSources).toHaveProperty('spoonacular');
      expect(results.dataSources).toHaveProperty('user_input');
    });
  });

  describe('Integration Tests', () => {
    it('should work together for comprehensive nutrition tracking', async () => {
      // Initialize all services
      await ansesRNPService.initialize();
      await realTimeNutritionalTrackingService.initialize();
      await unifiedNutritionService.initialize();

      // Create user profile
      const profile = {
        userId: 'integration-test-user',
        age: 30,
        gender: 'female' as const,
        weight: 65,
        height: 165,
        activityLevel: 'moderate' as const,
        goals: {
          focus_nutrients: ['vitaminB12', 'iron', 'calcium']
        },
        preferences: {
          meal_frequency: 3,
          cooking_time: 'medium' as const,
          favorite_ingredients: ['tofu', 'quinoa'],
          disliked_ingredients: [],
          preferred_cuisines: ['mediterranean'],
          supplement_preference: 'targeted' as const
        },
        restrictions: [],
        trackingStartDate: new Date(),
        lastUpdated: new Date()
      };

      await realTimeNutritionalTrackingService.updateUserProfile(profile);

      // Get ANSES recommendations
      const recommendations = await ansesRNPService.getRecommendations(profile);
      expect(recommendations).toBeDefined();

      // Check service integration
      const ansesStatus = ansesRNPService.getStatus();
      const trackingStatus = realTimeNutritionalTrackingService.getStatus();
      const unifiedStatus = unifiedNutritionService.getStatus();

      expect(ansesStatus.initialized).toBe(true);
      expect(trackingStatus.initialized).toBe(true);
      expect(unifiedStatus.unified.initialized).toBeDefined();
    });
  });
});