import { logger } from '../utils/logger';

/**
 * Nutrition Analysis Service
 * Provides comprehensive nutritional analysis capabilities for the enhanced menu optimization
 */

export interface NutrientProfile {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  magnesium: number;
  zinc: number;
  vitaminB12: number;
  vitaminD: number;
  vitaminB6: number;
  vitaminC?: number;
  folate: number;
  omega3: number;
  omega6: number;
  [key: string]: number | undefined;
}

export interface Menu {
  id: string;
  days: MenuDay[];
  summary: {
    totalCost: number;
    nutritionScore: number;
    carbonFootprint: number;
    averageQualityScore: number;
    dataSource?: string;
  };
}

export interface MenuDay {
  day: number;
  date: string;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
    morningSnack?: Meal;
    afternoonSnack?: Meal;
    [key: string]: Meal | undefined;
  };
}

export interface Meal {
  id: string;
  name: string;
  nutrition?: NutrientProfile;
  ingredients?: Ingredient[];
  cost?: number;
  carbonFootprint?: number;
  cookingTime?: number;
  preparationMethod?: string;
  qualityScore?: {
    overallScore: number;
    nutriScore?: string;
    ecoScore?: string;
    novaGroup?: number;
  };
}

export interface Ingredient {
  name: string;
  amount: string;
  categories?: string[];
}

export interface NutritionProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals?: 'maintain' | 'lose' | 'gain';
  activityProfile?: {
    schedule?: Record<number, { workout?: { time: number } }>;
  };
}

export class NutritionAnalysisService {
  /**
   * Calculate nutritional score based on how well a menu meets RDA requirements
   */
  public calculateNutritionalScore(menu: Menu, userProfile: NutritionProfile): number {
    try {
      logger.info('Calculating nutritional score for menu', { 
        menuId: menu.id, 
        daysCount: menu.days.length 
      });

      // Calculate total nutrition across all days
      const totalNutrition = this.calculateTotalNutrition(menu);
      
      // Get daily averages
      const daysCount = menu.days.length || 1;
      const dailyNutrition: NutrientProfile = {} as NutrientProfile;
      
      Object.keys(totalNutrition).forEach(nutrient => {
        const value = totalNutrition[nutrient];
        if (typeof value === 'number') {
          dailyNutrition[nutrient] = value / daysCount;
        }
      });

      // Get recommended daily values for this user
      const rdaTargets = this.calculateRDA(userProfile);
      
      // Calculate score for each nutrient
      let totalScore = 0;
      let nutrientCount = 0;
      
      for (const [nutrient, target] of Object.entries(rdaTargets)) {
        const actual = dailyNutrition[nutrient] || 0;
        const nutrientScore = this.calculateNutrientScore(actual, target);
        totalScore += nutrientScore;
        nutrientCount++;
      }

      const overallScore = nutrientCount > 0 ? totalScore / nutrientCount : 0.5;
      
      logger.info('Nutritional score calculated', { 
        overallScore: Math.round(overallScore * 100),
        nutrientsEvaluated: nutrientCount 
      });

      return Math.max(0, Math.min(1, overallScore));

    } catch (error) {
      logger.error('Error calculating nutritional score:', error);
      return 0.5; // Default neutral score
    }
  }

