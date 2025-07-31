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

/**
 * @route GET /api/nutrition/ciqual/search
 * @desc Search CIQUAL database for foods
 * @access Public
 */
router.get('/ciqual/search', nutritionController.searchCiqual);

/**
 * @route GET /api/nutrition/ciqual/food/:code
 * @desc Get CIQUAL food by code
 * @access Public
 */
router.get('/ciqual/food/:code', nutritionController.getCiqualFood);

/**
 * @route GET /api/nutrition/ciqual/vegan
 * @desc Get vegan foods from CIQUAL database
 * @access Public
 */
router.get('/ciqual/vegan', nutritionController.getCiqualVeganFoods);

/**
 * @route GET /api/nutrition/openfoodfacts/search
 * @desc Search OpenFoodFacts for products
 * @access Public
 */
router.get('/openfoodfacts/search', nutritionController.searchOpenFoodFacts);

/**
 * @route GET /api/nutrition/openfoodfacts/product/:barcode
 * @desc Get OpenFoodFacts product by barcode
 * @access Public
 */
router.get('/openfoodfacts/product/:barcode', nutritionController.getOpenFoodFactsProduct);

/**
 * @route GET /api/nutrition/openfoodfacts/category/:category
 * @desc Get OpenFoodFacts products by category
 * @access Public
 */
router.get('/openfoodfacts/category/:category', nutritionController.getOpenFoodFactsCategory);

/**
 * @route GET /api/nutrition/openfoodfacts/vegan
 * @desc Get vegan products from OpenFoodFacts
 * @access Public
 */
router.get('/openfoodfacts/vegan', nutritionController.getOpenFoodFactsVeganProducts);

/**
 * @route GET /api/nutrition/databases/status
 * @desc Get status and statistics for food databases
 * @access Public
 */
router.get('/databases/status', nutritionController.getFoodDatabaseStatus);

export { router as nutritionRouter };