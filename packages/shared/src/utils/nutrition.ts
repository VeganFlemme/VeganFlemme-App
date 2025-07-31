import { NutritionalInfo, Meal } from '../types';

export function calculateNutritionalScore(nutrition: NutritionalInfo): number {
  // Calculate a nutritional score based on various factors
  const proteinScore = Math.min(nutrition.protein / 20, 1) * 25; // Up to 25 points for protein
  const fiberScore = Math.min(nutrition.fiber / 25, 1) * 20; // Up to 20 points for fiber
  const vitaminScore = calculateVitaminScore(nutrition) * 30; // Up to 30 points for vitamins
  const mineralScore = calculateMineralScore(nutrition) * 25; // Up to 25 points for minerals
  
  return Math.round(proteinScore + fiberScore + vitaminScore + mineralScore);
}

function calculateVitaminScore(nutrition: NutritionalInfo): number {
  let score = 0;
  let count = 0;
  
  // Check key vitamins
  if (nutrition.vitaminB12 !== undefined) {
    score += Math.min(nutrition.vitaminB12 / 2.4, 1); // RDA for B12
    count++;
  }
  
  return count > 0 ? score / count : 0.5; // Default score if no vitamin data
}

function calculateMineralScore(nutrition: NutritionalInfo): number {
  let score = 0;
  let count = 0;
  
  // Check key minerals
  if (nutrition.iron !== undefined) {
    score += Math.min(nutrition.iron / 18, 1); // RDA for iron
    count++;
  }
  if (nutrition.calcium !== undefined) {
    score += Math.min(nutrition.calcium / 1000, 1); // RDA for calcium
    count++;
  }
  
  return count > 0 ? score / count : 0.5; // Default score if no mineral data
}

export function getQualityScore(meal: Meal): {
  overallScore: number;
  nutritionScore: number;
  sustainabilityScore: number;
} {
  // Use existing nutrition data if available, otherwise calculate from recipe
  const nutritionScore = meal.nutrition ? 
    calculateNutritionalScoreFromRecord(meal.nutrition) : 
    50; // Default score
    
  const sustainabilityScore = calculateSustainabilityScore(meal);
  const overallScore = Math.round((nutritionScore * 0.7) + (sustainabilityScore * 0.3));
  
  return {
    overallScore,
    nutritionScore,
    sustainabilityScore
  };
}

function calculateNutritionalScoreFromRecord(nutrition: Record<string, number>): number {
  const proteinScore = Math.min((nutrition.protein || 0) / 20, 1) * 25;
  const fiberScore = Math.min((nutrition.fiber || 0) / 25, 1) * 20;
  const vitaminScore = 25; // Default vitamin score
  const mineralScore = 25; // Default mineral score
  
  return Math.round(proteinScore + fiberScore + vitaminScore + mineralScore);
}

function calculateSustainabilityScore(meal: Meal): number {
  // Basic sustainability score based on plant-based ingredients
  if (meal.ingredients && meal.ingredients.length > 0) {
    const veganIngredients = meal.ingredients.filter(ing => 
      ing.isVegan !== false // Assume vegan unless explicitly marked as not vegan
    );
    
    const veganRatio = veganIngredients.length / meal.ingredients.length;
    const localRatio = 0.8; // Assume 80% local ingredients (could be calculated from ingredient data)
    const seasonalRatio = 0.7; // Assume 70% seasonal ingredients (could be calculated)
    
    return Math.round((veganRatio * 60) + (localRatio * 25) + (seasonalRatio * 15));
  }
  
  // Default high sustainability score for vegan meals
  return 85;
}