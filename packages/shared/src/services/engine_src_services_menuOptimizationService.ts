import { FoodItem, MenuDay, NutritionProfile, UserPreferences, Menu } from '../types';
import { calculateNutritionalScore } from './nutritionAnalysisService';
import { getQualityScore } from './qualityScorerService';
import { findCompatibleSwaps } from './swapRecommenderService';
import * as math from 'mathjs';

/**
 * Enhanced Multi-Objective Optimization Algorithm for Vegan Menu Generation
 * Using a hybrid approach: genetic algorithm + simulated annealing + constraint satisfaction
 */
export class MenuOptimizationService {
  private foodDatabase: FoodItem[] = [];
  private nutrientTargets: Record<string, { min: number; optimal: number; max: number }> = {};
  private readonly POPULATION_SIZE = 100;
  private readonly MAX_GENERATIONS = 200;
  private readonly MUTATION_RATE = 0.15;
  private readonly CROSSOVER_RATE = 0.8;
  private readonly ELITISM_COUNT = 5;
  
  constructor(
    foodDatabase: FoodItem[],
    nutrientTargets: Record<string, { min: number; optimal: number; max: number }>,
  ) {
    this.foodDatabase = foodDatabase;
    this.nutrientTargets = nutrientTargets;
  }
  
  /**
   * Generates an optimized vegan menu based on user preferences and nutritional needs
   */
  public generateOptimizedMenu(
    userProfile: NutritionProfile,
    preferences: UserPreferences,
    daysCount: number
  ): Menu {
    // Initialize population with diverse meal combinations
    let population = this.initializePopulation(daysCount, preferences);
    
    // Track best solution across generations
    let bestSolution = this.evaluatePopulation(population, userProfile, preferences)[0];
    let bestFitness = this.calculateFitness(bestSolution, userProfile, preferences);
    
    // Main genetic algorithm loop
    for (let generation = 0; generation < this.MAX_GENERATIONS; generation++) {
      // Evaluate current population
      const evaluatedPopulation = this.evaluatePopulation(population, userProfile, preferences);
      
      // Check if we have a new best solution
      const currentBest = evaluatedPopulation[0];
      const currentBestFitness = this.calculateFitness(currentBest, userProfile, preferences);
      
      if (currentBestFitness > bestFitness) {
        bestSolution = currentBest;
        bestFitness = currentBestFitness;
      }
      
      // Apply elitism - keep the best solutions
      const newPopulation = evaluatedPopulation.slice(0, this.ELITISM_COUNT);
      
      // Fill the rest of the new population
      while (newPopulation.length < this.POPULATION_SIZE) {
        // Selection
        const parent1 = this.tournamentSelection(evaluatedPopulation);
        const parent2 = this.tournamentSelection(evaluatedPopulation);
        
        // Crossover
        let child: Menu;
        if (Math.random() < this.CROSSOVER_RATE) {
          child = this.crossover(parent1, parent2);
        } else {
          // No crossover, just clone one parent
          child = JSON.parse(JSON.stringify(parent1));
        }
        
        // Mutation
        if (Math.random() < this.MUTATION_RATE) {
          this.mutate(child, preferences);
        }
        
        // Add to new population
        newPopulation.push(child);
      }
      
      // Apply simulated annealing to break out of local optima
      if (generation % 10 === 0) {
        this.applySimulatedAnnealing(newPopulation, userProfile, preferences, generation);
      }
      
      // Set the new population
      population = newPopulation;
      
      // Apply constraint satisfaction to ensure all menus meet minimum requirements
      this.enforceConstraints(population, userProfile, preferences);
    }
    
    // Post-process the best solution to enhance it further
    const enhancedMenu = this.postProcessMenu(bestSolution, userProfile, preferences);
    
    // Calculate the final nutritional and quality metrics
    const finalMetrics = this.calculateMenuMetrics(enhancedMenu, userProfile);
    
    // Return the optimized menu with all metrics
    return {
      ...enhancedMenu,
      summary: {
        ...enhancedMenu.summary,
        ...finalMetrics,
        dataSource: "CIQUAL + OpenFoodFacts"
      }
    };
  }
  
  /**
   * Initialize a diverse population of potential menu solutions
   */
  private initializePopulation(daysCount: number, preferences: UserPreferences): Menu[] {
    const population: Menu[] = [];
    
    for (let i = 0; i < this.POPULATION_SIZE; i++) {
      const menu: Menu = {
        id: `menu_${i}`,
        days: [],
        userId: 'temp_user',
        createdAt: new Date(),
        updatedAt: new Date(),
        summary: {
          totalCost: 0,
          nutritionScore: 0,
          carbonFootprint: 0,
          averageQualityScore: 0
        }
      };
      
      // Generate days
      for (let day = 1; day <= daysCount; day++) {
        const menuDay: MenuDay = {
          day,
          date: this.getDateForDay(day),
          meals: {
            breakfast: this.generateRandomMeal("breakfast", preferences),
            lunch: this.generateRandomMeal("lunch", preferences),
            dinner: this.generateRandomMeal("dinner", preferences)
          }
        };
        
        // Add snacks based on preferences
        if (preferences.includeSnacks) {
          menuDay.meals.morningSnack = this.generateRandomMeal("snack", preferences);
          menuDay.meals.afternoonSnack = this.generateRandomMeal("snack", preferences);
        }
        
        menu.days.push(menuDay);
      }
      
      population.push(menu);
    }
    
    return population;
  }
  
  /**
   * Tournament selection for parent selection
   */
  private tournamentSelection(population: Menu[]): Menu {
    const tournamentSize = 3;
    let bestFitness = -Infinity;
    let bestIndividual: Menu | null = null;
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      const individual = population[randomIndex];
      // We already have sorted population, so earlier indices are better
      if (randomIndex < bestFitness || bestIndividual === null) {
        bestFitness = randomIndex;
        bestIndividual = individual;
      }
    }
    
