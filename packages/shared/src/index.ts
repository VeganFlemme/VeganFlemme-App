// Export shared types
export * from './types';

// Export shared utilities that are truly cross-platform
// Note: API client services are specific to frontend and should not be exported from shared
// Backend algorithm services are specific to backend and should not be exported from shared

// Only export truly shared utilities and types
export { createLogger } from './utils/logger';
export { validateNutritionData, isValidEmail } from './utils/validation';
export { calculateNutritionalScore, getQualityScore } from './utils/nutrition';