import { RecipeIntegrationService } from '../src/services/recipeIntegrationService';
import { NutritionProfile, UserPreferences, Menu, MenuDay, Meal } from '../src/types';

// Mock axios to avoid making real API calls in tests
jest.mock('axios');

describe('RecipeIntegrationService', () => {
  let service: RecipeIntegrationService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    service = new RecipeIntegrationService(mockApiKey);
  });

  describe('Service initialization', () => {
    it('should initialize with API key', () => {
      expect(service).toBeInstanceOf(RecipeIntegrationService);
    });
  });

  describe('parseNutrition', () => {
    it('should parse recipe nutrition data correctly', () => {
      const mockRecipe = {
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 250, unit: 'kcal' },
            { name: 'Protein', amount: 15, unit: 'g' },
            { name: 'Carbohydrates', amount: 30, unit: 'g' },
            { name: 'Fat', amount: 8, unit: 'g' },
            { name: 'Fiber', amount: 5, unit: 'g' },
            { name: 'Iron', amount: 3.2, unit: 'mg' },
            { name: 'Calcium', amount: 120, unit: 'mg' },
            { name: 'Vitamin C', amount: 15, unit: 'mg' }
          ]
        }
      };

      const result = service.parseNutrition(mockRecipe);

      expect(result).toEqual({
        calories: 250,
        protein: 15,
        carbs: 30,
        fat: 8,
        fiber: 5,
        iron: 3.2,
        calcium: 120,
        vitaminC: 15
      });
    });

    it('should return empty object if no nutrition data', () => {
      const mockRecipe = {};
      const result = service.parseNutrition(mockRecipe);
      expect(result).toEqual({});
    });
  });

  describe('parseIngredients', () => {
    it('should parse recipe ingredients correctly', () => {
      const mockRecipe = {
        extendedIngredients: [
          {
            name: 'tofu',
            amount: 200,
            unit: 'g',
            original: '200g extra-firm tofu',
            image: 'tofu.jpg'
          },
          {
            name: 'spinach',
            amount: 100,
            unit: 'g',
            original: '100g fresh spinach',
            image: 'spinach.jpg'
          }
        ]
      };

      const result = service.parseIngredients(mockRecipe);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'tofu',
        amount: 200,
        unit: 'g',
        originalString: '200g extra-firm tofu',
        image: 'tofu.jpg',
        categories: ['protein']
      });
      expect(result[1]).toEqual({
        name: 'spinach',
        amount: 100,
        unit: 'g',
        originalString: '100g fresh spinach',
        image: 'spinach.jpg',
        categories: ['leafy-greens', 'vegetables']
      });
    });
  });

  describe('parseInstructions', () => {
    it('should parse recipe instructions correctly', () => {
      const mockRecipe = {
        analyzedInstructions: [
          {
            steps: [
              {
                number: 1,
                step: 'Heat oil in a pan',
                ingredients: [{ name: 'oil' }]
              },
              {
                number: 2,
                step: 'Add tofu and cook for 5 minutes',
                ingredients: [{ name: 'tofu' }]
              }
            ]
          }
        ]
      };

      const result = service.parseInstructions(mockRecipe);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        number: 1,
        step: 'Heat oil in a pan',
        ingredients: ['oil']
      });
      expect(result[1]).toEqual({
        number: 2,
        step: 'Add tofu and cook for 5 minutes',
        ingredients: ['tofu']
      });
    });

    it('should handle missing instructions gracefully', () => {
      const mockRecipe = {};
      const result = service.parseInstructions(mockRecipe);
      expect(result).toEqual([]);
    });
  });

  describe('validateVeganRecipe', () => {
    it('should validate vegan recipe correctly', () => {
      const veganRecipe = {
        extendedIngredients: [
          { name: 'tofu' },
          { name: 'spinach' },
          { name: 'olive oil' },
          { name: 'garlic' }
        ]
      };

      const result = service.validateVeganRecipe(veganRecipe);
      expect(result).toBe(true);
    });

    it('should reject non-vegan recipe', () => {
      const nonVeganRecipe = {
        extendedIngredients: [
          { name: 'tofu' },
          { name: 'spinach' },
          { name: 'chicken breast' }, // Non-vegan ingredient
          { name: 'garlic' }
        ]
      };

      const result = service.validateVeganRecipe(nonVeganRecipe);
      expect(result).toBe(false);
    });

    it('should accept vegan alternatives', () => {
      const veganAlternativeRecipe = {
        extendedIngredients: [
          { name: 'vegan butter' },
          { name: 'plant-based milk' },
          { name: 'dairy-free cheese' },
          { name: 'vegetables' }
        ]
      };

      const result = service.validateVeganRecipe(veganAlternativeRecipe);
      expect(result).toBe(true);
    });

    it('should handle missing ingredients gracefully', () => {
      const emptyRecipe = {};
      const result = service.validateVeganRecipe(emptyRecipe);
      expect(result).toBe(false);
    });
  });

  describe('calculateQualityScores', () => {
    it('should calculate quality scores for a recipe', async () => {
      const mockRecipe = {
        nutrition: {
          nutrients: [
            { name: 'Fiber', amount: 8, percentOfDailyNeeds: 32 },
            { name: 'Protein', amount: 15, percentOfDailyNeeds: 30 },
            { name: 'Sodium', amount: 400, percentOfDailyNeeds: 17 },
            { name: 'Sugar', amount: 5, percentOfDailyNeeds: 6 },
            { name: 'Vitamin C', amount: 25, percentOfDailyNeeds: 28 }
          ]
        },
        extendedIngredients: [
          { name: 'organic tofu' },
          { name: 'fresh spinach' },
          { name: 'quinoa' }
        ]
      };

      const result = await service.calculateQualityScores(mockRecipe);

      expect(result).toHaveProperty('nutriScore');
      expect(result).toHaveProperty('ecoScore');
      expect(result).toHaveProperty('novaGroup');
      expect(result).toHaveProperty('overallScore');
    });
  });

  describe('BMR calculation', () => {
    it('should calculate BMR correctly for males', () => {
      const maleProfile: NutritionProfile = {
        age: 30,
        gender: 'male',
        weight: 75,
        height: 180,
        activityLevel: 'moderate'
      };

      // Access private method through type assertion for testing
      const bmr = (service as any).calculateBMR(maleProfile);
      
      // Harris-Benedict equation for males: 88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)
      const expectedBMR = 88.362 + (13.397 * 75) + (4.799 * 180) - (5.677 * 30);
      expect(bmr).toBeCloseTo(expectedBMR, 1);
    });

    it('should calculate BMR correctly for females', () => {
      const femaleProfile: NutritionProfile = {
        age: 25,
        gender: 'female',
        weight: 60,
        height: 165,
        activityLevel: 'light'
      };

      const bmr = (service as any).calculateBMR(femaleProfile);
      
      // Harris-Benedict equation for females: 447.593 + (9.247 × weight) + (3.098 × height) - (4.330 × age)
      const expectedBMR = 447.593 + (9.247 * 60) + (3.098 * 165) - (4.330 * 25);
      expect(bmr).toBeCloseTo(expectedBMR, 1);
    });
  });

  describe('Ingredient categorization', () => {
    it('should categorize protein ingredients correctly', () => {
      const tofuIngredient = { name: 'tofu' };
      const categories = (service as any).categorizeIngredient(tofuIngredient);
      expect(categories).toContain('protein');
    });

    it('should categorize multiple categories correctly', () => {
      const spinachIngredient = { name: 'spinach' };
      const categories = (service as any).categorizeIngredient(spinachIngredient);
      expect(categories).toContain('leafy-greens');
      expect(categories).toContain('vegetables');
    });

    it('should handle ingredients without specific categories', () => {
      const unknownIngredient = { name: 'mysterious-ingredient-xyz' };
      const categories = (service as any).categorizeIngredient(unknownIngredient);
      expect(categories).toEqual([]);
    });
  });
});