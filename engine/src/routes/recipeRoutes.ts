import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController';
import { RecipeIntegrationService } from '../services/recipeIntegrationService';
import { MenuOptimizationService } from '../services/menuOptimizationService';
import { ProfileService } from '../services/profileService';

const router = Router();

// Initialize services
const recipeService = new RecipeIntegrationService(process.env.SPOONACULAR_API_KEY || '');
const menuService = new MenuOptimizationService(); // No arguments needed
const profileService = new ProfileService(); // No arguments needed

// Initialize controller
const recipeController = new RecipeController(recipeService, menuService, profileService);

// Define routes
router.get('/search', recipeController.searchRecipes);
router.get('/details/:id', recipeController.getRecipeDetails);
router.post('/enhance-menu', recipeController.enhanceMenuWithRecipes);
router.get('/suggest', recipeController.suggestRecipes);

export default router;