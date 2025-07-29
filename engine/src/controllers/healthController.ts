import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export const healthController = {
  /**
   * Basic health check
   */
  checkHealth: (req: Request, res: Response) => {
    try {
      res.status(200).json({
        status: 'ok',
        message: 'VeganFlemme Engine is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health check failed'
      });
    }
  },

  /**
   * Detailed health check with system information
   */
  detailedHealth: (req: Request, res: Response) => {
    try {
      const memoryUsage = process.memoryUsage();
      
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: {
          name: 'VeganFlemme Engine',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version
        },
        system: {
          uptime: process.uptime(),
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024),
            unit: 'MB'
          },
          cpu: {
            platform: process.platform,
            arch: process.arch
          }
        },
        features: {
          menuGeneration: 'active',
          nutritionTracking: 'active',
          swapRecommendations: 'active',
          cartBuilder: 'active'
        }
      });
    } catch (error) {
      logger.error('Detailed health check failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Detailed health check failed'
      });
    }
  }
};