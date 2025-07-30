import { Request, Response } from 'express';
import { RecipeIntegrationService } from '../services/recipeIntegrationService';
import { MenuOptimizationService } from '../services/menuOptimizationService';
import { ProfileService } from '../services/profileService';
import { UserPreferences } from '../types';

/**
 * Controller for recipe-related endpoints
 */
export class RecipeController {
  private recipeService: RecipeIntegrationService;
  private menuService: MenuOptimizationService;
  private profileService: ProfileService;
  
  constructor(
    recipeService: RecipeIntegrationService,
    menuService: MenuOptimizationService,
    profileService: ProfileService
  ) {
    this.recipeService = recipeService;
    this.menuService = menuService;
    this.profileService = profileService;
  }
  
  /**
   * Searches for recipes with advanced filters
   */
  public searchRecipes = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract search parameters from request
      const {
        query = '',
        diet = 'vegan', // Default to vegan
        intolerances,
        includeIngredients,
        excludeIngredients,
        type,
        maxReadyTime,
        minProtein,
        maxCalories,
        sort = 'healthiness',
        number = 10
      } = req.query;
      
      // Ensure vegan diet is enforced
      const params: Record<string, any> = {
        ...req.query,
        diet: 'vegan', // Force vegan regardless of input
        addRecipeNutrition: true,
        instructionsRequired: true,
        fillIngredients: true
      };
      
      // Search recipes
      const recipes = await this.recipeService.searchRecipes(params);
      
