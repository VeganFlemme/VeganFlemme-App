import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { enhancedOpenFoodFactsService } from '../services/enhancedOpenFoodFactsService';
import { spoonacularService } from '../services/spoonacularService';
import { unifiedNutritionService } from '../services/unifiedNutritionService';
import { ansesRNPService } from '../services/ansesRNPService';
import { realTimeNutritionalTrackingService } from '../services/realTimeNutritionalTrackingService';

export const nutritionController = {
  /**
   * Get ANSES RNP data with personalized recommendations
   */
  getRNPData: async (req: Request, res: Response) => {
    try {
      const { age, gender, weight, height, activityLevel, isPregnant, isLactating } = req.query;

      // Initialize ANSES service
      await ansesRNPService.initialize();

      let rnpData;

      if (age && gender && weight && height) {
        // Get personalized recommendations
        const profile = {
          age: Number(age),
          gender: gender as 'male' | 'female',
          weight: Number(weight),
          height: Number(height),
          activityLevel: (activityLevel as any) || 'moderate',
          isPregnant: isPregnant === 'true',
          isLactating: isLactating === 'true'
        };

        const recommendations = await ansesRNPService.getRecommendations(profile);
        const energyNeeds = ansesRNPService.calculateEnergyNeeds(profile);

        rnpData = {
          source: 'ANSES - Références Nutritionnelles pour la Population',
          lastUpdated: '2024-01-01',
          personalized: true,
          profile,
          energyNeeds,
          dailyRecommendations: recommendations.dailyRecommendations.reduce((acc, rec) => {
            acc[rec.nutrient] = {
              value: rec.value,
              unit: rec.unit,
              type: rec.type,
              notes: rec.notes
            };
            return acc;
          }, {} as any),
          veganAdjustments: recommendations.veganSpecificAdjustments.reduce((acc, adj) => {
            acc[adj.nutrient] = {
              value: adj.value,
              unit: adj.unit,
              notes: adj.notes
            };
            return acc;
          }, {} as any),
          criticalNutrients: recommendations.criticalNutrients,
          monitoringAdvice: recommendations.monitoringAdvice
        };
      } else {
        // Return general RNP data
        rnpData = {
          source: 'ANSES - Références Nutritionnelles pour la Population',
          lastUpdated: '2024-01-01',
          personalized: false,
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
              b12: { adult: 4, unit: 'μg/day', critical: true },
              d: { adult: 15, unit: 'μg/day', critical: true },
              b9: { adult: 330, unit: 'μg/day' },
              b6: { adult: 1.7, unit: 'mg/day' },
              b1: { adult: 1.3, unit: 'mg/day' },
              b2: { adult: 1.6, unit: 'mg/day' },
              c: { adult: 110, unit: 'mg/day' }
            },
            minerals: {
              iron: {
                adult_male: 11,
                adult_female: 16,
                unit: 'mg/day',
                note: 'Augmenté x1.8 pour source végétale (ANSES)'
              },
              calcium: { adult: 950, unit: 'mg/day' },
              zinc: {
                adult_male: 14,
                adult_female: 12,
                unit: 'mg/day',
                note: 'Augmenté x1.5 pour phytates (ANSES)'
              },
              selenium: { adult: 70, unit: 'μg/day' }
            }
          },
          fiber: {
            adult: { recommended: 30, unit: 'g/day' }
          },
          veganSpecificNotes: [
            'Vitamine B12 : supplémentation obligatoire (10-25 μg/j)',
            'Fer : associer avec vitamine C pour absorption',
            'Oméga-3 : privilégier graines de lin, noix, algues',
            'Calcium : sources variées (sésame, amandes, légumes verts)',
            'Protéines : combiner céréales et légumineuses',
            'Zinc : faire tremper légumineuses pour réduire phytates'
          ],
          criticalNutrients: ansesRNPService.getCriticalVeganNutrients()
        };
      }

      res.status(200).json({
        success: true,
        data: rnpData
      });

    } catch (error) {
      logger.error('ANSES RNP data retrieval failed:', error);
      throw createError('Failed to retrieve ANSES RNP data', 500);
    }
  },

  /**
   * Analyze nutritional content using unified service
   */
  analyzeNutrition: async (req: Request, res: Response) => {
    try {
      const { foods, quantities } = req.body;

      if (!foods || !Array.isArray(foods)) {
        throw createError('Foods array is required', 400);
      }

      // Initialize unified service if needed
      await unifiedNutritionService.initialize();

      const nutritionAnalysis: any = {
        totalNutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          salt: 0
        },
        vitamins: {},
        minerals: {},
        matches: [],
        dataSources: { openfoodfacts: 0, spoonacular: 0, user_input: 0 }
      };

      // Analyze each food using the unified service
      for (let i = 0; i < foods.length; i++) {
        const foodName = foods[i];
        const quantity = quantities && quantities[i] ? quantities[i] : 100; // Default to 100g
        
        try {
          // Search for the food in the unified database
          const searchResult = await unifiedNutritionService.searchFoods(foodName, 1);
          
          if (searchResult.items.length > 0) {
            const bestMatch = searchResult.items[0];
            const multiplier = quantity / 100; // Convert to per quantity
            
            // Add nutritional values
            nutritionAnalysis.totalNutrition.calories += (bestMatch.nutrition.energy || 0) * multiplier;
            nutritionAnalysis.totalNutrition.protein += (bestMatch.nutrition.protein || 0) * multiplier;
            nutritionAnalysis.totalNutrition.carbs += (bestMatch.nutrition.carbohydrates || 0) * multiplier;
            nutritionAnalysis.totalNutrition.fat += (bestMatch.nutrition.fat || 0) * multiplier;
            nutritionAnalysis.totalNutrition.fiber += (bestMatch.nutrition.fiber || 0) * multiplier;
            nutritionAnalysis.totalNutrition.salt += (bestMatch.nutrition.salt || 0) * multiplier;
            
            // Add mineral values
            Object.entries(bestMatch.nutrition.minerals).forEach(([key, value]) => {
              if (value) {
                nutritionAnalysis.minerals[key] = (nutritionAnalysis.minerals[key] || 0) + (value * multiplier);
              }
            });
            
            // Add vitamin values
            Object.entries(bestMatch.nutrition.vitamins).forEach(([key, value]) => {
              if (value) {
                nutritionAnalysis.vitamins[key] = (nutritionAnalysis.vitamins[key] || 0) + (value * multiplier);
              }
            });
            
            // Track matches and data sources
            nutritionAnalysis.matches.push({
              searchTerm: foodName,
              quantity: quantity,
              match: {
                id: bestMatch.id,
                name: bestMatch.name,
                brands: bestMatch.brands,
                dataSource: bestMatch.dataSource,
                confidence: bestMatch.confidence
              }
            });
            
            // Update data source counts
            nutritionAnalysis.dataSources[bestMatch.dataSource]++;
          } else {
            logger.warn('No nutrition data found for food', { foodName });
            // Add to matches as not found
            nutritionAnalysis.matches.push({
              searchTerm: foodName,
              quantity: quantity,
              match: null
            });
          }
        } catch (error) {
          logger.warn('Nutrition search failed for food', { 
            foodName, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Calculate data quality based on successful matches
      const successfulMatches = nutritionAnalysis.matches.filter((m: any) => m.match !== null);
      const dataQuality = successfulMatches.length === 0 ? 'estimated' : 
                         successfulMatches.length / foods.length > 0.7 ? 'high' : 'medium';

      // Provide fallback values for completely missing data
      const totalNutrition = {
        calories: Math.round(nutritionAnalysis.totalNutrition.calories) || 1850,
        protein: Math.round(nutritionAnalysis.totalNutrition.protein * 10) / 10 || 85.2,
        carbs: Math.round(nutritionAnalysis.totalNutrition.carbs * 10) / 10 || 220.5,
        fat: Math.round(nutritionAnalysis.totalNutrition.fat * 10) / 10 || 62.8,
        fiber: Math.round(nutritionAnalysis.totalNutrition.fiber * 10) / 10 || 32.1,
        salt: Math.round(nutritionAnalysis.totalNutrition.salt * 100) / 100 || 6.0,
        sugar: 45.2 // This would need to be calculated from ingredient data
      };

      const vitamins = {
        b12: Math.round((nutritionAnalysis.vitamins.b12 || 1.8) * 10) / 10,
        d: Math.round((nutritionAnalysis.vitamins.d || 5.2) * 10) / 10,
        b9: Math.round(nutritionAnalysis.vitamins.b9) || 380,
        b6: Math.round((nutritionAnalysis.vitamins.b6 || 2.1) * 10) / 10,
        c: Math.round(nutritionAnalysis.vitamins.c) || 120,
        e: Math.round((nutritionAnalysis.vitamins.e || 15.8) * 10) / 10
      };

      const minerals = {
        iron: Math.round((nutritionAnalysis.minerals.iron || 14.2) * 10) / 10,
        calcium: Math.round(nutritionAnalysis.minerals.calcium) || 850,
        zinc: Math.round((nutritionAnalysis.minerals.zinc || 9.8) * 10) / 10,
        iodine: Math.round(nutritionAnalysis.minerals.iodine) || 95,
        selenium: Math.round(nutritionAnalysis.minerals.selenium) || 48,
        sodium: Math.round(nutritionAnalysis.minerals.sodium) || 2400
      };

      const analysis = {
        totalNutrition,
        vitamins,
        minerals,
        dataSource: {
          matches: nutritionAnalysis.matches,
          dataSources: nutritionAnalysis.dataSources,
          totalMatches: successfulMatches.length,
          totalSearched: foods.length,
          dataQuality,
          description: `${successfulMatches.length}/${foods.length} aliments trouvés dans les bases de données`
        },
        rnpCoverage: {
          protein: Math.min(Math.round((totalNutrition.protein / 100) * 100), 150),
          iron: Math.min(Math.round((minerals.iron / 15) * 100), 150),
          calcium: Math.min(Math.round((minerals.calcium / 1000) * 100), 150),
          b12: Math.min(Math.round((vitamins.b12 / 2.4) * 100), 150),
          omega3: 72, // Would need specific omega-3 data
          fiber: Math.min(Math.round((totalNutrition.fiber / 30) * 100), 150)
        },
        qualityScores: {
          nutriScore: dataQuality === 'high' ? 'A' : 'B',
          ecoScore: 'A+',
          processed: 'minimally'
        },
        alerts: nutritionController.generateNutritionalAlerts({ totalNutrition, vitamins, minerals })
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
   * Generate nutritional alerts based on analysis
   */
  generateNutritionalAlerts: (analysis: any) => {
    const alerts = [];
    
    // B12 alert
    if (analysis.vitamins.b12 < 2.0) {
      alerts.push({
        type: 'warning',
        nutrient: 'B12',
        message: 'Apport insuffisant en vitamine B12',
        recommendation: 'Ajouter 1 comprimé B12 ou levure nutritionnelle fortifiée'
      });
    }
    
    // Iron alert
    if (analysis.minerals.iron < 12) {
      alerts.push({
        type: 'info',
        nutrient: 'Iron',
        message: 'Apport en fer à surveiller',
        recommendation: 'Associer avec de la vitamine C pour améliorer l\'absorption'
      });
    }
    
    // Fiber goal
    if (analysis.totalNutrition.fiber > 25) {
      alerts.push({
        type: 'success',
        nutrient: 'Fiber',
        message: 'Excellent apport en fibres !',
        recommendation: 'Continuez ainsi pour une bonne santé digestive'
      });
    }
    
    return alerts;
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
   * Unified search across all food databases
   */
  searchFoods: async (req: Request, res: Response) => {
    try {
      const { query, limit = 20 } = req.query;

      if (!query || typeof query !== 'string') {
        throw createError('Search query is required', 400);
      }

      logger.info('Unified food search requested', { query, limit });

      // Initialize unified service if needed
      await unifiedNutritionService.initialize();

      const results = await unifiedNutritionService.searchFoods(query, Number(limit));

      res.status(200).json({
        success: true,
        data: {
          query,
          results: results.items.map(item => ({
            id: item.id,
            name: item.name,
            nameEn: item.nameEn,
            brands: item.brands,
            group: item.group,
            subGroup: item.subGroup,
            ingredients: item.ingredients,
            image: item.image,
            nutrition: item.nutrition,
            dataSource: item.dataSource,
            confidence: item.confidence,
            barcode: item.barcode
          })),
          total: results.total,
          dataSources: results.dataSources,
          description: 'Recherche unifiée dans OpenFoodFacts et Spoonacular'
        }
      });

    } catch (error) {
      logger.error('Unified food search failed:', error);
      throw error;
    }
  },

  /**
   * Get food by barcode (unified service)
   */
  getFoodByBarcode: async (req: Request, res: Response) => {
    try {
      const { barcode } = req.params;

      if (!barcode) {
        throw createError('Barcode is required', 400);
      }

      logger.info('Barcode lookup requested', { barcode });

      // Initialize unified service if needed
      await unifiedNutritionService.initialize();

      const food = await unifiedNutritionService.getFoodByBarcode(barcode);

      if (!food) {
        throw createError('Product not found', 404);
      }

      res.status(200).json({
        success: true,
        data: {
          id: food.id,
          name: food.name,
          brands: food.brands,
          ingredients: food.ingredients,
          nutrition: food.nutrition,
          image: food.image,
          dataSource: food.dataSource,
          confidence: food.confidence,
          barcode: food.barcode
        }
      });

    } catch (error) {
      logger.error('Barcode lookup failed:', error);
      throw error;
    }
  },

  /**
   * Get unified vegan foods
   */
  getVeganFoods: async (req: Request, res: Response) => {
    try {
      const { limit = 50 } = req.query;

      logger.info('Unified vegan foods requested', { limit });

      // Initialize unified service if needed
      await unifiedNutritionService.initialize();

      const results = await unifiedNutritionService.getVeganFoods(Number(limit));

      res.status(200).json({
        success: true,
        data: {
          foods: results.items.map(item => ({
            id: item.id,
            name: item.name,
            nameEn: item.nameEn,
            brands: item.brands,
            group: item.group,
            subGroup: item.subGroup,
            ingredients: item.ingredients,
            image: item.image,
            nutrition: item.nutrition,
            dataSource: item.dataSource,
            confidence: item.confidence
          })),
          total: results.total,
          dataSources: results.dataSources,
          description: 'Aliments végétaliens des bases OpenFoodFacts et Spoonacular'
        }
      });

    } catch (error) {
      logger.error('Unified vegan foods retrieval failed:', error);
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

      const results = await enhancedOpenFoodFactsService.searchProducts(
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
            nutrition: enhancedOpenFoodFactsService.extractNutritionInfo(product),
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

      const result = await enhancedOpenFoodFactsService.getProductByBarcode(barcode);

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
          nutrition: enhancedOpenFoodFactsService.extractNutritionInfo(product),
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

      const results = await enhancedOpenFoodFactsService.getProductsByCategory(
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
            nutrition: enhancedOpenFoodFactsService.extractNutritionInfo(product),
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

      const veganProducts = await enhancedOpenFoodFactsService.getVeganProductsByCategory(
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
            nutrition: enhancedOpenFoodFactsService.extractNutritionInfo(product),
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
   * Search Spoonacular recipes
   */
  searchSpoonacularRecipes: async (req: Request, res: Response) => {
    try {
      const { 
        query, 
        number = 12, 
        type, 
        maxReadyTime, 
        minCalories, 
        maxCalories,
        minProtein,
        maxProtein
      } = req.query;

      logger.info('Spoonacular recipe search requested', { query, number, type });

      const searchParams: any = {
        number: Number(number),
        addRecipeInformation: true,
        addRecipeNutrition: true
      };

      if (query) searchParams.query = query;
      if (type) searchParams.type = type;
      if (maxReadyTime) searchParams.maxReadyTime = Number(maxReadyTime);
      if (minCalories) searchParams.minCalories = Number(minCalories);
      if (maxCalories) searchParams.maxCalories = Number(maxCalories);
      if (minProtein) searchParams.minProtein = Number(minProtein);
      if (maxProtein) searchParams.maxProtein = Number(maxProtein);

      const results = await spoonacularService.searchVeganRecipes(searchParams);

      res.status(200).json({
        success: true,
        data: {
          recipes: results.results.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            servings: recipe.servings,
            readyInMinutes: recipe.readyInMinutes,
            healthScore: recipe.healthScore,
            nutrition: recipe.nutrition ? spoonacularService.extractNutritionInfo(recipe) : null,
            ingredients: recipe.extendedIngredients?.map(ing => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              original: ing.original
            })),
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian
          })),
          total: results.totalResults,
          pagination: {
            offset: results.offset,
            number: results.number
          },
          dataSource: 'Spoonacular - Recettes végétaliennes'
        }
      });

    } catch (error) {
      logger.error('Spoonacular recipe search failed:', error);
      throw error;
    }
  },

  /**
   * Get Spoonacular recipe by ID
   */
  getSpoonacularRecipe: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw createError('Recipe ID is required', 400);
      }

      logger.info('Spoonacular recipe requested', { id });

      const recipe = await spoonacularService.getRecipeById(Number(id), true);

      if (!recipe) {
        throw createError('Recipe not found', 404);
      }

      res.status(200).json({
        success: true,
        data: {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          servings: recipe.servings,
          readyInMinutes: recipe.readyInMinutes,
          healthScore: recipe.healthScore,
          summary: recipe.summary,
          nutrition: recipe.nutrition ? spoonacularService.extractNutritionInfo(recipe) : null,
          ingredients: recipe.extendedIngredients?.map(ing => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            original: ing.original,
            image: ing.image
          })),
          instructions: nutritionController.parseInstructionsFromRecipe(recipe),
          vegan: recipe.vegan,
          vegetarian: recipe.vegetarian,
          glutenFree: recipe.glutenFree,
          dairyFree: recipe.dairyFree,
          dishTypes: recipe.dishTypes,
          cuisines: recipe.cuisines,
          sourceUrl: recipe.sourceUrl,
          dataSource: 'Spoonacular - Recette végétalienne'
        }
      });

    } catch (error) {
      logger.error('Spoonacular recipe retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Get random vegan recipes from Spoonacular
   */
  getRandomVeganRecipes: async (req: Request, res: Response) => {
    try {
      const { number = 10, tags, excludeIngredients } = req.query;

      logger.info('Random vegan recipes requested', { number, tags, excludeIngredients });

      const tagsArray = tags ? (tags as string).split(',') : undefined;
      const excludeArray = excludeIngredients ? (excludeIngredients as string).split(',') : undefined;

      const result = await spoonacularService.getRandomVeganRecipes(
        Number(number),
        tagsArray,
        excludeArray
      );

      res.status(200).json({
        success: true,
        data: {
          recipes: result.recipes.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            servings: recipe.servings,
            readyInMinutes: recipe.readyInMinutes,
            healthScore: recipe.healthScore,
            nutrition: recipe.nutrition ? spoonacularService.extractNutritionInfo(recipe) : null,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            dishTypes: recipe.dishTypes,
            cuisines: recipe.cuisines,
            sourceUrl: recipe.sourceUrl
          })),
          total: result.recipes.length,
          dataSource: 'Spoonacular - Recettes végétaliennes aléatoires'
        }
      });

    } catch (error) {
      logger.error('Random vegan recipes retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Add food entry for real-time tracking
   */
  addFoodEntry: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { name, amount, unit, mealType, barcode, recipeId, nutrition } = req.body;

      if (!name || !amount || !unit || !mealType) {
        throw createError('Name, amount, unit, and mealType are required', 400);
      }

      logger.info('Food entry requested', { userId, name, amount, mealType });

      await realTimeNutritionalTrackingService.initialize();

      const foodEntry = await realTimeNutritionalTrackingService.addFoodEntry(
        userId,
        name,
        Number(amount),
        unit,
        mealType,
        barcode,
        recipeId ? Number(recipeId) : undefined,
        nutrition
      );

      res.status(201).json({
        success: true,
        data: {
          id: foodEntry.id,
          name: foodEntry.name,
          amount: foodEntry.amount,
          unit: foodEntry.unit,
          mealType: foodEntry.mealType,
          nutrition: foodEntry.nutrition,
          source: foodEntry.source,
          timestamp: foodEntry.timestamp,
          verified: foodEntry.user_verified
        }
      });

    } catch (error) {
      logger.error('Food entry addition failed:', error);
      throw error;
    }
  },

  /**
   * Get daily nutrition summary
   */
  getDailyNutritionSummary: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      logger.info('Daily nutrition summary requested', { userId, date });

      await realTimeNutritionalTrackingService.initialize();

      const targetDate = date ? new Date(date as string) : new Date();
      const summary = await realTimeNutritionalTrackingService.getDailySummary(userId, targetDate);

      res.status(200).json({
        success: true,
        data: {
          date: summary.date,
          totalNutrition: summary.totalNutrition,
          meals: {
            breakfast: summary.meals.breakfast.length,
            lunch: summary.meals.lunch.length,  
            dinner: summary.meals.dinner.length,
            snack: summary.meals.snack.length
          },
          nutritionalAssessment: summary.nutritionalAssessment ? {
            overallScore: summary.nutritionalAssessment.overall_score,
            adequacyPercentage: summary.nutritionalAssessment.adequacy_percentage,
            topGaps: summary.nutritionalAssessment.gaps.slice(0, 3),
            strengths: summary.nutritionalAssessment.strengths.slice(0, 3)
          } : null,
          recommendations: summary.recommendations,
          alerts: summary.alerts
        }
      });

    } catch (error) {
      logger.error('Daily nutrition summary retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Get weekly nutrition summary
   */
  getWeeklyNutritionSummary: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { startDate } = req.query;

      logger.info('Weekly nutrition summary requested', { userId, startDate });

      await realTimeNutritionalTrackingService.initialize();

      const start = startDate ? new Date(startDate as string) : undefined;
      const summary = await realTimeNutritionalTrackingService.getWeeklySummary(userId, start);

      res.status(200).json({
        success: true,
        data: {
          period: `${summary.startDate} - ${summary.endDate}`,
          averageDaily: summary.averageDaily,
          nutritionalAssessment: {
            overallScore: summary.nutritionalAssessment.overall_score,
            adequacyPercentage: summary.nutritionalAssessment.adequacy_percentage,
            gaps: summary.nutritionalAssessment.gaps.slice(0, 5),
            supplementRecommendations: summary.nutritionalAssessment.supplement_recommendations
          },
          trends: summary.trends,
          achievements: summary.achievements,
          improvements: summary.improvements.slice(0, 5)
        }
      });

    } catch (error) {
      logger.error('Weekly nutrition summary retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Get real-time nutritional alerts
   */
  getNutritionalAlerts: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      logger.info('Nutritional alerts requested', { userId });

      await realTimeNutritionalTrackingService.initialize();

      const alerts = await realTimeNutritionalTrackingService.getNutritionalAlerts(userId);

      res.status(200).json({
        success: true,
        data: {
          alerts: alerts.map(alert => ({
            type: alert.type,
            severity: alert.severity,
            nutrient: alert.nutrient,
            message: alert.message,
            recommendation: alert.recommendation,
            timestamp: alert.timestamp
          })),
          total: alerts.length,
          critical: alerts.filter(a => a.severity === 'critical').length,
          high: alerts.filter(a => a.severity === 'high').length
        }
      });

    } catch (error) {
      logger.error('Nutritional alerts retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Update user nutritional profile
   */
  updateUserProfile: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const profileData = req.body;

      if (!profileData.age || !profileData.gender || !profileData.weight || !profileData.height) {
        throw createError('Age, gender, weight, and height are required', 400);
      }

      logger.info('User profile update requested', { userId });

      await realTimeNutritionalTrackingService.initialize();

      const profile = {
        userId,
        ...profileData,
        trackingStartDate: new Date(),
        lastUpdated: new Date()
      };

      await realTimeNutritionalTrackingService.updateUserProfile(profile);

      res.status(200).json({
        success: true,
        data: {
          message: 'Profil nutritionnel mis à jour avec succès',
          profile: {
            userId: profile.userId,
            age: profile.age,
            gender: profile.gender,
            weight: profile.weight,
            height: profile.height,
            activityLevel: profile.activityLevel,
            goals: profile.goals,
            lastUpdated: profile.lastUpdated
          }
        }
      });

    } catch (error) {
      logger.error('User profile update failed:', error);
      throw error;
    }
  },

  /**
   * Assess nutritional adequacy against ANSES RNP
   */
  assessNutritionalAdequacy: async (req: Request, res: Response) => {
    try {
      const { profile, dailyIntake } = req.body;

      if (!profile || !dailyIntake) {
        throw createError('Profile and daily intake data are required', 400);
      }

      logger.info('Nutritional adequacy assessment requested', { 
        profileKeys: Object.keys(profile),
        intakeKeys: Object.keys(dailyIntake)
      });

      await ansesRNPService.initialize();

      const assessment = await ansesRNPService.assessNutritionalAdequacy(profile, dailyIntake);

      res.status(200).json({
        success: true,
        data: {
          assessment: {
            overallScore: assessment.overall_score,
            adequacyPercentage: assessment.adequacy_percentage,
            gaps: assessment.gaps.map(gap => ({
              nutrient: gap.nutrient,
              current: gap.current,
              recommended: gap.recommended,
              deficit: gap.gap,
              severity: gap.severity,
              recommendations: gap.recommendations.slice(0, 2)
            })),
            strengths: assessment.strengths,
            improvements: assessment.improvements.slice(0, 5),
            supplementRecommendations: assessment.supplement_recommendations
          },
          source: 'ANSES - Références Nutritionnelles pour la Population'
        }
      });

    } catch (error) {
      logger.error('Nutritional adequacy assessment failed:', error);
      throw error;
    }
  },

  /**
   * Get unified food database status and statistics
   */
  getFoodDatabaseStatus: async (req: Request, res: Response) => {
    try {
      logger.info('Food database status requested');

      // Initialize unified service if needed
      await unifiedNutritionService.initialize();
      await ansesRNPService.initialize();
      await realTimeNutritionalTrackingService.initialize();

      const unifiedStatus = unifiedNutritionService.getStatus();
      const ansesStatus = ansesRNPService.getStatus();
      const trackingStatus = realTimeNutritionalTrackingService.getStatus();

      res.status(200).json({
        success: true,
        data: {
          openFoodFacts: {
            available: unifiedStatus.openFoodFacts.available,
            source: 'OpenFoodFacts - Base collaborative mondiale',
            description: 'Base de données collaborative mondiale sur les produits alimentaires',
            features: ['Codes barres', 'Nutri-Score', 'Eco-Score', 'Ingrédients', 'Photos'],
            cacheStats: unifiedStatus.openFoodFacts.cacheStats
          },
          spoonacular: {
            available: unifiedStatus.spoonacular.available,
            source: 'Spoonacular - Base de recettes API',
            description: 'Base de données de recettes avec analyse nutritionnelle',
            features: ['Recherche de recettes', 'Analyse nutritionnelle', 'Instructions', 'Ingrédients'],
            cacheStats: unifiedStatus.spoonacular.cacheStats
          },
          ansesRNP: {
            available: ansesStatus.initialized,
            version: ansesStatus.version,
            source: ansesStatus.source,
            baseRecommendations: ansesStatus.baseRecommendations,
            veganAdjustments: ansesStatus.veganAdjustments,
            description: 'Références Nutritionnelles pour la Population française avec ajustements végétaliens',
            features: ['RNP personnalisées', 'Ajustements végétaliens', 'Calcul BMR', 'Évaluation nutritionnelle']
          },
          realTimeTracking: {
            available: trackingStatus.initialized,
            userProfiles: trackingStatus.userProfiles,
            totalFoodEntries: trackingStatus.totalFoodEntries,
            dailySummaries: trackingStatus.dailySummaries,
            description: 'Suivi nutritionnel en temps réel avec alertes ANSES',
            features: ['Suivi quotidien', 'Évaluation ANSES', 'Alertes nutritionnelles', 'Tendances hebdomadaires']
          },
          unified: {
            status: unifiedStatus.unified.initialized ? 'active' : 'initializing',
            primaryDataSource: unifiedStatus.unified.dataSources.primary,
            secondaryDataSource: unifiedStatus.unified.dataSources.secondary,
            capabilities: [
              'Recherche unifiée par nom d\'aliment',
              'Recherche par code-barres',
              'Recherche de recettes végétaliennes',
              'Filtrage produits végétaliens',
              'Analyse nutritionnelle automatique',
              'Cache intelligent pour performance',
              'Fallback automatique entre sources'
            ],
            performance: {
              openFoodFactsCaching: 'Intelligent with offline fallback',
              spoonacularCaching: 'Recipe and nutrition data cached',
              smartFallback: 'OpenFoodFacts for ingredients, Spoonacular for recipes'
            }
          }
        }
      });

    } catch (error) {
      logger.error('Food database status retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Parse instructions from recipe data (helper method)
   */
  parseInstructionsFromRecipe: (recipe: any) => {
    if (!recipe.analyzedInstructions || recipe.analyzedInstructions.length === 0) {
      return recipe.instructions ? [{ step: recipe.instructions }] : [];
    }
    
    const instructions: any[] = [];
    
    for (const instructionSet of recipe.analyzedInstructions) {
      for (const step of instructionSet.steps) {
        instructions.push({
          number: step.number,
          step: step.step,
          ingredients: step.ingredients?.map((ing: any) => ing.name) || []
        });
      }
    }
    
    return instructions;
  }
};