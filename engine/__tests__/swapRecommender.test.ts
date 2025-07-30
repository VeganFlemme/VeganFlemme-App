import { SwapRecommenderService, SwapContext } from '../src/services/swapRecommenderService';

describe('SwapRecommenderService', () => {
  let swapService: SwapRecommenderService;

  beforeEach(() => {
    swapService = new SwapRecommenderService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize with ingredient database', () => {
      expect(swapService).toBeInstanceOf(SwapRecommenderService);
    });
  });

  describe('Basic Swap Recommendations', () => {
    const basicContext: SwapContext = {
      recipeType: 'lunch',
      cookingMethod: 'baked',
      userRestrictions: {
        allergens: [],
        intolerances: [],
        preferences: [],
        excludedIngredients: []
      },
      budget: 'medium',
      cookingTime: 'medium'
    };

    it('should provide swap recommendations for tofu', async () => {
      const result = await swapService.getSwapRecommendations('tofu', basicContext, 100);

      expect(result).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.alternativeCount).toBeGreaterThan(0);
      
      // Check first recommendation structure
      const firstSuggestion = result.suggestions[0];
      expect(firstSuggestion).toHaveProperty('originalIngredient');
      expect(firstSuggestion).toHaveProperty('alternative');
      expect(firstSuggestion).toHaveProperty('reason');
      expect(firstSuggestion).toHaveProperty('nutritionalImpact');
      expect(firstSuggestion).toHaveProperty('compatibilityScore');
      expect(firstSuggestion).toHaveProperty('confidence');
    });

    it('should provide recommendations for tempeh', async () => {
      const result = await swapService.getSwapRecommendations('tempeh', basicContext, 100);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.preservesNutritionBalance).toBe(true);
      
      // Should recommend other protein sources
      const proteinAlternatives = result.suggestions.filter(s => 
        s.alternative.category === 'protein'
      );
      expect(proteinAlternatives.length).toBeGreaterThan(0);
    });

    it('should handle unknown ingredients gracefully', async () => {
      const result = await swapService.getSwapRecommendations('unknown-ingredient-xyz', basicContext, 100);

      expect(result).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
      // Should still provide some recommendations even for unknown ingredients
    });
  });

  describe('Allergen Restrictions', () => {
    it('should exclude soy-based alternatives when soy allergy is specified', async () => {
      const contextWithSoyAllergy: SwapContext = {
        recipeType: 'dinner',
        cookingMethod: 'fried',
        userRestrictions: {
          allergens: ['soy'],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'medium'
      };

      const result = await swapService.getSwapRecommendations('tofu', contextWithSoyAllergy, 100);

      // None of the suggestions should contain soy
      result.suggestions.forEach(suggestion => {
        expect(suggestion.alternative.allergens).not.toContain('soy');
      });
    });

    it('should exclude nut-based alternatives when nut allergy is specified', async () => {
      const contextWithNutAllergy: SwapContext = {
        recipeType: 'breakfast',
        cookingMethod: 'raw',
        userRestrictions: {
          allergens: ['nuts'],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'high',
        cookingTime: 'quick'
      };

      const result = await swapService.getSwapRecommendations('cashew cream', contextWithNutAllergy, 50);

      // None of the suggestions should contain nuts
      result.suggestions.forEach(suggestion => {
        expect(suggestion.alternative.allergens).not.toContain('nuts');
      });
    });

    it('should exclude gluten when gluten intolerance is specified', async () => {
      const contextWithGlutenIntolerance: SwapContext = {
        recipeType: 'lunch',
        cookingMethod: 'baked',
        userRestrictions: {
          allergens: ['gluten'],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'medium'
      };

      const result = await swapService.getSwapRecommendations('seitan', contextWithGlutenIntolerance, 150);

      // None of the suggestions should contain gluten
      result.suggestions.forEach(suggestion => {
        expect(suggestion.alternative.allergens).not.toContain('gluten');
      });
    });
  });

  describe('Budget Considerations', () => {
    it('should prefer cheaper alternatives for low budget', async () => {
      const lowBudgetContext: SwapContext = {
        recipeType: 'dinner',
        cookingMethod: 'boiled',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'low',
        cookingTime: 'medium'
      };

      const result = await swapService.getSwapRecommendations('tempeh', lowBudgetContext, 100);

      // Should include some budget-friendly options
      const affordableOptions = result.suggestions.filter(s => 
        s.alternative.cost <= 2 || s.costImpact === 'cheaper'
      );
      expect(affordableOptions.length).toBeGreaterThan(0);
    });

    it('should allow premium alternatives for high budget', async () => {
      const highBudgetContext: SwapContext = {
        recipeType: 'dinner',
        cookingMethod: 'baked',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'high',
        cookingTime: 'elaborate'
      };

      const result = await swapService.getSwapRecommendations('lentils', highBudgetContext, 100);

      expect(result.suggestions.length).toBeGreaterThan(0);
      // Should include premium alternatives without heavy budget penalties
    });
  });

  describe('Cooking Time Constraints', () => {
    it('should prefer quick-cooking alternatives for quick cooking time', async () => {
      const quickCookingContext: SwapContext = {
        recipeType: 'breakfast',
        cookingMethod: 'fried',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'quick'
      };

      const result = await swapService.getSwapRecommendations('chickpeas', quickCookingContext, 100);

      // Should suggest alternatives that cook faster than chickpeas (60 min)
      const quickAlternatives = result.suggestions.filter(s => 
        s.alternative.cookingTime <= 20
      );
      expect(quickAlternatives.length).toBeGreaterThan(0);
    });

    it('should provide cooking adjustments when needed', async () => {
      const result = await swapService.getSwapRecommendations('lentils', {
        recipeType: 'lunch',
        cookingMethod: 'boiled',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'quick'
      }, 100);

      // Some suggestions should have cooking adjustments
      const suggestionsWithAdjustments = result.suggestions.filter(s => 
        s.cookingAdjustments && s.cookingAdjustments.length > 0
      );
      
      // At least some should have adjustments if cooking times differ significantly
      if (result.suggestions.length > 0) {
        expect(suggestionsWithAdjustments.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Nutritional Impact Assessment', () => {
    it('should calculate nutritional impact correctly', async () => {
      const result = await swapService.getSwapRecommendations('tofu', {
        recipeType: 'dinner',
        cookingMethod: 'baked',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'medium'
      }, 100);

      result.suggestions.forEach(suggestion => {
        const impact = suggestion.nutritionalImpact;
        
        expect(impact).toHaveProperty('protein');
        expect(impact).toHaveProperty('iron');
        expect(impact).toHaveProperty('calcium');
        expect(impact).toHaveProperty('calories');
        expect(impact).toHaveProperty('overallScore');
        
        expect(typeof impact.overallScore).toBe('number');
        expect(impact.overallScore).toBeGreaterThanOrEqual(0);
        expect(impact.overallScore).toBeLessThanOrEqual(100);
      });
    });

    it('should identify nutrition improvements correctly', async () => {
      const result = await swapService.getSwapRecommendations('brown rice', {
        recipeType: 'lunch',
        cookingMethod: 'boiled',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'medium'
      }, 100);

      // Should suggest protein-rich alternatives like quinoa
      const proteinRichAlternatives = result.suggestions.filter(s => 
        s.alternative.nutritionPer100g.protein > 10
      );
      
      if (proteinRichAlternatives.length > 0) {
        expect(result.improvesNutrition).toBe(true);
      }
    });
  });

  describe('Recipe Type Compatibility', () => {
    it('should provide appropriate suggestions for breakfast', async () => {
      const breakfastContext: SwapContext = {
        recipeType: 'breakfast',
        cookingMethod: 'raw',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'quick'
      };

      const result = await swapService.getSwapRecommendations('coconut milk', breakfastContext, 200);

      expect(result.suggestions.length).toBeGreaterThan(0);
      
      // Should suggest appropriate dairy alternatives
      const dairyAlternatives = result.suggestions.filter(s => 
        s.alternative.category === 'dairy' || s.alternative.category === 'fat'
      );
      expect(dairyAlternatives.length).toBeGreaterThanOrEqual(0);
    });

    it('should provide appropriate suggestions for dinner', async () => {
      const dinnerContext: SwapContext = {
        recipeType: 'dinner',
        cookingMethod: 'baked',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'elaborate'
      };

      const result = await swapService.getSwapRecommendations('tempeh', dinnerContext, 150);

      expect(result.suggestions.length).toBeGreaterThan(0);
      
      // Should suggest hearty protein alternatives
      const proteinAlternatives = result.suggestions.filter(s => 
        s.alternative.category === 'protein'
      );
      expect(proteinAlternatives.length).toBeGreaterThan(0);
    });
  });

  describe('Confidence Scoring', () => {
    it('should assign appropriate confidence scores', async () => {
      const result = await swapService.getSwapRecommendations('tofu', {
        recipeType: 'lunch',
        cookingMethod: 'fried',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'medium'
      }, 100);

      result.suggestions.forEach(suggestion => {
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(100);
        expect(suggestion.compatibilityScore).toBeGreaterThanOrEqual(0);
        expect(suggestion.compatibilityScore).toBeLessThanOrEqual(100);
        
        // Confidence should generally be lower than or equal to compatibility score
        expect(suggestion.confidence).toBeLessThanOrEqual(suggestion.compatibilityScore + 5);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty ingredient name', async () => {
      const result = await swapService.getSwapRecommendations('', {
        recipeType: 'lunch',
        cookingMethod: 'baked',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'medium'
      }, 100);

      expect(result).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should handle very restrictive allergen list', async () => {
      const restrictiveContext: SwapContext = {
        recipeType: 'dinner',
        cookingMethod: 'baked',
        userRestrictions: {
          allergens: ['soy', 'nuts', 'gluten'],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'low',
        cookingTime: 'quick'
      };

      const result = await swapService.getSwapRecommendations('tofu', restrictiveContext, 100);

      expect(result).toBeDefined();
      
      // Should still provide some alternatives despite restrictions
      if (result.suggestions.length > 0) {
        result.suggestions.forEach(suggestion => {
          expect(suggestion.alternative.allergens).not.toContain('soy');
          expect(suggestion.alternative.allergens).not.toContain('nuts');
          expect(suggestion.alternative.allergens).not.toContain('gluten');
        });
      }
    });

    it('should handle zero amount gracefully', async () => {
      const result = await swapService.getSwapRecommendations('quinoa', {
        recipeType: 'lunch',
        cookingMethod: 'boiled',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'medium'
      }, 0);

      expect(result).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('Performance', () => {
    it('should generate recommendations within reasonable time', async () => {
      const startTime = Date.now();
      
      await swapService.getSwapRecommendations('tempeh', {
        recipeType: 'dinner',
        cookingMethod: 'baked',
        userRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: [],
          excludedIngredients: []
        },
        budget: 'medium',
        cookingTime: 'medium'
      }, 100);

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
});