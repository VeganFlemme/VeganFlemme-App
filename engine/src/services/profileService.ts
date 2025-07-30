import { logger } from '../utils/logger';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  nutritionProfile: {
    age: number;
    gender: 'male' | 'female';
    weight: number; // kg
    height: number; // cm
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    goals: 'maintain' | 'lose' | 'gain';
  };
  dietaryRestrictions: {
    allergens: string[];
    intolerances: string[];
    preferences: string[];
    excludedIngredients: string[];
  };
  preferences: {
    cuisineTypes: string[];
    cookingTime: 'quick' | 'medium' | 'elaborate';
    budget: 'low' | 'medium' | 'high';
    favoriteMeals: string[];
    avoidedIngredients: string[];
  };
  settings: {
    units: 'metric' | 'imperial';
    language: 'fr' | 'en';
    notifications: {
      mealReminders: boolean;
      nutritionAlerts: boolean;
      shoppingReminders: boolean;
    };
  };
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    startDate: string;
    endDate?: string;
    features: string[];
  };
  statistics: {
    menusGenerated: number;
    favoriteRecipes: string[];
    averageNutritionScore: number;
    carbonFootprintSaved: number; // kg CO2
    joinDate: string;
    lastActive: string;
  };
}

export interface NutritionGoal {
  nutrient: string;
  target: number;
  unit: string;
  priority: 'low' | 'medium' | 'high';
  reason?: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  meals: {
    date: string;
    breakfast?: any;
    lunch?: any;
    dinner?: any;
    snacks?: any[];
  }[];
  nutritionSummary: any;
  shoppingList: any;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export class ProfileService {
  private profiles: Map<string, UserProfile> = new Map();
  private mealPlans: Map<string, MealPlan> = new Map();

  constructor() {
    this.initializeDefaultProfiles();
  }

  /**
   * Create a new user profile
   */
  async createProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const profile: UserProfile = {
        id,
        email: profileData.email || '',
        name: profileData.name || '',
        nutritionProfile: {
          age: 30,
          gender: 'male',
          weight: 70,
          height: 175,
          activityLevel: 'moderate',
          goals: 'maintain',
          ...profileData.nutritionProfile
        },
        dietaryRestrictions: {
          allergens: [],
          intolerances: [],
          preferences: ['vegan'],
          excludedIngredients: [],
          ...profileData.dietaryRestrictions
        },
        preferences: {
          cuisineTypes: ['mediterranean', 'asian', 'french'],
          cookingTime: 'medium',
          budget: 'medium',
          favoriteMeals: [],
          avoidedIngredients: [],
          ...profileData.preferences
        },
        settings: {
          units: 'metric',
          language: 'fr',
          notifications: {
            mealReminders: true,
            nutritionAlerts: true,
            shoppingReminders: false
          },
          ...profileData.settings
        },
        subscription: {
          plan: 'free',
          startDate: new Date().toISOString(),
          features: ['basic_menu_generation', 'nutrition_tracking'],
          ...profileData.subscription
        },
        statistics: {
          menusGenerated: 0,
          favoriteRecipes: [],
          averageNutritionScore: 0,
          carbonFootprintSaved: 0,
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          ...profileData.statistics
        }
      };

      this.profiles.set(id, profile);
      logger.info('Profile created successfully', { userId: id });
      
      return profile;

    } catch (error) {
      logger.error('Failed to create profile:', error);
      throw new Error('Profile creation failed');
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profile = this.profiles.get(userId);
      
      if (profile) {
        // Update last active
        profile.statistics.lastActive = new Date().toISOString();
        this.profiles.set(userId, profile);
        
        logger.info('Profile retrieved', { userId });
        return profile;
      }
      
      logger.warn('Profile not found', { userId });
      return null;

    } catch (error) {
      logger.error('Failed to get profile:', error);
      throw new Error('Profile retrieval failed');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const existingProfile = this.profiles.get(userId);
      
      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      const updatedProfile = {
        ...existingProfile,
        ...updates,
        id: userId, // Preserve ID
        statistics: {
          ...existingProfile.statistics,
          ...updates.statistics,
          lastActive: new Date().toISOString()
        }
      };

      this.profiles.set(userId, updatedProfile);
      logger.info('Profile updated successfully', { userId });
      
      return updatedProfile;

    } catch (error) {
      logger.error('Failed to update profile:', error);
      throw new Error('Profile update failed');
    }
  }

  /**
   * Calculate BMI and other health metrics
   */
  calculateHealthMetrics(profile: UserProfile): any {
    const { weight, height } = profile.nutritionProfile;
    
    const bmi = weight / Math.pow(height / 100, 2);
    
    let bmiCategory: string;
    if (bmi < 18.5) bmiCategory = 'underweight';
    else if (bmi < 25) bmiCategory = 'normal';
    else if (bmi < 30) bmiCategory = 'overweight';
    else bmiCategory = 'obese';

    // Calculate BMR (Basal Metabolic Rate)
    let bmr: number;
    const { age, gender } = profile.nutritionProfile;
    
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * activityMultipliers[profile.nutritionProfile.activityLevel];

    return {
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      idealWeight: {
        min: Math.round(18.5 * Math.pow(height / 100, 2)),
        max: Math.round(24.9 * Math.pow(height / 100, 2))
      }
    };
  }

  /**
   * Get personalized nutrition recommendations
   */
  getNutritionRecommendations(profile: UserProfile): NutritionGoal[] {
    const recommendations: NutritionGoal[] = [];
    const { age, gender, weight } = profile.nutritionProfile;

    // Protein recommendations
    recommendations.push({
      nutrient: 'protein',
      target: Math.round(0.83 * weight),
      unit: 'g',
      priority: 'high',
      reason: 'Maintien de la masse musculaire'
    });

    // B12 - crucial for vegans
    recommendations.push({
      nutrient: 'vitaminB12',
      target: 4,
      unit: 'μg',
      priority: 'high',
      reason: 'Essentiel pour les végétaliens'
    });

    // Iron - higher for women
    recommendations.push({
      nutrient: 'iron',
      target: gender === 'female' ? 16 : 11,
      unit: 'mg',
      priority: 'high',
      reason: 'Prévention de l\'anémie'
    });

    // Calcium
    recommendations.push({
      nutrient: 'calcium',
      target: 950,
      unit: 'mg',
      priority: 'medium',
      reason: 'Santé osseuse'
    });

    // Omega-3
    recommendations.push({
      nutrient: 'omega3',
      target: 2.5,
      unit: 'g',
      priority: 'medium',
      reason: 'Santé cardiovasculaire et cognitive'
    });

    // Additional recommendations based on age
    if (age > 50) {
      recommendations.push({
        nutrient: 'vitaminD',
        target: 20,
        unit: 'μg',
        priority: 'high',
        reason: 'Absorption du calcium après 50 ans'
      });
    }

    return recommendations;
  }

  /**
   * Create meal plan for user
   */
  async createMealPlan(userId: string, planData: Partial<MealPlan>): Promise<MealPlan> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        throw new Error('User profile not found');
      }

      const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const mealPlan: MealPlan = {
        id,
        userId,
        name: planData.name || 'Mon plan de repas',
        description: planData.description,
        startDate: planData.startDate || new Date().toISOString().split('T')[0],
        endDate: planData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        meals: planData.meals || [],
        nutritionSummary: planData.nutritionSummary || {},
        shoppingList: planData.shoppingList || {},
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.mealPlans.set(id, mealPlan);
      
      // Update user statistics
      profile.statistics.menusGenerated += 1;
      await this.updateProfile(userId, profile);

      logger.info('Meal plan created', { userId, planId: id });
      return mealPlan;

    } catch (error) {
      logger.error('Failed to create meal plan:', error);
      throw new Error('Meal plan creation failed');
    }
  }

  /**
   * Get user's meal plans
   */
  async getMealPlans(userId: string): Promise<MealPlan[]> {
    try {
      const userPlans = Array.from(this.mealPlans.values())
        .filter(plan => plan.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      logger.info('Meal plans retrieved', { userId, count: userPlans.length });
      return userPlans;

    } catch (error) {
      logger.error('Failed to get meal plans:', error);
      throw new Error('Meal plans retrieval failed');
    }
  }

  /**
   * Add recipe to favorites
   */
  async addToFavorites(userId: string, recipeId: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      if (!profile.statistics.favoriteRecipes.includes(recipeId)) {
        profile.statistics.favoriteRecipes.push(recipeId);
        await this.updateProfile(userId, profile);
        
        logger.info('Recipe added to favorites', { userId, recipeId });
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Failed to add to favorites:', error);
      throw new Error('Add to favorites failed');
    }
  }

  /**
   * Update nutrition score based on menu analysis
   */
  async updateNutritionScore(userId: string, score: number): Promise<void> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      // Calculate running average
      const currentAvg = profile.statistics.averageNutritionScore;
      const menuCount = profile.statistics.menusGenerated;
      
      const newAverage = ((currentAvg * (menuCount - 1)) + score) / menuCount;
      
      profile.statistics.averageNutritionScore = Math.round(newAverage * 100) / 100;
      
      await this.updateProfile(userId, profile);
      logger.info('Nutrition score updated', { userId, newScore: score, newAverage });

    } catch (error) {
      logger.error('Failed to update nutrition score:', error);
      throw new Error('Nutrition score update failed');
    }
  }

  /**
   * Update carbon footprint savings
   */
  async updateCarbonSavings(userId: string, savedKgCO2: number): Promise<void> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      profile.statistics.carbonFootprintSaved += savedKgCO2;
      
      await this.updateProfile(userId, profile);
      logger.info('Carbon savings updated', { userId, saved: savedKgCO2 });

    } catch (error) {
      logger.error('Failed to update carbon savings:', error);
      throw new Error('Carbon savings update failed');
    }
  }

  /**
   * Get user dashboard data
   */
  async getDashboardData(userId: string): Promise<any> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const mealPlans = await this.getMealPlans(userId);
      const healthMetrics = this.calculateHealthMetrics(profile);
      const recommendations = this.getNutritionRecommendations(profile);

      return {
        profile: {
          name: profile.name,
          joinDate: profile.statistics.joinDate,
          lastActive: profile.statistics.lastActive,
          subscription: profile.subscription
        },
        statistics: profile.statistics,
        healthMetrics,
        recommendations,
        recentMealPlans: mealPlans.slice(0, 3),
        achievements: this.calculateAchievements(profile)
      };

    } catch (error) {
      logger.error('Failed to get dashboard data:', error);
      throw new Error('Dashboard data retrieval failed');
    }
  }

  /**
   * Calculate user achievements
   */
  private calculateAchievements(profile: UserProfile): any[] {
    const achievements = [];
    const stats = profile.statistics;

    // Menu generation achievements
    if (stats.menusGenerated >= 1) {
      achievements.push({
        id: 'first_menu',
        name: 'Premier menu',
        description: 'Vous avez généré votre premier menu !',
        icon: '🥗',
        unlockedAt: profile.statistics.joinDate
      });
    }

    if (stats.menusGenerated >= 10) {
      achievements.push({
        id: 'menu_master',
        name: 'Maître des menus',
        description: 'Vous avez généré 10 menus personnalisés',
        icon: '👨‍🍳',
        unlockedAt: new Date().toISOString()
      });
    }

    // Nutrition score achievements
    if (stats.averageNutritionScore >= 0.8) {
      achievements.push({
        id: 'nutrition_expert',
        name: 'Expert nutrition',
        description: 'Score nutritionnel moyen supérieur à 80%',
        icon: '🏆',
        unlockedAt: new Date().toISOString()
      });
    }

    // Environmental achievements
    if (stats.carbonFootprintSaved >= 10) {
      achievements.push({
        id: 'eco_warrior',
        name: 'Guerrier écologique',
        description: 'Vous avez économisé 10kg de CO2',
        icon: '🌱',
        unlockedAt: new Date().toISOString()
      });
    }

    return achievements;
  }

  /**
   * Initialize default profiles for demo
   */
  private initializeDefaultProfiles(): void {
    // Demo profile for testing
    const demoProfile: UserProfile = {
      id: 'demo_user',
      email: 'demo@veganflemme.com',
      name: 'Utilisateur Demo',
      nutritionProfile: {
        age: 28,
        gender: 'female',
        weight: 65,
        height: 168,
        activityLevel: 'moderate',
        goals: 'maintain'
      },
      dietaryRestrictions: {
        allergens: ['nuts'],
        intolerances: ['gluten'],
        preferences: ['vegan', 'organic'],
        excludedIngredients: ['mushrooms']
      },
      preferences: {
        cuisineTypes: ['mediterranean', 'asian'],
        cookingTime: 'medium',
        budget: 'medium',
        favoriteMeals: [],
        avoidedIngredients: []
      },
      settings: {
        units: 'metric',
        language: 'fr',
        notifications: {
          mealReminders: true,
          nutritionAlerts: true,
          shoppingReminders: true
        }
      },
      subscription: {
        plan: 'premium',
        startDate: new Date().toISOString(),
        features: ['advanced_menu_generation', 'nutrition_tracking', 'meal_planning', 'shopping_lists']
      },
      statistics: {
        menusGenerated: 5,
        favoriteRecipes: ['porridge_avoine', 'bowl_quinoa'],
        averageNutritionScore: 0.87,
        carbonFootprintSaved: 12.5,
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date().toISOString()
      }
    };

    this.profiles.set('demo_user', demoProfile);
    logger.info('Default profiles initialized');
  }
}