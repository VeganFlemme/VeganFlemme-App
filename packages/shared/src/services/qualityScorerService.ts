// Stub implementation for quality scorer service
export function getQualityScore(meal: any): any {
  return {
    overallScore: Math.random() * 100,
    nutritionScore: Math.random() * 100,
    sustainabilityScore: Math.random() * 100
  };
}