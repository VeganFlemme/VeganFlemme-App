import { logger } from '../utils/logger';
import { ANSES_RNP } from './menuOptimizationService';

export interface NutritionProfile {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins: {
    b12: number;
    d: number;
    b6: number;
    folate: number;
  };
  minerals: {
    iron: number;
    calcium: number;
    magnesium: number;
    zinc: number;
  };
  omega3: number;
  omega6: number;
}

export interface IngredientData {
  id: string;
  name: string;
  category: 'protein' | 'grain' | 'vegetable' | 'fruit' | 'dairy' | 'fat' | 'spice' | 'other';
  nutritionPer100g: NutritionProfile;
  allergens: string[];
  cookingTime: number; // minutes
  cost: number; // relative cost 1-5
  availability: 'common' | 'specialty' | 'rare';
  season?: string[];
  texture: 'soft' | 'firm' | 'crunchy' | 'liquid';
  flavor: 'neutral' | 'mild' | 'strong' | 'sweet' | 'savory';
}

export interface SwapContext {
  recipeType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cookingMethod: 'raw' | 'boiled' | 'fried' | 'baked' | 'steamed';
  userRestrictions: {
    allergens: string[];
    intolerances: string[];
    preferences: string[];
    excludedIngredients: string[];
  };
  nutritionalTargets?: {
    protein?: number;
    iron?: number;
    b12?: number;
    calcium?: number;
  };
  budget: 'low' | 'medium' | 'high';
  cookingTime: 'quick' | 'medium' | 'elaborate';
}

export interface SwapRecommendation {
  originalIngredient: string;
  alternative: IngredientData;
  reason: string;
  nutritionalImpact: {
    protein: string;
    iron: string;
    calcium: string;
    calories: string;
    overallScore: number; // 0-100
  };
  compatibilityScore: number; // 0-100
  availability: string;
  costImpact: 'cheaper' | 'similar' | 'more_expensive';
  cookingAdjustments?: string[];
  confidence: number; // 0-100
}

export interface SwapResult {
  suggestions: SwapRecommendation[];
  preservesNutritionBalance: boolean;
  improvesNutrition: boolean;
  alternativeCount: number;
}

export class SwapRecommenderService {
  private ingredientDatabase: Map<string, IngredientData>;

  constructor() {
    this.ingredientDatabase = new Map();
    this.initializeIngredientDatabase();
    logger.info('SwapRecommender Service initialized');
  }

