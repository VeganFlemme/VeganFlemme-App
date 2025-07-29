import { Router } from 'express';
import { nutritionController } from '../controllers/nutritionController';

const router = Router();

/**
 * @route GET /api/nutrition/rnp-anses
 * @desc Get ANSES RNP (Références Nutritionnelles pour la Population) data
 * @access Public
 */
router.get('/rnp-anses', nutritionController.getRNPData);

/**
 * @route POST /api/nutrition/analyze
 * @desc Analyze nutritional content of meals/ingredients
 * @access Public
 */
router.post('/analyze', nutritionController.analyzeNutrition);

/**
 * @route GET /api/nutrition/daily-tracking/:profileId
 * @desc Get daily nutrition tracking for a profile
 * @access Public
 */
router.get('/daily-tracking/:profileId', nutritionController.getDailyTracking);

/**
 * @route GET /api/nutrition/weekly-evolution/:profileId
 * @desc Get weekly nutrition evolution for charts
 * @access Public
 */
router.get('/weekly-evolution/:profileId', nutritionController.getWeeklyEvolution);

export { router as nutritionRouter };