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
 * @route GET /api/nutrition/search
 * @desc Unified search across all food databases
 * @access Public
 */
router.get('/search', nutritionController.searchFoods);

/**
 * @route GET /api/nutrition/barcode/:barcode
 * @desc Get food by barcode (unified service)
 * @access Public
 */
router.get('/barcode/:barcode', nutritionController.getFoodByBarcode);

/**
 * @route GET /api/nutrition/vegan-foods
 * @desc Get vegan foods from all databases
 * @access Public
 */
router.get('/vegan-foods', nutritionController.getVeganFoods);

/**
 * @route GET /api/nutrition/spoonacular/search
 * @desc Search Spoonacular for vegan recipes
 * @access Public
 */
router.get('/spoonacular/search', nutritionController.searchSpoonacularRecipes);

/**
 * @route GET /api/nutrition/spoonacular/recipe/:id
 * @desc Get Spoonacular recipe by ID
 * @access Public
 */
router.get('/spoonacular/recipe/:id', nutritionController.getSpoonacularRecipe);

/**
 * @route GET /api/nutrition/spoonacular/random
 * @desc Get random vegan recipes from Spoonacular
 * @access Public
 */
router.get('/spoonacular/random', nutritionController.getRandomVeganRecipes);

/**
 * @route POST /api/nutrition/tracking/:userId/food
 * @desc Add food entry for real-time tracking
 * @access Public
 */
router.post('/tracking/:userId/food', nutritionController.addFoodEntry);

/**
 * @route GET /api/nutrition/tracking/:userId/daily
 * @desc Get daily nutrition summary
 * @access Public
 */
router.get('/tracking/:userId/daily', nutritionController.getDailyNutritionSummary);

/**
 * @route GET /api/nutrition/tracking/:userId/weekly
 * @desc Get weekly nutrition summary
 * @access Public
 */
router.get('/tracking/:userId/weekly', nutritionController.getWeeklyNutritionSummary);

/**
 * @route GET /api/nutrition/tracking/:userId/alerts
 * @desc Get real-time nutritional alerts
 * @access Public
 */
router.get('/tracking/:userId/alerts', nutritionController.getNutritionalAlerts);

/**
 * @route PUT /api/nutrition/tracking/:userId/profile
 * @desc Update user nutritional profile
 * @access Public
 */
router.put('/tracking/:userId/profile', nutritionController.updateUserProfile);

/**
 * @route POST /api/nutrition/assess
 * @desc Assess nutritional adequacy against ANSES RNP
 * @access Public
 */
router.post('/assess', nutritionController.assessNutritionalAdequacy);

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