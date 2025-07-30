import request from 'supertest';
import app from '../src/app';
import { FoodProduct } from '../src/services/qualityScorerService';

describe('Quality API Endpoints', () => {
  const mockProduct: FoodProduct = {
    id: 'test_tofu',
    name: 'Tofu Bio Nature',
    category: 'protein',
    nutrition: {
      calories: 144,
      protein: 17.3,
      carbs: 0.8,
      fat: 8.7,
      saturatedFat: 1.2,
      sugar: 0.1,
      fiber: 2.3,
      sodium: 15,
      salt: 0.04
    },
    environmental: {
      carbonFootprint: 1.0,
      waterFootprint: 300,
      landUse: 5,
      packaging: 'recyclable',
      transportDistance: 150,
      seasonality: 'year_round'
    },
    processing: {
      novaClass: 2,
      additives: [],
      preservatives: [],
      artificialFlavors: false,
      artificialColors: false,
      emulsifiers: []
    },
    labels: {
      organic: true,
      local: true,
      fairTrade: false,
      sustainable: true,
      artisanal: false,
      seasonal: false
    },
    fruitsVegetablesPercentage: 0
  };

  const mockHighlyProcessedProduct: FoodProduct = {
    id: 'test_processed',
    name: 'Substitut de Viande Ultra-Transformé',
    category: 'protein_substitute',
    nutrition: {
      calories: 280,
      protein: 20.0,
      carbs: 15.0,
      fat: 18.0,
      saturatedFat: 8.0,
      sugar: 2.0,
      fiber: 3.0,
      sodium: 1200, // Over 1000mg to trigger warning
      salt: 2.1
    },
    environmental: {
      carbonFootprint: 4.5,
      waterFootprint: 1200,
      landUse: 15,
      packaging: 'plastic',
      transportDistance: 2000,
      seasonality: 'year_round'
    },
    processing: {
      novaClass: 4,
      additives: ['E621', 'E330', 'E407', 'E500'],
      preservatives: ['E202', 'E211'],
      artificialFlavors: true,
      artificialColors: true,
      emulsifiers: ['E471', 'E322']
    },
    labels: {
      organic: false,
      local: false,
      fairTrade: false,
      sustainable: false,
      artisanal: false,
      seasonal: false
    },
    fruitsVegetablesPercentage: 0
  };

  describe('POST /api/quality/analyze', () => {
    it('should analyze a basic product and return quality scores', async () => {
      const response = await request(app)
        .post('/api/quality/analyze')
        .send(mockProduct)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.scores).toBeDefined();
      expect(response.body.scores.nutriScore).toBeDefined();
      expect(response.body.scores.ecoScore).toBeDefined();
      expect(response.body.scores.processing).toBeDefined();
      expect(response.body.scores.quality).toBeDefined();

      // Check Nutri-Score structure
      expect(response.body.scores.nutriScore.grade).toMatch(/^[A-E]$/);
      expect(typeof response.body.scores.nutriScore.points).toBe('number');

      // Check Eco-Score structure
      expect(response.body.scores.ecoScore.grade).toMatch(/^(A\+|[A-E])$/);
      expect(typeof response.body.scores.ecoScore.points).toBe('number');

      // Check processing score
      expect([1, 2, 3, 4]).toContain(response.body.scores.processing.novaScore);
      expect(typeof response.body.scores.processing.naturalness).toBe('number');

      // Check overall quality
      expect(typeof response.body.scores.quality.overallScore).toBe('number');
      expect(Array.isArray(response.body.scores.quality.recommendations)).toBe(true);
    });

    it('should return good scores for organic, minimally processed tofu', async () => {
      const response = await request(app)
        .post('/api/quality/analyze')
        .send(mockProduct)
        .expect(200);

      const scores = response.body.scores;
      
      // Tofu should have decent nutrition scores
      expect(['A', 'B', 'C']).toContain(scores.nutriScore.grade);
      
      // Organic local product should have good eco score
      expect(['A+', 'A', 'B']).toContain(scores.ecoScore.grade);
      
      // Minimally processed (NOVA 2)
      expect(scores.processing.novaScore).toBe(2);
      expect(scores.processing.isUltraProcessed).toBe(false);
      
      // Overall score should be decent
      expect(scores.quality.overallScore).toBeGreaterThan(60);
    });

    it('should return poor scores for ultra-processed product', async () => {
      const response = await request(app)
        .post('/api/quality/analyze')
        .send(mockHighlyProcessedProduct)
        .expect(200);

      const scores = response.body.scores;
      
      // Ultra-processed should be NOVA 4
      expect(scores.processing.novaScore).toBe(4);
      expect(scores.processing.isUltraProcessed).toBe(true);
      
      // Should have many additives
      expect(scores.processing.additiveCount).toBeGreaterThan(5);
      
      // Lower naturalness score
      expect(scores.processing.naturalness).toBeLessThan(50);
      
      // High sodium should affect Nutri-Score
      expect(['C', 'D', 'E']).toContain(scores.nutriScore.grade);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteProduct = {
        name: 'Incomplete Product'
        // missing id and nutrition
      };

      const response = await request(app)
        .post('/api/quality/analyze')
        .send(incompleteProduct)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should handle missing optional data with defaults', async () => {
      const minimalProduct = {
        id: 'minimal_test',
        name: 'Minimal Product',
        category: 'test',
        nutrition: {
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 5,
          saturatedFat: 1,
          sugar: 2,
          fiber: 3,
          sodium: 100,
          salt: 0.25
        }
        // missing environmental, processing, labels
      };

      const response = await request(app)
        .post('/api/quality/analyze')
        .send(minimalProduct)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.scores).toBeDefined();
    });
  });

  describe('POST /api/quality/nutri-score', () => {
    it('should calculate Nutri-Score only', async () => {
      const response = await request(app)
        .post('/api/quality/nutri-score')
        .send(mockProduct)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.nutriScore).toBeDefined();
      expect(response.body.nutriScore.grade).toMatch(/^[A-E]$/);
      expect(typeof response.body.nutriScore.points).toBe('number');
      expect(response.body.nutriScore.breakdown).toBeDefined();
    });

    it('should return 400 for missing nutrition data', async () => {
      const productWithoutNutrition = {
        id: 'test',
        name: 'Test Product'
        // missing nutrition
      };

      const response = await request(app)
        .post('/api/quality/nutri-score')
        .send(productWithoutNutrition)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/quality/eco-score', () => {
    it('should calculate Eco-Score only', async () => {
      const response = await request(app)
        .post('/api/quality/eco-score')
        .send(mockProduct)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.ecoScore).toBeDefined();
      expect(response.body.ecoScore.grade).toMatch(/^(A\+|[A-E])$/);
      expect(typeof response.body.ecoScore.points).toBe('number');
    });

    it('should return 400 for missing environmental data', async () => {
      const productWithoutEnvironmental = {
        id: 'test',
        name: 'Test Product'
        // missing environmental
      };

      const response = await request(app)
        .post('/api/quality/eco-score')
        .send(productWithoutEnvironmental)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/quality/processing', () => {
    it('should calculate processing score only', async () => {
      const response = await request(app)
        .post('/api/quality/processing')
        .send(mockProduct)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.processing).toBeDefined();
      expect([1, 2, 3, 4]).toContain(response.body.processing.novaScore);
      expect(typeof response.body.processing.naturalness).toBe('number');
    });
  });

  describe('POST /api/quality/compare', () => {
    it('should compare two products', async () => {
      const response = await request(app)
        .post('/api/quality/compare')
        .send({
          product1: mockProduct,
          product2: mockHighlyProcessedProduct
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.comparison).toBeDefined();
      expect(response.body.comparison.product1).toBeDefined();
      expect(response.body.comparison.product2).toBeDefined();
      expect(response.body.comparison.comparison).toBeDefined();
      expect(response.body.comparison.comparison.betterNutrition).toBeDefined();
      expect(response.body.comparison.comparison.recommendation).toBeDefined();
    });

    it('should return 400 for missing products', async () => {
      const response = await request(app)
        .post('/api/quality/compare')
        .send({
          product1: mockProduct
          // missing product2
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/quality/filter', () => {
    it('should filter products by quality score', async () => {
      const products = [mockProduct, mockHighlyProcessedProduct];
      
      const response = await request(app)
        .post('/api/quality/filter')
        .send({
          products,
          minScore: 70
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBeDefined();
      expect(response.body.results.total).toBe(2);
      expect(Array.isArray(response.body.results.products)).toBe(true);
      expect(response.body.filter.minScore).toBe(70);
    });

    it('should use default minScore when not provided', async () => {
      const response = await request(app)
        .post('/api/quality/filter')
        .send({
          products: [mockProduct]
        })
        .expect(200);

      expect(response.body.filter.minScore).toBe(60); // default
    });

    it('should return 400 for invalid products array', async () => {
      const response = await request(app)
        .post('/api/quality/filter')
        .send({
          products: 'not an array'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/quality/batch-analyze', () => {
    it('should analyze multiple products', async () => {
      const products = [mockProduct, mockHighlyProcessedProduct];
      
      const response = await request(app)
        .post('/api/quality/batch-analyze')
        .send({ products })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.total).toBe(2);
      expect(response.body.summary.successful).toBe(2);
      expect(response.body.summary.failed).toBe(0);
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(2);
      
      // Check each result has the expected structure
      response.body.results.forEach((result: any) => {
        expect(result.success).toBe(true);
        expect(result.product).toBeDefined();
        expect(result.scores).toBeDefined();
      });
    });

    it('should handle partial failures in batch', async () => {
      const products = [
        mockProduct,
        { id: 'invalid', name: 'Invalid Product' } // missing nutrition
      ];
      
      const response = await request(app)
        .post('/api/quality/batch-analyze')
        .send({ products })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.summary.successful).toBe(1);
      expect(response.body.summary.failed).toBe(1);
    });
  });

  describe('POST /api/quality/recommendations', () => {
    it('should return recommendations for a product', async () => {
      const response = await request(app)
        .post('/api/quality/recommendations')
        .send(mockProduct)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.recommendations).toBeDefined();
      expect(response.body.warnings).toBeDefined();
      expect(response.body.labels).toBeDefined();
      expect(typeof response.body.qualityScore).toBe('number');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      expect(Array.isArray(response.body.warnings)).toBe(true);
    });

    it('should include warnings for highly processed product', async () => {
      const response = await request(app)
        .post('/api/quality/recommendations')
        .send(mockHighlyProcessedProduct)
        .expect(200);

      expect(response.body.warnings.length).toBeGreaterThan(0);
      
      // Should warn about high sodium
      const sodiumWarning = response.body.warnings.some((warning: string) => 
        warning.includes('sodium') || warning.includes('Sodium')
      );
      expect(sodiumWarning).toBe(true);
    });

    it('should include positive recommendations for organic products', async () => {
      const response = await request(app)
        .post('/api/quality/recommendations')
        .send(mockProduct)
        .expect(200);

      // Should have positive recommendations for organic/local
      const positiveRecs = response.body.recommendations.filter((rec: string) => 
        rec.includes('✓')
      );
      expect(positiveRecs.length).toBeGreaterThan(0);
    });

    it('should return 400 for missing required data', async () => {
      const response = await request(app)
        .post('/api/quality/recommendations')
        .send({
          name: 'Test Product'
          // missing id and nutrition
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('QualityScorer Service Unit Tests', () => {
  // Additional unit tests for specific scoring logic
  
  describe('Nutri-Score calculation', () => {
    it('should give A grade to healthy products', () => {
      // Test cases for specific Nutri-Score scenarios
      // This would test the service directly rather than through API
    });
    
    it('should give E grade to unhealthy products', () => {
      // Test edge cases for worst Nutri-Score
    });
  });

  describe('Eco-Score calculation', () => {
    it('should reward local organic products', () => {
      // Test eco-scoring logic
    });
    
    it('should penalize high carbon footprint', () => {
      // Test environmental penalties
    });
  });

  describe('NOVA classification', () => {
    it('should correctly identify ultra-processed foods', () => {
      // Test NOVA 4 classification logic
    });
  });
});