import axios from 'axios';
import { User, DietaryPreference, TransitionStage } from '../types';

export const getUserProfile = async (userId: string): Promise<User> => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user profile ${userId}:`, error);
    throw new Error('Failed to fetch user profile');
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<User> => {
  try {
    const response = await axios.put(`/api/users/${userId}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating user profile ${userId}:`, error);
    throw new Error('Failed to update user profile');
  }
};

export const updateTransitionStage = async (
  userId: string,
  stage: TransitionStage
): Promise<User> => {
  try {
    const response = await axios.put(`/api/users/${userId}/transition-stage`, { stage });
    return response.data;
  } catch (error) {
    console.error(`Error updating transition stage for user ${userId}:`, error);
    throw new Error('Failed to update transition stage');
  }
};

export const updateDietaryPreferences = async (
  userId: string,
  preferences: DietaryPreference[]
): Promise<User> => {
  try {
    const response = await axios.put(`/api/users/${userId}/dietary-preferences`, { preferences });
    return response.data;
  } catch (error) {
    console.error(`Error updating dietary preferences for user ${userId}:`, error);
    throw new Error('Failed to update dietary preferences');
  }
};

export const updateAllergies = async (
  userId: string,
  allergies: string[]
): Promise<User> => {
  try {
    const response = await axios.put(`/api/users/${userId}/allergies`, { allergies });
    return response.data;
  } catch (error) {
    console.error(`Error updating allergies for user ${userId}:`, error);
    throw new Error('Failed to update allergies');
  }
};

export const toggleFavoriteRecipe = async (
  userId: string,
  recipeId: string
): Promise<void> => {
  try {
    await axios.post(`/api/users/${userId}/favorite-recipes/toggle`, { recipeId });
  } catch (error) {
    console.error(`Error toggling favorite recipe ${recipeId} for user ${userId}:`, error);
    throw new Error('Failed to toggle favorite recipe');
  }
};

export const getUserActivity = async (
  userId: string,
  limit: number = 10
): Promise<{
  type: 'recipe_added' | 'meal_planned' | 'shopping_completed' | 'transition_milestone';
  data: any;
  timestamp: string;
}[]> => {
  try {
    const response = await axios.get(`/api/users/${userId}/activity`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching activity for user ${userId}:`, error);
    throw new Error('Failed to fetch user activity');
  }
};