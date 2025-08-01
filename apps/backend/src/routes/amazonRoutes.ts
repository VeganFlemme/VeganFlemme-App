import { Router } from 'express';
import * as amazonController from '../controllers/amazonController';

const router = Router();

/**
 * @route POST /api/amazon/search
 * @desc Search Amazon products using PA API
 * @access Public
 */
router.post('/search', amazonController.searchProducts);

/**
 * @route POST /api/amazon/getItems
 * @desc Get Amazon products by ASIN
 * @access Public
 */
router.post('/getItems', amazonController.getItems);

/**
 * @route POST /api/amazon/recommendations
 * @desc Get product recommendations for ingredients
 * @access Public
 */
router.post('/recommendations', amazonController.getRecommendations);

export default router;