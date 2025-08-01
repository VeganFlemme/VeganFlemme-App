import { logger } from '../utils/logger';
import { ansesRNPService, ANSESProfile, NutritionalAssessment, NutritionalGap } from './ansesRNPService';
import { enhancedOpenFoodFactsService } from './enhancedOpenFoodFactsService';
import { spoonacularService } from './spoonacularService';

export interface FoodEntry {
  id: string;
  name: string;
  amount: number; // in grams
  unit: string;
  timestamp: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  source: 'openfoodfacts' | 'spoonacular' | 'user_input';
  nutrition: NutritionData;
  barcode?: string;
  recipe_id?: number;
  user_verified?: boolean;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar?: number;
  saturatedFat?: number;
  sodium?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  zinc?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminB1?: number;
  vitaminB2?: number;
  vitaminB3?: number;
  vitaminB6?: number;
  vitaminB9?: number;
  vitaminB12?: number;
  selenium?: number;
  copper?: number;
  manganese?: number;
  omega3?: number;
  omega6?: number;
}

export interface DayNutritionSummary {
  date: string;
  totalNutrition: NutritionData;
  meals: {
    breakfast: FoodEntry[];
    lunch: FoodEntry[];
    dinner: FoodEntry[];
    snack: FoodEntry[];
  };
  nutritionalAssessment?: NutritionalAssessment;
  recommendations: string[];
  alerts: NutritionalAlert[];
}

export interface NutritionalAlert {
  type: 'deficiency' | 'excess' | 'warning' | 'achievement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  nutrient: string;
  message: string;
  recommendation?: string;
  timestamp: Date;
}

export interface WeeklyNutritionSummary {
  startDate: string;
  endDate: string;
  averageDaily: NutritionData;
  nutritionalAssessment: NutritionalAssessment;
  trends: NutritionalTrend[];
  achievements: string[];
  improvements: string[];
}

export interface NutritionalTrend {
  nutrient: string;
  trend: 'improving' | 'declining' | 'stable';
  change: number; // percentage change
  significance: 'major' | 'minor';
}

export interface UserNutritionalProfile extends ANSESProfile {
  userId: string;
  goals: NutritionalGoals;
  preferences: DietaryPreferences;
  restrictions: string[];
  trackingStartDate: Date;
  lastUpdated: Date;
}

export interface NutritionalGoals {
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  target_fiber?: number;
  focus_nutrients: string[]; // nutrients user wants to focus on
  weight_goal?: 'maintain' | 'lose' | 'gain';
  custom_targets?: Record<string, number>;
}

export interface DietaryPreferences {
  meal_frequency: number; // meals per day
  cooking_time: 'quick' | 'medium' | 'long';
  favorite_ingredients: string[];
  disliked_ingredients: string[];
  preferred_cuisines: string[];
  supplement_preference: 'minimal' | 'targeted' | 'comprehensive';
}

/**
 * Real-time Nutritional Tracking Service
 * Provides comprehensive nutrition tracking with ANSES RNP compliance
 */
export class RealTimeNutritionalTrackingService {
  private userProfiles: Map<string, UserNutritionalProfile> = new Map();
  private userFoodEntries: Map<string, FoodEntry[]> = new Map(); // userId -> entries
  private dailySummaries: Map<string, Map<string, DayNutritionSummary>> = new Map(); // userId -> date -> summary
  private initialized: boolean = false;

