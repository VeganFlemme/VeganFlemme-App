import { Recipe, UserProfile, NutrientProfile, Food } from './types';
import { NutritionService } from './nutritionService';

export class RecipeRecommendationService {
  private nutritionService: NutritionService;
  
  constructor(nutritionService: NutritionService) {
    this.nutritionService = nutritionService;
  }
  
  /**
   * Recommends recipes based on user profile, nutritional needs, and preferences
   */
  public async recommendRecipes(
    userProfile: UserProfile,
    targetNutrients: NutrientProfile,
    mealType: string,
    recipes: Recipe[],
    foods: Map<string, Food>,
    options: {
      count?: number;
      previousRecommendations?: string[];
      seasonalFocus?: boolean;
      excludeAllergens?: boolean;
      prioritizeFavorites?: boolean;
      transitionFriendly?: boolean;
    } = {}
  ): Promise<Recipe[]> {
    const count = options.count || 5;
    const previousRecommendations = options.previousRecommendations || [];
    
    // Filter out recipes with allergens if requested
    let eligibleRecipes = recipes;
    
    if (options.excludeAllergens && userProfile.allergies && userProfile.allergies.length > 0) {
      eligibleRecipes = recipes.filter(recipe => {
        // Check if any ingredient in the recipe contains allergens
        return !recipe.ingredients.some(ingredient => {
          const food = foods.get(ingredient.foodId);
          if (!food) return false;
          return userProfile.allergies!.some(allergen => 
            food.allergens.includes(allergen)
          );
        });
      });
    }
    
    // Filter out recipes with disliked ingredients
    if (userProfile.dislikedIngredients && userProfile.dislikedIngredients.length > 0) {
      eligibleRecipes = eligibleRecipes.filter(recipe => {
        return !recipe.ingredients.some(ingredient => {
          const food = foods.get(ingredient.foodId);
          if (!food) return false;
          return userProfile.dislikedIngredients!.includes(food.name);
        });
      });
    }
    
    // Filter by meal type
    eligibleRecipes = eligibleRecipes.filter(recipe => 
      recipe.mealType.includes(mealType as any)
    );
    
    // Calculate score for each recipe
    const scoredRecipes = await Promise.all(eligibleRecipes.map(async recipe => {
      // Calculate base score
      let score = 0;
      
      // Nutritional match score (0-40 points)
      const nutrients = recipe.nutrients || this.nutritionService.calculateRecipeNutrients(recipe, foods);
      const nutritionScore = this.calculateNutritionMatchScore(nutrients, targetNutrients, mealType);
      score += nutritionScore * 40;
      
      // Preference match (0-20 points)
      const preferenceScore = this.calculatePreferenceScore(recipe, userProfile, foods);
      score += preferenceScore * 20;
      
      // Seasonal match if requested (0-10 points)
      if (options.seasonalFocus) {
        const seasonalScore = this.calculateSeasonalScore(recipe, foods);
        score += seasonalScore * 10;
      }
      
      // Variety boost - reduce score for previously recommended recipes (0-15 points)
      const varietyScore = previousRecommendations.includes(recipe.id) ? 0 : 1;
      score += varietyScore * 15;
      
      // Transition-friendliness for new vegans (0-15 points)
      if (options.transitionFriendly && 
          (userProfile.veganTransitionStage === 'considering' || 
           userProfile.veganTransitionStage === 'beginning')) {
        const transitionScore = this.calculateTransitionFriendliness(recipe);
        score += transitionScore * 15;
      }
      
      // Cooking skill match (0-10 points)
      const skillScore = this.calculateSkillMatchScore(recipe, userProfile);
      score += skillScore * 10;
      
      // Cooking time match (0-10 points)
      const timeScore = this.calculateTimeMatchScore(recipe, userProfile);
      score += timeScore * 10;
      
      // Prioritize favorites if requested
      if (options.prioritizeFavorites && 
          userProfile.favoriteRecipes && 
          userProfile.favoriteRecipes.includes(recipe.id)) {
        score *= 1.2; // 20% boost for favorites
      }
      
      return {
        recipe,
        score
      };
    }));
    
    // Sort by score (descending) and return the top recipes
    return scoredRecipes
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.recipe);
  }
  
  /**
   * Calculate how well a recipe's nutritional profile matches target nutrients
   */
  private calculateNutritionMatchScore(
    recipeNutrients: NutrientProfile,
    targetNutrients: NutrientProfile,
    mealType: string
  ): number {
    // Define approximate percentage of daily nutrients by meal type
    const mealPercentages: { [key: string]: number } = {
      'breakfast': 0.25,
      'lunch': 0.3,
      'dinner': 0.35,
      'snack': 0.1,
      'dessert': 0.05
    };
    
    const mealPercent = mealPercentages[mealType] || 0.3;
    
    // Calculate weighted match for key nutrients
    let totalScore = 0;
    let maxScore = 0;
    
    // Key nutrients with weights (higher weight = more important)
    const nutrientWeights = {
      calories: 1.0,
      protein: 1.5,
      fiber: 1.2,
      iron: 1.2,
      calcium: 1.2,
      vitaminB12: 1.5,
      zinc: 1.2,
      omega3: 1.3
    };
    
    for (const [nutrient, weight] of Object.entries(nutrientWeights)) {
      if (targetNutrients[nutrient] > 0) {
        // Target amount for this meal
        const target = targetNutrients[nutrient] * mealPercent;
        const actual = recipeNutrients[nutrient];
        
        // Calculate score based on how close actual is to target (1.0 = perfect match)
        let matchScore = 0;
        if (actual >= target * 0.7 && actual <= target * 1.3) {
          // Within 70-130% of target: full points
          matchScore = 1.0;
        } else if (actual > 0) {
          // Outside ideal range but still contributes: partial points
          matchScore = 1 - Math.min(1, Math.abs(actual - target) / target);
        }
        
        totalScore += matchScore * weight;
        maxScore += weight;
      }
    }
    
    return maxScore > 0 ? totalScore / maxScore : 0;
  }
  
  /**
   * Calculate preference score based on user's preferences
   */
  private calculatePreferenceScore(recipe: Recipe, userProfile: UserProfile, foods: Map<string, Food>): number {
    let score = 0;
    let points = 0;
    
    // Check for cuisine preferences
    if (userProfile.cuisinePreferences && userProfile.cuisinePreferences.length > 0) {
      points++;
      if (recipe.cuisineType.some(cuisine => 
          userProfile.cuisinePreferences!.includes(cuisine))) {
        score++;
      }
    }
    
    // Check for favorite ingredients
    if (userProfile.favoriteIngredients && userProfile.favoriteIngredients.length > 0) {
      points++;
      
      const ingredientNames = recipe.ingredients
        .map(i => {
          const food = foods.get(i.foodId);
          return food ? food.name : null;
        })
        .filter(name => name !== null);
      
      if (ingredientNames.some(name => 
          userProfile.favoriteIngredients!.includes(name!))) {
        score++;
      }
    }
    
    // Check dietary focus match
    if (userProfile.dietaryFocus && userProfile.dietaryFocus.length > 0) {
      points++;
      
      // Map recipe tags to dietary focus categories
      const recipeMatchesDietaryFocus = userProfile.dietaryFocus.some(focus => {
        switch (focus) {
          case 'high-protein':
            // Check if protein is at least 25% of calories
            if (recipe.nutrients) {
              const proteinCalories = recipe.nutrients.protein * 4;
              return (proteinCalories / recipe.nutrients.calories) >= 0.25;
            }
            return recipe.tags.includes('high-protein');
            
          case 'low-fat':
            // Check if fat is less than 20% of calories
            if (recipe.nutrients) {
              const fatCalories = recipe.nutrients.fat * 9;
              return (fatCalories / recipe.nutrients.calories) <= 0.2;
            }
            return recipe.tags.includes('low-fat');
            
          // Add more cases for other dietary focuses
            
          default:
            return recipe.tags.includes(focus);
        }
      });
      
      if (recipeMatchesDietaryFocus) {
        score++;
      }
    }
    
    // Default to middle score if no preferences set
    return points > 0 ? score / points : 0.5;
  }
  
  /**
   * Calculate seasonal score based on ingredient seasonality
   */
  private calculateSeasonalScore(recipe: Recipe, foods: Map<string, Food>): number {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    let seasonalIngredients = 0;
    let totalSignificantIngredients = 0;
    
    // Check each ingredient for seasonality
    for (const ingredient of recipe.ingredients) {
      const food = foods.get(ingredient.foodId);
      if (!food || food.isStaple) continue; // Skip staple foods
      
      totalSignificantIngredients++;
      
      if (food.seasonality && 
          food.seasonality.months && 
          food.seasonality.months.includes(currentMonth)) {
        seasonalIngredients++;
      }
    }
    
    return totalSignificantIngredients > 0 ? 
           seasonalIngredients / totalSignificantIngredients : 0.5;
  }
  
  /**
   * Calculate how friendly a recipe is for someone transitioning to veganism
   */
  private calculateTransitionFriendliness(recipe: Recipe): number {
    // Check for tags that indicate transition-friendly recipes
    const transitionFriendlyTags = [
      'beginner-friendly',
      'meat-alternative',
      'cheese-alternative',
      'egg-alternative',
      'milk-alternative',
      'familiar',
      'comfort-food',
      'classic',
      'easy'
    ];
    
    const matchingTags = recipe.tags.filter(tag => 
      transitionFriendlyTags.includes(tag.toLowerCase())
    );
    
    // Calculate score based on matching tags
    return Math.min(1, matchingTags.length / 3); // 3+ matching tags = perfect score
  }
  
  /**
   * Calculate how well the recipe matches user's cooking skill level
   */
  private calculateSkillMatchScore(recipe: Recipe, userProfile: UserProfile): number {
    const difficultyLevels: { [key: string]: number } = {
      'easy': 1,
      'medium': 2,
      'hard': 3,
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3
    };
    
    const recipeDifficulty = difficultyLevels[recipe.difficulty] || 2;
    const userSkill = difficultyLevels[userProfile.cookingSkill] || 2;
    
    // Perfect match if recipe difficulty matches user skill
    if (recipeDifficulty === userSkill) return 1.0;
    
    // Acceptable if recipe is easier than user skill
    if (recipeDifficulty < userSkill) return 0.9;
    
    // Penalize if recipe is more difficult than user skill
    const skillGap = recipeDifficulty - userSkill;
    return Math.max(0, 1 - skillGap * 0.5);
  }
  
  /**
   * Calculate how well the recipe matches user's cooking time preferences
   */
  private calculateTimeMatchScore(recipe: Recipe, userProfile: UserProfile): number {
    const timePreferences = {
      'minimal': 30,  // 30 minutes max
      'moderate': 60, // 60 minutes max
      'extended': 120 // 120+ minutes is fine
    };
    
    const userMaxTime = timePreferences[userProfile.cookingTime];
    const totalRecipeTime = recipe.totalTime;
    
    if (totalRecipeTime <= userMaxTime) return 1.0;
    
    // Penalty for exceeding preferred time
    const overtime = totalRecipeTime - userMaxTime;
    return Math.max(0, 1 - overtime / userMaxTime);
  }
}