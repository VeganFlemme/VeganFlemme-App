import { Router } from 'express';
import { healthController } from '../controllers/healthController';

const router = Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', healthController.checkHealth);

/**
 * @route GET /api/health/detailed
 * @desc Detailed health check with system information
 * @access Public
 */
router.get('/detailed', healthController.detailedHealth);

export { router as healthRouter };