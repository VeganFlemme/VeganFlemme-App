import { MealPlan, MealPlanDay, Meal, Recipe, UserProfile, NutrientProfile, Food } from './types';
import { NutritionService } from './nutritionService';
import { RecipeRecommendationService } from './recipeRecommendationService';
import { v4 as uuidv4 } from 'uuid';

export class MealPlanningService {
  private nutritionService: NutritionService;
  private recipeRecommendationService: RecipeRecommendationService;
  
  constructor(
    nutritionService: NutritionService,
    recipeRecommendationService: RecipeRecommendationService
  ) {
    this.nutritionService = nutritionService;
    this.recipeRecommendationService = recipeRecommendationService;
  }
  
  /**
   * Generates a complete meal plan for the specified number of days
   */
  public async generateMealPlan(
    userProfile: UserProfile,
    options: {
      days: number;
      startDate: Date;
      includedMealTypes: string[];
      preferences?: {
        maxRecipeReuse?: number;
        balanceAcrossDays?: boolean;
        seasonalFocus?: boolean;
        maxPrepTimePerDay?: number;
        prioritizeLeftovers?: boolean;
        balanceProteinSources?: boolean;
      }
    },
    availableRecipes: Recipe[],
    availableFoods: Map<string, Food>
  ): Promise<MealPlan> {
    // Calculate daily target nutrients for the user
    const dailyTargetNutrients = this.nutritionService.calculateDailyRequirements(userProfile);
    
    // Set default preferences if not provided
    const preferences = {
      maxRecipeReuse: options.preferences?.maxRecipeReuse || 2,
      balanceAcrossDays: options.preferences?.balanceAcrossDays !== false,
      seasonalFocus: options.preferences?.seasonalFocus || false,
      maxPrepTimePerDay: options.preferences?.maxPrepTimePerDay || 60,
      prioritizeLeftovers: options.preferences?.prioritizeLeftovers !== false,
      balanceProteinSources: options.preferences?.balanceProteinSources !== false
    };
    
    // Track used recipes to ensure variety
    const usedRecipes: Map<string, number> = new Map();
    
    // Track nutrient distribution for balancing across days
    let remainingNutrientDistribution = { ...dailyTargetNutrients };
    
    // Initialize meal plan
    const mealPlan: MealPlan = {
      id: uuidv4(),
      userId: userProfile.id,
      startDate: new Date(options.startDate),
      endDate: new Date(options.startDate),
      days: [],
      targetNutrients: { ...dailyTargetNutrients },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Set end date
    mealPlan.endDate.setDate(mealPlan.startDate.getDate() + options.days - 1);
    
    // Track protein sources used to ensure balance if requested
    const proteinSourcesUsed: Set<string> = new Set();
    
    // Generate each day's meals
    for (let dayIndex = 0; dayIndex < options.days; dayIndex++) {
      // Create date for this day
      const currentDate = new Date(options.startDate);
      currentDate.setDate(currentDate.getDate() + dayIndex);
      
      const day: MealPlanDay = {
        date: currentDate,
        meals: [],
        groceryList: []
      };
      
      // Calculate how many nutrients should be consumed on this day
      let dayTargetNutrients: NutrientProfile;
      
      if (preferences.balanceAcrossDays && dayIndex < options.days - 1) {
        // For better weekly balance, adjust daily targets based on previous consumption
        dayTargetNutrients = this.adjustDailyTargets(
          dailyTargetNutrients, 
          remainingNutrientDistribution,
          options.days - dayIndex
        );
      } else {
        dayTargetNutrients = { ...dailyTargetNutrients };
      }
      
      // Track nutrients still needed for this day as we add meals
      const remainingDayNutrients = { ...dayTargetNutrients };
      
      // Track time spent on meal prep for this day
      let totalPrepTimeForDay = 0;
      
      // Generate each meal for the day
      for (const mealType of options.includedMealTypes) {
        // Skip this meal if we've already exceeded prep time budget
        if (totalPrepTimeForDay > preferences.maxPrepTimePerDay) {
          // Instead, recommend simple no-cook options
          day.meals.push(this.createSimpleNoPreparationMeal(mealType, remainingDayNutrients));
          continue;
        }
        
        // Calculate target nutrients for this meal
        const mealNutrientTarget = this.calculateMealNutrientTargets(
          remainingDayNutrients, 
          mealType,
          options.includedMealTypes.length
        );
        
        // Get previously used recipes to avoid repetition
        const previouslyUsedRecipes = Array.from(usedRecipes.keys());
        
        // Generate recipe recommendations for this meal
        const recommendedRecipes = await this.recipeRecommendationService.recommendRecipes(
          userProfile,
          mealNutrientTarget,
          mealType,
          availableRecipes,
          availableFoods,
          {
            count: 3,
            previousRecommendations: previouslyUsedRecipes,
            seasonalFocus: preferences.seasonalFocus,
            excludeAllergens: true,
            prioritizeFavorites: true,
            transitionFriendly: userProfile.veganTransitionStage !== 'established'
          }
        );
        
        // Select best recipe based on various criteria
        let selectedRecipe = recommendedRecipes[0];
        
        // Check if we can reuse leftovers instead of a new recipe
        if (preferences.prioritizeLeftovers && dayIndex > 0) {
          const leftoverRecipe = this.findSuitableLeftover(
            mealType,
            mealNutrientTarget,
            mealPlan.days,
            usedRecipes,
            availableRecipes
          );
          
          if (leftoverRecipe) {
            selectedRecipe = leftoverRecipe;
          }
        }
        
        // If balancing protein sources, try to select a recipe with different protein sources
        if (preferences.balanceProteinSources) {
          selectedRecipe = this.selectForProteinDiversity(
            recommendedRecipes,
            proteinSourcesUsed,
            availableFoods
          ) || selectedRecipe;
        }
        
        // Create the meal with the selected recipe
        const meal: Meal = {
          id: uuidv4(),
          mealType: mealType as any,
          recipes: [{
            recipeId: selectedRecipe.id,
            servings: this.calculateOptimalServings(selectedRecipe, mealNutrientTarget, availableFoods)
          }],
          nutrients: selectedRecipe.nutrients || 
                     this.nutritionService.calculateRecipeNutrients(selectedRecipe, availableFoods)
        };
        
        // Update used recipes count
        usedRecipes.set(selectedRecipe.id, (usedRecipes.get(selectedRecipe.id) || 0) + 1);
        
        // Update protein sources used
        this.updateProteinSourcesUsed(selectedRecipe, proteinSourcesUsed, availableFoods);
        
        // Update remaining nutrients for the day
        this.subtractNutrients(remainingDayNutrients, meal.nutrients);
        
        // Update prep time for the day
        totalPrepTimeForDay += selectedRecipe.prepTime + selectedRecipe.cookTime;
        
        // Add the meal to the day
        day.meals.push(meal);
        
        // Update grocery list for the day
        this.updateGroceryList(day.groceryList!, selectedRecipe, meal.recipes[0].servings);
      }
      
      // Calculate actual nutrients for the day
      day.nutrients = this.calculateDayNutrients(day.meals);
      
      // Update the remaining nutrient distribution if balancing across days
      if (preferences.balanceAcrossDays) {
        this.subtractNutrients(remainingNutrientDistribution, day.nutrients);
      }
      
      // Add the day to the meal plan
      mealPlan.days.push(day);
    }
    
    // Calculate actual nutrients for the entire meal plan
    mealPlan.actualNutrients = this.calculateMealPlanNutrients(mealPlan.days);
    
    return mealPlan;
  }
  
  /**
   * Creates a meal plan day with simple no-preparation meals
   */
  private createSimpleNoPreparationMeal(mealType: string, targetNutrients: NutrientProfile): Meal {
    // This would contain logic to create simple meals that require no cooking
    // For now, returning a placeholder
    return {
      id: uuidv4(),
      mealType: mealType as any,
      recipes: [],
      foods: [], // Would contain simple foods that don't require recipes
    };
  }
  
  /**
   * Adjusts daily nutrient targets based on remaining weekly distribution
   */
  private adjustDailyTargets(
    standardDailyTargets: NutrientProfile,
    remainingDistribution: NutrientProfile,
    daysRemaining: number
  ): NutrientProfile {
    const adjustedTargets = { ...standardDailyTargets };
    
    // Distribute remaining nutrients evenly
    for (const nutrient in standardDailyTargets) {
      const average = remainingDistribution[nutrient] / daysRemaining;
      
      // Allow up to 15% adjustment from standard targets
      const maxAdjustment = standardDailyTargets[nutrient] * 0.15;
      
      if (average > standardDailyTargets[nutrient]) {
        // Need to catch up, increase target
        adjustedTargets[nutrient] = Math.min(
          standardDailyTargets[nutrient] + maxAdjustment,
          average
        );
      } else if (average < standardDailyTargets[nutrient]) {
        // Ahead of target, can reduce
        adjustedTargets[nutrient] = Math.max(
          standardDailyTargets[nutrient] - maxAdjustment,
          average
        );
      }
    }
    
    return adjustedTargets;
  }
  
  /**
   * Calculate target nutrients for a specific meal
   */
  private calculateMealNutrientTargets(
    remainingDayNutrients: NutrientProfile,
    mealType: string,
    totalMeals: number
  ): NutrientProfile {
    const mealTargets = { ...remainingDayNutrients };
    
    // Distribute nutrients based on meal type
    const mealDistribution = {
      'breakfast': 0.25,
      'lunch': 0.3,
      'dinner': 0.35,
      'snack': 0.1,
      'dessert': 0.05
    };
    
    // Get distribution factor for this meal type
    const distributionFactor = mealDistribution[mealType] || (1 / totalMeals);
    
    // Calculate targets based on remaining nutrients and distribution factor
    for (const nutrient in mealTargets) {
      mealTargets[nutrient] = remainingDayNutrients[nutrient] * distributionFactor;
    }
    
    return mealTargets;
  }
  
  /**
   * Find a recipe from previous days that could be reused as leftovers
   */
  private findSuitableLeftover(
    mealType: string,
    targetNutrients: NutrientProfile,
    previousDays: MealPlanDay[],
    usedRecipes: Map<string, number>,
    availableRecipes: Recipe[]
  ): Recipe | null {
    // Only consider recipes from the last 2 days (freshness concerns)
    const recentDays = previousDays.slice(-2);
    
    for (const day of recentDays) {
      for (const meal of day.meals) {
        for (const recipeRef of meal.recipes) {
          // Find the full recipe object
          const recipe = availableRecipes.find(r => r.id === recipeRef.recipeId);
          if (!recipe) continue;
          
          // Check if this recipe is suitable for the current meal type
          if (!recipe.mealType.includes(mealType as any)) continue;
          
          // Check if we haven't overused this recipe
          if ((usedRecipes.get(recipe.id) || 0) > 1) continue;
          
          // Check if it's nutritionally suitable
          const nutritionMatch = this.checkNutrientMatch(recipe.nutrients!, targetNutrients);
          if (nutritionMatch > 0.7) { // 70% match is good enough for leftovers
            return recipe;
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * Select a recipe that provides protein diversity
   */
  private selectForProteinDiversity(
    recipes: Recipe[],
    usedProteinSources: Set<string>,
    foods: Map<string, Food>
  ): Recipe | null {
    // For each recipe, identify its main protein sources
    for (const recipe of recipes) {
      const proteinSources = this.identifyProteinSources(recipe, foods);
      
      // Check if this recipe offers new protein sources
      const hasNewSource = proteinSources.some(source => !usedProteinSources.has(source));
      
      if (hasNewSource) {
        return recipe;
      }
    }
    
    return null;
  }
  
  /**
   * Identify main protein sources in a recipe
   */
  private identifyProteinSources(recipe: Recipe, foods: Map<string, Food>): string[] {
    const sources: string[] = [];
    const proteinGroups = {
      'legumes': ['beans', 'lentils', 'chickpeas', 'peas', 'tofu', 'tempeh', 'edamame'],
      'nuts-seeds': ['almonds', 'walnuts', 'cashews', 'hemp seeds', 'chia seeds', 'flax seeds', 'pumpkin seeds'],
      'whole-grains': ['quinoa', 'buckwheat', 'oats', 'amaranth', 'wild rice', 'teff'],
      'seitan': ['seitan', 'vital wheat gluten', 'wheat protein'],
      'tvp': ['tvp', 'textured vegetable protein', 'soy curls'],
      'mycoproteins': ['mycoprotein', 'quorn'],
      'plant-based-meats': ['impossible', 'beyond', 'plant-based meat', 'vegan meat']
    };
    
    // Check each ingredient
    for (const ingredient of recipe.ingredients) {
      const food = foods.get(ingredient.foodId);
      if (!food) continue;
      
      // Check if this is a significant protein source
      if (food.nutrients.protein > 5) { // More than 5g protein per serving
        // Identify which protein group it belongs to
        for (const [group, keywords] of Object.entries(proteinGroups)) {
          if (keywords.some(keyword => 
              food.name.toLowerCase().includes(keyword) || 
              food.category.some(cat => cat.toLowerCase().includes(keyword)))) {
            sources.push(group);
            break;
          }
        }
      }
    }
    
    return sources;
  }
  
  /**
   * Update the set of protein sources used in the meal plan
   */
  private updateProteinSourcesUsed(
    recipe: Recipe, 
    proteinSources: Set<string>,
    foods: Map<string, Food>
  ): void {
    const sources = this.identifyProteinSources(recipe, foods);
    sources.forEach(source => proteinSources.add(source));
  }
  
  /**
   * Calculate optimal servings for a recipe based on nutritional targets
   */
  private calculateOptimalServings(
    recipe: Recipe,
    targetNutrients: NutrientProfile,
    foods: Map<string, Food>
  ): number {
    // Start with standard serving
    let servings = 1;
    
    // Calculate nutrients per serving
    const recipeNutrients = recipe.nutrients || 
                           this.nutritionService.calculateRecipeNutrients(recipe, foods);
    
    // Focus on calories and protein for serving size
    const calorieRatio = targetNutrients.calories / recipeNutrients.calories;
    const proteinRatio = targetNutrients.protein / recipeNutrients.protein;
    
    // Use average of calorie and protein ratios to determine servings
    const avgRatio = (calorieRatio + proteinRatio) / 2;
    
    // Round to nearest 0.5 serving
    servings = Math.max(0.5, Math.round(avgRatio * 2) / 2);
    
    // Cap at reasonable limits
    servings = Math.min(Math.max(servings, 0.5), 3);
    
    return servings;
  }
  
  /**
   * Subtract consumed nutrients from remaining targets
   */
  private subtractNutrients(remaining: NutrientProfile, consumed: NutrientProfile): void {
    for (const nutrient in remaining) {
      remaining[nutrient] = Math.max(0, remaining[nutrient] - (consumed[nutrient] || 0));
    }
  }
  
  /**
   * Update grocery list with ingredients from a recipe
   */
  private updateGroceryList(
    groceryList: Array<{foodId: string, amount: number, unit: string}>,
    recipe: Recipe,
    servings: number
  ): void {
    // Multiply ingredients by servings
    for (const ingredient of recipe.ingredients) {
      // Check if this ingredient is already in the list
      const existingItem = groceryList.find(item => item.foodId === ingredient.foodId);
      
      if (existingItem) {
        // Add to existing amount
        existingItem.amount += ingredient.amount * servings;
      } else {
        // Add new item to grocery list
        groceryList.push({
          foodId: ingredient.foodId,
          amount: ingredient.amount * servings,
          unit: ingredient.unit
        });
      }
    }
  }
  
  /**
   * Calculate total nutrients for a day
   */
  private calculateDayNutrients(meals: Meal[]): NutrientProfile {
    // Start with empty nutrient profile
    const totalNutrients: NutrientProfile = this.createEmptyNutrientProfile();
    
    // Add nutrients from each meal
    for (const meal of meals) {
      if (meal.nutrients) {
        this.addNutrients(totalNutrients, meal.nutrients);
      }
    }
    
    return totalNutrients;
  }
  
  /**
   * Calculate total nutrients for the meal plan
   */
  private calculateMealPlanNutrients(days: MealPlanDay[]): NutrientProfile {
    // Start with empty nutrient profile
    const totalNutrients: NutrientProfile = this.createEmptyNutrientProfile();
    
    // Add nutrients from each day
    for (const day of days) {
      if (day.nutrients) {
        this.addNutrients(totalNutrients, day.nutrients);
      }
    }
    
    return totalNutrients;
  }
  
  /**
   * Add nutrients together
   */
  private addNutrients(base: NutrientProfile, toAdd: NutrientProfile): void {
    for (const nutrient in base) {
      base[nutrient] += toAdd[nutrient] || 0;
    }
  }
  
  /**
   * Check how well a recipe's nutrients match target nutrients
   * Returns a score between 0 and 1
   */
  private checkNutrientMatch(recipeNutrients: NutrientProfile, targetNutrients: NutrientProfile): number {
    const keyNutrients = ['calories', 'protein', 'carbohydrates', 'fat'];
    let totalScore = 0;
    
    for (const nutrient of keyNutrients) {
      if (targetNutrients[nutrient] > 0) {
        const target = targetNutrients[nutrient];
        const actual = recipeNutrients[nutrient];
        
        // Score based on how close actual is to target (1.0 = perfect match)
        const matchScore = 1 - Math.min(1, Math.abs(actual - target) / target);
        totalScore += matchScore;
      }
    }
    
    return totalScore / keyNutrients.length;
  }
  
  /**
   * Creates an empty nutrient profile with all values set to 0
   */
  private createEmptyNutrientProfile(): NutrientProfile {
    return {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fiber: 0,
      sugar: 0,
      fat: 0,
      saturatedFat: 0,
      monounsaturatedFat: 0,
      polyunsaturatedFat: 0,
      omega3: 0,
      omega6: 0,
      cholesterol: 0,
      sodium: 0,
      potassium: 0,
      calcium: 0,
      magnesium: 0,
      iron: 0,
      zinc: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminK: 0,
      thiamin: 0,
      riboflavin: 0,
      niacin: 0,
      vitaminB6: 0,
      folate: 0,
      vitaminB12: 0,
      biotin: 0,
      pantothenicAcid: 0,
      iodine: 0,
      selenium: 0
    };
  }
}