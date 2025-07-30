import { Router } from 'express';
import { QualityController } from '../controllers/qualityController';

const router = Router();
const qualityController = new QualityController();

/**
 * Quality Scoring Routes
 * 
 * These routes provide food quality analysis including:
 * - Nutri-Score calculation
 * - Eco-Score calculation  
 * - NOVA processing classification
 * - Overall quality scoring
 * - Product comparisons
 */

// Main quality analysis endpoint
router.post('/analyze', qualityController.analyzeProduct);

// Specific score calculations
router.post('/nutri-score', qualityController.getNutriScore);
router.post('/eco-score', qualityController.getEcoScore);
router.post('/processing', qualityController.getProcessingScore);

// Product comparisons and filtering
router.post('/compare', qualityController.compareProducts);
router.post('/filter', qualityController.filterByQuality);

// Batch operations
router.post('/batch-analyze', qualityController.batchAnalyze);

// Recommendations
router.post('/recommendations', qualityController.getRecommendations);

export default router;