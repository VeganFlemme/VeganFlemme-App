import axios from 'axios';
import { Recipe } from '../types';

interface RecipeSearchParams {
  query?: string;
  tags?: string[];
  mealType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPrepTime?: number;
  ingredients?: string[];
  page?: number;
  limit?: number;
}

export const searchRecipes = async (params: RecipeSearchParams): Promise<Recipe[]> => {
  try {
    const response = await axios.get('/api/recipes', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw new Error('Failed to search recipes');
  }
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  try {
    const response = await axios.get(`/api/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    throw new Error('Failed to fetch recipe');
  }
};

export const getFavoriteRecipes = async (userId: string): Promise<Recipe[]> => {
  try {
    const response = await axios.get(`/api/users/${userId}/favorite-recipes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching favorite recipes:', error);
    throw new Error('Failed to fetch favorite recipes');
  }
};

export const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'reviewCount'>): Promise<Recipe> => {
  try {
    const response = await axios.post('/api/recipes', recipe);
    return response.data;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw new Error('Failed to add recipe');
  }
};

export const updateRecipe = async (id: string, recipe: Partial<Recipe>): Promise<Recipe> => {
  try {
    const response = await axios.put(`/api/recipes/${id}`, recipe);
    return response.data;
  } catch (error) {
    console.error(`Error updating recipe ${id}:`, error);
    throw new Error('Failed to update recipe');
  }
};

export const deleteRecipe = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/api/recipes/${id}`);
  } catch (error) {
    console.error(`Error deleting recipe ${id}:`, error);
    throw new Error('Failed to delete recipe');
  }
};

export const getRecipesByIngredients = async (ingredients: string[]): Promise<Recipe[]> => {
  try {
    const response = await axios.get('/api/recipes/by-ingredients', {
      params: { ingredients: ingredients.join(',') }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recipes by ingredients:', error);
    throw new Error('Failed to fetch recipes by ingredients');
  }
};

export const rateRecipe = async (recipeId: string, userId: string, rating: number): Promise<void> => {
  try {
    await axios.post(`/api/recipes/${recipeId}/ratings`, { userId, rating });
  } catch (error) {
    console.error(`Error rating recipe ${recipeId}:`, error);
    throw new Error('Failed to rate recipe');
  }
};