  /**
   * Initialize comprehensive ingredient database with nutrition data
   */
  private initializeIngredientDatabase(): void {
    const ingredients: IngredientData[] = [
      // Protein sources
      {
        id: 'tofu',
        name: 'Tofu ferme',
        category: 'protein',
        nutritionPer100g: {
          calories: 144,
          protein: 15.7,
          carbs: 2.8,
          fat: 8.7,
          fiber: 2.3,
          vitamins: { b12: 0, d: 0, b6: 0.1, folate: 15 },
          minerals: { iron: 2.7, calcium: 200, magnesium: 65, zinc: 1.6 },
          omega3: 0.6,
          omega6: 4.9
        },
        allergens: ['soy'],
        cookingTime: 15,
        cost: 2,
        availability: 'common',
        texture: 'firm',
        flavor: 'neutral'
      },
      {
        id: 'tempeh',
        name: 'Tempeh',
        category: 'protein',
        nutritionPer100g: {
          calories: 190,
          protein: 20.3,
          carbs: 7.6,
          fat: 10.8,
          fiber: 9.0,
          vitamins: { b12: 0.1, d: 0, b6: 0.2, folate: 24 },
          minerals: { iron: 2.9, calcium: 111, magnesium: 81, zinc: 1.1 },
          omega3: 0.2,
          omega6: 5.8
        },
        allergens: ['soy'],
        cookingTime: 10,
        cost: 3,
        availability: 'specialty',
        texture: 'firm',
        flavor: 'savory'
      },
      {
        id: 'seitan',
        name: 'Seitan',
        category: 'protein',
        nutritionPer100g: {
          calories: 370,
          protein: 75.0,
          carbs: 14.0,
          fat: 1.9,
          fiber: 6.0,
          vitamins: { b12: 0, d: 0, b6: 0.3, folate: 27 },
          minerals: { iron: 5.2, calcium: 23, magnesium: 25, zinc: 1.6 },
          omega3: 0.1,
          omega6: 0.6
        },
        allergens: ['gluten'],
        cookingTime: 20,
        cost: 4,
        availability: 'specialty',
        texture: 'firm',
        flavor: 'savory'
      },
      {
        id: 'lentils_red',
        name: 'Lentilles corail',
        category: 'protein',
        nutritionPer100g: {
          calories: 116,
          protein: 9.0,
          carbs: 20.1,
          fat: 0.4,
          fiber: 7.9,
          vitamins: { b12: 0, d: 0, b6: 0.2, folate: 181 },
          minerals: { iron: 3.3, calcium: 19, magnesium: 47, zinc: 1.3 },
          omega3: 0.2,
          omega6: 0.2
        },
        allergens: [],
        cookingTime: 15,
        cost: 1,
        availability: 'common',
        texture: 'soft',
        flavor: 'mild'
      },
      {
        id: 'chickpeas',
        name: 'Pois chiches',
        category: 'protein',
        nutritionPer100g: {
          calories: 164,
          protein: 8.9,
          carbs: 27.4,
          fat: 2.6,
          fiber: 7.6,
          vitamins: { b12: 0, d: 0, b6: 0.1, folate: 172 },
          minerals: { iron: 2.9, calcium: 49, magnesium: 79, zinc: 1.5 },
          omega3: 0.1,
          omega6: 1.2
        },
        allergens: [],
        cookingTime: 60,
        cost: 1,
        availability: 'common',
        texture: 'firm',
        flavor: 'mild'
      },
      // Plant-based dairy alternatives
      {
        id: 'cashew_cream',
        name: 'Crème de cajou',
        category: 'dairy',
        nutritionPer100g: {
          calories: 220,
          protein: 7.8,
          carbs: 8.5,
          fat: 18.2,
          fiber: 2.0,
          vitamins: { b12: 0, d: 0, b6: 0.4, folate: 7 },
          minerals: { iron: 3.8, calcium: 26, magnesium: 260, zinc: 5.6 },
          omega3: 0.1,
          omega6: 7.8
        },
        allergens: ['nuts'],
        cookingTime: 5,
        cost: 4,
        availability: 'specialty',
        texture: 'soft',
        flavor: 'mild'
      },
      {
        id: 'coconut_milk',
        name: 'Lait de coco',
        category: 'dairy',
        nutritionPer100g: {
          calories: 230,
          protein: 2.3,
          carbs: 5.5,
          fat: 23.8,
          fiber: 2.2,
          vitamins: { b12: 0, d: 0, b6: 0.0, folate: 16 },
          minerals: { iron: 3.9, calcium: 16, magnesium: 37, zinc: 0.7 },
          omega3: 0.0,
          omega6: 0.2
        },
        allergens: [],
        cookingTime: 0,
        cost: 2,
        availability: 'common',
        texture: 'liquid',
        flavor: 'mild'
      },
      // Grains and starches
      {
        id: 'quinoa',
        name: 'Quinoa',
        category: 'grain',
        nutritionPer100g: {
          calories: 368,
          protein: 14.1,
          carbs: 64.2,
          fat: 6.1,
          fiber: 7.0,
          vitamins: { b12: 0, d: 0, b6: 0.5, folate: 184 },
          minerals: { iron: 4.6, calcium: 47, magnesium: 197, zinc: 3.1 },
          omega3: 0.3,
          omega6: 2.9
        },
        allergens: [],
        cookingTime: 20,
        cost: 3,
        availability: 'common',
        texture: 'firm',
        flavor: 'neutral'
      },
      {
        id: 'brown_rice',
        name: 'Riz complet',
        category: 'grain',
        nutritionPer100g: {
          calories: 111,
          protein: 2.6,
          carbs: 22.0,
          fat: 0.9,
          fiber: 1.8,
          vitamins: { b12: 0, d: 0, b6: 0.1, folate: 7 },
          minerals: { iron: 0.4, calcium: 10, magnesium: 43, zinc: 0.6 },
          omega3: 0.0,
          omega6: 0.3
        },
        allergens: [],
        cookingTime: 45,
        cost: 1,
        availability: 'common',
        texture: 'firm',
        flavor: 'neutral'
      },
      // More protein sources for better coverage
      {
        id: 'black_beans',
        name: 'Haricots noirs',
        category: 'protein',
        nutritionPer100g: {
          calories: 132,
          protein: 8.9,
          carbs: 23.0,
          fat: 0.5,
          fiber: 8.7,
          vitamins: { b12: 0, d: 0, b6: 0.1, folate: 149 },
          minerals: { iron: 2.3, calcium: 27, magnesium: 70, zinc: 1.1 },
          omega3: 0.1,
          omega6: 0.2
        },
        allergens: [],
        cookingTime: 45,
        cost: 1,
        availability: 'common',
        texture: 'firm',
        flavor: 'mild'
      },
      {
        id: 'hemp_seeds',
        name: 'Graines de chanvre',
        category: 'protein',
        nutritionPer100g: {
          calories: 553,
          protein: 31.6,
          carbs: 8.7,
          fat: 48.8,
          fiber: 4.0,
          vitamins: { b12: 0, d: 0, b6: 0.6, folate: 7 },
          minerals: { iron: 7.9, calcium: 70, magnesium: 700, zinc: 9.9 },
          omega3: 9.3,
          omega6: 28.7
        },
        allergens: [],
        cookingTime: 0,
        cost: 5,
        availability: 'specialty',
        texture: 'crunchy',
        flavor: 'neutral'
      }
    ];

    ingredients.forEach(ingredient => {
      this.ingredientDatabase.set(ingredient.id, ingredient);
    });
  }

