import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { MenuOptimizationService, NutritionProfile, MenuPreferences, DietaryRestrictions } from '../services/menuOptimizationService';
import { ProfileService } from '../services/profileService';

const menuOptimizationService = new MenuOptimizationService();
const profileService = new ProfileService();

export const menuController = {
  /**
   * Generate a personalized vegan menu using advanced optimization
   */
  generateMenu: async (req: Request, res: Response) => {
    try {
      const { 
        people = 2, 
        budget = 'medium', 
        cookingTime = 'medium',
        dietaryRestrictions = [],
        daysCount = 7,
        userId = 'demo_user', // Default to demo user for now
        customProfile
      } = req.body;

      logger.info('Generating optimized menu for preferences:', {
        people,
        budget,
        cookingTime,
        restrictions: dietaryRestrictions.length,
        daysCount,
        userId
      });

      // Get user profile or use provided custom profile
      let userProfile;
      if (customProfile) {
        userProfile = customProfile;
      } else {
        const profile = await profileService.getProfile(userId);
        userProfile = profile?.nutritionProfile || {
          age: 30,
          gender: 'male',
          weight: 70,
          height: 175,
          activityLevel: 'moderate',
          goals: 'maintain'
        };
      }

      // Prepare optimization parameters
      const nutritionProfile: NutritionProfile = userProfile;

      const menuPreferences: MenuPreferences = {
        people,
        budget,
        cookingTime,
        cuisineTypes: ['mediterranean', 'asian', 'french'],
        mealTypes: ['breakfast', 'lunch', 'dinner'],
        daysCount
      };

      const restrictions: DietaryRestrictions = {
        allergens: dietaryRestrictions.filter((r: any) => r.type === 'allergen').map((r: any) => r.name) || [],
        intolerances: dietaryRestrictions.filter((r: any) => r.type === 'intolerance').map((r: any) => r.name) || [],
        preferences: ['vegan'],
        excludedIngredients: dietaryRestrictions.filter((r: any) => r.type === 'ingredient').map((r: any) => r.name) || []
      };

      // Generate optimized menu
      const optimizedResult = await menuOptimizationService.optimizeMenu(
        nutritionProfile,
        menuPreferences,
        restrictions
      );

      // Update user statistics if user exists
      if (userId && userId !== 'demo_user') {
        try {
          await profileService.updateNutritionScore(userId, optimizedResult.optimizationScore);
          
          // Calculate carbon savings (compare to average omnivore diet)
          const carbonSaved = Math.max(0, 15 - optimizedResult.analysis.sustainability.carbonFootprint); // 15kg CO2 = avg omnivore weekly
          await profileService.updateCarbonSavings(userId, carbonSaved);
        } catch (error) {
          logger.warn('Failed to update user statistics:', error);
        }
      }

      // Format response
      const response = {
        id: optimizedResult.menu.id,
        generatedAt: optimizedResult.menu.generatedAt,
        parameters: optimizedResult.menu.parameters,
        days: optimizedResult.menu.days,
        analysis: {
          nutritionSummary: optimizedResult.analysis.nutritionSummary,
          rnpCoverage: optimizedResult.analysis.rnpCoverage,
          sustainability: optimizedResult.analysis.sustainability,
          totalCost: optimizedResult.analysis.totalCost,
          warnings: optimizedResult.analysis.warnings
        },
        requirements: optimizedResult.requirements,
        optimizationScore: Math.round(optimizedResult.optimizationScore * 100),
        shoppingList: {
          totalCost: optimizedResult.analysis.totalCost,
          carbonFootprint: optimizedResult.analysis.sustainability.carbonFootprint,
          ecoRating: optimizedResult.analysis.sustainability.ecoRating
        }
      };

      logger.info('Menu optimization completed', {
        userId,
        score: response.optimizationScore,
        cost: response.analysis.totalCost,
        carbonFootprint: response.analysis.sustainability.carbonFootprint
      });

      res.status(200).json({
        success: true,
        data: response
      });

    } catch (error) {
      logger.error('Menu generation failed:', error);
      throw createError('Failed to generate menu', 500);
    }
  },

  /**
   * Get detailed recipe information
   */
  getRecipe: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // TODO: Implement recipe retrieval from database
      const recipe = {
        id,
        name: 'Porridge avoine aux fruits rouges',
        description: 'Un petit-déjeuner nutritif et délicieux, riche en fibres et antioxydants',
        instructions: [
          'Porter le lait d\'amande à ébullition',
          'Ajouter les flocons d\'avoine et cuire 5 minutes',
          'Incorporer les graines de lin',
          'Servir avec les fruits rouges'
        ],
        tips: [
          'Préparez la veille pour un porridge overnight',
          'Ajoutez une cuillère de tahini pour plus de protéines'
        ],
        nutritionDetails: {
          vitamins: { b12: 0.8, d: 0.2, b6: 0.3 },
          minerals: { iron: 3.2, calcium: 180, zinc: 1.8 }
        }
      };

      res.status(200).json({
        success: true,
        data: recipe
      });

    } catch (error) {
      logger.error('Recipe retrieval failed:', error);
      throw createError('Recipe not found', 404);
    }
  },

  /**
   * Get ingredient swap recommendations
   */
  swapIngredient: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ingredient, _reason, _nutritionalTarget } = req.body;

      if (!ingredient) {
        return next(createError('Ingredient parameter is required', 400));
      }

      // TODO: Implement intelligent swap algorithm
      const swapSuggestions = [
        {
          original: ingredient,
          alternative: 'Tempeh',
          reason: 'Même profil protéique, moins transformé',
          nutritionalImpact: {
            protein: '+5%',
            iron: '+10%',
            calories: '-3%'
          },
          availability: 'Disponible chez Greenweez',
          cost: 'Similar'
        }
      ];

      res.status(200).json({
        success: true,
        data: {
          suggestions: swapSuggestions,
          preservesBalance: true
        }
      });

    } catch (error: any) {
      logger.error('Ingredient swap failed:', error);
      next(createError('Failed to generate swap suggestions', 500));
    }
  }
};