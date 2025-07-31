import axios from 'axios';
import { TransitionPlan, TransitionStage, TransitionGoal, TransitionTask, Resource } from '../types';

export const getTransitionPlan = async (userId: string): Promise<TransitionPlan> => {
  try {
    const response = await axios.get(`/api/users/${userId}/transition-plan`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transition plan:', error);
    throw new Error('Failed to fetch transition plan');
  }
};

export const createTransitionPlan = async (
  userId: string, 
  stage: TransitionStage
): Promise<TransitionPlan> => {
  try {
    const response = await axios.post(`/api/users/${userId}/transition-plan`, { stage });
    return response.data;
  } catch (error) {
    console.error('Error creating transition plan:', error);
    throw new Error('Failed to create transition plan');
  }
};

export const updateTransitionPlan = async (
  plan: TransitionPlan
): Promise<TransitionPlan> => {
  try {
    const response = await axios.put(`/api/transition-plans/${plan.id}`, plan);
    return response.data;
  } catch (error) {
    console.error(`Error updating transition plan ${plan.id}:`, error);
    throw new Error('Failed to update transition plan');
  }
};

export const addGoal = async (
  planId: string,
  goal: Omit<TransitionGoal, 'id'>
): Promise<TransitionGoal> => {
  try {
    const response = await axios.post(`/api/transition-plans/${planId}/goals`, goal);
    return response.data;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw new Error('Failed to add goal');
  }
};

export const updateGoal = async (
  goalId: string,
  updates: Partial<TransitionGoal>
): Promise<TransitionGoal> => {
  try {
    const response = await axios.put(`/api/transition-goals/${goalId}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating goal ${goalId}:`, error);
    throw new Error('Failed to update goal');
  }
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  try {
    await axios.delete(`/api/transition-goals/${goalId}`);
  } catch (error) {
    console.error(`Error deleting goal ${goalId}:`, error);
    throw new Error('Failed to delete goal');
  }
};

export const addTask = async (
  planId: string,
  task: Omit<TransitionTask, 'id'>
): Promise<TransitionTask> => {
  try {
    const response = await axios.post(`/api/transition-plans/${planId}/tasks`, task);
    return response.data;
  } catch (error) {
    console.error('Error adding task:', error);
    throw new Error('Failed to add task');
  }
};

export const updateTask = async (
  taskId: string,
  updates: Partial<TransitionTask>
): Promise<TransitionTask> => {
  try {
    const response = await axios.put(`/api/transition-tasks/${taskId}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw new Error('Failed to update task');
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await axios.delete(`/api/transition-tasks/${taskId}`);
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw new Error('Failed to delete task');
  }
};

export const getResources = async (
  stage: TransitionStage,
  type?: 'article' | 'video' | 'recipe' | 'book',
  limit?: number
): Promise<Resource[]> => {
  try {
    const response = await axios.get('/api/resources', {
      params: { stage, type, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw new Error('Failed to fetch resources');
  }
};

export const getTransitionStageRecommendations = async (
  stage: TransitionStage
): Promise<{
  recipes: string[];
  products: string[];
  resources: string[];
}> => {
  try {
    const response = await axios.get(`/api/transition-stages/${stage}/recommendations`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recommendations for stage ${stage}:`, error);
    throw new Error('Failed to fetch stage recommendations');
  }
};