  /**
   * Get intelligent swap recommendations for an ingredient
   */
  async getSwapRecommendations(
    originalIngredientName: string,
    context: SwapContext,
    amount: number = 100
  ): Promise<SwapResult> {
    try {
      logger.info('Generating swap recommendations', {
        ingredient: originalIngredientName,
        context: context.recipeType,
        restrictions: context.userRestrictions.allergens.length
      });

      // Find the original ingredient or use best match
      const originalIngredient = this.findIngredientByName(originalIngredientName);
      
      if (!originalIngredient) {
        // If ingredient not found, provide general category-based recommendations
        return this.getCategoryBasedRecommendations(originalIngredientName, context);
      }

      // Get compatible alternatives
      const alternatives = this.findCompatibleAlternatives(originalIngredient, context);
      
      // Score and rank alternatives
      const scoredAlternatives = alternatives.map(alt => 
        this.scoreAlternative(originalIngredient, alt, context, amount)
      );

      // Sort by compatibility score
      scoredAlternatives.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      // Take top 3-5 recommendations
      const topRecommendations = scoredAlternatives.slice(0, 5);

      // Assess nutritional impact
      const preservesBalance = this.assessNutritionalBalance(originalIngredient, topRecommendations);
      const improvesNutrition = this.assessNutritionalImprovement(originalIngredient, topRecommendations);

      logger.info('Swap recommendations generated', {
        originalIngredient: originalIngredientName,
        alternativeCount: topRecommendations.length,
        preservesBalance,
        improvesNutrition
      });

      return {
        suggestions: topRecommendations,
        preservesNutritionBalance: preservesBalance,
        improvesNutrition: improvesNutrition,
        alternativeCount: topRecommendations.length
      };

    } catch (error) {
      logger.error('Swap recommendation failed:', error);
      throw new Error('Failed to generate swap recommendations');
    }
  }

