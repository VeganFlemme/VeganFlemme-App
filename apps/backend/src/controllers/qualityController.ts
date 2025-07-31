import { Request, Response } from 'express';
import { QualityScorerService, FoodProduct } from '../services/qualityScorerService';
import { logger } from '../utils/logger';

export class QualityController {
  private qualityScorerService: QualityScorerService;

  constructor() {
    this.qualityScorerService = new QualityScorerService();
  }

  /**
   * Calculate quality scores for a single product
   * POST /api/quality/analyze
   */
  public analyzeProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('POST /api/quality/analyze', { ip: req.ip });

      const productData: FoodProduct = req.body;

      // Validation des données requises
      if (!productData.id || !productData.name || !productData.nutrition) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: id, name, nutrition'
        });
        return;
      }

      // Valeurs par défaut pour les données manquantes
      const product: FoodProduct = {
        ...productData,
        environmental: productData.environmental || {
          carbonFootprint: 2.0,
          waterFootprint: 1000,
          landUse: 10,
          packaging: 'recyclable',
          transportDistance: 500,
          seasonality: 'year_round'
        },
        processing: productData.processing || {
          novaClass: 2,
          additives: [],
          preservatives: [],
          artificialFlavors: false,
          artificialColors: false,
          emulsifiers: []
        },
        labels: productData.labels || {
          organic: false,
          local: false,
          fairTrade: false,
          sustainable: false,
          artisanal: false,
          seasonal: false
        }
      };

      const qualityScores = this.qualityScorerService.calculateQualityScores(product);

      logger.info('Quality analysis completed', { 
        productId: product.id,
        nutriScore: qualityScores.nutriScore.grade,
        ecoScore: qualityScores.ecoScore.grade,
        overallScore: qualityScores.quality.overallScore
      });

      res.json({
        success: true,
        product: {
          id: product.id,
          name: product.name,
          category: product.category
        },
        scores: qualityScores,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Quality analysis failed:', error);
      res.status(500).json({
        success: false,
        error: 'Quality analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Compare two products
   * POST /api/quality/compare
   */
  public compareProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('POST /api/quality/compare', { ip: req.ip });

      const { product1, product2 } = req.body;

      if (!product1 || !product2) {
        res.status(400).json({
          success: false,
          error: 'Two products required for comparison'
        });
        return;
      }

      const comparison = this.qualityScorerService.compareProducts(product1, product2);

      logger.info('Product comparison completed', { 
        product1: product1.name,
        product2: product2.name,
        winner: comparison.comparison.betterNutrition
      });

      res.json({
        success: true,
        comparison,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product comparison failed:', error);
      res.status(500).json({
        success: false,
        error: 'Product comparison failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get Nutri-Score for a product
   * POST /api/quality/nutri-score
   */
  public getNutriScore = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('POST /api/quality/nutri-score', { ip: req.ip });

      const productData: FoodProduct = req.body;

      if (!productData.nutrition) {
        res.status(400).json({
          success: false,
          error: 'Nutrition data required'
        });
        return;
      }

      const qualityScores = this.qualityScorerService.calculateQualityScores(productData);

      res.json({
        success: true,
        productName: productData.name,
        nutriScore: qualityScores.nutriScore,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Nutri-Score calculation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Nutri-Score calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get Eco-Score for a product
   * POST /api/quality/eco-score
   */
  public getEcoScore = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('POST /api/quality/eco-score', { ip: req.ip });

      const productData: FoodProduct = req.body;

      if (!productData.environmental) {
        res.status(400).json({
          success: false,
          error: 'Environmental data required'
        });
        return;
      }

      const qualityScores = this.qualityScorerService.calculateQualityScores(productData);

      res.json({
        success: true,
        productName: productData.name,
        ecoScore: qualityScores.ecoScore,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Eco-Score calculation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Eco-Score calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get processing score (NOVA classification)
   * POST /api/quality/processing
   */
  public getProcessingScore = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('POST /api/quality/processing', { ip: req.ip });

      const productData: FoodProduct = req.body;

      if (!productData.processing) {
        res.status(400).json({
          success: false,
          error: 'Processing data required'
        });
        return;
      }

      const qualityScores = this.qualityScorerService.calculateQualityScores(productData);

      res.json({
        success: true,
        productName: productData.name,
        processing: qualityScores.processing,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Processing score calculation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Processing score calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Filter products by minimum quality score
   * POST /api/quality/filter
   */
  public filterByQuality = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('POST /api/quality/filter', { ip: req.ip });

      const { products, minScore = 60 } = req.body;

      if (!products || !Array.isArray(products)) {
        res.status(400).json({
          success: false,
          error: 'Array of products required'
        });
        return;
      }

      const filteredProducts = this.qualityScorerService.filterByQuality(products, minScore);

      logger.info('Products filtered by quality', { 
        totalProducts: products.length,
        filteredCount: filteredProducts.length,
        minScore
      });

      res.json({
        success: true,
        filter: { minScore },
        results: {
          total: products.length,
          filtered: filteredProducts.length,
          products: filteredProducts
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product filtering failed:', error);
      res.status(500).json({
        success: false,
        error: 'Product filtering failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get quality scores for multiple products (batch)
   * POST /api/quality/batch-analyze
   */
  public batchAnalyze = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('POST /api/quality/batch-analyze', { ip: req.ip });

      const { products } = req.body;

      if (!products || !Array.isArray(products)) {
        res.status(400).json({
          success: false,
          error: 'Array of products required'
        });
        return;
      }

      const results = products.map((product: FoodProduct) => {
        try {
          const scores = this.qualityScorerService.calculateQualityScores(product);
          return {
            success: true,
            product: {
              id: product.id,
              name: product.name
            },
            scores
          };
        } catch (error) {
          return {
            success: false,
            product: {
              id: product.id,
              name: product.name
            },
            error: error instanceof Error ? error.message : 'Analysis failed'
          };
        }
      });

      const successCount = results.filter(r => r.success).length;

      logger.info('Batch quality analysis completed', { 
        totalProducts: products.length,
        successCount,
        failureCount: products.length - successCount
      });

      res.json({
        success: true,
        summary: {
          total: products.length,
          successful: successCount,
          failed: products.length - successCount
        },
        results,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Batch quality analysis failed:', error);
      res.status(500).json({
        success: false,
        error: 'Batch quality analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get quality recommendations for a product
   * POST /api/quality/recommendations
   */
  public getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('POST /api/quality/recommendations', { ip: req.ip });

      const productData: FoodProduct = req.body;

      if (!productData.id || !productData.nutrition) {
        res.status(400).json({
          success: false,
          error: 'Product ID and nutrition data required'
        });
        return;
      }

      const qualityScores = this.qualityScorerService.calculateQualityScores(productData);

      res.json({
        success: true,
        product: {
          id: productData.id,
          name: productData.name
        },
        qualityScore: qualityScores.quality.overallScore,
        recommendations: qualityScores.quality.recommendations,
        warnings: qualityScores.quality.warnings,
        labels: qualityScores.quality.labels,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Quality recommendations failed:', error);
      res.status(500).json({
        success: false,
        error: 'Quality recommendations failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}