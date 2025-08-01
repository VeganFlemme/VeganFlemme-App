import { logger } from '../utils/logger';

/**
 * French ANSES (Agence nationale de sécurité sanitaire de l'alimentation) 
 * Nutritional Reference Values (RNP - Références Nutritionnelles pour la Population)
 * 
 * Based on the latest ANSES recommendations for the French population
 * https://www.anses.fr/fr/content/les-références-nutritionnelles-en-vitamines-et-minéraux
 */

export interface ANSESProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense';
  isPregnant?: boolean;
  isLactating?: boolean;
  specialConditions?: string[];
}

export interface NutritionalReference {
  nutrient: string;
  value: number;
  unit: string;
  type: 'RNP' | 'AS' | 'LSS'; // RNP: Reference, AS: Adequate Safety, LSS: Safety Limit
  confidence: 'high' | 'medium' | 'low';
  source: string;
  notes?: string;
}

export interface ANSESRecommendations {
  profile: ANSESProfile;
  dailyRecommendations: NutritionalReference[];
  veganSpecificAdjustments: NutritionalReference[];
  criticalNutrients: string[];
  monitoringAdvice: string[];
}

export interface NutritionalGap {
  nutrient: string;
  current: number;
  recommended: number;
  gap: number;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  recommendations: string[];
}

export interface NutritionalAssessment {
  profile: ANSESProfile;
  overall_score: number; // 0-100
  adequacy_percentage: number;
  gaps: NutritionalGap[];
  strengths: string[];
  improvements: string[];
  supplement_recommendations?: string[];
}

/**
 * ANSES RNP Service for French nutritional recommendations
 * Specifically adapted for vegan populations with French dietary guidelines
 */
export class ANSESRNPService {
  private baseRecommendations: Map<string, any> = new Map();
  private veganAdjustments: Map<string, any> = new Map();
  private initialized: boolean = false;

  constructor() {
    logger.info('ANSES RNP Service initializing');
  }

