import axios from 'axios';
import { MealPlan, Meal } from '../types';

export const getMealPlans = async (userId: string): Promise<MealPlan[]> => {
  try {
    const response = await axios.get(`/api/users/${userId}/meal-plans`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    throw new Error('Failed to fetch meal plans');
  }
};

export const getMealPlanById = async (planId: string): Promise<MealPlan> => {
  try {
    const response = await axios.get(`/api/meal-plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching meal plan ${planId}:`, error);
    throw new Error('Failed to fetch meal plan');
  }
};

export const createMealPlan = async (
  plan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MealPlan> => {
  try {
    const response = await axios.post('/api/meal-plans', plan);
    return response.data;
  } catch (error) {
    console.error('Error creating meal plan:', error);
    throw new Error('Failed to create meal plan');
  }
};

export const updateMealPlan = async (plan: MealPlan): Promise<MealPlan> => {
  try {
    const response = await axios.put(`/api/meal-plans/${plan.id}`, plan);
    return response.data;
  } catch (error) {
    console.error(`Error updating meal plan ${plan.id}:`, error);
    throw new Error('Failed to update meal plan');
  }
};

export const deleteMealPlan = async (planId: string): Promise<void> => {
  try {
    await axios.delete(`/api/meal-plans/${planId}`);
  } catch (error) {
    console.error(`Error deleting meal plan ${planId}:`, error);
    throw new Error('Failed to delete meal plan');
  }
};

export const addMeal = async (
  planId: string,
  meal: Omit<Meal, 'id'>
): Promise<Meal> => {
  try {
    const response = await axios.post(`/api/meal-plans/${planId}/meals`, meal);
    return response.data;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw new Error('Failed to add meal');
  }
};

export const updateMeal = async (
  mealId: string,
  updates: Partial<Meal>
): Promise<Meal> => {
  try {
    const response = await axios.put(`/api/meals/${mealId}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating meal ${mealId}:`, error);
    throw new Error('Failed to update meal');
  }
};

export const deleteMeal = async (mealId: string): Promise<void> => {
  try {
    await axios.delete(`/api/meals/${mealId}`);
  } catch (error) {
    console.error(`Error deleting meal ${mealId}:`, error);
    throw new Error('Failed to delete meal');
  }
};

export const generateMealPlanSuggestion = async (
  userId: string,
  preferences: {
    startDate: Date;
    endDate: Date;
    mealsPerDay: number;
    preferences: string[];
    excludeIngredients: string[];
  }
): Promise<MealPlan> => {
  try {
    const response = await axios.post(`/api/users/${userId}/meal-plan-suggestions`, preferences);
    return response.data;
  } catch (error) {
    console.error('Error generating meal plan suggestion:', error);
    throw new Error('Failed to generate meal plan suggestion');
  }
};