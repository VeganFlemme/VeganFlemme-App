import { Router } from 'express';
import { menuController } from '../controllers/menuController';

const router = Router();

/**
 * @route POST /api/menu/generate
 * @desc Generate a personalized vegan menu
 * @access Public
 */
router.post('/generate', menuController.generateMenu);

/**
 * @route GET /api/menu/recipes/:id
 * @desc Get detailed recipe information
 * @access Public
 */
router.get('/recipes/:id', menuController.getRecipe);

/**
 * @route POST /api/menu/swap-ingredient
 * @desc Get ingredient swap recommendations
 * @access Public
 */
router.post('/swap-ingredient', menuController.swapIngredient);

export { router as menuRouter };