      res.json({
        success: true,
        data: {
          results: recipes,
          count: recipes.length,
          parameters: params
        }
      });
    } catch (error) {
      console.error('Error searching recipes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  /**
   * Gets detailed recipe information
   */
  public getRecipeDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Recipe ID is required'
        });
        return;
      }
      
      // Get recipe details
      const recipeDetails = await this.recipeService.getRecipeDetails(parseInt(id));
      
      if (!recipeDetails) {
        res.status(404).json({
          success: false,
          error: 'Recipe not found'
        });
        return;
      }
      
      // Validate recipe is vegan
      if (!this.recipeService.validateVeganRecipe(recipeDetails)) {
        res.status(400).json({
          success: false,
          error: 'Recipe is not vegan',
          message: 'This recipe contains non-vegan ingredients'
        });
        return;
      }
      
      // Format response
      const formattedRecipe = {
        id: recipeDetails.id,
        title: recipeDetails.title,
        image: recipeDetails.image,
        readyInMinutes: recipeDetails.readyInMinutes,
        servings: recipeDetails.servings,
        sourceUrl: recipeDetails.sourceUrl,
        summary: recipeDetails.summary,
        instructions: this.recipeService.parseInstructions(recipeDetails),
        ingredients: this.recipeService.parseIngredients(recipeDetails),
        nutrition: this.recipeService.parseNutrition(recipeDetails),
        qualityScore: await this.recipeService.calculateQualityScores(recipeDetails)
      };
      
      res.json({
        success: true,
        data: formattedRecipe
      });
    } catch (error) {
      console.error('Error getting recipe details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recipe details',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  /**
   * Enhances a menu with detailed recipes
   */
  public enhanceMenuWithRecipes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { menu, userId } = req.body;
      
      if (!menu || !userId) {
        res.status(400).json({
          success: false,
          error: 'Menu and userId are required'
        });
        return;
      }
      
      // Get user profile
      const userProfile = await this.profileService.getProfile(userId);
      
      if (!userProfile) {
        res.status(404).json({
          success: false,
          error: 'User profile not found'
        });
        return;
      }
      
      // Get user preferences (from the profile) and convert to UserPreferences format
      const userPreferences: UserPreferences = {
        people: 1, // Default to 1 person, could be configurable
        budget: userProfile?.preferences?.budget || 'medium',
        cookingTime: userProfile?.preferences?.cookingTime === 'elaborate' ? 'long' : (userProfile?.preferences?.cookingTime as 'quick' | 'medium') || 'medium',
        cuisineTypes: userProfile?.preferences?.cuisineTypes || [],
        mealTypes: ['breakfast', 'lunch', 'dinner'],
        daysCount: 7,
        restrictions: [],
        favoriteIngredients: userProfile?.preferences?.favoriteMeals || [],
        dislikedIngredients: userProfile?.preferences?.avoidedIngredients || [],
        includeSnacks: true
      };
      
      // Enhance menu with recipes
      const enhancedMenu = await this.recipeService.enrichMenuWithRecipes(
        menu,
        userProfile.nutritionProfile,
        userPreferences
      );
      
      res.json({
        success: true,
        data: enhancedMenu
      });
    } catch (error) {
      console.error('Error enhancing menu with recipes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to enhance menu with recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  /**
   * Suggests recipes based on user profile and preferences
   */
  public suggestRecipes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, mealType, count = 5 } = req.query;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }
      
      // Get user profile
      const userProfile = await this.profileService.getProfile(userId as string);
      
      if (!userProfile) {
        res.status(404).json({
          success: false,
          error: 'User profile not found'
        });
        return;
      }
      
      // Get user preferences (from the profile) and convert to UserPreferences format
      const userPreferences2: UserPreferences = {
        people: 1, // Default to 1 person
        budget: userProfile?.preferences?.budget || 'medium',
        cookingTime: userProfile?.preferences?.cookingTime === 'elaborate' ? 'long' : (userProfile?.preferences?.cookingTime as 'quick' | 'medium') || 'medium',
        cuisineTypes: userProfile?.preferences?.cuisineTypes || [],
        mealTypes: ['breakfast', 'lunch', 'dinner'],
        daysCount: 7,
        restrictions: [],
        favoriteIngredients: userProfile?.preferences?.favoriteMeals || [],
        dislikedIngredients: userProfile?.preferences?.avoidedIngredients || [],
        includeSnacks: true
      };
      
      // Generate search parameters based on user profile and meal type
      const searchParams = this.generateSearchParamsFromProfile(
        userProfile.nutritionProfile,
        userPreferences2,
        mealType as string,
        parseInt(count as string)
      );
      
      // Search recipes
      const recipes = await this.recipeService.searchRecipes(searchParams);
      
      res.json({
        success: true,
        data: {
          suggestions: recipes,
          count: recipes.length,
          mealType: mealType || 'any'
        }
      });
    } catch (error) {
      console.error('Error suggesting recipes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to suggest recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  /**
   * Generates API search parameters based on user profile and meal type
   */
  private generateSearchParamsFromProfile(
    nutritionProfile: any,
    preferences: UserPreferences,
    mealType: string,
    count: number
  ): Record<string, any> {
    const params: Record<string, any> = {
      diet: 'vegan',
      addRecipeNutrition: true,
      instructionsRequired: true,
      fillIngredients: true,
      number: count || 5
    };
    
    // Set meal type
    if (mealType) {
      switch (mealType.toLowerCase()) {
        case 'breakfast':
          params.type = 'breakfast';
          break;
        case 'lunch':
          params.type = 'main course';
          break;
        case 'dinner':
          params.type = 'main course';
          break;
        case 'snack':
        case 'morningsnack':
        case 'afternoonsnack':
          params.type = 'snack';
          break;
      }
    }
    
    // Calculate nutritional targets based on user profile
    if (nutritionProfile) {
      // Calculate BMR using Harris-Benedict equation
      let bmr: number;
      if (nutritionProfile.gender === 'male') {
        bmr = 88.362 + (13.397 * nutritionProfile.weight) + (4.799 * nutritionProfile.height) - (5.677 * nutritionProfile.age);
      } else {
        bmr = 447.593 + (9.247 * nutritionProfile.weight) + (3.098 * nutritionProfile.height) - (4.330 * nutritionProfile.age);
      }
      
      // Adjust calories based on meal type
      let targetCalories = bmr;
      
      if (mealType) {
        switch (mealType.toLowerCase()) {
          case 'breakfast':
            targetCalories *= 0.25; // 25% of daily calories
            break;
          case 'lunch':
            targetCalories *= 0.35; // 35% of daily calories
            break;
          case 'dinner':
            targetCalories *= 0.35; // 35% of daily calories
            break;
          case 'snack':
          case 'morningsnack':
          case 'afternoonsnack':
            targetCalories *= 0.1; // 10% of daily calories
            break;
        }
      }
      
      // Set calorie range (±20%)
      params.minCalories = Math.floor(targetCalories * 0.8);
      params.maxCalories = Math.ceil(targetCalories * 1.2);
      
      // Set protein target based on weight
      const dailyProtein = nutritionProfile.weight * 1.2; // 1.2g per kg of body weight
      let mealProtein = dailyProtein;
      
      if (mealType) {
        switch (mealType.toLowerCase()) {
          case 'breakfast':
            mealProtein *= 0.25; // 25% of daily protein
            break;
          case 'lunch':
            mealProtein *= 0.35; // 35% of daily protein
            break;
          case 'dinner':
            mealProtein *= 0.35; // 35% of daily protein
            break;
          case 'snack':
          case 'morningsnack':
          case 'afternoonsnack':
            mealProtein *= 0.1; // 10% of daily protein
            break;
        }
      }
      
      // Set protein range (±20%)
      params.minProtein = Math.floor(mealProtein * 0.8);
      params.maxProtein = Math.ceil(mealProtein * 1.2);
    }
    
    // Include user preferences
    if (preferences) {
      // Cooking time
      if (preferences.cookingTime) {
        switch (preferences.cookingTime) {
          case 'quick':
            params.maxReadyTime = 20;
            break;
          case 'medium':
            params.maxReadyTime = 40;
            break;
          case 'long':
            params.maxReadyTime = 90;
            break;
        }
      }
      
      // Ingredient preferences
      if (preferences.favoriteIngredients && preferences.favoriteIngredients.length > 0) {
        // Include up to 2 favorite ingredients randomly
        const favoritesToInclude = preferences.favoriteIngredients
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        
        params.includeIngredients = favoritesToInclude.join(',');
      }
      
      // Exclude disliked ingredients
      if (preferences.dislikedIngredients && preferences.dislikedIngredients.length > 0) {
        params.excludeIngredients = preferences.dislikedIngredients.join(',');
      }
      
      // Add intolerances
      if (preferences.restrictions) {
        const intolerances: string[] = [];
        
        // Convert numeric code to string intolerances
        if (typeof preferences.restrictions === 'number') {
          const code = preferences.restrictions;
          if (code & 1) intolerances.push('gluten');
          if (code & 2) intolerances.push('soy');
          if (code & 4) intolerances.push('tree nut');
          if (code & 8) intolerances.push('nightshade');
          // Add more as needed
        } else if (Array.isArray(preferences.restrictions)) {
          // Map internal restriction names to Spoonacular format
          const restrictionMap: Record<string, string> = {
            'gluten': 'gluten',
            'soy': 'soy',
            'nuts': 'tree nut',
            'nightshades': 'nightshade',
            // Add more mappings as needed
          };
          
          for (const restriction of preferences.restrictions) {
            if (restrictionMap[restriction]) {
              intolerances.push(restrictionMap[restriction]);
            }
          }
        }
        
        if (intolerances.length > 0) {
          params.intolerances = intolerances.join(',');
        }
      }
    }
    
    return params;
  }
}