  /**
   * Find ingredient by name (fuzzy matching)
   */
  private findIngredientByName(name: string): IngredientData | null {
    const normalizedName = name.toLowerCase().trim();
    
    // Direct match
    for (const ingredient of this.ingredientDatabase.values()) {
      if (ingredient.name.toLowerCase().includes(normalizedName) || 
          normalizedName.includes(ingredient.name.toLowerCase())) {
        return ingredient;
      }
    }

    // Partial match for common terms
    const commonMappings: Record<string, string> = {
      'lentils': 'lentils_red',
      'lentilles': 'lentils_red',
      'chickpeas': 'chickpeas',
      'pois chiches': 'chickpeas',
      'rice': 'brown_rice',
      'riz': 'brown_rice'
    };

    if (commonMappings[normalizedName]) {
      return this.ingredientDatabase.get(commonMappings[normalizedName]) || null;
    }

    // Partial match
    for (const ingredient of this.ingredientDatabase.values()) {
      const words = normalizedName.split(' ');
      const ingredientWords = ingredient.name.toLowerCase().split(' ');
      
      const hasCommonWord = words.some(word => 
        ingredientWords.some(ingWord => ingWord.includes(word) || word.includes(ingWord))
      );
      
      if (hasCommonWord) {
        return ingredient;
      }
    }

    return null;
  }

  /**
   * Find compatible alternatives based on category and constraints
   */
  private findCompatibleAlternatives(original: IngredientData, context: SwapContext): IngredientData[] {
    const alternatives: IngredientData[] = [];

    for (const ingredient of this.ingredientDatabase.values()) {
      if (ingredient.id === original.id) continue;

      // Check allergen compatibility
      const hasRestrictedAllergen = ingredient.allergens.some(allergen =>
        context.userRestrictions.allergens.includes(allergen)
      );
      if (hasRestrictedAllergen) continue;

      // Check excluded ingredients
      if (context.userRestrictions.excludedIngredients.includes(ingredient.name.toLowerCase())) {
        continue;
      }

      // Category compatibility (same category or compatible categories)
      if (this.areCategoriesCompatible(original.category, ingredient.category)) {
        alternatives.push(ingredient);
      }
    }

    return alternatives;
  }

  /**
   * Check if categories are compatible for substitution
   */
  private areCategoriesCompatible(originalCategory: string, alternativeCategory: string): boolean {
    const compatibilityMap: Record<string, string[]> = {
      'protein': ['protein'],
      'grain': ['grain', 'protein'], // Some grains can substitute proteins
      'dairy': ['dairy', 'fat'],
      'fat': ['fat', 'dairy'],
      'vegetable': ['vegetable', 'fruit'],
      'fruit': ['fruit', 'vegetable'],
      'spice': ['spice'],
      'other': ['other']
    };

    return compatibilityMap[originalCategory]?.includes(alternativeCategory) || false;
  }

  /**
   * Score an alternative based on compatibility
   */
  private scoreAlternative(
    original: IngredientData,
    alternative: IngredientData,
    context: SwapContext,
    amount: number
  ): SwapRecommendation {
    let score = 0;

    // Nutritional similarity (40% of score)
    const nutritionScore = this.calculateNutritionalSimilarity(original, alternative);
    score += nutritionScore * 0.4;

    // Cooking compatibility (20% of score)
    const cookingScore = this.calculateCookingCompatibility(original, alternative, context);
    score += cookingScore * 0.2;

    // Availability and cost (20% of score)
    const practicalScore = this.calculatePracticalScore(alternative, context);
    score += practicalScore * 0.2;

    // Texture and flavor compatibility (20% of score)
    const sensoryScore = this.calculateSensoryCompatibility(original, alternative);
    score += sensoryScore * 0.2;

    // Calculate nutritional impact
    const nutritionalImpact = this.calculateNutritionalImpact(original, alternative, amount);

    // Generate reason
    const reason = this.generateSwapReason(original, alternative, nutritionalImpact);

    // Determine cost impact
    const costImpact = this.determineCostImpact(original, alternative);

    // Generate cooking adjustments if needed
    const cookingAdjustments = this.generateCookingAdjustments(original, alternative, context);

    return {
      originalIngredient: original.name,
      alternative: alternative,
      reason: reason,
      nutritionalImpact: nutritionalImpact,
      compatibilityScore: Math.round(score),
      availability: this.getAvailabilityDescription(alternative),
      costImpact: costImpact,
      cookingAdjustments: cookingAdjustments,
      confidence: Math.round(score * 0.9) // Slightly lower than compatibility score
    };
  }

