import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

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
      // Mock analysis for now
      const analysis = {
        totalNutrition: {
          calories: 1850,
          protein: 85.2,
          carbs: 220.5,
          fat: 62.8,
          fiber: 32.1,
          sugar: 45.2
        },
        vitamins: {
          b12: 1.8,
          d: 5.2,
          b9: 380,
          b6: 2.1,
          c: 120,
          e: 15.8
        },
        minerals: {
          iron: 14.2,
          calcium: 850,
          zinc: 9.8,
          iodine: 95,
          selenium: 48
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
  }
};