    return bestIndividual!;
  }
  
  /**
   * Crossover two parent menus to create a child menu
   */
  private crossover(parent1: Menu, parent2: Menu): Menu {
    const child: Menu = {
      id: `menu_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      days: [],
      userId: parent1.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      summary: { ...parent1.summary }
    };
    
    // For each day, randomly select meals from either parent
    for (let i = 0; i < parent1.days.length; i++) {
      const day1 = parent1.days[i];
      const day2 = parent2.days[i];
      
      const childDay: MenuDay = {
        day: day1.day,
        date: day1.date,
        meals: {}
      };
      
      // For each meal type, randomly select from either parent
      const mealTypes = Object.keys(day1.meals) as Array<keyof typeof day1.meals>;
      
      for (const mealType of mealTypes) {
        // 50% chance to take from each parent
        childDay.meals[mealType] = Math.random() < 0.5 
          ? { ...day1.meals[mealType] } 
          : { ...day2.meals[mealType] };
      }
      
      child.days.push(childDay);
    }
    
    return child;
  }
  
  /**
   * Mutate a menu by randomly replacing some meals
   */
  private mutate(menu: Menu, preferences: UserPreferences): void {
    const daysToMutate = Math.ceil(menu.days.length * 0.3); // Mutate ~30% of days
    
    for (let i = 0; i < daysToMutate; i++) {
      const randomDayIndex = Math.floor(Math.random() * menu.days.length);
      const day = menu.days[randomDayIndex];
      
      // Randomly select a meal to replace
      const mealTypes = Object.keys(day.meals) as Array<keyof typeof day.meals>;
      const randomMealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
      
      // Replace with a new random meal
      day.meals[randomMealType] = this.generateRandomMeal(randomMealType as string, preferences);
    }
  }
  
  /**
   * Apply simulated annealing to escape local optima
   */
  private applySimulatedAnnealing(
    population: Menu[],
    userProfile: NutritionProfile, 
    preferences: UserPreferences,
    currentGeneration: number
  ): void {
    const temperature = 1.0 - (currentGeneration / this.MAX_GENERATIONS);
    
    for (let i = 0; i < population.length; i++) {
      const currentSolution = population[i];
      const currentFitness = this.calculateFitness(currentSolution, userProfile, preferences);
      
      // Create a modified copy
      const modifiedSolution = JSON.parse(JSON.stringify(currentSolution)) as Menu;
      
      // Apply a more radical mutation
      this.applyRadicalMutation(modifiedSolution, preferences);
      
      const modifiedFitness = this.calculateFitness(modifiedSolution, userProfile, preferences);
      
      // Calculate acceptance probability
      const acceptanceProbability = 
        modifiedFitness > currentFitness ? 1.0 : 
        Math.exp((modifiedFitness - currentFitness) / temperature);
      
      // Accept new solution based on probability
      if (Math.random() < acceptanceProbability) {
        population[i] = modifiedSolution;
      }
    }
  }
  
  /**
   * Apply a more radical mutation for simulated annealing
   */
  private applyRadicalMutation(menu: Menu, preferences: UserPreferences): void {
    // Replace ~50% of meals
    for (const day of menu.days) {
      const mealTypes = Object.keys(day.meals) as Array<keyof typeof day.meals>;
      
      for (const mealType of mealTypes) {
        if (Math.random() < 0.5) {
          day.meals[mealType] = this.generateRandomMeal(mealType as string, preferences);
        }
      }
    }
  }
  
  /**
   * Evaluate the entire population and sort by fitness
   */
  private evaluatePopulation(
    population: Menu[], 
    userProfile: NutritionProfile, 
    preferences: UserPreferences
  ): Menu[] {
    return [...population].sort((a, b) => {
      const fitnessA = this.calculateFitness(a, userProfile, preferences);
      const fitnessB = this.calculateFitness(b, userProfile, preferences);
      return fitnessB - fitnessA; // Sort descending
    });
  }
  
  /**
   * Calculate the fitness of a menu solution
   */
  private calculateFitness(
    menu: Menu, 
    userProfile: NutritionProfile, 
    preferences: UserPreferences
  ): number {
    // Weight factors for different aspects
    const weights = {
      nutrition: 0.4,
      variety: 0.2,
      quality: 0.15,
      cost: 0.15,
      userPreferences: 0.1
    };
    
    // Calculate nutritional score
    const nutritionScore = this.calculateNutritionalScore(menu, userProfile);
    
    // Calculate variety score
    const varietyScore = this.calculateVarietyScore(menu);
    
    // Calculate quality score (Nutri-Score, Eco-Score, etc.)
    const qualityScore = this.calculateQualityScore(menu);
    
    // Calculate cost score (inverse - lower cost is better)
    const costScore = this.calculateCostScore(menu, preferences);
    
    // Calculate user preferences score
    const preferencesScore = this.calculateUserPreferencesScore(menu, preferences);
    
    // Calculate weighted sum
    const weightedScore = 
      weights.nutrition * nutritionScore +
      weights.variety * varietyScore +
      weights.quality * qualityScore +
      weights.cost * costScore +
      weights.userPreferences * preferencesScore;
    
    return weightedScore;
  }
  
  /**
   * Calculate how well the menu meets the user's nutritional needs
   */
  private calculateNutritionalScore(menu: Menu, userProfile: NutritionProfile): number {
    // Track total nutrients across all days
    const totalNutrients: Record<string, number> = {};
    
    // Initialize tracked nutrients
    for (const nutrient of Object.keys(this.nutrientTargets)) {
      totalNutrients[nutrient] = 0;
    }
    
    // Calculate total nutrients from all meals
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal) continue;
        
        // Add meal nutrients to total
        for (const [nutrient, amount] of Object.entries(meal.nutrition || {})) {
          if (typeof amount === 'number') {
            totalNutrients[nutrient] = (totalNutrients[nutrient] || 0) + amount;
          }
        }
      }
    }
    
    // Calculate average daily nutrients
    const daysCount = menu.days.length;
    const dailyAverage: Record<string, number> = {};
    
    for (const [nutrient, total] of Object.entries(totalNutrients)) {
      dailyAverage[nutrient] = total / daysCount;
    }
    
    // Calculate how well daily average meets targets
    let totalScore = 0;
    let nutrientCount = 0;
    
    for (const [nutrient, target] of Object.entries(this.nutrientTargets)) {
      const actual = dailyAverage[nutrient] || 0;
      
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
    
    // Return average score across all nutrients
    return nutrientCount > 0 ? totalScore / nutrientCount : 0;
  }
  
  /**
   * Calculate how varied the menu is
   */
  private calculateVarietyScore(menu: Menu): number {
    // Track all ingredients used
    const ingredientCounts: Record<string, number> = {};
    let totalIngredients = 0;
    
    // Count ingredient occurrences
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.ingredients) continue;
        
        for (const ingredient of meal.ingredients) {
          ingredientCounts[ingredient.name] = (ingredientCounts[ingredient.name] || 0) + 1;
          totalIngredients++;
        }
      }
    }
    
    // Calculate variety metrics
    const uniqueIngredients = Object.keys(ingredientCounts).length;
    
    if (totalIngredients === 0) return 0;
    
    // Calculate Shannon entropy as a measure of variety
    let entropy = 0;
    for (const count of Object.values(ingredientCounts)) {
      const probability = count / totalIngredients;
      entropy -= probability * Math.log2(probability);
    }
    
    // Normalize entropy to 0-1 scale
    // Perfect variety would have equal distribution of all ingredients
    const maxEntropy = Math.log2(uniqueIngredients);
    const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;
    
    // Factor in the absolute number of unique ingredients
    // More unique ingredients is better, up to a point
    const uniquenessFactor = Math.min(1, uniqueIngredients / 50); // Cap at 50 unique ingredients
    
    // Combined score: 70% entropy (distribution), 30% uniqueness (absolute variety)
    return (0.7 * normalizedEntropy) + (0.3 * uniquenessFactor);
  }
  
  /**
   * Calculate the overall quality score of the menu
   */
  private calculateQualityScore(menu: Menu): number {
    let totalQualityScore = 0;
    let mealCount = 0;
    
    // Calculate average quality score across all meals
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.qualityScore) continue;
        
        totalQualityScore += meal.qualityScore.overallScore || 0;
        mealCount++;
      }
    }
    
    return mealCount > 0 ? totalQualityScore / mealCount / 100 : 0; // Normalize to 0-1
  }
  
  /**
   * Calculate cost score - lower cost is better, but must meet minimum quality
   */
  private calculateCostScore(menu: Menu, preferences: UserPreferences): number {
    let totalCost = 0;
    
    // Calculate total cost of the menu
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.cost) continue;
        
        totalCost += meal.cost;
      }
    }
    
    // Average daily cost
    const daysCount = menu.days.length;
    const dailyCost = daysCount > 0 ? totalCost / daysCount : 0;
    
    // Score based on user's budget preference
    let budgetTarget: number;
    switch (preferences.budget) {
      case 'low':
        budgetTarget = 15; // €15/day for low budget
        break;
      case 'medium':
        budgetTarget = 25; // €25/day for medium budget
        break;
      case 'high':
        budgetTarget = 40; // €40/day for high budget
        break;
      default:
        budgetTarget = 25;
    }
    
    // Calculate score - higher when closer to or below budget
    if (dailyCost <= budgetTarget) {
      // Below budget is good, but extremely low might mean poor quality
      return 0.7 + (0.3 * (dailyCost / budgetTarget));
    } else {
      // Above budget is worse the higher it goes
      const excess = dailyCost - budgetTarget;
      return Math.max(0, 1 - (excess / budgetTarget));
    }
  }
  
  /**
   * Calculate how well the menu matches user preferences
   */
  private calculateUserPreferencesScore(menu: Menu, preferences: UserPreferences): number {
    let score = 0;
    
    // Check cooking time preference
    const cookingTimeScore = this.calculateCookingTimeScore(menu, String(preferences.cookingTime || 'medium'));
    
    // Check dietary restrictions
    const restrictionsScore = this.calculateRestrictionsScore(menu, preferences.restrictions);
    
    // Check favorite ingredients inclusion
    const favoritesScore = this.calculateFavoritesScore(menu, preferences.favoriteIngredients || []);
    
    // Check disliked ingredients exclusion
    const dislikesScore = this.calculateDislikesScore(menu, preferences.dislikedIngredients || []);
    
    // Average all preference scores
    score = (cookingTimeScore + restrictionsScore + favoritesScore + dislikesScore) / 4;
    
    return score;
  }
  
  /**
   * Helper method for cooking time preference
   */
  private calculateCookingTimeScore(menu: Menu, cookingTimePreference: string): number {
    let totalComplianceScore = 0;
    let mealCount = 0;
    
    // Map preference to maximum minutes
    let maxPreferredTime: number;
    switch (cookingTimePreference) {
      case 'quick':
        maxPreferredTime = 20;
        break;
      case 'medium':
        maxPreferredTime = 40;
        break;
      case 'long':
        maxPreferredTime = 90;
        break;
      default:
        maxPreferredTime = 40;
    }
    
    // Check each meal's cooking time
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.cookingTime) continue;
        
        const mealTime = meal.cookingTime;
        
        // Calculate compliance score
        let complianceScore: number;
        if (mealTime <= maxPreferredTime) {
          complianceScore = 1.0; // Perfect score if within preferred time
        } else {
          // Score decreases as time exceeds preferred maximum
          const excess = mealTime - maxPreferredTime;
          complianceScore = Math.max(0, 1 - (excess / maxPreferredTime));
        }
        
        totalComplianceScore += complianceScore;
        mealCount++;
      }
    }
    
    return mealCount > 0 ? totalComplianceScore / mealCount : 0;
  }
  
  /**
   * Helper method for dietary restrictions
   */
  private calculateRestrictionsScore(menu: Menu, restrictions: number | string[]): number {
    // If no restrictions, perfect score
    if (!restrictions || (Array.isArray(restrictions) && restrictions.length === 0)) {
      return 1.0;
    }
    
    let violationCount = 0;
    let totalIngredients = 0;
    
    // Convert numeric restriction to string array if needed
    const restrictionsList = typeof restrictions === 'number' 
      ? this.getRestrictionsFromCode(restrictions)
      : restrictions;
    
    // Check each ingredient against restrictions
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.ingredients) continue;
        
        for (const ingredient of meal.ingredients) {
          totalIngredients++;
          
          // Check if ingredient violates any restriction
          if (ingredient.categories && restrictionsList.some(
            restriction => ingredient.categories?.includes(restriction)
          )) {
            violationCount++;
          }
        }
      }
    }
    
    // Perfect score only if zero violations
    return totalIngredients > 0 
      ? Math.max(0, 1 - (violationCount / totalIngredients))
      : 1.0;
  }
  
  /**
   * Helper method for favorite ingredients inclusion
   */
  private calculateFavoritesScore(menu: Menu, favoriteIngredients: string[]): number {
    // If no favorites specified, perfect score
    if (!favoriteIngredients || favoriteIngredients.length === 0) {
      return 1.0;
    }
    
    // Track favorites inclusion per day
    const favoritesIncludedPerDay: boolean[] = new Array(menu.days.length).fill(false);
    
    // Check each meal for favorites
    for (let dayIndex = 0; dayIndex < menu.days.length; dayIndex++) {
      const day = menu.days[dayIndex];
      
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.ingredients) continue;
        
        // Check if any favorite ingredient is included
        if (meal.ingredients.some(ing => 
          favoriteIngredients.includes(ing.name.toLowerCase())
        )) {
          favoritesIncludedPerDay[dayIndex] = true;
        }
      }
    }
    
    // Calculate inclusion rate across days
    const daysWithFavorites = favoritesIncludedPerDay.filter(Boolean).length;
    
    // Score based on inclusion - aim for ~50% of days to include favorites
    const inclusionRate = daysWithFavorites / menu.days.length;
    
    // Optimal score at 50% inclusion, tapering off in both directions
    return inclusionRate <= 0.5 
      ? inclusionRate * 2 // 0-0.5 → 0-1.0
      : 1 - ((inclusionRate - 0.5) * 0.5); // 0.5-1.0 → 1.0-0.75
  }
  
  /**
   * Helper method for disliked ingredients exclusion
   */
  private calculateDislikesScore(menu: Menu, dislikedIngredients: string[]): number {
    // If no dislikes specified, perfect score
    if (!dislikedIngredients || dislikedIngredients.length === 0) {
      return 1.0;
    }
    
    let violationCount = 0;
    let totalIngredients = 0;
    
    // Check each ingredient against dislikes
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.ingredients) continue;
        
        for (const ingredient of meal.ingredients) {
          totalIngredients++;
          
          // Check if ingredient is disliked
          if (dislikedIngredients.some(
            disliked => ingredient.name.toLowerCase().includes(disliked.toLowerCase())
          )) {
            violationCount++;
          }
        }
      }
    }
    
    // Perfect score only if zero violations
    return totalIngredients > 0 
      ? Math.max(0, 1 - (violationCount / totalIngredients) * 3) // Stronger penalty for dislikes
      : 1.0;
  }
  
  /**
   * Convert restriction code to string array
   */
  private getRestrictionsFromCode(code: number): string[] {
    const restrictions: string[] = [];
    
    // Bitwise check for each restriction
    if (code & 1) restrictions.push('gluten');
    if (code & 2) restrictions.push('soy');
    if (code & 4) restrictions.push('nuts');
    if (code & 8) restrictions.push('nightshades');
    // Add more as needed
    
    return restrictions;
  }
  
  /**
   * Enforce nutritional and preference constraints on the population
   */
  private enforceConstraints(
    population: Menu[], 
    userProfile: NutritionProfile, 
    preferences: UserPreferences
  ): void {
    for (const menu of population) {
      // Check protein constraint
      this.enforceProteinConstraint(menu, userProfile);
      
      // Check micronutrients
      this.enforceMicronutrientConstraints(menu, userProfile);
      
      // Enforce variety constraint
      this.enforceVarietyConstraint(menu);
      
      // Enforce dietary restrictions
      this.enforceRestrictionConstraints(menu, preferences);
    }
  }
  
  /**
   * Ensure menu meets minimum protein requirements
   */
  private enforceProteinConstraint(menu: Menu, userProfile: NutritionProfile): void {
    // Calculate current protein
    let totalProtein = 0;
    
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.nutrition) continue;
        
        totalProtein += meal.nutrition.protein || 0;
      }
    }
    
    const daysCount = menu.days.length;
    const avgDailyProtein = daysCount > 0 ? totalProtein / daysCount : 0;
    
    // Check if below minimum
    const minProteinTarget = userProfile.weight * 0.8; // 0.8g per kg of body weight minimum
    
    if (avgDailyProtein < minProteinTarget) {
      // Add protein-rich foods to random meals
      const deficit = minProteinTarget - avgDailyProtein;
      this.addProteinToMenu(menu, deficit * daysCount);
    }
  }
  
  /**
   * Ensure menu meets micronutrient requirements
   */
  private enforceMicronutrientConstraints(menu: Menu, userProfile: NutritionProfile): void {
    // Track critical nutrients (like iron, calcium, B12, etc.)
    const criticalNutrients = ['iron', 'calcium', 'vitaminB12', 'vitaminD', 'omega3'];
    const nutrientTotals: Record<string, number> = {};
    
    // Initialize
    for (const nutrient of criticalNutrients) {
      nutrientTotals[nutrient] = 0;
    }
    
    // Calculate current totals
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.nutrition) continue;
        
        for (const nutrient of criticalNutrients) {
          nutrientTotals[nutrient] += (meal.nutrition[nutrient] || 0);
        }
      }
    }
    
    const daysCount = menu.days.length;
    
    // Check each nutrient against minimum requirements
    for (const nutrient of criticalNutrients) {
      const dailyAvg = daysCount > 0 ? nutrientTotals[nutrient] / daysCount : 0;
      const minTarget = this.getNutrientMinimum(nutrient, userProfile);
      
      if (dailyAvg < minTarget) {
        // Add foods rich in this nutrient
        const deficit = minTarget - dailyAvg;
        this.addNutrientToMenu(menu, nutrient, deficit * daysCount);
      }
    }
  }
  
  /**
   * Get minimum target for a specific nutrient
   */
  private getNutrientMinimum(nutrient: string, userProfile: NutritionProfile): number {
    // These values should be based on RDAs or similar guidelines
    switch (nutrient) {
      case 'iron':
        return userProfile.gender === 'female' ? 18 : 8; // mg
      case 'calcium':
        return 1000; // mg
      case 'vitaminB12':
        return 2.4; // μg
      case 'vitaminD':
        return 15; // μg
      case 'omega3':
        return 1.6; // g
      default:
        return 0;
    }
  }
  
  /**
   * Ensure menu has sufficient variety
   */
  private enforceVarietyConstraint(menu: Menu): void {
    // Count ingredient occurrences
    const ingredientCounts: Record<string, number> = {};
    
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.ingredients) continue;
        
        for (const ingredient of meal.ingredients) {
          ingredientCounts[ingredient.name] = (ingredientCounts[ingredient.name] || 0) + 1;
        }
      }
    }
    
    // Find overused ingredients
    const overusedIngredients = Object.entries(ingredientCounts)
      .filter(([_, count]) => count > menu.days.length * 0.7) // Used in >70% of days
      .map(([name]) => name);
    
    // Replace overused ingredients
    if (overusedIngredients.length > 0) {
      this.replaceOverusedIngredients(menu, overusedIngredients);
    }
  }
  
  /**
   * Ensure menu respects dietary restrictions
   */
  private enforceRestrictionConstraints(menu: Menu, preferences: UserPreferences): void {
    // If no restrictions, nothing to enforce
    if (!preferences.restrictions || 
        (Array.isArray(preferences.restrictions) && preferences.restrictions.length === 0)) {
      return;
    }
    
    // Convert numeric restriction to string array if needed
    const restrictionsList = typeof preferences.restrictions === 'number' 
      ? this.getRestrictionsFromCode(preferences.restrictions)
      : preferences.restrictions;
    
    // Check each meal for restricted ingredients
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.ingredients) continue;
        
        // Find restricted ingredients
        const restrictedIngredients = meal.ingredients.filter(ingredient => 
          ingredient.categories && restrictionsList.some(
            restriction => ingredient.categories?.includes(restriction)
          )
        );
        
        // Replace restricted ingredients
        if (restrictedIngredients.length > 0) {
          this.replaceRestrictedIngredients(meal, restrictedIngredients, restrictionsList);
        }
      }
    }
  }
  
  /**
   * Add protein-rich foods to the menu
   */
  private addProteinToMenu(menu: Menu, proteinDeficit: number): void {
    // Get protein-rich vegan foods
    const proteinFoods = this.foodDatabase.filter(food => 
      food.nutrition && food.nutrition.protein && food.nutrition.protein > 15 // >15g protein per serving
    ).sort((a, b) => (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0));
    
    if (proteinFoods.length === 0) return;
    
    // Add to random meals until deficit is met
    let remainingDeficit = proteinDeficit;
    const totalMeals = menu.days.length * 3; // Assuming 3 meals per day
    
    while (remainingDeficit > 0 && proteinFoods.length > 0) {
      // Select random day and meal
      const randomDayIndex = Math.floor(Math.random() * menu.days.length);
      const day = menu.days[randomDayIndex];
      
      const mealTypes = Object.keys(day.meals);
      const randomMealType = mealTypes[Math.floor(Math.random() * mealTypes.length)] as keyof typeof day.meals;
      const meal = day.meals[randomMealType];
      
      if (!meal) continue;
      
      // Add a protein-rich food
      const randomProteinFoodIndex = Math.floor(Math.random() * Math.min(3, proteinFoods.length));
      const proteinFood = proteinFoods[randomProteinFoodIndex];
      
      // Initialize ingredients if needed
      if (!meal.ingredients) {
        meal.ingredients = [];
      }
      
      // Add the protein food
      meal.ingredients.push({
        name: proteinFood.name,
        amount: "1 serving",
        categories: proteinFood.categories
      });
      
      // Update meal nutrition
      if (!meal.nutrition) {
        meal.nutrition = {};
      }
      
      for (const [nutrient, amount] of Object.entries(proteinFood.nutrition || {})) {
        meal.nutrition[nutrient] = (meal.nutrition[nutrient] || 0) + amount;
      }
      
      // Reduce remaining deficit
      remainingDeficit -= (proteinFood.nutrition?.protein || 0);
    }
  }
  
  /**
   * Add foods rich in specific nutrients
   */
  private addNutrientToMenu(menu: Menu, nutrient: string, deficit: number): void {
    // Get foods rich in this nutrient
    const nutrientFoods = this.foodDatabase.filter(food => 
      food.nutrition && food.nutrition[nutrient] && food.nutrition[nutrient] > this.getNutrientThreshold(nutrient)
    ).sort((a, b) => (b.nutrition?.[nutrient] || 0) - (a.nutrition?.[nutrient] || 0));
    
    if (nutrientFoods.length === 0) return;
    
    // Add to random meals until deficit is met
    let remainingDeficit = deficit;
    
    while (remainingDeficit > 0 && nutrientFoods.length > 0) {
      // Select random day and meal
      const randomDayIndex = Math.floor(Math.random() * menu.days.length);
      const day = menu.days[randomDayIndex];
      
      const mealTypes = Object.keys(day.meals);
      const randomMealType = mealTypes[Math.floor(Math.random() * mealTypes.length)] as keyof typeof day.meals;
      const meal = day.meals[randomMealType];
      
      if (!meal) continue;
      
      // Add a nutrient-rich food
      const randomFoodIndex = Math.floor(Math.random() * Math.min(3, nutrientFoods.length));
      const nutrientFood = nutrientFoods[randomFoodIndex];
      
      // Initialize ingredients if needed
      if (!meal.ingredients) {
        meal.ingredients = [];
      }
      
      // Add the nutrient-rich food
      meal.ingredients.push({
        name: nutrientFood.name,
        amount: "1 serving",
        categories: nutrientFood.categories
      });
      
      // Update meal nutrition
      if (!meal.nutrition) {
        meal.nutrition = {};
      }
      
      for (const [n, amount] of Object.entries(nutrientFood.nutrition || {})) {
        meal.nutrition[n] = (meal.nutrition[n] || 0) + amount;
      }
      
      // Reduce remaining deficit
      remainingDeficit -= (nutrientFood.nutrition?.[nutrient] || 0);
    }
  }
  
  /**
   * Get threshold for considering a food rich in a nutrient
   */
  private getNutrientThreshold(nutrient: string): number {
    switch (nutrient) {
      case 'iron':
        return 3.6; // mg (20% of RDA for women)
      case 'calcium':
        return 200; // mg (20% of RDA)
      case 'vitaminB12':
        return 0.5; // μg (20% of RDA)
      case 'vitaminD':
        return 3; // μg (20% of RDA)
      case 'omega3':
        return 0.3; // g (20% of RDA)
      default:
        return 0;
    }
  }
  
  /**
   * Replace overused ingredients with alternatives
   */
  private replaceOverusedIngredients(menu: Menu, overusedIngredients: string[]): void {
    for (const ingredient of overusedIngredients) {
      // Find suitable alternatives
      const alternatives = this.findIngredientAlternatives(ingredient);
      
      if (alternatives.length === 0) continue;
      
      // Count occurrences to replace around half of them
      let occurrenceCount = 0;
      
      for (const day of menu.days) {
        for (const mealType of Object.keys(day.meals)) {
          const meal = day.meals[mealType as keyof typeof day.meals];
          if (!meal || !meal.ingredients) continue;
          
          for (let i = 0; i < meal.ingredients.length; i++) {
            if (meal.ingredients[i].name === ingredient) {
              occurrenceCount++;
              
              // Replace about half the occurrences
              if (occurrenceCount % 2 === 0) {
                const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
                meal.ingredients[i] = {
                  name: alternative.name,
                  amount: meal.ingredients[i].amount,
                  categories: alternative.categories
                };
                
                // Update nutrition accordingly
                if (meal.nutrition && alternative.nutrition) {
                  const originalFood = this.foodDatabase.find(f => f.name === ingredient);
                  
                  if (originalFood && originalFood.nutrition) {
                    // Remove original nutrition
                    for (const [nutrient, amount] of Object.entries(originalFood.nutrition)) {
                      meal.nutrition[nutrient] = (meal.nutrition[nutrient] || 0) - amount;
                      if (meal.nutrition[nutrient] < 0) meal.nutrition[nutrient] = 0;
                    }
                    
                    // Add new nutrition
                    for (const [nutrient, amount] of Object.entries(alternative.nutrition)) {
                      meal.nutrition[nutrient] = (meal.nutrition[nutrient] || 0) + amount;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  /**
   * Replace restricted ingredients with compliant alternatives
   */
  private replaceRestrictedIngredients(
    meal: any, 
    restrictedIngredients: any[], 
    restrictions: string[]
  ): void {
    for (const ingredient of restrictedIngredients) {
      // Find compliant alternatives
      const alternatives = this.findCompliantAlternatives(ingredient.name, restrictions);
      
      if (alternatives.length === 0) continue;
      
      // Replace in the meal
      const ingredientIndex = meal.ingredients.findIndex((ing: any) => ing.name === ingredient.name);
      
      if (ingredientIndex !== -1) {
        const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
        
        meal.ingredients[ingredientIndex] = {
          name: alternative.name,
          amount: meal.ingredients[ingredientIndex].amount,
          categories: alternative.categories
        };
        
        // Update nutrition accordingly
        if (meal.nutrition && alternative.nutrition) {
          const originalFood = this.foodDatabase.find(f => f.name === ingredient.name);
          
          if (originalFood && originalFood.nutrition) {
            // Remove original nutrition
            for (const [nutrient, amount] of Object.entries(originalFood.nutrition)) {
              meal.nutrition[nutrient] = (meal.nutrition[nutrient] || 0) - amount;
              if (meal.nutrition[nutrient] < 0) meal.nutrition[nutrient] = 0;
            }
            
            // Add new nutrition
            for (const [nutrient, amount] of Object.entries(alternative.nutrition)) {
              meal.nutrition[nutrient] = (meal.nutrition[nutrient] || 0) + amount;
            }
          }
        }
      }
    }
  }
  
  /**
   * Find alternative ingredients for variety
   */
  private findIngredientAlternatives(ingredient: string): FoodItem[] {
    // Find the original ingredient
    const originalFood = this.foodDatabase.find(f => f.name === ingredient);
    
    if (!originalFood) return [];
    
    // Find similar foods in the same category
    return this.foodDatabase.filter(food => 
      food.name !== ingredient && 
      food.categories && 
      originalFood.categories && 
      food.categories.some(cat => originalFood.categories?.includes(cat))
    );
  }
  
  /**
   * Find alternatives that comply with dietary restrictions
   */
  private findCompliantAlternatives(ingredient: string, restrictions: string[]): FoodItem[] {
    // Find the original ingredient
    const originalFood = this.foodDatabase.find(f => f.name === ingredient);
    
    if (!originalFood) return [];
    
    // Find similar foods that don't violate restrictions
    return this.foodDatabase.filter(food => 
      food.name !== ingredient && 
      food.categories && 
      originalFood.categories && 
      food.categories.some(cat => originalFood.categories?.includes(cat)) &&
      !food.categories.some(cat => restrictions.includes(cat))
    );
  }
  
  /**
   * Post-process the menu to enhance it further
   */
  private postProcessMenu(menu: Menu, userProfile: NutritionProfile, preferences: UserPreferences): Menu {
    // Create a deep copy
    const enhancedMenu: Menu = JSON.parse(JSON.stringify(menu));
    
    // 1. Balance nutrition across days
    this.balanceNutritionAcrossDays(enhancedMenu);
    
    // 2. Add complementary foods for better nutrition
    this.addComplementaryFoods(enhancedMenu);
    
    // 3. Optimize meal timing based on activity profile
    if (userProfile.activityProfile) {
      this.optimizeMealTiming(enhancedMenu, userProfile.activityProfile);
    }
    
    // 4. Add variety in preparation methods
    this.diversifyPreparationMethods(enhancedMenu);
    
    // 5. Calculate final summary metrics
    enhancedMenu.summary = this.calculateMenuMetrics(enhancedMenu, userProfile);
    
    return enhancedMenu;
  }
  
  /**
   * Balance nutrition across days
   */
  private balanceNutritionAcrossDays(menu: Menu): void {
    // Calculate average daily nutrient intake
    const dailyNutrients: Array<Record<string, number>> = [];
    
    // Initialize for each day
    for (let i = 0; i < menu.days.length; i++) {
      dailyNutrients.push({});
    }
    
    // Calculate nutrition for each day
    for (let dayIndex = 0; dayIndex < menu.days.length; dayIndex++) {
      const day = menu.days[dayIndex];
      
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.nutrition) continue;
        
        for (const [nutrient, amount] of Object.entries(meal.nutrition)) {
          dailyNutrients[dayIndex][nutrient] = (dailyNutrients[dayIndex][nutrient] || 0) + amount;
        }
      }
    }
    
    // Calculate average and standard deviation for each nutrient
    const avgNutrients: Record<string, { avg: number; stdDev: number }> = {};
    
    for (const day of dailyNutrients) {
      for (const [nutrient, amount] of Object.entries(day)) {
        if (!avgNutrients[nutrient]) {
          avgNutrients[nutrient] = { avg: 0, stdDev: 0 };
        }
        avgNutrients[nutrient].avg += amount / menu.days.length;
      }
    }
    
    // Calculate standard deviations
    for (const day of dailyNutrients) {
      for (const [nutrient, amount] of Object.entries(day)) {
        if (avgNutrients[nutrient]) {
          const diff = amount - avgNutrients[nutrient].avg;
          avgNutrients[nutrient].stdDev += (diff * diff) / menu.days.length;
        }
      }
    }
    
    for (const [nutrient, stats] of Object.entries(avgNutrients)) {
      avgNutrients[nutrient].stdDev = Math.sqrt(stats.stdDev);
    }
    
    // Balance days with excessive deviation
    for (let dayIndex = 0; dayIndex < menu.days.length; dayIndex++) {
      const day = menu.days[dayIndex];
      const dayNutrients = dailyNutrients[dayIndex];
      
      for (const [nutrient, amount] of Object.entries(dayNutrients)) {
        const stats = avgNutrients[nutrient];
        
        if (!stats) continue;
        
        // Check if this day has excessive nutrient
        if (amount > stats.avg + 2 * stats.stdDev) {
          // Find a day with deficit
          const deficitDayIndex = dailyNutrients.findIndex((d, idx) => 
            idx !== dayIndex && 
            (!d[nutrient] || d[nutrient] < stats.avg - stats.stdDev)
          );
          
          if (deficitDayIndex !== -1) {
            // Swap a meal or adjust portions
            this.balanceNutrientBetweenDays(
              menu, dayIndex, deficitDayIndex, nutrient
            );
          }
        }
      }
    }
  }
  
  /**
   * Balance a specific nutrient between two days
   */
  private balanceNutrientBetweenDays(
    menu: Menu, 
    excessDayIndex: number, 
    deficitDayIndex: number,
    nutrient: string
  ): void {
    const excessDay = menu.days[excessDayIndex];
    const deficitDay = menu.days[deficitDayIndex];
    
    // Find meals with highest and lowest amount of this nutrient
    let highestMeal: any = null;
    let highestAmount = 0;
    let lowestMeal: any = null;
    let lowestAmount = Infinity;
    
    // Check excess day
    for (const mealType of Object.keys(excessDay.meals)) {
      const meal = excessDay.meals[mealType as keyof typeof excessDay.meals];
      if (!meal || !meal.nutrition || !meal.nutrition[nutrient]) continue;
      
      if (meal.nutrition[nutrient] > highestAmount) {
        highestAmount = meal.nutrition[nutrient];
        highestMeal = { type: mealType, meal };
      }
    }
    
    // Check deficit day
    for (const mealType of Object.keys(deficitDay.meals)) {
      const meal = deficitDay.meals[mealType as keyof typeof deficitDay.meals];
      if (!meal || !meal.nutrition) continue;
      
      const amount = meal.nutrition[nutrient] || 0;
      if (amount < lowestAmount) {
        lowestAmount = amount;
        lowestMeal = { type: mealType, meal };
      }
    }
    
    if (!highestMeal || !lowestMeal) return;
    
    // Swap a high-nutrient ingredient from excess meal to deficit meal
    if (highestMeal.meal.ingredients && highestMeal.meal.ingredients.length > 0) {
      // Find ingredient with highest amount of this nutrient
      const highNutrientIngredients = highestMeal.meal.ingredients
        .map((ing: any) => {
          const food = this.foodDatabase.find(f => f.name === ing.name);
          return { 
            ingredient: ing, 
            nutrientAmount: food?.nutrition?.[nutrient] || 0 
          };
        })
        .filter((item: any) => item.nutrientAmount > 0)
        .sort((a: any, b: any) => b.nutrientAmount - a.nutrientAmount);
      
      if (highNutrientIngredients.length > 0) {
        const ingredientToMove = highNutrientIngredients[0].ingredient;
        const nutrientAmount = highNutrientIngredients[0].nutrientAmount;
        
        // Add to deficit meal
        if (!lowestMeal.meal.ingredients) {
          lowestMeal.meal.ingredients = [];
        }
        
        lowestMeal.meal.ingredients.push(ingredientToMove);
        
        // Update nutrition values
        if (!lowestMeal.meal.nutrition) {
          lowestMeal.meal.nutrition = {};
        }
        
        lowestMeal.meal.nutrition[nutrient] = (lowestMeal.meal.nutrition[nutrient] || 0) + nutrientAmount;
        highestMeal.meal.nutrition[nutrient] -= nutrientAmount;
        
        // Remove from excess meal
        highestMeal.meal.ingredients = highestMeal.meal.ingredients.filter(
          (ing: any) => ing.name !== ingredientToMove.name
        );
      }
    }
  }
  
  /**
   * Add complementary foods for better nutrition
   */
  private addComplementaryFoods(menu: Menu): void {
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal || !meal.ingredients) continue;
        
        // Check for iron-rich foods paired with vitamin C for absorption
        const hasIronRichFood = meal.ingredients.some(ing => {
          const food = this.foodDatabase.find(f => f.name === ing.name);
          return food?.nutrition?.iron && food.nutrition.iron > 3;
        });
        
        const hasVitaminC = meal.ingredients.some(ing => {
          const food = this.foodDatabase.find(f => f.name === ing.name);
          return food?.nutrition?.vitaminC && food.nutrition.vitaminC > 20;
        });
        
        // Add vitamin C source if iron-rich food present but no vitamin C
        if (hasIronRichFood && !hasVitaminC) {
          const vitaminCSources = this.foodDatabase
            .filter(food => food.nutrition?.vitaminC && food.nutrition.vitaminC > 30)
            .sort((a, b) => (b.nutrition?.vitaminC || 0) - (a.nutrition?.vitaminC || 0));
          
          if (vitaminCSources.length > 0) {
            const source = vitaminCSources[Math.floor(Math.random() * Math.min(3, vitaminCSources.length))];
            
            meal.ingredients.push({
              name: source.name,
              amount: "1 small serving",
              categories: source.categories
            });
            
            // Update nutrition
            if (!meal.nutrition) {
              meal.nutrition = {};
            }
            
            for (const [nutrient, amount] of Object.entries(source.nutrition || {})) {
              meal.nutrition[nutrient] = (meal.nutrition[nutrient] || 0) + amount;
            }
          }
        }
        
        // Similar logic for other nutrient pairs (zinc+vitamin A, calcium+vitamin D, etc.)
        // ...
      }
    }
  }
  
  /**
   * Optimize meal timing based on activity profile
   */
  private optimizeMealTiming(menu: Menu, activityProfile: any): void {
    for (let dayIndex = 0; dayIndex < menu.days.length; dayIndex++) {
      const day = menu.days[dayIndex];
      const dayOfWeek = dayIndex % 7; // 0 = Sunday, 1 = Monday, etc.
      
      // Get activity schedule for this day
      const dayActivity = activityProfile.schedule?.[dayOfWeek] || {};
      
      if (dayActivity.workout) {
        const workoutTime = dayActivity.workout.time;
        
        // Determine pre and post workout meals
        if (workoutTime < 10) { // Morning workout
          // Make breakfast higher carb, post-workout meal higher protein
          this.adjustMealMacros(day.meals.breakfast, { carbs: 1.2, protein: 0.9 });
          if (day.meals.morningSnack) {
            this.adjustMealMacros(day.meals.morningSnack, { protein: 1.3, carbs: 0.8 });
          }
        } else if (workoutTime < 14) { // Midday workout
          // Adjust breakfast and lunch
          this.adjustMealMacros(day.meals.breakfast, { carbs: 1.1 });
          this.adjustMealMacros(day.meals.lunch, { protein: 1.3, carbs: 0.9 });
        } else if (workoutTime < 19) { // Evening workout
          // Adjust lunch and dinner
          this.adjustMealMacros(day.meals.lunch, { carbs: 1.2 });
          this.adjustMealMacros(day.meals.dinner, { protein: 1.3, carbs: 0.8 });
        } else { // Night workout
          // Adjust dinner
          this.adjustMealMacros(day.meals.dinner, { carbs: 1.1, protein: 1.2 });
        }
      }
    }
  }
  
  /**
   * Adjust meal macronutrients by factor
   */
  private adjustMealMacros(meal: any, factors: Record<string, number>): void {
    if (!meal || !meal.nutrition) return;
    
    for (const [macro, factor] of Object.entries(factors)) {
      if (meal.nutrition[macro]) {
        meal.nutrition[macro] *= factor;
      }
    }
    
    // Adjust ingredients to match new nutrition if needed
    // This would involve a more complex algorithm to adjust portions
    // or add/remove ingredients to match the new macro targets
  }
  
  /**
   * Add variety in preparation methods
   */
  private diversifyPreparationMethods(menu: Menu): void {
    const preparationMethods = [
      'roasted', 'steamed', 'sautéed', 'raw', 'grilled', 
      'baked', 'stir-fried', 'slow-cooked', 'air-fried'
    ];
    
    // Track methods used for similar ingredients
    const ingredientMethods: Record<string, string[]> = {};
    
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal) continue;
        
        // Initialize preparation method if not set
        if (!meal.preparationMethod) {
          const randomMethod = preparationMethods[Math.floor(Math.random() * preparationMethods.length)];
          meal.preparationMethod = randomMethod;
        }
        
        // Check ingredient categories and vary methods
        if (meal.ingredients) {
          for (const ingredient of meal.ingredients) {
            const category = ingredient.categories?.[0] || 'other';
            
            if (!ingredientMethods[category]) {
              ingredientMethods[category] = [];
            }
            
            // If this category has too many of the same method, change it
            if (ingredientMethods[category].length >= 3 && 
                ingredientMethods[category].every(m => m === meal.preparationMethod)) {
              
              // Pick a different method
              let newMethod;
              do {
                newMethod = preparationMethods[Math.floor(Math.random() * preparationMethods.length)];
              } while (newMethod === meal.preparationMethod);
              
              meal.preparationMethod = newMethod;
            }
            
            ingredientMethods[category].push(meal.preparationMethod);
          }
        }
      }
    }
  }
  
  /**
   * Calculate menu metrics for summary
   */
  private calculateMenuMetrics(menu: Menu, userProfile: NutritionProfile): any {
    const metrics: any = {
      totalCost: 0,
      nutritionScore: 0,
      carbonFootprint: 0,
      averageQualityScore: 0,
      nutritionBalance: {}
    };
    
    let mealCount = 0;
    const totalNutrients: Record<string, number> = {};
    
    // Calculate totals across all meals
    for (const day of menu.days) {
      for (const mealType of Object.keys(day.meals)) {
        const meal = day.meals[mealType as keyof typeof day.meals];
        if (!meal) continue;
        
        mealCount++;
        
        // Add costs
        metrics.totalCost += meal.cost || 0;
        
        // Add carbon footprint
        metrics.carbonFootprint += meal.carbonFootprint || 0;
        
        // Add quality score
        if (meal.qualityScore) {
          metrics.averageQualityScore += meal.qualityScore.overallScore || 0;
        }
        
        // Sum up nutrients
        if (meal.nutrition) {
          for (const [nutrient, amount] of Object.entries(meal.nutrition)) {
            totalNutrients[nutrient] = (totalNutrients[nutrient] || 0) + amount;
          }
        }
      }
    }

    return metrics;
  }

  // Missing methods - stub implementations
  private getDateForDay(day: number): Date {
    const today = new Date();
    return new Date(today.getTime() + day * 24 * 60 * 60 * 1000);
  }

  private generateRandomMeal(mealType: string, preferences: UserPreferences): any {
    return {
      id: Math.random().toString(36),
      name: `Random ${mealType}`,
      type: mealType,
      ingredients: [],
      nutrition: {},
      cost: Math.random() * 10,
      carbonFootprint: Math.random() * 5,
      qualityScore: {
        overallScore: Math.random() * 100
      }
    };
  }
}