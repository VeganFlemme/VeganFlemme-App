import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { ProfileService } from '../services/profileService';

const profileService = new ProfileService();

export const profileController = {
  /**
   * Create or update user profile
   */
  createOrUpdateProfile: async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        age,
        gender,
        height,
        weight,
        activityLevel,
        goals,
        allergens = [],
        intolerances = [],
        preferences = ['vegan'],
        excludedIngredients = [],
        cuisineTypes = [],
        cookingTime = 'medium',
        budget = 'medium'
      } = req.body;

      // Basic validation
      if (!name || !email || !age || !gender || !height || !weight) {
        throw createError('Missing required profile fields', 400);
      }

      const profileData = {
        name,
        email,
        nutritionProfile: {
          age,
          gender,
          height,
          weight,
          activityLevel: activityLevel || 'moderate',
          goals: goals || 'maintain'
        },
        dietaryRestrictions: {
          allergens,
          intolerances,
          preferences,
          excludedIngredients
        },
        preferences: {
          cuisineTypes,
          cookingTime,
          budget,
          favoriteMeals: [],
          avoidedIngredients: []
        }
      };

      const profile = await profileService.createProfile(profileData);
      const healthMetrics = profileService.calculateHealthMetrics(profile);
      const recommendations = profileService.getNutritionRecommendations(profile);

      logger.info('Profile created/updated:', { profileId: profile.id, email });

      res.status(200).json({
        success: true,
        data: {
          profile,
          healthMetrics,
          recommendations
        }
      });

    } catch (error) {
      logger.error('Profile creation failed:', error);
      throw error;
    }
  },

  /**
   * Get user profile
   */
  getProfile: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const profile = await profileService.getProfile(id);
      
      if (!profile) {
        throw createError('Profile not found', 404);
      }

      const healthMetrics = profileService.calculateHealthMetrics(profile);
      const recommendations = profileService.getNutritionRecommendations(profile);

      res.status(200).json({
        success: true,
        data: {
          profile,
          healthMetrics,
          recommendations
        }
      });

    } catch (error) {
      logger.error('Profile retrieval failed:', error);
      throw createError('Profile not found', 404);
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedProfile = await profileService.updateProfile(id, updates);
      const healthMetrics = profileService.calculateHealthMetrics(updatedProfile);

      logger.info('Profile updated:', { profileId: id });

      res.status(200).json({
        success: true,
        data: {
          profile: updatedProfile,
          healthMetrics
        }
      });

    } catch (error) {
      logger.error('Profile update failed:', error);
      throw createError('Failed to update profile', 500);
    }
  },

  /**
   * Get user dashboard data
   */
  getDashboard: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const dashboardData = await profileService.getDashboardData(id);

      res.status(200).json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      logger.error('Dashboard data retrieval failed:', error);
      throw createError('Failed to get dashboard data', 500);
    }
  },

  /**
   * Add recipe to favorites
   */
  addToFavorites: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { recipeId } = req.body;

      if (!recipeId) {
        throw createError('Recipe ID is required', 400);
      }

      const success = await profileService.addToFavorites(id, recipeId);

      res.status(200).json({
        success: true,
        data: {
          added: success,
          message: success ? 'Recipe added to favorites' : 'Recipe already in favorites'
        }
      });

    } catch (error) {
      logger.error('Add to favorites failed:', error);
      throw createError('Failed to add to favorites', 500);
    }
  },

  /**
   * Create meal plan
   */
  createMealPlan: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const planData = req.body;

      const mealPlan = await profileService.createMealPlan(id, planData);

      res.status(201).json({
        success: true,
        data: mealPlan
      });

    } catch (error) {
      logger.error('Meal plan creation failed:', error);
      throw createError('Failed to create meal plan', 500);
    }
  },

  /**
   * Get user meal plans
   */
  getMealPlans: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const mealPlans = await profileService.getMealPlans(id);

      res.status(200).json({
        success: true,
        data: mealPlans
      });

    } catch (error) {
      logger.error('Meal plans retrieval failed:', error);
      throw createError('Failed to get meal plans', 500);
    }
  },

  /**
   * Calculate nutritional needs based on profile
   */
  calculateNutritionalNeeds: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const profile = await profileService.getProfile(id);
      if (!profile) {
        throw createError('Profile not found', 404);
      }

      const recommendations = profileService.getNutritionRecommendations(profile);
      const healthMetrics = profileService.calculateHealthMetrics(profile);

      res.status(200).json({
        success: true,
        data: {
          profileId: id,
          recommendations,
          healthMetrics,
          source: 'ANSES RNP adapted for vegan diet',
          calculatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Nutritional needs calculation failed:', error);
      throw createError('Failed to calculate nutritional needs', 500);
    }
  }
};

function _getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}