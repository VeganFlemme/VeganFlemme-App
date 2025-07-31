import { UserProfile, Recipe, Food, MealPlan } from './types';
import { NutritionService } from './nutritionService';
import { RecipeRecommendationService } from './recipeRecommendationService';

export class VeganTransitionService {
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
   * Create a customized transition plan for new vegans
   */
  public async createTransitionPlan(
    userProfile: UserProfile,
    options: {
      currentDiet: 'omnivore' | 'vegetarian' | 'pescatarian' | 'flexitarian';
      transitionSpeed: 'gradual' | 'moderate' | 'rapid';
      motivations: ('health' | 'environmental' | 'ethical' | 'athletic')[];
      challengeAreas?: ('cheese' | 'meat' | 'eggs' | 'convenience' | 'protein' | 'social')[];
      weekDuration?: number;
    },
    recipes: Recipe[],
    foods: Map<string, Food>
  ): Promise<{
    phases: Array<{
      name: string;
      description: string;
      duration: number; // in days
      focus: string[];
      dietaryGuidelines: string[];
      mealPlan?: MealPlan;
      educationalTopics: string[];
      recipeSuggestions: Recipe[];
      alternativeProducts: Food[];
      nutritionalFocus: string[];
    }>;
    totalDuration: number;
    expectedChallenges: string[];
    successMetrics: string[];
  }> {
    // Set default week duration if not provided
    const weekDuration = options.weekDuration || 12;
    
    // Calculate phase durations based on transition speed
    const phaseDurations = this.calculatePhaseDurations(
      options.currentDiet, 
      options.transitionSpeed,
      weekDuration
    );
    
    // Initialize transition phases
    const phases = [];
    
    // Phase 1: Exploration & Foundation
    phases.push(await this.createExplorationPhase(
      userProfile,
      options.currentDiet,
      options.motivations,
      phaseDurations.exploration,
      recipes,
      foods
    ));
    
    // Phase 2: Transition
    phases.push(await this.createTransitionPhase(
      userProfile,
      options.currentDiet,
      options.challengeAreas || [],
      phaseDurations.transition,
      recipes,
      foods
    ));
    
    // Phase 3: Adaptation
    phases.push(await this.createAdaptationPhase(
      userProfile,
      options.motivations,
      options.challengeAreas || [],
      phaseDurations.adaptation,
      recipes,
      foods
    ));
    
    // Phase 4: Optimization
    phases.push(await this.createOptimizationPhase(
      userProfile,
      options.motivations,
      phaseDurations.optimization,
      recipes,
      foods
    ));
    
    // Calculate total duration
    const totalDuration = phaseDurations.exploration + 
                          phaseDurations.transition +
                          phaseDurations.adaptation +
                          phaseDurations.optimization;
    
    // Identify expected challenges
    const expectedChallenges = this.identifyChallenges(
      options.currentDiet,
      options.challengeAreas || [],
      options.motivations
    );
    
    // Define success metrics
    const successMetrics = this.defineSuccessMetrics(
      options.motivations,
      userProfile
    );
    
    return {
      phases,
      totalDuration,
      expectedChallenges,
      successMetrics
    };
  }
  
  /**
   * Calculate phase durations based on diet and transition speed
   */
  private calculatePhaseDurations(
    currentDiet: string,
    transitionSpeed: string,
    totalWeeks: number
  ): {
    exploration: number;
    transition: number;
    adaptation: number;
    optimization: number;
  } {
    // Base duration factors (percentages of total time)
    let explorationFactor = 0.2;
    let transitionFactor = 0.4;
    let adaptationFactor = 0.25;
    let optimizationFactor = 0.15;
    
    // Adjust based on current diet
    if (currentDiet === 'vegetarian' || currentDiet === 'pescatarian') {
      // Less time needed for exploration and transition
      explorationFactor = 0.15;
      transitionFactor = 0.3;
      adaptationFactor = 0.3;
      optimizationFactor = 0.25;
    } else if (currentDiet === 'flexitarian') {
      // Moderate adjustment
      explorationFactor = 0.18;
      transitionFactor = 0.35;
      adaptationFactor = 0.27;
      optimizationFactor = 0.2;
    }
    
    // Adjust based on transition speed
    if (transitionSpeed === 'rapid') {
      // Shorter exploration and transition, longer optimization
      explorationFactor *= 0.7;
      transitionFactor *= 0.8;
      optimizationFactor /= 0.7;
    } else if (transitionSpeed === 'gradual') {
      // Longer exploration and transition, shorter optimization
      explorationFactor *= 1.2;
      transitionFactor *= 1.2;
      optimizationFactor *= 0.8;
    }
    
    // Calculate days for each phase
    const totalDays = totalWeeks * 7;
    
    return {
      exploration: Math.round(totalDays * explorationFactor),
      transition: Math.round(totalDays * transitionFactor),
      adaptation: Math.round(totalDays * adaptationFactor),
      optimization: Math.round(totalDays * optimizationFactor)
    };
  }
}