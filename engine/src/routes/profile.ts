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
 * @route POST /api/profile/:id/calculate-needs
 * @desc Calculate nutritional needs based on profile
 * @access Public
 */
router.post('/:id/calculate-needs', profileController.calculateNutritionalNeeds);

export { router as profileRouter };