  /**
   * Initialize the service with ANSES reference data
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.loadBaseRecommendations();
      this.loadVeganAdjustments();
      this.initialized = true;
      
      logger.info('ANSES RNP Service initialized successfully', {
        baseRecommendations: this.baseRecommendations.size,
        veganAdjustments: this.veganAdjustments.size
      });
    } catch (error) {
      logger.error('Failed to initialize ANSES RNP Service', { error });
      throw new Error(`ANSES RNP Service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get personalized ANSES recommendations for a user profile
   */
  async getRecommendations(profile: ANSESProfile): Promise<ANSESRecommendations> {
    await this.ensureInitialized();

    try {
      logger.info('Generating ANSES recommendations', { 
        age: profile.age, 
        gender: profile.gender,
        activityLevel: profile.activityLevel
      });

      const dailyRecommendations = this.calculateDailyRecommendations(profile);
      const veganAdjustments = this.calculateVeganAdjustments(profile);
      const criticalNutrients = this.identifyCriticalNutrients(profile);
      const monitoringAdvice = this.generateMonitoringAdvice(profile);

      const recommendations: ANSESRecommendations = {
        profile,
        dailyRecommendations,
        veganSpecificAdjustments: veganAdjustments,
        criticalNutrients,
        monitoringAdvice
      };

      logger.info('ANSES recommendations generated', {
        totalRecommendations: dailyRecommendations.length,
        veganAdjustments: veganAdjustments.length,
        criticalNutrients: criticalNutrients.length
      });

      return recommendations;
    } catch (error) {
      logger.error('Error generating ANSES recommendations', { profile, error });
      throw new Error(`Failed to generate recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assess nutritional adequacy against ANSES recommendations
   */
  async assessNutritionalAdequacy(
    profile: ANSESProfile,
    dailyIntake: Record<string, number>
  ): Promise<NutritionalAssessment> {
    await this.ensureInitialized();

    try {
      logger.info('Assessing nutritional adequacy', { 
        profile: { age: profile.age, gender: profile.gender },
        nutrients: Object.keys(dailyIntake).length
      });

      const recommendations = await this.getRecommendations(profile);
      const gaps: NutritionalGap[] = [];
      const strengths: string[] = [];
      const improvements: string[] = [];
      
      let adequateNutrients = 0;
      let totalNutrients = 0;

      // Assess each nutrient
      for (const rec of recommendations.dailyRecommendations) {
        const currentIntake = dailyIntake[rec.nutrient] || 0;
        const recommended = rec.value;
        totalNutrients++;

        const adequacyRatio = currentIntake / recommended;

        if (adequacyRatio >= 0.9) { // ≥90% of recommendation
          adequateNutrients++;
          if (adequacyRatio >= 1.2) { // >120% of recommendation
            strengths.push(`Excellent ${rec.nutrient} intake (${Math.round(adequacyRatio * 100)}% of RNP)`);
          }
        } else {
          // Identify gap
          const gap: NutritionalGap = {
            nutrient: rec.nutrient,
            current: currentIntake,
            recommended: recommended,
            gap: recommended - currentIntake,
            severity: this.assessGapSeverity(rec.nutrient, adequacyRatio),
            recommendations: this.getGapRecommendations(rec.nutrient, adequacyRatio)
          };
          gaps.push(gap);

          // Add to improvements
          improvements.push(`Increase ${rec.nutrient} intake: ${currentIntake.toFixed(1)} → ${recommended.toFixed(1)} ${rec.unit}`);
        }
      }

      // Check vegan-specific adjustments
      for (const adj of recommendations.veganSpecificAdjustments) {
        const currentIntake = dailyIntake[adj.nutrient] || 0;
        const recommended = adj.value;
        const adequacyRatio = currentIntake / recommended;

        if (adequacyRatio < 0.8) { // <80% for vegan-critical nutrients
          const existingGap = gaps.find(g => g.nutrient === adj.nutrient);
          if (existingGap) {
            existingGap.severity = this.escalateSeverity(existingGap.severity);
            existingGap.recommendations.push(...this.getVeganSpecificRecommendations(adj.nutrient));
          }
        }
      }

      const adequacyPercentage = (adequateNutrients / totalNutrients) * 100;
      const overallScore = this.calculateOverallScore(gaps, strengths, adequacyPercentage);

      const assessment: NutritionalAssessment = {
        profile,
        overall_score: overallScore,
        adequacy_percentage: adequacyPercentage,
        gaps: gaps.sort((a, b) => this.severityToNumber(b.severity) - this.severityToNumber(a.severity)),
        strengths,
        improvements,
        supplement_recommendations: this.generateSupplementRecommendations(gaps, profile)
      };

      logger.info('Nutritional assessment completed', {
        overallScore,
        adequacyPercentage,
        gapsCount: gaps.length,
        strengthsCount: strengths.length
      });

      return assessment;
    } catch (error) {
      logger.error('Error assessing nutritional adequacy', { error });
      throw new Error(`Failed to assess nutritional adequacy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get critical nutrients that require special attention for vegans
   */
  getCriticalVeganNutrients(): string[] {
    return [
      'vitaminB12',
      'iron',
      'zinc',
      'calcium',
      'vitaminD',
      'omega3',
      'protein',
      'vitaminB2',
      'selenium'
    ];
  }

  /**
   * Calculate daily energy needs based on ANSES methodology
   */
  calculateEnergyNeeds(profile: ANSESProfile): number {
    // Base Metabolic Rate using ANSES coefficients
    let bmr: number;
    
    if (profile.gender === 'male') {
      if (profile.age >= 18 && profile.age <= 29) {
        bmr = (15.3 * profile.weight) + 679;
      } else if (profile.age >= 30 && profile.age <= 59) {
        bmr = (11.6 * profile.weight) + 879;
      } else if (profile.age >= 60) {
        bmr = (13.5 * profile.weight) + 487;
      } else {
        // Adolescent values
        bmr = (17.5 * profile.weight) + 651;
      }
    } else {
      if (profile.age >= 18 && profile.age <= 29) {
        bmr = (14.7 * profile.weight) + 496;
      } else if (profile.age >= 30 && profile.age <= 59) {
        bmr = (8.7 * profile.weight) + 829;
      } else if (profile.age >= 60) {
        bmr = (10.5 * profile.weight) + 596;
      } else {
        // Adolescent values
        bmr = (12.2 * profile.weight) + 749;
      }
    }

    // Apply activity factor
    const activityFactors = {
      sedentary: 1.4,
      light: 1.6,
      moderate: 1.8,
      intense: 2.0
    };

    let totalEnergyExpenditure = bmr * activityFactors[profile.activityLevel];

    // Adjustments for special conditions
    if (profile.isPregnant) {
      if (profile.age >= 20) {
        totalEnergyExpenditure += 300; // 2nd and 3rd trimester
      }
    }

    if (profile.isLactating) {
      totalEnergyExpenditure += 500; // Additional energy for lactation
    }

    return Math.round(totalEnergyExpenditure);
  }

  /**
   * Load base ANSES recommendations
   */
  private loadBaseRecommendations(): void {
    // Energy and Macronutrients
    this.baseRecommendations.set('energy', {
      calculation: 'profile-based',
      notes: 'Calculated using ANSES coefficients'
    });

    this.baseRecommendations.set('protein', {
      adult: { male: 0.83, female: 0.83 }, // g/kg body weight
      elderly: { male: 1.0, female: 1.0 }, // ≥65 years
      pregnant: 1.2,
      lactating: 1.3,
      unit: 'g/kg',
      type: 'RNP'
    });

    this.baseRecommendations.set('carbohydrates', {
      percentage: 45-65, // % of total energy
      minimum: 130, // g/day
      unit: '% energy',
      type: 'RNP'
    });

    this.baseRecommendations.set('fat', {
      percentage: 35-40, // % of total energy for adults
      unit: '% energy',
      type: 'RNP'
    });

    this.baseRecommendations.set('fiber', {
      adult: { male: 30, female: 25 },
      unit: 'g',
      type: 'RNP'
    });

    // Vitamins
    this.baseRecommendations.set('vitaminA', {
      adult: { male: 750, female: 650 },
      pregnant: 700,
      lactating: 1300,
      unit: 'µg',
      type: 'RNP'
    });

    this.baseRecommendations.set('vitaminD', {
      adult: 15,
      elderly: 20, // ≥65 years
      unit: 'µg',
      type: 'RNP'
    });

    this.baseRecommendations.set('vitaminE', {
      adult: { male: 10, female: 9 },
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('vitaminK', {
      adult: { male: 79, female: 79 },
      unit: 'µg',
      type: 'AS'
    });

    this.baseRecommendations.set('vitaminC', {
      adult: { male: 110, female: 110 },
      pregnant: 120,
      lactating: 170,
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('vitaminB1', {
      adult: { male: 1.3, female: 1.1 },
      pregnant: 1.8,
      lactating: 1.8,
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('vitaminB2', {
      adult: { male: 1.6, female: 1.5 },
      pregnant: 1.9,
      lactating: 2.0,
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('vitaminB3', {
      adult: { male: 14, female: 11 },
      pregnant: 16,
      lactating: 15,
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('vitaminB6', {
      adult: { male: 1.8, female: 1.5 },
      pregnant: 2.0,
      lactating: 2.0,
      elderly: { male: 2.2, female: 2.0 }, // ≥65 years
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('vitaminB9', {
      adult: { male: 330, female: 330 },
      pregnant: 600,
      lactating: 500,
      unit: 'µg',
      type: 'RNP'
    });

    this.baseRecommendations.set('vitaminB12', {
      adult: { male: 4, female: 4 },
      pregnant: 4.5,
      lactating: 5,
      unit: 'µg',
      type: 'RNP'
    });

    // Minerals
    this.baseRecommendations.set('calcium', {
      adult: { male: 950, female: 950 },
      elderly: { male: 1200, female: 1200 }, // ≥65 years
      pregnant: 1000,
      lactating: 1000,
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('phosphorus', {
      adult: { male: 750, female: 750 },
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('magnesium', {
      adult: { male: 380, female: 300 },
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('iron', {
      adult: { male: 11, female: 16 }, // Higher for menstruating females
      postmenopausal: 11,
      pregnant: 25,
      lactating: 10,
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('zinc', {
      adult: { male: 14, female: 12 },
      pregnant: 14,
      lactating: 19,
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('copper', {
      adult: { male: 1.7, female: 1.5 },
      unit: 'mg',
      type: 'RNP'
    });

    this.baseRecommendations.set('selenium', {
      adult: { male: 70, female: 60 },
      pregnant: 70,
      lactating: 85,
      unit: 'µg',
      type: 'RNP'
    });

    this.baseRecommendations.set('iodine', {
      adult: { male: 150, female: 150 },
      pregnant: 200,
      lactating: 200,
      unit: 'µg',
      type: 'RNP'
    });

    this.baseRecommendations.set('potassium', {
      adult: { male: 4000, female: 4000 },
      unit: 'mg',
      type: 'AS'
    });

    this.baseRecommendations.set('sodium', {
      adult: { male: 8000, female: 8000 }, // Upper limit
      unit: 'mg',
      type: 'LSS'
    });
  }

  /**
   * Load vegan-specific adjustments based on research
   */
  private loadVeganAdjustments(): void {
    this.veganAdjustments.set('vitaminB12', {
      multiplier: 1.0, // No adjustment needed, but supplementation required
      supplementation: 'mandatory',
      notes: 'Vegan sources are insufficient, supplementation required'
    });

    this.veganAdjustments.set('iron', {
      multiplier: 1.8, // ANSES recommends 1.8x for vegetarians due to non-heme iron
      bioavailability: 'enhanced_with_vitamin_c',
      notes: 'Non-heme iron has lower bioavailability'
    });

    this.veganAdjustments.set('zinc', {
      multiplier: 1.5, // Higher needs due to phytate binding
      notes: 'Phytates can reduce zinc absorption'
    });

    this.veganAdjustments.set('calcium', {
      multiplier: 1.0, // No adjustment if well-planned
      attention: 'high',
      notes: 'Focus on bioavailable sources'
    });

    this.veganAdjustments.set('vitaminD', {
      multiplier: 1.0,
      supplementation: 'recommended',
      notes: 'Limited dietary sources in vegan diet'
    });

    this.veganAdjustments.set('omega3', {
      multiplier: 1.5, // Higher ALA needs for EPA/DHA conversion
      source_focus: 'ALA_conversion',
      notes: 'Focus on ALA-rich foods for EPA/DHA conversion'
    });

    this.veganAdjustments.set('protein', {
      multiplier: 1.0, // No adjustment needed if varied
      quality_focus: 'amino_acid_complementarity',
      notes: 'Ensure amino acid complementarity'
    });

    this.veganAdjustments.set('vitaminB2', {
      multiplier: 1.0,
      attention: 'moderate',
      notes: 'Monitor intake, fewer dietary sources in vegan diet'
    });

    this.veganAdjustments.set('selenium', {
      multiplier: 1.0,
      attention: 'moderate',
      variability: 'geographic',
      notes: 'Depends on soil selenium content'
    });
  }

  /**
   * Calculate daily recommendations for a specific profile
   */
  private calculateDailyRecommendations(profile: ANSESProfile): NutritionalReference[] {
    const recommendations: NutritionalReference[] = [];

    for (const [nutrient, data] of this.baseRecommendations.entries()) {
      let value: number;
      let notes = '';

      if (nutrient === 'energy') {
        value = this.calculateEnergyNeeds(profile);
      } else if (nutrient === 'protein') {
        // Calculate based on body weight
        let factor = data.adult[profile.gender];
        if (profile.age >= 65) factor = data.elderly[profile.gender];
        if (profile.isPregnant) factor = data.pregnant;
        if (profile.isLactating) factor = data.lactating;
        value = factor * profile.weight;
      } else if (nutrient === 'carbohydrates' || nutrient === 'fat') {
        // These are percentage-based, calculate from energy needs
        const energy = this.calculateEnergyNeeds(profile);
        if (nutrient === 'carbohydrates') {
          value = (energy * 0.50) / 4; // 50% of energy from carbs
          notes = '45-65% of total energy intake';
        } else {
          value = (energy * 0.30) / 9; // 30% of energy from fat
          notes = '35-40% of total energy intake';
        }
      } else {
        // Regular nutrient with gender/age/condition specific values
        if (data.adult) {
          value = data.adult[profile.gender] || data.adult;
        } else {
          value = data.adult || 0;
        }

        // Apply age adjustments
        if (profile.age >= 65 && data.elderly) {
          value = data.elderly[profile.gender] || data.elderly;
        }

        // Apply condition adjustments
        if (profile.isPregnant && data.pregnant) {
          value = data.pregnant;
        }
        if (profile.isLactating && data.lactating) {
          value = data.lactating;
        }
      }

      recommendations.push({
        nutrient,
        value,
        unit: data.unit || 'mg',
        type: data.type || 'RNP',
        confidence: 'high',
        source: 'ANSES',
        notes
      });
    }

    return recommendations;
  }

  /**
   * Calculate vegan-specific adjustments
   */
  private calculateVeganAdjustments(profile: ANSESProfile): NutritionalReference[] {
    const adjustments: NutritionalReference[] = [];

    for (const [nutrient, adjustment] of this.veganAdjustments.entries()) {
      const baseRec = this.baseRecommendations.get(nutrient);
      if (!baseRec) continue;

      let baseValue: number;
      
      // Calculate base value
      if (nutrient === 'protein') {
        let factor = baseRec.adult[profile.gender];
        if (profile.age >= 65) factor = baseRec.elderly[profile.gender];
        if (profile.isPregnant) factor = baseRec.pregnant;
        if (profile.isLactating) factor = baseRec.lactating;
        baseValue = factor * profile.weight;
      } else {
        baseValue = baseRec.adult[profile.gender] || baseRec.adult;
        if (profile.age >= 65 && baseRec.elderly) {
          baseValue = baseRec.elderly[profile.gender] || baseRec.elderly;
        }
        if (profile.isPregnant && baseRec.pregnant) {
          baseValue = baseRec.pregnant;
        }
        if (profile.isLactating && baseRec.lactating) {
          baseValue = baseRec.lactating;
        }
      }

      const adjustedValue = baseValue * (adjustment.multiplier || 1.0);

      adjustments.push({
        nutrient,
        value: adjustedValue,
        unit: baseRec.unit || 'mg',
        type: 'RNP',
        confidence: adjustment.attention === 'high' ? 'high' : 'medium',
        source: 'ANSES + Vegan Research',
        notes: adjustment.notes
      });
    }

    return adjustments;
  }

  /**
   * Identify critical nutrients for this profile
   */
  private identifyCriticalNutrients(profile: ANSESProfile): string[] {
    const critical = ['vitaminB12', 'iron', 'zinc', 'calcium', 'vitaminD', 'omega3'];
    
    // Add age-specific critical nutrients
    if (profile.age >= 65) {
      critical.push('vitaminB6', 'protein');
    }

    // Add condition-specific critical nutrients
    if (profile.isPregnant) {
      critical.push('vitaminB9', 'vitaminB1');
    }

    if (profile.isLactating) {
      critical.push('vitaminB2', 'selenium');
    }

    return critical;
  }

  /**
   * Generate monitoring advice
   */
  private generateMonitoringAdvice(profile: ANSESProfile): string[] {
    const advice: string[] = [
      'Contrôlez régulièrement votre taux de vitamine B12',
      'Surveillez votre taux de fer (ferritine, hémoglobine)',
      'Vérifiez votre statut en vitamine D (25-OH-D3)',
      'Assurez-vous d\'un apport suffisant en oméga-3 (ALA, EPA, DHA)'
    ];

    if (profile.age >= 65) {
      advice.push('Surveillance renforcée du statut protéique et de la vitamine B6');
    }

    if (profile.isPregnant || profile.isLactating) {
      advice.push('Suivi médical renforcé pendant la grossesse/allaitement');
    }

    if (profile.gender === 'female' && profile.age < 50) {
      advice.push('Attention particulière au fer en période de menstruation');
    }

    return advice;
  }

  /**
   * Assess gap severity
   */
  private assessGapSeverity(nutrient: string, adequacyRatio: number): 'critical' | 'high' | 'moderate' | 'low' {
    const criticalNutrients = ['vitaminB12', 'iron', 'calcium'];
    
    if (criticalNutrients.includes(nutrient)) {
      if (adequacyRatio < 0.5) return 'critical';
      if (adequacyRatio < 0.7) return 'high';
      if (adequacyRatio < 0.9) return 'moderate';
      return 'low';
    } else {
      if (adequacyRatio < 0.3) return 'critical';
      if (adequacyRatio < 0.5) return 'high';
      if (adequacyRatio < 0.7) return 'moderate';
      return 'low';
    }
  }

  /**
   * Get recommendations for addressing gaps
   */
  private getGapRecommendations(nutrient: string, adequacyRatio: number): string[] {
    const recommendations: string[] = [];
    
    const foodSources: Record<string, string[]> = {
      iron: ['légumineuses', 'épinards', 'graines de tournesol', 'quinoa', 'tofu'],
      calcium: ['légumes verts', 'amandes', 'tahini', 'tofu au calcium', 'boissons végétales enrichies'],
      zinc: ['graines de citrouille', 'légumineuses', 'noix', 'graines de sésame'],
      vitaminB12: ['supplémentation obligatoire', 'aliments enrichis'],
      vitaminD: ['exposition solaire', 'supplémentation', 'champignons UV'],
      protein: ['légumineuses', 'quinoa', 'tofu', 'tempeh', 'noix', 'graines']
    };

    if (foodSources[nutrient]) {
      recommendations.push(`Augmentez la consommation de: ${foodSources[nutrient].join(', ')}`);
    }

    if (adequacyRatio < 0.5) {
      recommendations.push('Considérez une supplémentation après avis médical');
    }

    return recommendations;
  }

  /**
   * Get vegan-specific recommendations
   */
  private getVeganSpecificRecommendations(nutrient: string): string[] {
    const specific: Record<string, string[]> = {
      iron: ['Associez avec de la vitamine C', 'Évitez le thé/café aux repas'],
      calcium: ['Préférez les sources à haute biodisponibilité'],
      zinc: ['Faites tremper les légumineuses', 'Consommez avec des protéines'],
      vitaminB12: ['Supplémentation quotidienne ou hebdomadaire obligatoire'],
      omega3: ['Consommez des graines de lin moulues, noix, huile de colza']
    };

    return specific[nutrient] || [];
  }

  /**
   * Escalate severity level
   */
  private escalateSeverity(current: 'critical' | 'high' | 'moderate' | 'low'): 'critical' | 'high' | 'moderate' | 'low' {
    const levels = ['low', 'moderate', 'high', 'critical'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.min(currentIndex + 1, levels.length - 1)] as any;
  }

  /**
   * Convert severity to number for sorting
   */
  private severityToNumber(severity: 'critical' | 'high' | 'moderate' | 'low'): number {
    const map = { critical: 4, high: 3, moderate: 2, low: 1 };
    return map[severity];
  }

  /**
   * Calculate overall nutritional score
   */
  private calculateOverallScore(gaps: NutritionalGap[], strengths: string[], adequacyPercentage: number): number {
    let score = adequacyPercentage;

    // Penalize gaps based on severity
    for (const gap of gaps) {
      const penalty = this.severityToNumber(gap.severity) * 5;
      score -= penalty;
    }

    // Bonus for strengths
    score += strengths.length * 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate supplement recommendations
   */
  private generateSupplementRecommendations(gaps: NutritionalGap[], profile: ANSESProfile): string[] {
    const supplements: string[] = [];
    
    // Always recommend B12 for vegans
    supplements.push('Vitamine B12: 10-25 µg/jour ou 2000 µg/semaine');

    // Check for other critical gaps
    for (const gap of gaps) {
      if (gap.severity === 'critical' || gap.severity === 'high') {
        switch (gap.nutrient) {
          case 'vitaminD':
            supplements.push('Vitamine D3: 1000-2000 UI/jour (octobre-mars)');
            break;
          case 'iron':
            if (profile.gender === 'female' && profile.age < 50) {
              supplements.push('Fer: consulter un médecin pour dosage');
            }
            break;
          case 'omega3':
            supplements.push('Oméga-3: algues (EPA/DHA) 250-500 mg/jour');
            break;
          case 'zinc':
            supplements.push('Zinc: 8-11 mg/jour avec repas');
            break;
        }
      }
    }

    return supplements;
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      baseRecommendations: this.baseRecommendations.size,
      veganAdjustments: this.veganAdjustments.size,
      version: '2024.1',
      source: 'ANSES France'
    };
  }
}

// Export singleton instance
export const ansesRNPService = new ANSESRNPService();