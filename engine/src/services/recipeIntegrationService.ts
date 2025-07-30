import axios from 'axios';
import { FoodItem, MenuDay, NutritionProfile, UserPreferences, Menu, Recipe } from '../types';
import { calculateNutritionalScore } from './nutritionAnalysisService';
import { getQualityScore } from './qualityScorerService';
import * as math from 'mathjs';

/**
 * Service responsible for integrating external recipe APIs with the VeganFlemme menu generation system
 */
export class RecipeIntegrationService {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string = 'https://api.spoonacular.com';
  private recipeCache: Map<string, any> = new Map();
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Enriches a generated menu with detailed recipes from the API
   */
  public async enrichMenuWithRecipes(
    menu: Menu, 
    userProfile: NutritionProfile,
    preferences: UserPreferences
  ): Promise<Menu> {
    try {
      // Create a deep copy to avoid modifying the original
      const enrichedMenu: Menu = JSON.parse(JSON.stringify(menu));
      
      // Process each day and meal
      for (const day of enrichedMenu.days) {
        for (const mealType of Object.keys(day.meals)) {
          const meal = day.meals[mealType as keyof typeof day.meals];
          if (!meal) continue;
          
          // Skip if meal already has detailed recipe
          if (meal.recipeDetails?.instructions?.length > 0) continue;
          
          // Generate recipe search parameters based on meal
          const searchParams = this.generateSearchParameters(
            meal, 
            mealType as string, 
            userProfile, 
            preferences
          );
          
          // Fetch matching recipes
          const recipes = await this.searchRecipes(searchParams);
          
          if (recipes.length > 0) {
            // Select best matching recipe
            const bestMatch = this.selectBestRecipeMatch(recipes, meal, userProfile);
            
            // Fetch full recipe details
            const recipeDetails = await this.getRecipeDetails(bestMatch.id);
            
            // Validate recipe is truly vegan
            if (!this.validateVeganRecipe(recipeDetails)) {
              console.warn(`Recipe ${bestMatch.id} marked as vegan but contains non-vegan ingredients`);
              continue;
            }
            
            // Enrich meal with recipe details
            meal.recipeDetails = {
              id: recipeDetails.id,
              title: recipeDetails.title,
              image: recipeDetails.image,
              sourceUrl: recipeDetails.sourceUrl,
              servings: recipeDetails.servings,
              readyInMinutes: recipeDetails.readyInMinutes,
              instructions: this.parseInstructions(recipeDetails),
              ingredients: this.parseIngredients(recipeDetails),
              nutrition: this.parseNutrition(recipeDetails)
            };
            
            // Update meal nutrition with more accurate data from recipe
            if (recipeDetails.nutrition) {
              meal.nutrition = this.parseNutrition(recipeDetails);
            }
            
            // Update meal cooking time
            meal.cookingTime = recipeDetails.readyInMinutes;
            
            // Calculate and update quality scores
            if (recipeDetails.nutrition) {
              meal.qualityScore = await this.calculateQualityScores(recipeDetails);
            }
          }
        }
      }
      
      // Recalculate menu summary metrics with the enriched data
      enrichedMenu.summary = this.recalculateMenuSummary(enrichedMenu, userProfile);
      
      return enrichedMenu;
    } catch (error) {
      console.error('Failed to enrich menu with recipes:', error);
      return menu; // Return original menu on error
    }
  }
  
  /**
   * Searches for recipes matching the given parameters
   */
  private async searchRecipes(params: Record<string, any>): Promise<any[]> {
    try {
      // Create cache key from params
      const cacheKey = JSON.stringify(params);
      
      // Check cache first
      if (this.recipeCache.has(cacheKey)) {
        return this.recipeCache.get(cacheKey);
      }
      
      // Add API key to parameters
      params.apiKey = this.apiKey;
      
      // Always filter for vegan recipes
      params.diet = 'vegan';
      
      // Ensure we get nutritional information
      params.addRecipeNutrition = true;
      
      // Make API request
      const response = await axios.get(`${this.apiBaseUrl}/recipes/complexSearch`, { params });
      
      // Cache results for future use
      this.recipeCache.set(cacheKey, response.data.results);
      
      return response.data.results;
    } catch (error) {
      console.error('Failed to search recipes:', error);
      return [];
    }
  }
  
