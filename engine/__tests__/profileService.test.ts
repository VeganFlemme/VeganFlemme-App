import { ProfileService, UserProfile } from '../src/services/profileService';

describe('ProfileService', () => {
  let profileService: ProfileService;

  beforeEach(() => {
    profileService = new ProfileService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize with default demo profile', () => {
      expect(profileService).toBeInstanceOf(ProfileService);
    });

    it('should have demo user profile available', async () => {
      const demoProfile = await profileService.getProfile('demo_user');
      expect(demoProfile).toBeDefined();
      expect(demoProfile?.id).toBe('demo_user');
      expect(demoProfile?.email).toBe('demo@veganflemme.com');
    });
  });

  describe('Profile Creation', () => {
    it('should create a new profile with minimal data', async () => {
      const profileData = {
        name: 'Test User',
        email: 'test@example.com',
        nutritionProfile: {
          age: 25,
          gender: 'male' as const,
          weight: 75,
          height: 180,
          activityLevel: 'active' as const,
          goals: 'maintain' as const
        }
      };

      const profile = await profileService.createProfile(profileData);

      expect(profile).toBeDefined();
      expect(profile.id).toMatch(/^user_\d+_[a-z0-9]+$/);
      expect(profile.name).toBe('Test User');
      expect(profile.email).toBe('test@example.com');
      expect(profile.nutritionProfile.age).toBe(25);
      expect(profile.nutritionProfile.gender).toBe('male');
      expect(profile.nutritionProfile.weight).toBe(75);
      expect(profile.nutritionProfile.height).toBe(180);
      expect(profile.dietaryRestrictions.preferences).toContain('vegan');
      expect(profile.subscription.plan).toBe('free');
      expect(profile.statistics.menusGenerated).toBe(0);
    });

    it('should create profile with default values when data is minimal', async () => {
      const profileData = {
        email: 'minimal@example.com'
      };

      const profile = await profileService.createProfile(profileData);

      expect(profile.name).toBe('');
      expect(profile.nutritionProfile.age).toBe(30);
      expect(profile.nutritionProfile.gender).toBe('male');
      expect(profile.nutritionProfile.weight).toBe(70);
      expect(profile.nutritionProfile.height).toBe(175);
      expect(profile.nutritionProfile.activityLevel).toBe('moderate');
      expect(profile.nutritionProfile.goals).toBe('maintain');
      expect(profile.preferences.cuisineTypes).toEqual(['mediterranean', 'asian', 'french']);
      expect(profile.settings.units).toBe('metric');
      expect(profile.settings.language).toBe('fr');
    });

    it('should create profile with custom dietary restrictions', async () => {
      const profileData = {
        name: 'Allergic User',
        email: 'allergic@example.com',
        dietaryRestrictions: {
          allergens: ['nuts', 'soy'],
          intolerances: ['gluten', 'lactose'],
          preferences: ['vegan', 'organic'],
          excludedIngredients: ['mushrooms', 'tomatoes']
        }
      };

      const profile = await profileService.createProfile(profileData);

      expect(profile.dietaryRestrictions.allergens).toEqual(['nuts', 'soy']);
      expect(profile.dietaryRestrictions.intolerances).toEqual(['gluten', 'lactose']);
      expect(profile.dietaryRestrictions.preferences).toEqual(['vegan', 'organic']);
      expect(profile.dietaryRestrictions.excludedIngredients).toEqual(['mushrooms', 'tomatoes']);
    });
  });

  describe('Profile Retrieval', () => {
    let testProfile: UserProfile;

    beforeEach(async () => {
      testProfile = await profileService.createProfile({
        name: 'Get Test User',
        email: 'gettest@example.com'
      });
    });

    it('should retrieve existing profile', async () => {
      const retrieved = await profileService.getProfile(testProfile.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(testProfile.id);
      expect(retrieved?.name).toBe('Get Test User');
      expect(retrieved?.email).toBe('gettest@example.com');
    });

    it('should update lastActive when retrieving profile', async () => {
      const originalLastActive = testProfile.statistics.lastActive;
      
      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const retrieved = await profileService.getProfile(testProfile.id);
      
      expect(retrieved?.statistics.lastActive).not.toBe(originalLastActive);
      expect(new Date(retrieved!.statistics.lastActive).getTime())
        .toBeGreaterThan(new Date(originalLastActive).getTime());
    });

    it('should return null for non-existent profile', async () => {
      const result = await profileService.getProfile('non_existent_id');
      expect(result).toBeNull();
    });
  });

  describe('Profile Updates', () => {
    let testProfile: UserProfile;

    beforeEach(async () => {
      testProfile = await profileService.createProfile({
        name: 'Update Test User',
        email: 'updatetest@example.com',
        nutritionProfile: {
          age: 30,
          gender: 'female',
          weight: 60,
          height: 165,
          activityLevel: 'moderate',
          goals: 'lose'
        }
      });
    });

    it('should update profile successfully', async () => {
      const updates = {
        name: 'Updated Name',
        nutritionProfile: {
          ...testProfile.nutritionProfile,
          weight: 65,
          goals: 'maintain' as const
        }
      };

      const updated = await profileService.updateProfile(testProfile.id, updates);

      expect(updated.name).toBe('Updated Name');
      expect(updated.nutritionProfile.weight).toBe(65);
      expect(updated.nutritionProfile.goals).toBe('maintain');
      expect(updated.id).toBe(testProfile.id); // ID should be preserved
    });

    it('should preserve existing data when partially updating', async () => {
      const updates = {
        name: 'Partial Update'
      };

      const updated = await profileService.updateProfile(testProfile.id, updates);

      expect(updated.name).toBe('Partial Update');
      expect(updated.email).toBe('updatetest@example.com'); // Should be preserved
      expect(updated.nutritionProfile.age).toBe(30); // Should be preserved
    });

    it('should update lastActive on profile update', async () => {
      const originalLastActive = testProfile.statistics.lastActive;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updated = await profileService.updateProfile(testProfile.id, { name: 'New Name' });
      
      expect(updated.statistics.lastActive).not.toBe(originalLastActive);
    });

    it('should throw error when updating non-existent profile', async () => {
      await expect(profileService.updateProfile('non_existent', { name: 'Test' }))
        .rejects.toThrow('Profile update failed');
    });
  });

  describe('Health Metrics Calculation', () => {
    it('should calculate BMI and health metrics correctly for male', async () => {
      const profile = await profileService.createProfile({
        nutritionProfile: {
          age: 30,
          gender: 'male',
          weight: 80,
          height: 180,
          activityLevel: 'moderate',
          goals: 'maintain'
        }
      });

      const metrics = profileService.calculateHealthMetrics(profile);

      expect(metrics.bmi).toBe(24.7); // 80 / (1.8)^2 = 24.69
      expect(metrics.bmiCategory).toBe('normal');
      expect(metrics.bmr).toBeGreaterThan(0);
      expect(metrics.tdee).toBeGreaterThan(metrics.bmr);
      expect(metrics.idealWeight.min).toBeGreaterThan(0);
      expect(metrics.idealWeight.max).toBeGreaterThan(metrics.idealWeight.min);
    });

    it('should calculate BMI and health metrics correctly for female', async () => {
      const profile = await profileService.createProfile({
        nutritionProfile: {
          age: 25,
          gender: 'female',
          weight: 60,
          height: 165,
          activityLevel: 'active',
          goals: 'maintain'
        }
      });

      const metrics = profileService.calculateHealthMetrics(profile);

      expect(metrics.bmi).toBe(22.0); // 60 / (1.65)^2 = 22.04
      expect(metrics.bmiCategory).toBe('normal');
      expect(metrics.bmr).toBeGreaterThan(0);
      expect(metrics.tdee).toBeGreaterThan(metrics.bmr);
    });

    it('should categorize BMI correctly', async () => {
      const testCases = [
        { weight: 50, height: 180, expected: 'underweight' },
        { weight: 70, height: 180, expected: 'normal' },
        { weight: 85, height: 180, expected: 'overweight' },
        { weight: 100, height: 180, expected: 'obese' }
      ];

      for (const testCase of testCases) {
        const profile = await profileService.createProfile({
          nutritionProfile: {
            age: 30,
            gender: 'male',
            weight: testCase.weight,
            height: testCase.height,
            activityLevel: 'moderate',
            goals: 'maintain'
          }
        });

        const metrics = profileService.calculateHealthMetrics(profile);
        expect(metrics.bmiCategory).toBe(testCase.expected);
      }
    });

    it('should apply correct activity multipliers', async () => {
      const baseProfile = {
        age: 30,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        goals: 'maintain' as const
      };

      const activityLevels: Array<{ level: any, multiplier: number }> = [
        { level: 'sedentary', multiplier: 1.2 },
        { level: 'light', multiplier: 1.375 },
        { level: 'moderate', multiplier: 1.55 },
        { level: 'active', multiplier: 1.725 },
        { level: 'very_active', multiplier: 1.9 }
      ];

      for (const activity of activityLevels) {
        const profile = await profileService.createProfile({
          nutritionProfile: {
            ...baseProfile,
            activityLevel: activity.level
          }
        });

        const metrics = profileService.calculateHealthMetrics(profile);
        const expectedTdee = Math.round(metrics.bmr * activity.multiplier);
        
        // Allow for minor rounding differences
        expect(Math.abs(metrics.tdee - expectedTdee)).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Nutrition Recommendations', () => {
    it('should provide basic nutrition recommendations', async () => {
      const profile = await profileService.createProfile({
        nutritionProfile: {
          age: 30,
          gender: 'male',
          weight: 70,
          height: 175,
          activityLevel: 'moderate',
          goals: 'maintain'
        }
      });

      const recommendations = profileService.getNutritionRecommendations(profile);

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);

      // Check for essential nutrients
      const proteinRec = recommendations.find(r => r.nutrient === 'protein');
      const b12Rec = recommendations.find(r => r.nutrient === 'vitaminB12');
      const ironRec = recommendations.find(r => r.nutrient === 'iron');

      expect(proteinRec).toBeDefined();
      expect(proteinRec?.target).toBe(Math.round(0.83 * 70)); // 0.83g per kg
      expect(proteinRec?.priority).toBe('high');

      expect(b12Rec).toBeDefined();
      expect(b12Rec?.target).toBe(4);
      expect(b12Rec?.priority).toBe('high');

      expect(ironRec).toBeDefined();
      expect(ironRec?.target).toBe(11); // Male recommendation
    });

    it('should provide different iron recommendations for females', async () => {
      const profile = await profileService.createProfile({
        nutritionProfile: {
          age: 25,
          gender: 'female',
          weight: 60,
          height: 165,
          activityLevel: 'moderate',
          goals: 'maintain'
        }
      });

      const recommendations = profileService.getNutritionRecommendations(profile);
      const ironRec = recommendations.find(r => r.nutrient === 'iron');

      expect(ironRec).toBeDefined();
      expect(ironRec?.target).toBe(16); // Female recommendation
    });

    it('should add vitamin D recommendation for people over 50', async () => {
      const profile = await profileService.createProfile({
        nutritionProfile: {
          age: 55,
          gender: 'male',
          weight: 75,
          height: 175,
          activityLevel: 'moderate',
          goals: 'maintain'
        }
      });

      const recommendations = profileService.getNutritionRecommendations(profile);
      const vitaminDRec = recommendations.find(r => r.nutrient === 'vitaminD');

      expect(vitaminDRec).toBeDefined();
      expect(vitaminDRec?.target).toBe(20);
      expect(vitaminDRec?.priority).toBe('high');
      expect(vitaminDRec?.reason).toContain('50 ans');
    });
  });

  describe('Meal Plans', () => {
    let testProfile: UserProfile;

    beforeEach(async () => {
      testProfile = await profileService.createProfile({
        name: 'Meal Plan User',
        email: 'mealplan@example.com'
      });
    });

    it('should create a meal plan', async () => {
      const planData = {
        name: 'Test Meal Plan',
        description: 'A test meal plan',
        meals: [
          {
            date: '2024-07-30',
            breakfast: {
              id: 'breakfast_1',
              name: 'Porridge aux fruits',
              calories: 350
            },
            lunch: {
              id: 'lunch_1', 
              name: 'Salade quinoa',
              calories: 450
            }
          }
        ]
      };

      const mealPlan = await profileService.createMealPlan(testProfile.id, planData);

      expect(mealPlan).toBeDefined();
      expect(mealPlan.id).toMatch(/^plan_\d+_[a-z0-9]+$/);
      expect(mealPlan.userId).toBe(testProfile.id);
      expect(mealPlan.name).toBe('Test Meal Plan');
      expect(mealPlan.status).toBe('active');
      expect(mealPlan.meals).toEqual(planData.meals);
    });

    it('should increment menu generation count when creating meal plan', async () => {
      const originalCount = testProfile.statistics.menusGenerated;

      await profileService.createMealPlan(testProfile.id, { name: 'Test Plan' });

      const updatedProfile = await profileService.getProfile(testProfile.id);
      expect(updatedProfile?.statistics.menusGenerated).toBe(originalCount + 1);
    });

    it('should get user meal plans', async () => {
      const plan1 = await profileService.createMealPlan(testProfile.id, { name: 'Plan 1' });
      const plan2 = await profileService.createMealPlan(testProfile.id, { name: 'Plan 2' });

      const mealPlans = await profileService.getMealPlans(testProfile.id);

      expect(mealPlans).toBeInstanceOf(Array);
      expect(mealPlans.length).toBe(2);
      
      // Check that we have both plans (order may vary due to timestamp precision)
      const planNames = mealPlans.map(p => p.name);
      expect(planNames).toContain('Plan 1');
      expect(planNames).toContain('Plan 2');
    });

    it('should throw error when creating meal plan for non-existent user', async () => {
      await expect(profileService.createMealPlan('non_existent', { name: 'Test' }))
        .rejects.toThrow('Meal plan creation failed');
    });
  });

  describe('Favorites Management', () => {
    let testProfile: UserProfile;

    beforeEach(async () => {
      testProfile = await profileService.createProfile({
        name: 'Favorites User',
        email: 'favorites@example.com'
      });
    });

    it('should add recipe to favorites', async () => {
      const result = await profileService.addToFavorites(testProfile.id, 'recipe123');

      expect(result).toBe(true);

      const updatedProfile = await profileService.getProfile(testProfile.id);
      expect(updatedProfile?.statistics.favoriteRecipes).toContain('recipe123');
    });

    it('should not add duplicate recipes to favorites', async () => {
      await profileService.addToFavorites(testProfile.id, 'recipe123');
      const result = await profileService.addToFavorites(testProfile.id, 'recipe123');

      expect(result).toBe(false);

      const updatedProfile = await profileService.getProfile(testProfile.id);
      expect(updatedProfile?.statistics.favoriteRecipes.filter(id => id === 'recipe123')).toHaveLength(1);
    });

    it('should throw error when adding to favorites for non-existent user', async () => {
      await expect(profileService.addToFavorites('non_existent', 'recipe123'))
        .rejects.toThrow('Add to favorites failed');
    });
  });

  describe('Statistics Updates', () => {
    let testProfile: UserProfile;

    beforeEach(async () => {
      testProfile = await profileService.createProfile({
        name: 'Stats User',
        email: 'stats@example.com'
      });
    });

    it('should update nutrition score', async () => {
      // First create a meal plan to establish a base count
      await profileService.createMealPlan(testProfile.id, { name: 'Test Plan' });
      await profileService.updateNutritionScore(testProfile.id, 0.85);

      const updatedProfile = await profileService.getProfile(testProfile.id);
      expect(updatedProfile?.statistics.averageNutritionScore).toBe(0.85);
    });

    it('should calculate running average for nutrition score', async () => {
      // First menu
      await profileService.createMealPlan(testProfile.id, { name: 'Plan 1' });
      await profileService.updateNutritionScore(testProfile.id, 0.8);

      // Second menu
      await profileService.createMealPlan(testProfile.id, { name: 'Plan 2' });
      await profileService.updateNutritionScore(testProfile.id, 0.9);

      const updatedProfile = await profileService.getProfile(testProfile.id);
      expect(updatedProfile?.statistics.averageNutritionScore).toBe(0.85); // (0.8 + 0.9) / 2
    });

    it('should update carbon footprint savings', async () => {
      await profileService.updateCarbonSavings(testProfile.id, 5.5);

      const updatedProfile = await profileService.getProfile(testProfile.id);
      expect(updatedProfile?.statistics.carbonFootprintSaved).toBe(5.5);

      // Add more savings
      await profileService.updateCarbonSavings(testProfile.id, 3.0);

      const finalProfile = await profileService.getProfile(testProfile.id);
      expect(finalProfile?.statistics.carbonFootprintSaved).toBe(8.5);
    });
  });

  describe('Dashboard Data', () => {
    let testProfile: UserProfile;

    beforeEach(async () => {
      testProfile = await profileService.createProfile({
        name: 'Dashboard User',
        email: 'dashboard@example.com',
        nutritionProfile: {
          age: 30,
          gender: 'male',
          weight: 75,
          height: 180,
          activityLevel: 'moderate',
          goals: 'maintain'
        }
      });

      // Add some data
      await profileService.createMealPlan(testProfile.id, { name: 'Plan 1' });
      await profileService.createMealPlan(testProfile.id, { name: 'Plan 2' });
      await profileService.updateNutritionScore(testProfile.id, 0.85);
      await profileService.updateCarbonSavings(testProfile.id, 12.0);
    });

    it('should provide comprehensive dashboard data', async () => {
      const dashboardData = await profileService.getDashboardData(testProfile.id);

      expect(dashboardData).toBeDefined();
      expect(dashboardData.profile).toBeDefined();
      expect(dashboardData.profile.name).toBe('Dashboard User');
      expect(dashboardData.statistics).toBeDefined();
      expect(dashboardData.healthMetrics).toBeDefined();
      expect(dashboardData.recommendations).toBeDefined();
      expect(dashboardData.recentMealPlans).toBeDefined();
      expect(dashboardData.achievements).toBeDefined();

      // Check health metrics
      expect(dashboardData.healthMetrics.bmi).toBeDefined();
      expect(dashboardData.healthMetrics.bmr).toBeDefined();
      expect(dashboardData.healthMetrics.tdee).toBeDefined();

      // Check recommendations
      expect(dashboardData.recommendations).toBeInstanceOf(Array);
      expect(dashboardData.recommendations.length).toBeGreaterThan(0);

      // Check recent meal plans (should be limited to 3)
      expect(dashboardData.recentMealPlans).toBeInstanceOf(Array);
      expect(dashboardData.recentMealPlans.length).toBeLessThanOrEqual(3);
    });

    it('should calculate achievements correctly', async () => {
      const dashboardData = await profileService.getDashboardData(testProfile.id);

      expect(dashboardData.achievements).toBeInstanceOf(Array);
      
      // Should have first menu achievement
      const firstMenuAchievement = dashboardData.achievements.find((a: any) => a.id === 'first_menu');
      expect(firstMenuAchievement).toBeDefined();
      expect(firstMenuAchievement.name).toBe('Premier menu');

      // Should have eco warrior achievement (>10kg CO2)
      const ecoAchievement = dashboardData.achievements.find((a: any) => a.id === 'eco_warrior');
      expect(ecoAchievement).toBeDefined();
      expect(ecoAchievement.name).toBe('Guerrier écologique');
    });

    it('should throw error for non-existent user dashboard', async () => {
      await expect(profileService.getDashboardData('non_existent'))
        .rejects.toThrow('Dashboard data retrieval failed');
    });
  });

  describe('Achievements System', () => {
    let testProfile: UserProfile;

    beforeEach(async () => {
      testProfile = await profileService.createProfile({
        name: 'Achievement User',
        email: 'achievements@example.com'
      });
    });

    it('should unlock first menu achievement', async () => {
      await profileService.createMealPlan(testProfile.id, { name: 'First Plan' });

      const dashboardData = await profileService.getDashboardData(testProfile.id);
      const firstMenuAchievement = dashboardData.achievements.find((a: any) => a.id === 'first_menu');

      expect(firstMenuAchievement).toBeDefined();
      expect(firstMenuAchievement.icon).toBe('🥗');
    });

    it('should unlock menu master achievement after 10 menus', async () => {
      // Create 10 meal plans
      for (let i = 1; i <= 10; i++) {
        await profileService.createMealPlan(testProfile.id, { name: `Plan ${i}` });
      }

      const dashboardData = await profileService.getDashboardData(testProfile.id);
      const menuMasterAchievement = dashboardData.achievements.find((a: any) => a.id === 'menu_master');

      expect(menuMasterAchievement).toBeDefined();
      expect(menuMasterAchievement.name).toBe('Maître des menus');
      expect(menuMasterAchievement.icon).toBe('👨‍🍳');
    });

    it('should unlock nutrition expert achievement with high score', async () => {
      await profileService.createMealPlan(testProfile.id, { name: 'High Score Plan' });
      await profileService.updateNutritionScore(testProfile.id, 0.85);

      const dashboardData = await profileService.getDashboardData(testProfile.id);
      const nutritionExpertAchievement = dashboardData.achievements.find((a: any) => a.id === 'nutrition_expert');

      expect(nutritionExpertAchievement).toBeDefined();
      expect(nutritionExpertAchievement.icon).toBe('🏆');
    });

    it('should unlock eco warrior achievement with carbon savings', async () => {
      await profileService.updateCarbonSavings(testProfile.id, 15.0);

      const dashboardData = await profileService.getDashboardData(testProfile.id);
      const ecoWarriorAchievement = dashboardData.achievements.find((a: any) => a.id === 'eco_warrior');

      expect(ecoWarriorAchievement).toBeDefined();
      expect(ecoWarriorAchievement.icon).toBe('🌱');
    });
  });
});