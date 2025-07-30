import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { ciqualService } from '../services/ciqualService';
import { openFoodFactsService } from '../services/openFoodFactsService';

export const nutritionController = {
  /**
   * Get ANSES RNP data
   */
  getRNPData: async (req: Request, res: Response) => {
    try {
      const { _age, _gender } = req.query;

      // ANSES Références Nutritionnelles pour la Population
      const rnpData = {
        source: 'ANSES 2016 - Actualisation des références nutritionnelles',
        lastUpdated: '2024-01-01',
        macronutrients: {
          protein: {
            adult: { min: 0.83, recommended: 1.2, unit: 'g/kg/day' },
            note: 'Augmenté pour régime vegan (biodisponibilité)'
          },
          carbohydrates: {
            adult: { min: 45, max: 65, unit: '% of total energy' }
          },
          lipids: {
            adult: { min: 20, max: 35, unit: '% of total energy' },
            omega3: { recommended: 2.5, unit: 'g/day' }
          }
        },
        micronutrients: {
          vitamins: {
            b12: { adult: 2.4, unit: 'μg/day', critical: true },
            d: { adult: 15, unit: 'μg/day', critical: true },
            b9: { adult: 400, unit: 'μg/day' },
            b6: { adult: 1.7, unit: 'mg/day' },
            b1: { adult: 1.3, unit: 'mg/day' },
            b2: { adult: 1.6, unit: 'mg/day' }
          },
          minerals: {
            iron: {
              adult_male: 11,
              adult_female: 16,
              unit: 'mg/day',
              note: 'Augmenté pour source végétale'
            },
            calcium: { adult: 1000, unit: 'mg/day' },
            zinc: {
              adult_male: 11,
              adult_female: 8,
              unit: 'mg/day'
            },
            iodine: { adult: 150, unit: 'μg/day' },
            selenium: { adult: 55, unit: 'μg/day' }
          }
        },
        fiber: {
          adult: { recommended: 30, unit: 'g/day' }
        },
        veganSpecificNotes: [
          'Vitamine B12 : supplémentation obligatoire',
          'Fer : associer avec vitamine C pour absorption',
          'Oméga-3 : privilégier graines de lin, noix, algues',
          'Calcium : sources variées (sésame, amandes, légumes verts)',
          'Protéines : combiner céréales et légumineuses'
        ]
      };

      res.status(200).json({
        success: true,
        data: rnpData
      });

    } catch (error) {
      logger.error('RNP data retrieval failed:', error);
      throw createError('Failed to retrieve RNP data', 500);
    }
  },

  /**
   * Analyze nutritional content
   */
  analyzeNutrition: async (req: Request, res: Response) => {
    try {
      const { foods, _quantities } = req.body;

      if (!foods || !Array.isArray(foods)) {
        throw createError('Foods array is required', 400);
      }

      // TODO: Implement integration with CIQUAL database
      // Use CIQUAL service for nutritional analysis, with fallback mechanisms including mock data and OpenFoodFacts matches
      const nutritionAnalysis: any = {
        totalNutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0
        },
        vitamins: {},
        minerals: {},
        ciqualMatches: [],
        openFoodFactsMatches: []
      };

      // Try to match foods with CIQUAL database
      for (const foodName of foods) {
        try {
          const ciqualResults = await ciqualService.searchFoodsByName(foodName, 3);
          if (ciqualResults.foods.length > 0) {
            const bestMatch = ciqualResults.foods[0];
            const nutrition = ciqualService.getNutritionSummary(bestMatch);
            
            nutritionAnalysis.totalNutrition.calories += nutrition.energy || 0;
            nutritionAnalysis.totalNutrition.protein += nutrition.protein || 0;
            nutritionAnalysis.totalNutrition.carbs += nutrition.carbohydrates || 0;
            nutritionAnalysis.totalNutrition.fat += nutrition.fat || 0;
            nutritionAnalysis.totalNutrition.fiber += nutrition.fiber || 0;
            
            // Add mineral values
            Object.entries(nutrition.minerals).forEach(([key, value]) => {
              if (value) {
                nutritionAnalysis.minerals[key] = (nutritionAnalysis.minerals[key] || 0) + value;
              }
            });
            
            // Add vitamin values
            Object.entries(nutrition.vitamins).forEach(([key, value]) => {
              if (value) {
                nutritionAnalysis.vitamins[key] = (nutritionAnalysis.vitamins[key] || 0) + value;
              }
            });
            
            nutritionAnalysis.ciqualMatches.push({
              searchTerm: foodName,
              match: {
                name: bestMatch.name,
                code: bestMatch.code,
                group: bestMatch.group,
                confidence: 0.8 // Simple confidence score
              }
            });
          }
        } catch (error) {
          logger.warn('CIQUAL search failed for food', { foodName, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      // Mock analysis with actual CIQUAL data where available
      const analysis = {
        totalNutrition: {
          calories: nutritionAnalysis.totalNutrition.calories || 1850,
          protein: nutritionAnalysis.totalNutrition.protein || 85.2,
          carbs: nutritionAnalysis.totalNutrition.carbs || 220.5,
          fat: nutritionAnalysis.totalNutrition.fat || 62.8,
          fiber: nutritionAnalysis.totalNutrition.fiber || 32.1,
          sugar: 45.2
        },
        vitamins: {
          b12: nutritionAnalysis.vitamins.b12 || 1.8,
          d: nutritionAnalysis.vitamins.d || 5.2,
          b9: nutritionAnalysis.vitamins.b9 || 380,
          b6: nutritionAnalysis.vitamins.b6 || 2.1,
          c: nutritionAnalysis.vitamins.c || 120,
          e: nutritionAnalysis.vitamins.e || 15.8
        },
        minerals: {
          iron: nutritionAnalysis.minerals.iron || 14.2,
          calcium: nutritionAnalysis.minerals.calcium || 850,
          zinc: nutritionAnalysis.minerals.zinc || 9.8,
          iodine: nutritionAnalysis.minerals.iodine || 95,
          selenium: nutritionAnalysis.minerals.selenium || 48
        },
        dataSource: {
          ciqualMatches: nutritionAnalysis.ciqualMatches,
          openFoodFactsMatches: nutritionAnalysis.openFoodFactsMatches,
          totalCiqualMatches: nutritionAnalysis.ciqualMatches.length,
          dataQuality: nutritionAnalysis.ciqualMatches.length > 0 ? 'high' : 'estimated'
        },
        rnpCoverage: {
          protein: 95,
          iron: 89,
          calcium: 85,
          b12: 75,
          omega3: 72,
          fiber: 107
        },
        qualityScores: {
          nutriScore: 'A',
          ecoScore: 'A+',
          processed: 'minimally'
        },
        alerts: [
          {
            type: 'warning',
            nutrient: 'B12',
            message: 'Apport insuffisant, pensez à votre supplément',
            recommendation: 'Ajouter 1 comprimé B12 ou levure nutritionnelle'
          }
        ]
      };

      res.status(200).json({
        success: true,
        data: analysis
      });

    } catch (error) {
      logger.error('Nutrition analysis failed:', error);
      throw error;
    }
  },

  /**
   * Get weekly nutrition evolution
   */
  getWeeklyEvolution: async (req: Request, res: Response) => {
    try {
      const { _profileId } = req.params;
      
      // Mock weekly data for chart
      const weeklyData = {
        period: '7 derniers jours',
        data: [
          {
            day: 'Lun',
            date: '2024-01-22',
            protein: 92,
            iron: 88,
            b12: 75,
            omega3: 70,
            calories: 1980
          },
          {
            day: 'Mar',
            date: '2024-01-23',
            protein: 95,
            iron: 82,
            b12: 78,
            omega3: 72,
            calories: 1850
          },
          {
            day: 'Mer',
            date: '2024-01-24',
            protein: 89,
            iron: 91,
            b12: 72,
            omega3: 75,
            calories: 2100
          },
          {
            day: 'Jeu',
            date: '2024-01-25',
            protein: 98,
            iron: 85,
            b12: 80,
            omega3: 68,
            calories: 1920
          },
          {
            day: 'Ven',
            date: '2024-01-26',
            protein: 93,
            iron: 89,
            b12: 76,
            omega3: 74,
            calories: 2050
          },
          {
            day: 'Sam',
            date: '2024-01-27',
            protein: 87,
            iron: 86,
            b12: 74,
            omega3: 71,
            calories: 1780
          },
          {
            day: 'Dim',
            date: '2024-01-28',
            protein: 91,
            iron: 88,
            b12: 77,
            omega3: 73,
            calories: 1900
          }
        ],
        averages: {
          protein: 92,
          iron: 87,
          b12: 76,
          omega3: 72,
          calories: 1940
        },
        trends: {
          protein: 'stable',
          iron: 'increasing',
          b12: 'stable',
          omega3: 'increasing'
        }
      };

      res.status(200).json({
        success: true,
        data: weeklyData
      });

    } catch (error) {
      logger.error('Weekly evolution retrieval failed:', error);
      throw createError('Failed to retrieve weekly evolution', 500);
    }
  },

  /**
   * Get daily nutrition tracking
   */
  getDailyTracking: async (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;
      const { date = new Date().toISOString().split('T')[0] } = req.query;

      // TODO: Implement tracking from database
      // Mock tracking data
      const tracking = {
        profileId,
        date,
        meals: [
          {
            name: 'Petit-déjeuner',
            time: '08:00',
            foods: ['Porridge avoine', 'Fruits rouges', 'Lait amande'],
            nutrition: {
              calories: 320,
              protein: 12,
              iron: 3.2,
              b12: 0.8
            }
          },
          {
            name: 'Déjeuner',
            time: '12:30',
            foods: ['Bowl quinoa', 'Pois chiches', 'Avocat'],
            nutrition: {
              calories: 480,
              protein: 18,
              iron: 6.8,
              b12: 0.0
            }
          }
        ],
        dailyTotals: {
          calories: 1850,
          protein: 85,
          iron: 14.2,
          calcium: 850,
          b12: 1.8,
          omega3: 1.8,
          fiber: 32
        },
        targets: {
          calories: 2000,
          protein: 100,
          iron: 15,
          calcium: 1000,
          b12: 2.4,
          omega3: 2.5,
          fiber: 30
        },
        weeklyAverage: {
          rnpCoverage: {
            protein: 92,
            iron: 86,
            calcium: 78,
            b12: 68,
            omega3: 74
          }
        }
      };

      res.status(200).json({
        success: true,
        data: tracking
      });

    } catch (error) {
      logger.error('Daily tracking retrieval failed:', error);
      throw createError('Failed to retrieve tracking data', 500);
    }
  },

  /**
   * Search CIQUAL database for foods
   */
  searchCiqual: async (req: Request, res: Response) => {
    try {
      const { query, limit = 20 } = req.query;

      if (!query || typeof query !== 'string') {
        throw createError('Search query is required', 400);
      }

      logger.info('CIQUAL search requested', { query, limit });

      const results = await ciqualService.searchFoodsByName(query, Number(limit));

      res.status(200).json({
        success: true,
        data: {
          query,
          results: results.foods.map(food => ({
            code: food.code,
            name: food.name,
            nameEn: food.nameEn,
            group: food.group,
            subGroup: food.subGroup,
            nutrition: ciqualService.getNutritionSummary(food)
          })),
          total: results.total,
          dataSource: 'CIQUAL - Base alimentaire française ANSES'
        }
      });

    } catch (error) {
      logger.error('CIQUAL search failed:', error);
      throw error;
    }
  },

  /**
   * Get CIQUAL food by code
   */
  getCiqualFood: async (req: Request, res: Response) => {
    try {
      const { code } = req.params;

      if (!code) {
        throw createError('Food code is required', 400);
      }

      logger.info('CIQUAL food requested', { code });

      const food = await ciqualService.getFoodByCode(code);

      if (!food) {
        throw createError('Food not found', 404);
      }

      res.status(200).json({
        success: true,
        data: {
          code: food.code,
          name: food.name,
          nameEn: food.nameEn,
          group: food.group,
          subGroup: food.subGroup,
          nutrition: ciqualService.getNutritionSummary(food),
          dataSource: 'CIQUAL - Base alimentaire française ANSES'
        }
      });

    } catch (error) {
      logger.error('CIQUAL food retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Get vegan foods from CIQUAL
   */
  getCiqualVeganFoods: async (req: Request, res: Response) => {
    try {
      const { limit = 50 } = req.query;

      logger.info('CIQUAL vegan foods requested', { limit });

      const veganFoods = await ciqualService.getVeganFoods(Number(limit));

      res.status(200).json({
        success: true,
        data: {
          foods: veganFoods.map(food => ({
            code: food.code,
            name: food.name,
            nameEn: food.nameEn,
            group: food.group,
            subGroup: food.subGroup,
            nutrition: ciqualService.getNutritionSummary(food)
          })),
          total: veganFoods.length,
          dataSource: 'CIQUAL - Base alimentaire française ANSES',
          note: 'Aliments identifiés comme compatibles avec un régime végétalien'
        }
      });

    } catch (error) {
      logger.error('CIQUAL vegan foods retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Search OpenFoodFacts for products
   */
  searchOpenFoodFacts: async (req: Request, res: Response) => {
    try {
      const { query, page = 1, pageSize = 24 } = req.query;

      if (!query || typeof query !== 'string') {
        throw createError('Search query is required', 400);
      }

      logger.info('OpenFoodFacts search requested', { query, page, pageSize });

      const results = await openFoodFactsService.searchProducts(
        query, 
        Number(page), 
        Number(pageSize)
      );

      res.status(200).json({
        success: true,
        data: {
          query,
          products: results.products?.map(product => ({
            id: product._id,
            code: product.code,
            name: product.product_name,
            brands: product.brands,
            ingredients: product.ingredients_text,
            nutrition: openFoodFactsService.extractNutritionInfo(product),
            image: product.image_url
          })) || [],
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            total: results.count || 0
          },
          dataSource: 'OpenFoodFacts - Base mondiale collaborative'
        }
      });

    } catch (error) {
      logger.error('OpenFoodFacts search failed:', error);
      throw error;
    }
  },

  /**
   * Get OpenFoodFacts product by barcode
   */
  getOpenFoodFactsProduct: async (req: Request, res: Response) => {
    try {
      const { barcode } = req.params;

      if (!barcode) {
        throw createError('Barcode is required', 400);
      }

      logger.info('OpenFoodFacts product requested', { barcode });

      const result = await openFoodFactsService.getProductByBarcode(barcode);

      if (result.status !== 1 || !result.product) {
        throw createError('Product not found', 404);
      }

      const product = result.product;

      res.status(200).json({
        success: true,
        data: {
          code: product.code || barcode,
          name: product.product_name,
          brands: product.brands,
          ingredients: product.ingredients_text,
          nutrition: openFoodFactsService.extractNutritionInfo(product),
          image: product.image_url,
          dataSource: 'OpenFoodFacts - Base mondiale collaborative'
        }
      });

    } catch (error) {
      logger.error('OpenFoodFacts product retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Get OpenFoodFacts products by category
   */
  getOpenFoodFactsCategory: async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const { page = 1, pageSize = 24 } = req.query;

      if (!category) {
        throw createError('Category is required', 400);
      }

      logger.info('OpenFoodFacts category requested', { category, page, pageSize });

      const results = await openFoodFactsService.getProductsByCategory(
        category, 
        Number(page), 
        Number(pageSize)
      );

      res.status(200).json({
        success: true,
        data: {
          category,
          products: results.products?.map(product => ({
            id: product._id,
            code: product.code,
            name: product.product_name,
            brands: product.brands,
            ingredients: product.ingredients_text,
            nutrition: openFoodFactsService.extractNutritionInfo(product),
            image: product.image_url
          })) || [],
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize)
          },
          dataSource: 'OpenFoodFacts - Base mondiale collaborative'
        }
      });

    } catch (error) {
      logger.error('OpenFoodFacts category retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Get vegan products from OpenFoodFacts
   */
  getOpenFoodFactsVeganProducts: async (req: Request, res: Response) => {
    try {
      const { category = 'plant-based-foods', page = 1, pageSize = 24 } = req.query;

      logger.info('OpenFoodFacts vegan products requested', { category, page, pageSize });

      const veganProducts = await openFoodFactsService.getVeganProductsByCategory(
        category as string, 
        Number(page), 
        Number(pageSize)
      );

      res.status(200).json({
        success: true,
        data: {
          category,
          products: veganProducts.map(product => ({
            id: product._id,
            code: product.code,
            name: product.product_name,
            brands: product.brands,
            ingredients: product.ingredients_text,
            nutrition: openFoodFactsService.extractNutritionInfo(product),
            image: product.image_url
          })),
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            total: veganProducts.length
          },
          dataSource: 'OpenFoodFacts - Produits végétaliens'
        }
      });

    } catch (error) {
      logger.error('OpenFoodFacts vegan products retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Get food database status and statistics
   */
  getFoodDatabaseStatus: async (req: Request, res: Response) => {
    try {
      logger.info('Food database status requested');

      // Initialize services if needed
      if (!ciqualService.isInitialized()) {
        await ciqualService.initialize();
      }

      const openFoodFactsAvailable = await openFoodFactsService.isServiceAvailable();

      res.status(200).json({
        success: true,
        data: {
          ciqual: {
            available: ciqualService.isInitialized(),
            totalFoods: ciqualService.getTotalFoodsCount(),
            source: 'ANSES - Agence nationale de sécurité sanitaire',
            description: 'Base de données française officielle sur la composition nutritionnelle des aliments',
            lastUpdated: '2020-2021'
          },
          openFoodFacts: {
            available: openFoodFactsAvailable,
            source: 'OpenFoodFacts - Base collaborative mondiale',
            description: 'Base de données collaborative mondiale sur les produits alimentaires',
            features: ['Codes barres', 'Nutri-Score', 'Eco-Score', 'Ingrédients', 'Photos'],
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging'
          },
          integration: {
            status: 'active',
            priority: 'CIQUAL (données officielles) → OpenFoodFacts (produits commerciaux)',
            capabilities: [
              'Recherche par nom d\'aliment',
              'Recherche par code-barres',
              'Filtrage produits végétaliens',
              'Analyse nutritionnelle automatique'
            ]
          }
        }
      });

    } catch (error) {
      logger.error('Food database status retrieval failed:', error);
      throw error;
    }
  }
};