  /**
   * Calculate nutritional similarity between ingredients
   */
  private calculateNutritionalSimilarity(original: IngredientData, alternative: IngredientData): number {
    const weights = {
      protein: 0.3,
      calories: 0.2,
      iron: 0.15,
      calcium: 0.15,
      fiber: 0.1,
      b12: 0.1
    };

    let similarity = 0;

    // Compare protein content
    const proteinRatio = Math.min(alternative.nutritionPer100g.protein, original.nutritionPer100g.protein) /
                        Math.max(alternative.nutritionPer100g.protein, original.nutritionPer100g.protein);
    similarity += proteinRatio * weights.protein * 100;

    // Compare calories
    const calorieRatio = Math.min(alternative.nutritionPer100g.calories, original.nutritionPer100g.calories) /
                        Math.max(alternative.nutritionPer100g.calories, original.nutritionPer100g.calories);
    similarity += calorieRatio * weights.calories * 100;

    // Compare key minerals
    const ironRatio = Math.min(alternative.nutritionPer100g.minerals.iron, original.nutritionPer100g.minerals.iron) /
                     Math.max(alternative.nutritionPer100g.minerals.iron, original.nutritionPer100g.minerals.iron);
    similarity += ironRatio * weights.iron * 100;

    const calciumRatio = Math.min(alternative.nutritionPer100g.minerals.calcium, original.nutritionPer100g.minerals.calcium) /
                        Math.max(alternative.nutritionPer100g.minerals.calcium, original.nutritionPer100g.minerals.calcium);
    similarity += calciumRatio * weights.calcium * 100;

    return Math.min(similarity, 100);
  }

  /**
   * Calculate cooking compatibility score
   */
  private calculateCookingCompatibility(
    original: IngredientData,
    alternative: IngredientData,
    context: SwapContext
  ): number {
    let score = 80; // Base score

    // Cooking time difference
    const timeDifference = Math.abs(alternative.cookingTime - original.cookingTime);
    if (timeDifference > 30) score -= 20;
    else if (timeDifference > 15) score -= 10;

    // Context compatibility
    if (context.cookingTime === 'quick' && alternative.cookingTime > 20) score -= 15;
    if (context.cookingTime === 'elaborate' && alternative.cookingTime < 15) score -= 5;

    return Math.max(score, 0);
  }

  /**
   * Calculate practical score (availability and cost)
   */
  private calculatePracticalScore(ingredient: IngredientData, context: SwapContext): number {
    let score = 70; // Base score

    // Availability
    switch (ingredient.availability) {
      case 'common': score += 20; break;
      case 'specialty': score += 10; break;
      case 'rare': score -= 10; break;
    }

    // Cost compatibility
    switch (context.budget) {
      case 'low':
        if (ingredient.cost <= 2) score += 10;
        else if (ingredient.cost >= 4) score -= 20;
        break;
      case 'medium':
        if (ingredient.cost <= 3) score += 5;
        else if (ingredient.cost >= 5) score -= 10;
        break;
      case 'high':
        // No penalty for high cost ingredients
        break;
    }

    return Math.max(score, 0);
  }

