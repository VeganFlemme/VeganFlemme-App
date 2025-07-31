import axios from 'axios';
import { ShoppingList, ShoppingItem } from '../types';

export const getShoppingLists = async (userId: string): Promise<ShoppingList[]> => {
  try {
    const response = await axios.get(`/api/users/${userId}/shopping-lists`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    throw new Error('Failed to fetch shopping lists');
  }
};

export const getShoppingListById = async (listId: string): Promise<ShoppingList> => {
  try {
    const response = await axios.get(`/api/shopping-lists/${listId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching shopping list ${listId}:`, error);
    throw new Error('Failed to fetch shopping list');
  }
};

export const createShoppingList = async (
  list: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ShoppingList> => {
  try {
    const response = await axios.post('/api/shopping-lists', list);
    return response.data;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw new Error('Failed to create shopping list');
  }
};

export const updateShoppingList = async (list: ShoppingList): Promise<ShoppingList> => {
  try {
    const response = await axios.put(`/api/shopping-lists/${list.id}`, list);
    return response.data;
  } catch (error) {
    console.error(`Error updating shopping list ${list.id}:`, error);
    throw new Error('Failed to update shopping list');
  }
};

export const deleteShoppingList = async (listId: string): Promise<void> => {
  try {
    await axios.delete(`/api/shopping-lists/${listId}`);
  } catch (error) {
    console.error(`Error deleting shopping list ${listId}:`, error);
    throw new Error('Failed to delete shopping list');
  }
};

export const addItem = async (
  listId: string,
  item: Omit<ShoppingItem, 'id'>
): Promise<ShoppingItem> => {
  try {
    const response = await axios.post(`/api/shopping-lists/${listId}/items`, item);
    return response.data;
  } catch (error) {
    console.error('Error adding shopping item:', error);
    throw new Error('Failed to add shopping item');
  }
};

export const updateItem = async (
  itemId: string,
  updates: Partial<ShoppingItem>
): Promise<ShoppingItem> => {
  try {
    const response = await axios.put(`/api/shopping-items/${itemId}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating shopping item ${itemId}:`, error);
    throw new Error('Failed to update shopping item');
  }
};

export const deleteItem = async (itemId: string): Promise<void> => {
  try {
    await axios.delete(`/api/shopping-items/${itemId}`);
  } catch (error) {
    console.error(`Error deleting shopping item ${itemId}:`, error);
    throw new Error('Failed to delete shopping item');
  }
};

export const generateShoppingListFromMealPlan = async (
  mealPlanId: string,
  name?: string
): Promise<ShoppingList> => {
  try {
    const response = await axios.post('/api/shopping-lists/generate', {
      mealPlanId,
      name: name || `Shopping for meal plan`
    });
    return response.data;
  } catch (error) {
    console.error('Error generating shopping list:', error);
    throw new Error('Failed to generate shopping list');
  }
};