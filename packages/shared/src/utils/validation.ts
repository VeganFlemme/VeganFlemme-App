import { NutritionalInfo } from '../types';

export function validateNutritionData(nutrition: any): nutrition is NutritionalInfo {
  return (
    nutrition &&
    typeof nutrition.calories === 'number' &&
    typeof nutrition.protein === 'number' &&
    typeof nutrition.carbohydrates === 'number' &&
    typeof nutrition.fat === 'number'
  );
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}