  constructor() {
    logger.info('Real-time Nutritional Tracking Service initializing');
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await ansesRNPService.initialize();
      this.initialized = true;
      
      logger.info('Real-time Nutritional Tracking Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Real-time Nutritional Tracking Service', { error });
      throw new Error(`Tracking service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or update user nutritional profile
   */
  async updateUserProfile(profile: UserNutritionalProfile): Promise<void> {
    await this.ensureInitialized();

    try {
      profile.lastUpdated = new Date();
      this.userProfiles.set(profile.userId, profile);
      
      logger.info('User nutritional profile updated', {
        userId: profile.userId,
        age: profile.age,
        gender: profile.gender,
        goals: Object.keys(profile.goals).length
      });
    } catch (error) {
      logger.error('Error updating user profile', { userId: profile.userId, error });
      throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add food entry with automatic nutrition lookup
   */
  async addFoodEntry(
    userId: string,
    name: string,
    amount: number,
    unit: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    barcode?: string,
    recipeId?: number,
    userNutrition?: Partial<NutritionData>
  ): Promise<FoodEntry> {
    await this.ensureInitialized();

    try {
      let nutrition: NutritionData;
      let source: 'openfoodfacts' | 'spoonacular' | 'user_input';
      let verified = false;

      // Try to get nutrition data from various sources
      if (barcode) {
        // Try OpenFoodFacts first
        try {
          const product = await enhancedOpenFoodFactsService.getProductByBarcode(barcode);
          if (product.status === 1 && product.product) {
            nutrition = this.convertOFFNutrition(product.product, amount);
            source = 'openfoodfacts';
            verified = true;
            logger.info('Nutrition data retrieved from OpenFoodFacts', { barcode, name });
          } else {
            throw new Error('Product not found');
          }
        } catch (error) {
          logger.warn('Failed to get nutrition from OpenFoodFacts', { barcode, error });
          nutrition = this.createDefaultNutrition(userNutrition);
          source = 'user_input';
        }
      } else if (recipeId) {
        // Try Spoonacular
        try {
          const recipe = await spoonacularService.getRecipeById(recipeId, true);
          if (recipe && recipe.nutrition) {
            nutrition = this.convertSpoonacularNutrition(recipe, amount, recipe.servings);
            source = 'spoonacular';
            verified = true;
            logger.info('Nutrition data retrieved from Spoonacular', { recipeId, name });
          } else {
            throw new Error('Recipe not found');
          }
        } catch (error) {
          logger.warn('Failed to get nutrition from Spoonacular', { recipeId, error });
          nutrition = this.createDefaultNutrition(userNutrition);
          source = 'user_input';
        }
      } else {
        // Try searching OpenFoodFacts by name
        try {
          const searchResults = await enhancedOpenFoodFactsService.searchProducts(name, 1, 1);
          if (searchResults.products && searchResults.products.length > 0) {
            const product = searchResults.products[0];
            nutrition = this.convertOFFNutrition(product, amount);
            source = 'openfoodfacts';
            verified = false; // Search result, not exact match
            logger.info('Nutrition data estimated from OpenFoodFacts search', { name });
          } else {
            throw new Error('No products found');
          }
        } catch (error) {
          logger.warn('Failed to find nutrition data', { name, error });
          nutrition = this.createDefaultNutrition(userNutrition);
          source = 'user_input';
        }
      }

      // Create food entry
      const foodEntry: FoodEntry = {
        id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        amount,
        unit,
        timestamp: new Date(),
        mealType,
        source,
        nutrition,
        barcode,
        recipe_id: recipeId,
        user_verified: verified
      };

      // Add to user's entries
      if (!this.userFoodEntries.has(userId)) {
        this.userFoodEntries.set(userId, []);
      }
      this.userFoodEntries.get(userId)!.push(foodEntry);

      // Update daily summary
      await this.updateDailySummary(userId, foodEntry.timestamp);

      logger.info('Food entry added', {
        userId,
        name,
        amount,
        source,
        calories: nutrition.calories
      });

      return foodEntry;
    } catch (error) {
      logger.error('Error adding food entry', { userId, name, error });
      throw new Error(`Failed to add food entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get daily nutrition summary
   */
  async getDailySummary(userId: string, date?: Date): Promise<DayNutritionSummary> {
    await this.ensureInitialized();

    const targetDate = date || new Date();
    const dateStr = this.formatDate(targetDate);

    try {
      // Check if we have cached summary
      const userSummaries = this.dailySummaries.get(userId);
      if (userSummaries && userSummaries.has(dateStr)) {
        const summary = userSummaries.get(dateStr)!;
        // Update assessment if profile exists
        if (this.userProfiles.has(userId)) {
          summary.nutritionalAssessment = await this.assessDailyNutrition(userId, summary.totalNutrition);
        }
        return summary;
      }

      // Generate new summary
      return await this.generateDailySummary(userId, targetDate);
    } catch (error) {
      logger.error('Error getting daily summary', { userId, date, error });
      throw new Error(`Failed to get daily summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get weekly nutrition summary
   */
  async getWeeklySummary(userId: string, startDate?: Date): Promise<WeeklyNutritionSummary> {
    await this.ensureInitialized();

    const start = startDate || this.getWeekStart(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    try {
      const dailySummaries: DayNutritionSummary[] = [];
      const totalNutrition = this.createEmptyNutrition();

      // Collect daily summaries for the week
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);
        
        const dailySummary = await this.getDailySummary(userId, currentDate);
        dailySummaries.push(dailySummary);

        // Add to weekly totals
        this.addNutritionData(totalNutrition, dailySummary.totalNutrition);
      }

      // Calculate averages
      const averageDaily = this.divideNutritionData(totalNutrition, 7);

      // Get assessment for average daily intake
      const profile = this.userProfiles.get(userId);
      let nutritionalAssessment: NutritionalAssessment;
      
      if (profile) {
        nutritionalAssessment = await ansesRNPService.assessNutritionalAdequacy(profile, this.nutritionToRecord(averageDaily));
      } else {
        throw new Error('User profile not found');
      }

      // Analyze trends
      const trends = await this.analyzeTrends(userId, start, end);

      // Generate achievements and improvements
      const achievements = this.generateAchievements(nutritionalAssessment, dailySummaries);
      const improvements = this.generateImprovements(nutritionalAssessment);

      const weeklySummary: WeeklyNutritionSummary = {
        startDate: this.formatDate(start),
        endDate: this.formatDate(end),
        averageDaily,
        nutritionalAssessment,
        trends,
        achievements,
        improvements
      };

      logger.info('Weekly summary generated', {
        userId,
        startDate: weeklySummary.startDate,
        overallScore: nutritionalAssessment.overall_score,
        trendsCount: trends.length
      });

      return weeklySummary;
    } catch (error) {
      logger.error('Error generating weekly summary', { userId, startDate, error });
      throw new Error(`Failed to generate weekly summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get real-time nutritional alerts
   */
  async getNutritionalAlerts(userId: string): Promise<NutritionalAlert[]> {
    await this.ensureInitialized();

    try {
      const alerts: NutritionalAlert[] = [];
      const today = new Date();
      const dailySummary = await this.getDailySummary(userId, today);

      if (dailySummary.nutritionalAssessment) {
        // Generate alerts based on gaps
        for (const gap of dailySummary.nutritionalAssessment.gaps) {
          const alert: NutritionalAlert = {
            type: 'deficiency',
            severity: gap.severity,
            nutrient: gap.nutrient,
            message: `Insuffisance en ${gap.nutrient}: ${gap.current.toFixed(1)}/${gap.recommended.toFixed(1)}`,
            recommendation: gap.recommendations[0],
            timestamp: new Date()
          };
          alerts.push(alert);
        }

        // Check for achievements
        if (dailySummary.nutritionalAssessment.overall_score >= 85) {
          alerts.push({
            type: 'achievement',
            severity: 'low',
            nutrient: 'overall',
            message: `Excellente journée nutritionnelle! Score: ${dailySummary.nutritionalAssessment.overall_score}/100`,
            timestamp: new Date()
          });
        }
      }

      // Time-based alerts
      const currentHour = today.getHours();
      if (currentHour >= 14 && dailySummary.meals.lunch.length === 0) {
        alerts.push({
          type: 'warning',
          severity: 'medium',
          nutrient: 'meal_timing',
          message: 'N\'oubliez pas de prendre votre déjeuner!',
          timestamp: new Date()
        });
      }

      logger.info('Nutritional alerts generated', {
        userId,
        alertsCount: alerts.length,
        severityBreakdown: this.getAlertSeverityBreakdown(alerts)
      });

      return alerts.sort((a, b) => this.severityToNumber(b.severity) - this.severityToNumber(a.severity));
    } catch (error) {
      logger.error('Error generating nutritional alerts', { userId, error });
      throw new Error(`Failed to generate alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update daily summary for a user
   */
  private async updateDailySummary(userId: string, date: Date): Promise<void> {
    const dateStr = this.formatDate(date);
    
    if (!this.dailySummaries.has(userId)) {
      this.dailySummaries.set(userId, new Map());
    }

    const summary = await this.generateDailySummary(userId, date);
    this.dailySummaries.get(userId)!.set(dateStr, summary);
  }

  /**
   * Generate daily summary
   */
  private async generateDailySummary(userId: string, date: Date): Promise<DayNutritionSummary> {
    const dateStr = this.formatDate(date);
    const userEntries = this.userFoodEntries.get(userId) || [];
    
    // Filter entries for the specific date
    const dayEntries = userEntries.filter(entry => 
      this.formatDate(entry.timestamp) === dateStr
    );

    // Group by meal type
    const meals = {
      breakfast: dayEntries.filter(e => e.mealType === 'breakfast'),
      lunch: dayEntries.filter(e => e.mealType === 'lunch'),
      dinner: dayEntries.filter(e => e.mealType === 'dinner'),
      snack: dayEntries.filter(e => e.mealType === 'snack')
    };

    // Calculate total nutrition
    const totalNutrition = this.createEmptyNutrition();
    for (const entry of dayEntries) {
      this.addNutritionData(totalNutrition, entry.nutrition);
    }

    // Get nutritional assessment
    let nutritionalAssessment: NutritionalAssessment | undefined;
    const profile = this.userProfiles.get(userId);
    if (profile) {
      nutritionalAssessment = await ansesRNPService.assessNutritionalAdequacy(
        profile,
        this.nutritionToRecord(totalNutrition)
      );
    }

    // Generate recommendations
    const recommendations = this.generateDailyRecommendations(totalNutrition, nutritionalAssessment);

    // Generate alerts
    const alerts = await this.generateDailyAlerts(userId, totalNutrition, nutritionalAssessment);

    return {
      date: dateStr,
      totalNutrition,
      meals,
      nutritionalAssessment,
      recommendations,
      alerts
    };
  }

  /**
   * Convert OpenFoodFacts nutrition to our format
   */
  private convertOFFNutrition(product: any, amount: number): NutritionData {
    const factor = amount / 100; // OpenFoodFacts is per 100g

    return {
      calories: (product.energy_100g || 0) * factor,
      protein: (product.proteins_100g || 0) * factor,
      carbohydrates: (product.carbohydrates_100g || 0) * factor,
      fat: (product.fat_100g || 0) * factor,
      fiber: (product.fiber_100g || 0) * factor,
      sugar: (product.sugars_100g || 0) * factor,
      sodium: (product.sodium_100g || 0) * factor,
      // Note: OpenFoodFacts has limited micronutrient data
      // These would need to be estimated or supplemented from other sources
    };
  }

  /**
   * Convert Spoonacular nutrition to our format
   */
  private convertSpoonacularNutrition(recipe: any, amount: number, servings: number): NutritionData {
    if (!recipe.nutrition?.nutrients) {
      return this.createEmptyNutrition();
    }

    const factor = (amount / 100) / servings; // Adjust for amount and servings
    const nutrients = recipe.nutrition.nutrients;

    const nutrition = this.createEmptyNutrition();

    for (const nutrient of nutrients) {
      const value = nutrient.amount * factor;
      
      switch (nutrient.name) {
        case 'Calories': nutrition.calories = value; break;
        case 'Protein': nutrition.protein = value; break;
        case 'Carbohydrates': nutrition.carbohydrates = value; break;
        case 'Fat': nutrition.fat = value; break;
        case 'Fiber': nutrition.fiber = value; break;
        case 'Sugar': nutrition.sugar = value; break;
        case 'Sodium': nutrition.sodium = value; break;
        case 'Calcium': nutrition.calcium = value; break;
        case 'Iron': nutrition.iron = value; break;
        case 'Magnesium': nutrition.magnesium = value; break;
        case 'Potassium': nutrition.potassium = value; break;
        case 'Zinc': nutrition.zinc = value; break;
        case 'Vitamin A': nutrition.vitaminA = value; break;
        case 'Vitamin C': nutrition.vitaminC = value; break;
        case 'Vitamin D': nutrition.vitaminD = value; break;
        case 'Vitamin B12': nutrition.vitaminB12 = value; break;
        // Add more nutrient mappings as needed
      }
    }

    return nutrition;
  }

  /**
   * Create default nutrition data
   */
  private createDefaultNutrition(userNutrition?: Partial<NutritionData>): NutritionData {
    const defaults = this.createEmptyNutrition();
    
    if (userNutrition) {
      Object.assign(defaults, userNutrition);
    }

    return defaults;
  }

  /**
   * Create empty nutrition data structure
   */
  private createEmptyNutrition(): NutritionData {
    return {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      saturatedFat: 0,
      sodium: 0,
      calcium: 0,
      iron: 0,
      magnesium: 0,
      phosphorus: 0,
      potassium: 0,
      zinc: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminK: 0,
      vitaminB1: 0,
      vitaminB2: 0,
      vitaminB3: 0,
      vitaminB6: 0,
      vitaminB9: 0,
      vitaminB12: 0,
      selenium: 0,
      copper: 0,
      manganese: 0,
      omega3: 0,
      omega6: 0
    };
  }

  /**
   * Add nutrition data
   */
  private addNutritionData(target: NutritionData, source: NutritionData): void {
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'number' && key in target) {
        (target as any)[key] += value;
      }
    }
  }

  /**
   * Divide nutrition data by a factor
   */
  private divideNutritionData(nutrition: NutritionData, divisor: number): NutritionData {
    const result = { ...nutrition };
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'number') {
        (result as any)[key] = value / divisor;
      }
    }
    return result;
  }

  /**
   * Convert nutrition data to record for ANSES service
   */
  private nutritionToRecord(nutrition: NutritionData): Record<string, number> {
    return Object.fromEntries(
      Object.entries(nutrition).filter(([_, value]) => typeof value === 'number')
    );
  }

  /**
   * Assess daily nutrition
   */
  private async assessDailyNutrition(userId: string, nutrition: NutritionData): Promise<NutritionalAssessment | undefined> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return undefined;

    return await ansesRNPService.assessNutritionalAdequacy(
      profile,
      this.nutritionToRecord(nutrition)
    );
  }

  /**
   * Generate daily recommendations
   */
  private generateDailyRecommendations(nutrition: NutritionData, assessment?: NutritionalAssessment): string[] {
    const recommendations: string[] = [];

    if (assessment) {
      // Add improvement suggestions
      recommendations.push(...assessment.improvements.slice(0, 3));
    }

    // General daily recommendations
    if (nutrition.fiber < 25) {
      recommendations.push('Augmentez votre consommation de fibres avec plus de légumes et légumineuses');
    }

    if (nutrition.vitaminC && nutrition.vitaminC < 80) {
      recommendations.push('Ajoutez des agrumes ou des légumes colorés pour la vitamine C');
    }

    return recommendations;
  }

  /**
   * Generate daily alerts
   */
  private async generateDailyAlerts(userId: string, nutrition: NutritionData, assessment?: NutritionalAssessment): Promise<NutritionalAlert[]> {
    const alerts: NutritionalAlert[] = [];

    if (assessment) {
      // Convert gaps to alerts
      for (const gap of assessment.gaps.slice(0, 3)) { // Top 3 gaps
        alerts.push({
          type: 'deficiency',
          severity: gap.severity,
          nutrient: gap.nutrient,
          message: `Objectif ${gap.nutrient}: ${gap.current.toFixed(1)}/${gap.recommended.toFixed(1)}`,
          recommendation: gap.recommendations[0],
          timestamp: new Date()
        });
      }
    }

    return alerts;
  }

  /**
   * Analyze nutritional trends
   */
  private async analyzeTrends(userId: string, startDate: Date, endDate: Date): Promise<NutritionalTrend[]> {
    // This would analyze trends over time
    // For now, return empty array - would need historical data analysis
    return [];
  }

  /**
   * Generate achievements
   */
  private generateAchievements(assessment: NutritionalAssessment, dailySummaries: DayNutritionSummary[]): string[] {
    const achievements: string[] = [];

    if (assessment.overall_score >= 85) {
      achievements.push('Score nutritionnel excellent cette semaine!');
    }

    if (assessment.adequacy_percentage >= 80) {
      achievements.push('Objectifs nutritionnels largement atteints');
    }

    // Check consistency
    const consistentDays = dailySummaries.filter(day => 
      day.nutritionalAssessment && day.nutritionalAssessment.overall_score >= 70
    ).length;

    if (consistentDays >= 5) {
      achievements.push('Régularité nutritionnelle excellente');
    }

    return achievements;
  }

  /**
   * Generate improvements
   */
  private generateImprovements(assessment: NutritionalAssessment): string[] {
    return assessment.improvements.slice(0, 5); // Top 5 improvements
  }

  /**
   * Utility methods
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getWeekStart(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private severityToNumber(severity: string): number {
    const map: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return map[severity] || 1;
  }

  private getAlertSeverityBreakdown(alerts: NutritionalAlert[]): Record<string, number> {
    const breakdown: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const alert of alerts) {
      breakdown[alert.severity]++;
    }
    return breakdown;
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      userProfiles: this.userProfiles.size,
      totalFoodEntries: Array.from(this.userFoodEntries.values()).reduce((sum, entries) => sum + entries.length, 0),
      dailySummaries: Array.from(this.dailySummaries.values()).reduce((sum, userSummaries) => sum + userSummaries.size, 0)
    };
  }
}

// Export singleton instance
export const realTimeNutritionalTrackingService = new RealTimeNutritionalTrackingService();