  /**
   * Calculate sensory compatibility (texture and flavor)
   */
  private calculateSensoryCompatibility(original: IngredientData, alternative: IngredientData): number {
    let score = 60; // Base score

    // Texture compatibility
    if (original.texture === alternative.texture) score += 25;
    else if (this.areTexturesCompatible(original.texture, alternative.texture)) score += 15;

    // Flavor compatibility
    if (original.flavor === alternative.flavor) score += 15;
    else if (this.areFlavorsCompatible(original.flavor, alternative.flavor)) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Check if textures are compatible
   */
  private areTexturesCompatible(original: string, alternative: string): boolean {
    const compatibleTextures: Record<string, string[]> = {
      'firm': ['firm', 'crunchy'],
      'soft': ['soft', 'liquid'],
      'crunchy': ['crunchy', 'firm'],
      'liquid': ['liquid', 'soft']
    };

    return compatibleTextures[original]?.includes(alternative) || false;
  }

  /**
   * Check if flavors are compatible
   */
  private areFlavorsCompatible(original: string, alternative: string): boolean {
    const compatibleFlavors: Record<string, string[]> = {
      'neutral': ['neutral', 'mild'],
      'mild': ['mild', 'neutral', 'sweet'],
      'strong': ['strong', 'savory'],
      'sweet': ['sweet', 'mild'],
      'savory': ['savory', 'strong', 'mild']
    };

    return compatibleFlavors[original]?.includes(alternative) || false;
  }

  /**
   * Calculate nutritional impact of the swap
   */
  private calculateNutritionalImpact(
    original: IngredientData,
    alternative: IngredientData,
    amount: number
  ): SwapRecommendation['nutritionalImpact'] {
    const factor = amount / 100; // Convert to actual amount

    const proteinDiff = (alternative.nutritionPer100g.protein - original.nutritionPer100g.protein) * factor;
    const ironDiff = (alternative.nutritionPer100g.minerals.iron - original.nutritionPer100g.minerals.iron) * factor;
    const calciumDiff = (alternative.nutritionPer100g.minerals.calcium - original.nutritionPer100g.minerals.calcium) * factor;
    const caloriesDiff = (alternative.nutritionPer100g.calories - original.nutritionPer100g.calories) * factor;

    // Calculate overall nutritional score
    let overallScore = 70; // Neutral baseline
    
    if (proteinDiff > 0) overallScore += Math.min(proteinDiff * 2, 15);
    if (ironDiff > 0) overallScore += Math.min(ironDiff * 5, 10);
    if (calciumDiff > 0) overallScore += Math.min(calciumDiff * 0.1, 10);
    
    // Slight penalty for excessive calories
    if (caloriesDiff > 50) overallScore -= 5;

    return {
      protein: this.formatNutritionalChange(proteinDiff, 'g'),
      iron: this.formatNutritionalChange(ironDiff, 'mg'),
      calcium: this.formatNutritionalChange(calciumDiff, 'mg'),
      calories: this.formatNutritionalChange(caloriesDiff, 'kcal'),
      overallScore: Math.min(Math.max(Math.round(overallScore), 0), 100)
    };
  }

  /**
   * Format nutritional change as percentage or absolute value
   */
  private formatNutritionalChange(diff: number, unit: string): string {
    if (Math.abs(diff) < 0.1) return '±0%';
    
    const sign = diff > 0 ? '+' : '';
    if (Math.abs(diff) >= 1) {
      return `${sign}${diff.toFixed(1)}${unit}`;
    } else {
      const percentage = Math.round((diff / Math.abs(diff)) * Math.abs(diff * 10));
      return `${sign}${percentage}%`;
    }
  }

  /**
   * Generate a reason for the swap recommendation
   */
  private generateSwapReason(
    original: IngredientData,
    alternative: IngredientData,
    impact: SwapRecommendation['nutritionalImpact']
  ): string {
    const reasons: string[] = [];

    // Nutritional reasons
    if (impact.overallScore > 80) {
      reasons.push('Profil nutritionnel excellent');
    } else if (impact.overallScore > 70) {
      reasons.push('Bon équilibre nutritionnel');
    }

    // Specific nutritional benefits
    if (alternative.nutritionPer100g.protein > original.nutritionPer100g.protein + 2) {
      reasons.push('plus riche en protéines');
    }
    if (alternative.nutritionPer100g.minerals.iron > original.nutritionPer100g.minerals.iron + 1) {
      reasons.push('meilleure source de fer');
    }
    if (alternative.nutritionPer100g.fiber > original.nutritionPer100g.fiber + 2) {
      reasons.push('plus riche en fibres');
    }

    // Processing and quality reasons
    if (alternative.allergens.length < original.allergens.length) {
      reasons.push('moins allergène');
    }

    // Default reason if no specific benefits
    if (reasons.length === 0) {
      reasons.push('Alternative nutritionnelle compatible');
    }

    return reasons.join(', ');
  }

  /**
   * Determine cost impact of the swap
   */
  private determineCostImpact(original: IngredientData, alternative: IngredientData): 'cheaper' | 'similar' | 'more_expensive' {
    const costDiff = alternative.cost - original.cost;
    
    if (costDiff <= -1) return 'cheaper';
    if (costDiff >= 1) return 'more_expensive';
    return 'similar';
  }

  /**
   * Get availability description
   */
  private getAvailabilityDescription(ingredient: IngredientData): string {
    switch (ingredient.availability) {
      case 'common': return 'Disponible en supermarché';
      case 'specialty': return 'Disponible en magasin bio';
      case 'rare': return 'Commande en ligne recommandée';
      default: return 'Disponibilité variable';
    }
  }

  /**
   * Generate cooking adjustments if needed
   */
  private generateCookingAdjustments(
    original: IngredientData,
    alternative: IngredientData,
    context: SwapContext
  ): string[] {
    const adjustments: string[] = [];

    // Cooking time adjustments
    if (alternative.cookingTime > original.cookingTime + 15) {
      adjustments.push(`Augmenter le temps de cuisson de ${alternative.cookingTime - original.cookingTime} minutes`);
    } else if (alternative.cookingTime < original.cookingTime - 15) {
      adjustments.push(`Réduire le temps de cuisson de ${original.cookingTime - alternative.cookingTime} minutes`);
    }

    // Texture adjustments
    if (original.texture === 'firm' && alternative.texture === 'soft') {
      adjustments.push('Ajouter en fin de cuisson pour préserver la texture');
    }

    // Category-specific adjustments
    if (original.category === 'protein' && alternative.category === 'protein') {
      if (alternative.id === 'tempeh' || alternative.id === 'seitan') {
        adjustments.push('Faire revenir légèrement avant incorporation');
      }
    }

    return adjustments;
  }

  /**
   * Generate category-based recommendations when ingredient is not found
   */
  private getCategoryBasedRecommendations(ingredientName: string, context: SwapContext): SwapResult {
    // Try to guess category from ingredient name
    const guessedCategory = this.guessIngredientCategory(ingredientName);
    
    // Get ingredients from that category
    const categoryIngredients = Array.from(this.ingredientDatabase.values())
      .filter(ing => ing.category === guessedCategory)
      .filter(ing => !ing.allergens.some(allergen => 
        context.userRestrictions.allergens.includes(allergen)))
      .slice(0, 3);

    const recommendations: SwapRecommendation[] = categoryIngredients.map(ingredient => ({
      originalIngredient: ingredientName,
      alternative: ingredient,
      reason: `Alternative ${guessedCategory} recommandée`,
      nutritionalImpact: {
        protein: 'Non calculé',
        iron: 'Non calculé',
        calcium: 'Non calculé',
        calories: 'Non calculé',
        overallScore: 60
      },
      compatibilityScore: 60,
      availability: this.getAvailabilityDescription(ingredient),
      costImpact: 'similar',
      confidence: 50
    }));

    return {
      suggestions: recommendations,
      preservesNutritionBalance: true,
      improvesNutrition: false,
      alternativeCount: recommendations.length
    };
  }

  /**
   * Guess ingredient category from name
   */
  private guessIngredientCategory(name: string): IngredientData['category'] {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes('tofu') || lowercaseName.includes('tempeh') || 
        lowercaseName.includes('seitan') || lowercaseName.includes('lentille') ||
        lowercaseName.includes('pois') || lowercaseName.includes('haricot')) {
      return 'protein';
    }
    if (lowercaseName.includes('riz') || lowercaseName.includes('quinoa') || 
        lowercaseName.includes('avoine') || lowercaseName.includes('blé')) {
      return 'grain';
    }
    if (lowercaseName.includes('lait') || lowercaseName.includes('crème') || 
        lowercaseName.includes('yaourt') || lowercaseName.includes('fromage')) {
      return 'dairy';
    }
    
    return 'other';
  }

  /**
   * Assess if swap preserves nutritional balance
   */
  private assessNutritionalBalance(original: IngredientData, recommendations: SwapRecommendation[]): boolean {
    if (!recommendations.length) return false;
    
    const bestRecommendation = recommendations[0];
    return bestRecommendation.nutritionalImpact.overallScore >= 60;
  }

  /**
   * Assess if swap improves nutrition
   */
  private assessNutritionalImprovement(original: IngredientData, recommendations: SwapRecommendation[]): boolean {
    if (!recommendations.length) return false;
    
    const bestRecommendation = recommendations[0];
    return bestRecommendation.nutritionalImpact.overallScore >= 80;
  }
}