import { Router } from 'express';
import { profileController } from '../controllers/profileController';

const router = Router();

/**
 * @route POST /api/profile
 * @desc Create or update user profile
 * @access Public
 */
router.post('/', profileController.createOrUpdateProfile);

/**
 * @route GET /api/profile/:id
 * @desc Get user profile
 * @access Public
 */
router.get('/:id', profileController.getProfile);

/**
 * @route PUT /api/profile/:id
 * @desc Update user profile
 * @access Public
 */
router.put('/:id', profileController.updateProfile);

/**
 * @route GET /api/profile/:id/dashboard
 * @desc Get user dashboard data
 * @access Public
 */
router.get('/:id/dashboard', profileController.getDashboard);

/**
 * @route POST /api/profile/:id/favorites
 * @desc Add recipe to favorites
 * @access Public
 */
router.post('/:id/favorites', profileController.addToFavorites);

/**
 * @route POST /api/profile/:id/meal-plans
 * @desc Create meal plan
 * @access Public
 */
router.post('/:id/meal-plans', profileController.createMealPlan);

/**
 * @route GET /api/profile/:id/meal-plans
 * @desc Get user meal plans
 * @access Public
 */
router.get('/:id/meal-plans', profileController.getMealPlans);

/**
 * @route POST /api/profile/:id/calculate-needs
 * @desc Calculate nutritional needs based on profile
 * @access Public
 */
router.post('/:id/calculate-needs', profileController.calculateNutritionalNeeds);

export { router as profileRouter };