  /**
   * Gets detailed recipe information by ID
   */
  private async getRecipeDetails(recipeId: number): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `recipe_${recipeId}`;
      
      // Check cache first
      if (this.recipeCache.has(cacheKey)) {
        return this.recipeCache.get(cacheKey);
      }
      
      // Make API request
      const response = await axios.get(
        `${this.apiBaseUrl}/recipes/${recipeId}/information`, 
        { 
          params: { 
            apiKey: this.apiKey,
            includeNutrition: true
          } 
        }
      );
      
      // Cache result
      this.recipeCache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Failed to get recipe details for ID ${recipeId}:`, error);
      return null;
    }
  }
  
  /**
   * Generates API search parameters based on meal nutritional targets
   */
  private generateSearchParameters(
    meal: any, 
    mealType: string, 
    userProfile: NutritionProfile, 
    preferences: UserPreferences
  ): Record<string, any> {
    const params: Record<string, any> = {
      // Always search for vegan recipes
      diet: 'vegan',
      
      // Number of results to return
      number: 10,
      
      // Add detailed nutrition information
      addRecipeNutrition: true,
      
      // Ensure recipes have instructions
      instructionsRequired: true,
      
      // Sort by healthiness as default
      sort: 'healthiness',
      
      // Include recipe information
      addRecipeInformation: true
    };
    
    // Adjust by meal type
    switch (mealType) {
      case 'breakfast':
        params.type = 'breakfast';
        break;
      case 'lunch':
        params.type = 'main course';
        break;
      case 'dinner':
        params.type = 'main course';
        break;
      case 'morningSnack':
      case 'afternoonSnack':
        params.type = 'snack';
        break;
    }
    
    // Add nutritional parameters if meal has nutrition targets
    if (meal.nutrition) {
      // Allow some flexibility in nutrition targets (±20%)
      if (meal.nutrition.calories) {
        params.minCalories = Math.floor(meal.nutrition.calories * 0.8);
        params.maxCalories = Math.ceil(meal.nutrition.calories * 1.2);
      }
      
      if (meal.nutrition.protein) {
        params.minProtein = Math.floor(meal.nutrition.protein * 0.8);
        params.maxProtein = Math.ceil(meal.nutrition.protein * 1.2);
      }
      
      if (meal.nutrition.carbs) {
        params.minCarbs = Math.floor(meal.nutrition.carbs * 0.8);
        params.maxCarbs = Math.ceil(meal.nutrition.carbs * 1.2);
      }
      
      if (meal.nutrition.fat) {
        params.minFat = Math.floor(meal.nutrition.fat * 0.8);
        params.maxFat = Math.ceil(meal.nutrition.fat * 1.2);
      }
      
      // Add micronutrient targets if available
      if (meal.nutrition.iron) {
        params.minIron = Math.floor(meal.nutrition.iron * 0.8);
      }
      
      if (meal.nutrition.calcium) {
        params.minCalcium = Math.floor(meal.nutrition.calcium * 0.8);
      }
      
      if (meal.nutrition.vitaminC) {
        params.minVitaminC = Math.floor(meal.nutrition.vitaminC * 0.8);
      }
      
      if (meal.nutrition.fiber) {
        params.minFiber = Math.floor(meal.nutrition.fiber * 0.8);
      }
    }
    
    // Add cooking time constraints
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
    
    // Add ingredient preferences
    if (preferences.favoriteIngredients && preferences.favoriteIngredients.length > 0) {
      // Include up to 3 favorite ingredients randomly
      const favoritesToInclude = preferences.favoriteIngredients
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      params.includeIngredients = favoritesToInclude.join(',');
    }
    
    // Exclude disliked ingredients
    if (preferences.dislikedIngredients && preferences.dislikedIngredients.length > 0) {
      params.excludeIngredients = preferences.dislikedIngredients.join(',');
    }
    
    // Add intolerances and allergies
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
    
    return params;
  }
  
  /**
   * Selects the best recipe match based on nutritional targets
   */
  private selectBestRecipeMatch(recipes: any[], meal: any, userProfile: NutritionProfile): any {
    if (recipes.length === 0) return null;
    if (recipes.length === 1) return recipes[0];
    
    // Score each recipe based on how well it matches the nutritional targets
    const scoredRecipes = recipes.map(recipe => {
      let score = 0;
      
      // Score based on nutritional match
      if (meal.nutrition && recipe.nutrition) {
        // Compare key nutrients
        const nutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber'];
        
        for (const nutrient of nutrients) {
          if (meal.nutrition[nutrient] && recipe.nutrition[nutrient]) {
            // Calculate how close the recipe is to the target (0-1 score)
            const target = meal.nutrition[nutrient];
            const actual = recipe.nutrition[nutrient];
            const ratio = Math.min(actual, target) / Math.max(actual, target);
            score += ratio;
          }
        }
      }
      
      // Score based on cooking time match
      if (meal.cookingTime && recipe.readyInMinutes) {
        const timeRatio = Math.min(meal.cookingTime, recipe.readyInMinutes) / 
                          Math.max(meal.cookingTime, recipe.readyInMinutes);
        score += timeRatio;
      }
      
      // Score based on ingredient match
      if (meal.ingredients && recipe.extendedIngredients) {
        const mealIngredientNames = meal.ingredients.map((ing: any) => ing.name.toLowerCase());
        const recipeIngredientNames = recipe.extendedIngredients.map((ing: any) => ing.name.toLowerCase());
        
        // Count matching ingredients
        let matches = 0;
        for (const name of mealIngredientNames) {
          if (recipeIngredientNames.some(ing => ing.includes(name))) {
            matches++;
          }
        }
        
        const matchRatio = matches / mealIngredientNames.length;
        score += matchRatio * 2; // Weight ingredient matches higher
      }
      
      return { recipe, score };
    });
    
    // Sort by score descending
    scoredRecipes.sort((a, b) => b.score - a.score);
    
    // Return the best match
    return scoredRecipes[0].recipe;
  }
  
  /**
   * Validates that a recipe is truly vegan by analyzing ingredients
   */
  private validateVeganRecipe(recipe: any): boolean {
    if (!recipe || !recipe.extendedIngredients) return false;
    
    // List of non-vegan ingredients and keywords to check
    const nonVeganKeywords = [
      'meat', 'beef', 'chicken', 'pork', 'lamb', 'fish', 'seafood', 'salmon',
      'tuna', 'milk', 'cream', 'cheese', 'butter', 'yogurt', 'egg', 'honey',
      'gelatin', 'lard', 'whey', 'casein', 'lactose', 'ghee'
    ];
    
    // Check each ingredient for non-vegan keywords
    for (const ingredient of recipe.extendedIngredients) {
      const name = ingredient.name.toLowerCase();
      
      // Skip if it's explicitly a vegan alternative
      if (name.includes('vegan') || 
          name.includes('plant-based') || 
          name.includes('dairy-free') ||
          name.includes('non-dairy')) {
        continue;
      }
      
      // Check for non-vegan keywords
      for (const keyword of nonVeganKeywords) {
        if (name.includes(keyword)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Parses recipe instructions into a structured format
   */
  private parseInstructions(recipe: any): any[] {
    if (!recipe.analyzedInstructions || recipe.analyzedInstructions.length === 0) {
      return recipe.instructions ? [{ step: recipe.instructions }] : [];
    }
    
    const instructions: any[] = [];
    
    for (const instructionSet of recipe.analyzedInstructions) {
      for (const step of instructionSet.steps) {
        instructions.push({
          number: step.number,
          step: step.step,
          ingredients: step.ingredients?.map((ing: any) => ing.name) || []
        });
      }
    }
    
    return instructions;
  }
  
  /**
   * Parses recipe ingredients into a structured format
   */
  private parseIngredients(recipe: any): any[] {
    if (!recipe.extendedIngredients) return [];
    
    return recipe.extendedIngredients.map((ingredient: any) => ({
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
      originalString: ingredient.original,
      image: ingredient.image,
      categories: this.categorizeIngredient(ingredient)
    }));
  }
  
  /**
   * Assigns categories to an ingredient
   */
  private categorizeIngredient(ingredient: any): string[] {
    const categories: string[] = [];
    const name = ingredient.name.toLowerCase();
    
    // Basic categories
    if (name.includes('tofu') || name.includes('tempeh') || name.includes('seitan') || 
        name.includes('lentil') || name.includes('bean') || name.includes('chickpea')) {
      categories.push('protein');
    }
    
    if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || 
        name.includes('quinoa') || name.includes('oat')) {
      categories.push('grains');
    }
    
    if (name.includes('spinach') || name.includes('kale') || name.includes('lettuce') || 
        name.includes('arugula') || name.includes('chard')) {
      categories.push('leafy-greens');
    }
    
    if (name.includes('carrot') || name.includes('beet') || name.includes('potato') || 
        name.includes('squash') || name.includes('onion') || name.includes('garlic') ||
        name.includes('pepper') || name.includes('tomato')) {
      categories.push('vegetables');
    }
    
    if (name.includes('apple') || name.includes('banana') || name.includes('berry') || 
        name.includes('orange') || name.includes('grape') || name.includes('melon')) {
      categories.push('fruits');
    }
    
    if (name.includes('almond') || name.includes('cashew') || name.includes('walnut') || 
        name.includes('pecan') || name.includes('peanut')) {
      categories.push('nuts');
    }
    
    if (name.includes('oil') || name.includes('butter') || name.includes('margarine') || 
        name.includes('coconut')) {
      categories.push('fats');
    }
    
    // Add more categories as needed
    
    return categories;
  }
  
  /**
   * Parses recipe nutrition data into a structured format
   */
  private parseNutrition(recipe: any): Record<string, number> {
    if (!recipe.nutrition || !recipe.nutrition.nutrients) {
      return {};
    }
    
    const nutrition: Record<string, number> = {};
    
    // Map Spoonacular nutrient names to our internal names
    const nutrientMap: Record<string, string> = {
      'Calories': 'calories',
      'Protein': 'protein',
      'Fat': 'fat',
      'Carbohydrates': 'carbs',
      'Fiber': 'fiber',
      'Sugar': 'sugar',
      'Calcium': 'calcium',
      'Iron': 'iron',
      'Vitamin C': 'vitaminC',
      'Vitamin D': 'vitaminD',
      'Vitamin B12': 'vitaminB12',
      'Folate': 'folate',
      'Potassium': 'potassium',
      'Sodium': 'sodium',
      'Magnesium': 'magnesium',
      'Zinc': 'zinc',
      'Omega 3 Fatty Acids': 'omega3'
    };
    
    for (const nutrient of recipe.nutrition.nutrients) {
      const internalName = nutrientMap[nutrient.name] || nutrient.name.toLowerCase().replace(/\s+/g, '');
      nutrition[internalName] = nutrient.amount;
    }
    
    return nutrition;
  }
  
  /**
   * Calculates quality scores for a recipe
   */
  private async calculateQualityScores(recipe: any): Promise<any> {
    try {
      // Placeholder for actual quality scoring logic
      // In a real implementation, this would call the QualityScorer service
      
      // Basic quality scores based on nutrition
      const nutriScoreComponents = {
        positiveScore: 0,
        negativeScore: 0
      };
      
      if (recipe.nutrition && recipe.nutrition.nutrients) {
        // Positive components
        const fiberNutrient = recipe.nutrition.nutrients.find((n: any) => n.name === 'Fiber');
        const proteinNutrient = recipe.nutrition.nutrients.find((n: any) => n.name === 'Protein');
        const vitaminsScore = this.calculateVitaminsMineralsScore(recipe.nutrition.nutrients);
        
        if (fiberNutrient) nutriScoreComponents.positiveScore += fiberNutrient.amount / 2.5;
        if (proteinNutrient) nutriScoreComponents.positiveScore += proteinNutrient.amount / 5;
        nutriScoreComponents.positiveScore += vitaminsScore;
        
        // Negative components
        const sodiumNutrient = recipe.nutrition.nutrients.find((n: any) => n.name === 'Sodium');
        const sugarNutrient = recipe.nutrition.nutrients.find((n: any) => n.name === 'Sugar');
        const saturatedFatNutrient = recipe.nutrition.nutrients.find((n: any) => n.name === 'Saturated Fat');
        
        if (sodiumNutrient) nutriScoreComponents.negativeScore += sodiumNutrient.amount / 900;
        if (sugarNutrient) nutriScoreComponents.negativeScore += sugarNutrient.amount / 4.5;
        if (saturatedFatNutrient) nutriScoreComponents.negativeScore += saturatedFatNutrient.amount / 1;
      }
      
      // Calculate final Nutri-Score (A-E)
      let nutriScore = nutriScoreComponents.positiveScore - nutriScoreComponents.negativeScore;
      let nutriScoreLetter = 'C';
      
      if (nutriScore >= 10) nutriScoreLetter = 'A';
      else if (nutriScore >= 5) nutriScoreLetter = 'B';
      else if (nutriScore >= 0) nutriScoreLetter = 'C';
      else if (nutriScore >= -5) nutriScoreLetter = 'D';
      else nutriScoreLetter = 'E';
      
      // Eco-Score estimation (simplified)
      // In a real implementation, this would use actual food carbon footprint data
      const ecoScore = this.estimateEcoScore(recipe);
      
      // NOVA classification (food processing level)
      // In a real implementation, this would analyze ingredients more thoroughly
      const novaGroup = this.estimateNovaGroup(recipe);
      
      // Overall quality score (0-100)
      const overallScore = Math.round(
        (nutriScore + 15) * 4 + // Convert nutriScore to 0-100 scale
        (ecoScore.score * 30) + // 30% weight for eco-score
        ((5 - novaGroup) * 7.5) // 30% weight for NOVA (less processing is better)
      );
      
      return {
        nutriScore: nutriScoreLetter,
        ecoScore: ecoScore.letter,
        novaGroup,
        overallScore: Math.min(100, Math.max(0, overallScore))
      };
    } catch (error) {
      console.error('Failed to calculate quality scores:', error);
      return {
        nutriScore: 'C',
        ecoScore: 'C',
        novaGroup: 3,
        overallScore: 50
      };
    }
  }
  
  /**
   * Calculates a score based on vitamins and minerals content
   */
  private calculateVitaminsMineralsScore(nutrients: any[]): number {
    // List of important vitamins and minerals
    const vitaminsAndMinerals = [
      'Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K',
      'Vitamin B1', 'Vitamin B2', 'Vitamin B3', 'Vitamin B5', 'Vitamin B6', 'Vitamin B12',
      'Folate', 'Iron', 'Calcium', 'Magnesium', 'Zinc', 'Potassium'
    ];
    
    let score = 0;
    
    for (const nutrient of nutrients) {
      if (vitaminsAndMinerals.includes(nutrient.name)) {
        // Add score based on % of daily needs
        score += nutrient.percentOfDailyNeeds / 100;
      }
    }
    
    // Cap at 5 points
    return Math.min(5, score);
  }
  
  /**
   * Estimates Eco-Score based on recipe ingredients
   */
  private estimateEcoScore(recipe: any): { letter: string; score: number } {
    // This is a simplified estimation - a real implementation would use
    // actual carbon footprint data for each ingredient
    
    if (!recipe.extendedIngredients) {
      return { letter: 'C', score: 0.5 };
    }
    
    let score = 0.5; // Start at middle (C)
    
    // Factors that improve eco-score
    const positiveFactors = [
      'organic', 'local', 'seasonal', 'legume', 'lentil', 'bean',
      'vegetable', 'fruit', 'grain', 'sustainable'
    ];
    
    // Factors that reduce eco-score
    const negativeFactors = [
      'imported', 'processed', 'packaged', 'palm oil', 'coconut',
      'avocado', 'almond', 'chocolate', 'ultra-processed'
    ];
    
    // Count ingredient types
    let positiveCount = 0;
    let negativeCount = 0;
    let totalIngredients = recipe.extendedIngredients.length;
    
    for (const ingredient of recipe.extendedIngredients) {
      const name = ingredient.name.toLowerCase();
      
      // Check for positive factors
      for (const factor of positiveFactors) {
        if (name.includes(factor)) {
          positiveCount++;
          break;
        }
      }
      
      // Check for negative factors
      for (const factor of negativeFactors) {
        if (name.includes(factor)) {
          negativeCount++;
          break;
        }
      }
    }
    
    // Calculate score adjustment
    const positiveRatio = positiveCount / totalIngredients;
    const negativeRatio = negativeCount / totalIngredients;
    
    score += positiveRatio * 0.4; // Up to +0.4 for positive ingredients
    score -= negativeRatio * 0.3; // Up to -0.3 for negative ingredients
    
    // Ensure score is between 0-1
    score = Math.max(0, Math.min(1, score));
    
    // Convert to letter grade
    let letter = 'C';
    if (score >= 0.8) letter = 'A';
    else if (score >= 0.6) letter = 'B';
    else if (score >= 0.4) letter = 'C';
    else if (score >= 0.2) letter = 'D';
    else letter = 'E';
    
    return { letter, score };
  }
  
  /**
   * Estimates NOVA group classification (food processing level)
   * 1 = Unprocessed/minimally processed
   * 2 = Processed culinary ingredients
   * 3 = Processed foods
   * 4 = Ultra-processed foods
   */
  private estimateNovaGroup(recipe: any): number {
    if (!recipe.extendedIngredients) {
      return 3; // Default to processed foods
    }
    
    // Count ingredients by processing level
    let unprocessedCount = 0;
    let culinaryIngredientsCount = 0;
    let processedCount = 0;
    let ultraProcessedCount = 0;
    
    // Keywords for each NOVA group
    const nova1Keywords = [
      'fresh', 'raw', 'whole', 'natural', 'dried', 'frozen', 'chilled',
      'vegetable', 'fruit', 'grain', 'bean', 'lentil', 'nut', 'seed'
    ];
    
    const nova2Keywords = [
      'oil', 'butter', 'salt', 'sugar', 'honey', 'vinegar', 'starch', 'flour'
    ];
    
    const nova3Keywords = [
      'canned', 'preserved', 'fermented', 'tofu', 'tempeh', 'bread', 'cheese'
    ];
    
    const nova4Keywords = [
      'margarine', 'sweetener', 'flavoring', 'coloring', 'emulsifier', 'texturizer',
      'hydrogenated', 'modified', 'artificial', 'isolate', 'concentrate', 'extract',
      'ready-to-eat', 'instant', 'powder', 'nugget', 'chip'
    ];
    
    for (const ingredient of recipe.extendedIngredients) {
      const name = ingredient.name.toLowerCase();
      
      // Check which NOVA group this ingredient belongs to
      let matched = false;
      
      // Check NOVA 4 first (ultra-processed)
      for (const keyword of nova4Keywords) {
        if (name.includes(keyword)) {
          ultraProcessedCount++;
          matched = true;
          break;
        }
      }
      
      if (matched) continue;
      
      // Check NOVA 3 (processed)
      for (const keyword of nova3Keywords) {
        if (name.includes(keyword)) {
          processedCount++;
          matched = true;
          break;
        }
      }
      
      if (matched) continue;
      
      // Check NOVA 2 (culinary ingredients)
      for (const keyword of nova2Keywords) {
        if (name.includes(keyword)) {
          culinaryIngredientsCount++;
          matched = true;
          break;
        }
      }
      
      if (matched) continue;
      
      // If no match found, check NOVA 1 (unprocessed)
      for (const keyword of nova1Keywords) {
        if (name.includes(keyword)) {
          unprocessedCount++;
          matched = true;
          break;
        }
      }
      
      // If still no match, default to processed
      if (!matched) {
        processedCount++;
      }
    }
    
    // Determine NOVA group based on ingredient composition
    const totalIngredients = recipe.extendedIngredients.length;
    
    if (ultraProcessedCount >= totalIngredients * 0.2) {
      return 4; // Ultra-processed
    } else if (processedCount >= totalIngredients * 0.3) {
      return 3; // Processed
    } else if (unprocessedCount >= totalIngredients * 0.6) {
      return 1; // Unprocessed/minimally processed
    } else {
      return 2; // Processed culinary ingredients
    }
  }
  
  /**
   * Recalculates menu summary metrics after enriching with recipes
   */
  private recalculateMenuSummary(menu: Menu, userProfile: NutritionProfile): any {
    const summary: any = {
      totalCost: 0,
      nutritionScore: 0,
      carbonFootprint: 0,
      averageQualityScore: 0,
      dailyAverages: {}
    };
    
    // Track all nutrients across days
    const dailyNutrients: Record<string, number>[] = [];
    let mealCount = 0;
    let qualityScoreTotal = 0;
    
    // Initialize for each day
    for (let i = 0; i < menu.days.length; i++) {
      dailyNutrients.push({});
    }
    
    // Calculate nutrition and quality for each day
    for (let dayIndex = 0; dayIndex < menu.days.length; dayIndex++) {
      const day = menu.days[dayIndex];
      
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal) continue;
        
        mealCount++;
        
        // Add costs
        summary.totalCost += meal.cost || 0;
        
        // Add carbon footprint
        summary.carbonFootprint += meal.carbonFootprint || 0;
        
        // Add quality score
        if (meal.qualityScore) {
          qualityScoreTotal += meal.qualityScore.overallScore || 0;
        }
        
        // Sum up nutrients
        if (meal.nutrition) {
          for (const [nutrient, amount] of Object.entries(meal.nutrition)) {
            if (typeof amount === 'number') {
              dailyNutrients[dayIndex][nutrient] = (dailyNutrients[dayIndex][nutrient] || 0) + amount;
            }
          }
        }
      }
    }
    
    // Calculate daily averages for each nutrient
    const allNutrients = new Set<string>();
    for (const day of dailyNutrients) {
      for (const nutrient of Object.keys(day)) {
        allNutrients.add(nutrient);
      }
    }
    
    for (const nutrient of allNutrients) {
      let total = 0;
      for (const day of dailyNutrients) {
        total += day[nutrient] || 0;
      }
      summary.dailyAverages[nutrient] = total / menu.days.length;
    }
    
    // Calculate average quality score
    summary.averageQualityScore = mealCount > 0 ? qualityScoreTotal / mealCount : 0;
    
    // Calculate overall nutrition score based on how well it meets user needs
    summary.nutritionScore = this.calculateNutritionScore(summary.dailyAverages, userProfile);
    
    return summary;
  }
  
  /**
   * Calculates overall nutrition score based on how well the menu meets user needs
   */
  private calculateNutritionScore(dailyAverages: Record<string, number>, userProfile: NutritionProfile): number {
    // This is a simplified calculation - a real implementation would be more complex
    
    // Define target ranges for key nutrients
    const targets: Record<string, { min: number; optimal: number; max: number }> = {
      calories: {
        min: userProfile.bmr * 0.85,
        optimal: userProfile.bmr * 1.0,
        max: userProfile.bmr * 1.15
      },
      protein: {
        min: userProfile.weight * 0.8,
        optimal: userProfile.weight * 1.2,
        max: userProfile.weight * 2.0
      },
      carbs: {
        min: (userProfile.bmr * 0.45) / 4, // 45% of calories from carbs (min)
        optimal: (userProfile.bmr * 0.55) / 4, // 55% of calories from carbs (optimal)
        max: (userProfile.bmr * 0.65) / 4 // 65% of calories from carbs (max)
      },
      fat: {
        min: (userProfile.bmr * 0.2) / 9, // 20% of calories from fat (min)
        optimal: (userProfile.bmr * 0.3) / 9, // 30% of calories from fat (optimal)
        max: (userProfile.bmr * 0.35) / 9 // 35% of calories from fat (max)
      },
      fiber: {
        min: 25,
        optimal: 35,
        max: 50
      },
      // Add more nutrients as needed
    };
    
    // Calculate score for each nutrient
    let totalScore = 0;
    let nutrientCount = 0;
    
    for (const [nutrient, target] of Object.entries(targets)) {
      const actual = dailyAverages[nutrient] || 0;
      
      // Calculate score for this nutrient (0-1 scale)
      let nutrientScore: number;
      
      if (actual < target.min) {
        // Below minimum - score drops linearly
        nutrientScore = actual / target.min;
      } else if (actual > target.max) {
        // Above maximum - score drops linearly
        const excess = actual - target.max;
        const range = target.max - target.optimal;
        nutrientScore = Math.max(0, 1 - (excess / range));
      } else if (actual < target.optimal) {
        // Between min and optimal - good score
        const ratio = (actual - target.min) / (target.optimal - target.min);
        nutrientScore = 0.7 + (0.3 * ratio);
      } else {
        // Between optimal and max - excellent score
        const ratio = (actual - target.optimal) / (target.max - target.optimal);
        nutrientScore = 1 - (0.2 * ratio);
      }
      
      totalScore += nutrientScore;
      nutrientCount++;
    }
    
    // Calculate average score and convert to 0-100 scale
    const averageScore = nutrientCount > 0 ? totalScore / nutrientCount : 0;
    return Math.round(averageScore * 100);
  }
}