  /**
   * Calculate total nutrition across all meals in a menu
   */
  private calculateTotalNutrition(menu: Menu): NutrientProfile {
    const totalNutrition: NutrientProfile = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      iron: 0,
      calcium: 0,
      magnesium: 0,
      zinc: 0,
      vitaminB12: 0,
      vitaminD: 0,
      vitaminB6: 0,
      vitaminC: 0,
      folate: 0,
      omega3: 0,
      omega6: 0
    };

    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType];
        if (meal && meal.nutrition) {
          for (const [nutrient, amount] of Object.entries(meal.nutrition)) {
            if (typeof amount === 'number' && nutrient in totalNutrition) {
              const currentValue = totalNutrition[nutrient as keyof NutrientProfile];
              if (typeof currentValue === 'number') {
                (totalNutrition as any)[nutrient] = currentValue + amount;
              }
            }
          }
        }
      }
    }

    return totalNutrition;
  }

  /**
   * Calculate RDA (Recommended Daily Allowance) targets based on user profile
   */
  private calculateRDA(userProfile: NutritionProfile): Record<string, number> {
    const { age, gender, weight, height, activityLevel } = userProfile;
    
    // Calculate BMR (Basal Metabolic Rate)
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const totalCalories = bmr * activityMultipliers[activityLevel];

    // RDA targets (based on ANSES recommendations)
    const rdaTargets: Record<string, number> = {
      calories: totalCalories,
      protein: weight * 0.83, // g/kg body weight
      carbs: Math.max(130, totalCalories * 0.45 / 4), // 45-65% of calories
      fat: totalCalories * 0.30 / 9, // 20-35% of calories
      fiber: age < 50 ? (gender === 'male' ? 38 : 25) : (gender === 'male' ? 30 : 21),
      iron: gender === 'female' && age < 51 ? 18 : 8,
      calcium: age < 51 ? 1000 : 1200,
      magnesium: gender === 'male' ? 400 : 310,
      zinc: gender === 'male' ? 11 : 8,
      vitaminB12: 2.4,
      vitaminD: age < 70 ? 15 : 20,
      vitaminB6: age < 51 ? 1.3 : (gender === 'male' ? 1.7 : 1.5),
      vitaminC: gender === 'male' ? 90 : 75,
      folate: 400,
      omega3: gender === 'male' ? 1.6 : 1.1,
      omega6: gender === 'male' ? 17 : 12
    };

    return rdaTargets;
  }

  /**
   * Calculate score for individual nutrient (0-1 scale)
   */
  private calculateNutrientScore(actual: number, target: number): number {
    if (target === 0) return 1; // Perfect score if no requirement

    const ratio = actual / target;

    // Optimal range is 0.8-1.2 of target (80%-120%)
    if (ratio >= 0.8 && ratio <= 1.2) {
      return 1.0; // Perfect score
    } else if (ratio >= 0.6 && ratio < 0.8) {
      // Linear decrease from 80% to 60%
      return 0.5 + 2.5 * (ratio - 0.6);
    } else if (ratio > 1.2 && ratio <= 2.0) {
      // Linear decrease from 120% to 200%
      return 1.0 - 0.625 * (ratio - 1.2);
    } else if (ratio < 0.6) {
      // Very low - steep penalty
      return Math.max(0, 0.5 * ratio / 0.6);
    } else {
      // Very high - moderate penalty
      return Math.max(0.1, 0.5 - 0.1 * (ratio - 2.0));
    }
  }

  /**
   * Analyze nutritional gaps and strengths in a menu
   */
  public analyzeNutritionalGaps(menu: Menu, userProfile: NutritionProfile): {
    gaps: Array<{ nutrient: string; deficit: number; percentage: number }>;
    strengths: Array<{ nutrient: string; surplus: number; percentage: number }>;
    overall: { score: number; status: 'excellent' | 'good' | 'needs_improvement' | 'poor' };
  } {
    const totalNutrition = this.calculateTotalNutrition(menu);
    const daysCount = menu.days.length || 1;
    const rdaTargets = this.calculateRDA(userProfile);

    const gaps: Array<{ nutrient: string; deficit: number; percentage: number }> = [];
    const strengths: Array<{ nutrient: string; surplus: number; percentage: number }> = [];

    for (const [nutrient, target] of Object.entries(rdaTargets)) {
      const dailyActual = (totalNutrition[nutrient] || 0) / daysCount;
      const percentage = (dailyActual / target) * 100;

      if (percentage < 80) {
        gaps.push({
          nutrient,
          deficit: target - dailyActual,
          percentage: Math.round(percentage)
        });
      } else if (percentage > 120) {
        strengths.push({
          nutrient,
          surplus: dailyActual - target,
          percentage: Math.round(percentage)
        });
      }
    }

    const overallScore = this.calculateNutritionalScore(menu, userProfile);
    let status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    
    if (overallScore >= 0.9) status = 'excellent';
    else if (overallScore >= 0.75) status = 'good';
    else if (overallScore >= 0.6) status = 'needs_improvement';
    else status = 'poor';

    return {
      gaps: gaps.sort((a, b) => a.percentage - b.percentage),
      strengths: strengths.sort((a, b) => b.percentage - a.percentage),
      overall: { score: Math.round(overallScore * 100), status }
    };
  }
}

// Export singleton instance
export const nutritionAnalysisService = new NutritionAnalysisService();

// Re-export the calculateNutritionalScore function for backward compatibility
export function calculateNutritionalScore(menu: Menu, userProfile: NutritionProfile): number {
  return nutritionAnalysisService.calculateNutritionalScore(menu, userProfile);
}