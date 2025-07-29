import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

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
        activity,
        goal,
        allergies = [],
        dislikes = []
      } = req.body;

      // Basic validation
      if (!name || !email || !age || !gender || !height || !weight) {
        throw createError('Missing required profile fields', 400);
      }

      // Calculate BMI
      const heightInM = height / 100;
      const bmi = weight / (heightInM * heightInM);

      // Calculate TDEE (Total Daily Energy Expenditure)
      let bmr: number;
      
      // Mifflin-St Jeor equation
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        intense: 1.725
      };

      const tdee = bmr * (activityMultipliers[activity as keyof typeof activityMultipliers] || 1.55);

      // Adjust for goal
      let targetCalories = tdee;
      if (goal === 'lose') {
        targetCalories = tdee * 0.85; // 15% deficit
      } else if (goal === 'gain') {
        targetCalories = tdee * 1.15; // 15% surplus
      }

      const profile = {
        id: `profile_${Date.now()}`,
        personalInfo: {
          name,
          email,
          age,
          gender,
          height,
          weight
        },
        goals: {
          activity,
          goal,
          targetCalories: Math.round(targetCalories)
        },
        preferences: {
          allergies,
          dislikes
        },
        metrics: {
          bmi: Math.round(bmi * 10) / 10,
          bmr: Math.round(bmr),
          tdee: Math.round(tdee),
          bmiCategory: getBMICategory(bmi)
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      logger.info('Profile created/updated:', { profileId: profile.id, email });

      res.status(200).json({
        success: true,
        data: profile
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

      // TODO: Implement profile retrieval from database
      // Mock response for now
      const profile = {
        id,
        personalInfo: {
          name: 'Jean Dupont',
          email: 'jean@example.com',
          age: 30,
          gender: 'male',
          height: 175,
          weight: 70
        },
        goals: {
          activity: 'moderate',
          goal: 'maintain',
          targetCalories: 2200
        },
        preferences: {
          allergies: ['soja'],
          dislikes: ['champignons']
        },
        metrics: {
          bmi: 22.9,
          bmr: 1680,
          tdee: 2204,
          bmiCategory: 'Normal'
        }
      };

      res.status(200).json({
        success: true,
        data: profile
      });

    } catch (error) {
      logger.error('Profile retrieval failed:', error);
      throw createError('Profile not found', 404);
    }
  },

  /**
   * Calculate nutritional needs based on profile
   */
  calculateNutritionalNeeds: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { _age, gender, weight, activity } = req.body;

      // ANSES RNP calculations for vegan diet
      const baseNeeds = {
        protein: weight * 1.2, // Higher for vegans
        iron: gender === 'female' ? 16 : 11, // Higher bioavailability needs
        calcium: 1000,
        zinc: gender === 'female' ? 8 : 11,
        b12: 2.4,
        omega3: 2.5,
        vitaminD: 15,
        folate: 400,
        fiber: 30
      };

      // Adjust for activity level
      const activityMultiplier = activity === 'intense' ? 1.2 : activity === 'moderate' ? 1.1 : 1.0;
      
      const nutritionalNeeds = {
        ...baseNeeds,
        protein: Math.round(baseNeeds.protein * activityMultiplier),
        iron: Math.round(baseNeeds.iron * activityMultiplier * 10) / 10
      };

      res.status(200).json({
        success: true,
        data: {
          profileId: id,
          needs: nutritionalNeeds,
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

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}