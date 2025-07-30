import { logger } from '../utils/logger';

/**
 * QualityScorer Service
 * 
 * Calcule les scores de qualité alimentaire :
 * - Nutri-Score (A-E)
 * - Eco-Score (A+-E) 
 * - Score ultra-transformés (classification NOVA)
 * - Labels qualité (Bio, origine, etc.)
 */

export interface NutritionalData {
  calories: number; // kcal/100g
  protein: number; // g/100g
  carbs: number; // g/100g
  fat: number; // g/100g
  saturatedFat: number; // g/100g
  sugar: number; // g/100g
  fiber: number; // g/100g
  sodium: number; // mg/100g
  salt: number; // g/100g
}

export interface QualityLabels {
  organic: boolean;
  local: boolean; // origine France
  fairTrade: boolean;
  sustainable: boolean;
  artisanal: boolean;
  seasonal: boolean;
}

export interface EnvironmentalData {
  carbonFootprint: number; // kg CO2 eq / 100g
  waterFootprint: number; // L / 100g
  landUse: number; // m²/100g
  packaging: 'minimal' | 'recyclable' | 'plastic' | 'excessive';
  transportDistance: number; // km
  seasonality: 'in_season' | 'out_season' | 'year_round';
}

export interface ProcessingLevel {
  novaClass: 1 | 2 | 3 | 4; // Classification NOVA
  additives: string[]; // Liste des additifs
  preservatives: string[];
  artificialFlavors: boolean;
  artificialColors: boolean;
  emulsifiers: string[];
}

export interface QualityScores {
  nutriScore: {
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    points: number;
    breakdown: {
      negative: number; // calories, saturated fat, sugar, sodium
      positive: number; // fiber, protein, fruits/vegetables
    };
  };
  ecoScore: {
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
    points: number;
    breakdown: {
      environmental: number;
      packaging: number;
      origin: number;
      threatened_species: number;
    };
  };
  processing: {
    novaScore: 1 | 2 | 3 | 4;
    isUltraProcessed: boolean;
    additiveCount: number;
    naturalness: number; // 0-100%
  };
  quality: {
    overallScore: number; // 0-100
    labels: QualityLabels;
    recommendations: string[];
    warnings: string[];
  };
}

export interface FoodProduct {
  id: string;
  name: string;
  category: string;
  nutrition: NutritionalData;
  environmental: EnvironmentalData;
  processing: ProcessingLevel;
  labels: QualityLabels;
  fruitsVegetablesPercentage?: number; // 0-100% pour Nutri-Score
}

export class QualityScorerService {
  constructor() {
    logger.info('QualityScorer Service initialized');
  }

  /**
   * Calcule tous les scores de qualité pour un aliment
   */
  public calculateQualityScores(product: FoodProduct): QualityScores {
    const nutriScore = this.calculateNutriScore(product);
    const ecoScore = this.calculateEcoScore(product);
    const processing = this.calculateProcessingScore(product);
    const quality = this.calculateOverallQuality(product, nutriScore, ecoScore, processing);

    return {
      nutriScore,
      ecoScore,
      processing,
      quality
    };
  }

  /**
   * Calcul du Nutri-Score selon l'algorithme officiel
   * Source: https://www.santepubliquefrance.fr/determinants-de-sante/nutrition-et-activite-physique/articles/nutri-score
   */
  private calculateNutriScore(product: FoodProduct): QualityScores['nutriScore'] {
    const { nutrition } = product;
    
    // Points négatifs (éléments à limiter)
    let negativePoints = 0;
    
    // Énergie (calories)
    if (nutrition.calories <= 335) negativePoints += 0;
    else if (nutrition.calories <= 670) negativePoints += 1;
    else if (nutrition.calories <= 1005) negativePoints += 2;
    else if (nutrition.calories <= 1340) negativePoints += 3;
    else if (nutrition.calories <= 1675) negativePoints += 4;
    else if (nutrition.calories <= 2010) negativePoints += 5;
    else if (nutrition.calories <= 2345) negativePoints += 6;
    else if (nutrition.calories <= 2680) negativePoints += 7;
    else if (nutrition.calories <= 3015) negativePoints += 8;
    else if (nutrition.calories <= 3350) negativePoints += 9;
    else negativePoints += 10;

    // Acides gras saturés
    if (nutrition.saturatedFat <= 1) negativePoints += 0;
    else if (nutrition.saturatedFat <= 2) negativePoints += 1;
    else if (nutrition.saturatedFat <= 3) negativePoints += 2;
    else if (nutrition.saturatedFat <= 4) negativePoints += 3;
    else if (nutrition.saturatedFat <= 5) negativePoints += 4;
    else if (nutrition.saturatedFat <= 6) negativePoints += 5;
    else if (nutrition.saturatedFat <= 7) negativePoints += 6;
    else if (nutrition.saturatedFat <= 8) negativePoints += 7;
    else if (nutrition.saturatedFat <= 9) negativePoints += 8;
    else if (nutrition.saturatedFat <= 10) negativePoints += 9;
    else negativePoints += 10;

    // Sucres
    if (nutrition.sugar <= 4.5) negativePoints += 0;
    else if (nutrition.sugar <= 9) negativePoints += 1;
    else if (nutrition.sugar <= 13.5) negativePoints += 2;
    else if (nutrition.sugar <= 18) negativePoints += 3;
    else if (nutrition.sugar <= 22.5) negativePoints += 4;
    else if (nutrition.sugar <= 27) negativePoints += 5;
    else if (nutrition.sugar <= 31) negativePoints += 6;
    else if (nutrition.sugar <= 36) negativePoints += 7;
    else if (nutrition.sugar <= 40) negativePoints += 8;
    else if (nutrition.sugar <= 45) negativePoints += 9;
    else negativePoints += 10;

    // Sodium
    if (nutrition.sodium <= 90) negativePoints += 0;
    else if (nutrition.sodium <= 180) negativePoints += 1;
    else if (nutrition.sodium <= 270) negativePoints += 2;
    else if (nutrition.sodium <= 360) negativePoints += 3;
    else if (nutrition.sodium <= 450) negativePoints += 4;
    else if (nutrition.sodium <= 540) negativePoints += 5;
    else if (nutrition.sodium <= 630) negativePoints += 6;
    else if (nutrition.sodium <= 720) negativePoints += 7;
    else if (nutrition.sodium <= 810) negativePoints += 8;
    else if (nutrition.sodium <= 900) negativePoints += 9;
    else negativePoints += 10;

    // Points positifs (éléments favorables)
    let positivePoints = 0;

    // Fibres
    if (nutrition.fiber <= 0.9) positivePoints += 0;
    else if (nutrition.fiber <= 1.9) positivePoints += 1;
    else if (nutrition.fiber <= 2.8) positivePoints += 2;
    else if (nutrition.fiber <= 3.7) positivePoints += 3;
    else if (nutrition.fiber <= 4.7) positivePoints += 4;
    else positivePoints += 5;

    // Protéines (si points négatifs < 11 ou si fruits/légumes ≥ 80%)
    const canCountProteins = negativePoints < 11 || (product.fruitsVegetablesPercentage || 0) >= 80;
    if (canCountProteins) {
      if (nutrition.protein <= 1.6) positivePoints += 0;
      else if (nutrition.protein <= 3.2) positivePoints += 1;
      else if (nutrition.protein <= 4.8) positivePoints += 2;
      else if (nutrition.protein <= 6.4) positivePoints += 3;
      else if (nutrition.protein <= 8.0) positivePoints += 4;
      else positivePoints += 5;
    }

    // Fruits et légumes (estimation basée sur la catégorie)
    const fruitsVegPercentage = product.fruitsVegetablesPercentage || this.estimateFruitsVegetablesPercentage(product);
    if (fruitsVegPercentage <= 40) positivePoints += 0;
    else if (fruitsVegPercentage <= 60) positivePoints += 1;
    else if (fruitsVegPercentage <= 80) positivePoints += 2;
    else positivePoints += 5;

    // Calcul du score final
    const totalPoints = negativePoints - positivePoints;
    
    let grade: 'A' | 'B' | 'C' | 'D' | 'E';
    if (totalPoints <= -1) grade = 'A';
    else if (totalPoints <= 2) grade = 'B';
    else if (totalPoints <= 10) grade = 'C';
    else if (totalPoints <= 18) grade = 'D';
    else grade = 'E';

    logger.debug('Nutri-Score calculated', { 
      productId: product.id, 
      grade, 
      points: totalPoints,
      negative: negativePoints,
      positive: positivePoints
    });

    return {
      grade,
      points: totalPoints,
      breakdown: {
        negative: negativePoints,
        positive: positivePoints
      }
    };
  }

  /**
   * Calcul de l'Eco-Score
   * Basé sur l'analyse du cycle de vie et l'impact environnemental
   */
  private calculateEcoScore(product: FoodProduct): QualityScores['ecoScore'] {
    const { environmental, labels } = product;
    
    let totalPoints = 100; // On part de 100 et on retire des points

    // Impact environnemental (empreinte carbone principale)
    let environmentalPenalty = 0;
    if (environmental.carbonFootprint > 10) environmentalPenalty = 40;
    else if (environmental.carbonFootprint > 5) environmentalPenalty = 30;
    else if (environmental.carbonFootprint > 2) environmentalPenalty = 20;
    else if (environmental.carbonFootprint > 1) environmentalPenalty = 10;
    else environmentalPenalty = 0;

    // Emballage
    let packagingPenalty = 0;
    switch (environmental.packaging) {
      case 'minimal': packagingPenalty = 0; break;
      case 'recyclable': packagingPenalty = 5; break;
      case 'plastic': packagingPenalty = 15; break;
      case 'excessive': packagingPenalty = 25; break;
    }

    // Origine (transport)
    let originPenalty = 0;
    if (environmental.transportDistance > 10000) originPenalty = 20; // Intercontinental
    else if (environmental.transportDistance > 2000) originPenalty = 15; // Européen
    else if (environmental.transportDistance > 500) originPenalty = 10; // National
    else if (environmental.transportDistance > 100) originPenalty = 5; // Régional
    else originPenalty = 0; // Local

    // Espèces menacées (impact sur la biodiversité)
    let threatenedSpeciesPenalty = 0;
    // Pour une version complète, ici on intégrerait une base de données
    // des cultures/productions impactant la biodiversité
    
    // Bonus pour les labels écologiques
    let ecoBonus = 0;
    if (labels.organic) ecoBonus += 10;
    if (labels.local) ecoBonus += 5;
    if (labels.sustainable) ecoBonus += 5;
    if (labels.seasonal && environmental.seasonality === 'in_season') ecoBonus += 3;

    const finalScore = Math.max(0, Math.min(100, 
      totalPoints - environmentalPenalty - packagingPenalty - originPenalty - threatenedSpeciesPenalty + ecoBonus
    ));

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
    if (finalScore >= 90) grade = 'A+';
    else if (finalScore >= 80) grade = 'A';
    else if (finalScore >= 65) grade = 'B';
    else if (finalScore >= 50) grade = 'C';
    else if (finalScore >= 35) grade = 'D';
    else grade = 'E';

    logger.debug('Eco-Score calculated', { 
      productId: product.id, 
      grade, 
      score: finalScore,
      carbonFootprint: environmental.carbonFootprint
    });

    return {
      grade,
      points: finalScore,
      breakdown: {
        environmental: environmentalPenalty,
        packaging: packagingPenalty,
        origin: originPenalty,
        threatened_species: threatenedSpeciesPenalty
      }
    };
  }

  /**
   * Calcul du score de transformation (NOVA)
   */
  private calculateProcessingScore(product: FoodProduct): QualityScores['processing'] {
    const { processing } = product;
    
    const isUltraProcessed = processing.novaClass === 4;
    const additiveCount = processing.additives.length + processing.preservatives.length + processing.emulsifiers.length;
    
    // Calcul du score de naturalness (plus c'est transformé, moins c'est naturel)
    let naturalness = 100;
    
    switch (processing.novaClass) {
      case 1: naturalness = 100; break; // Aliments non transformés
      case 2: naturalness = 80; break;  // Ingrédients culinaires transformés
      case 3: naturalness = 50; break;  // Aliments transformés
      case 4: naturalness = 20; break;  // Aliments ultra-transformés
    }

    // Pénalité pour les additifs
    naturalness -= Math.min(30, additiveCount * 3);
    
    // Pénalité pour les arômes et colorants artificiels
    if (processing.artificialFlavors) naturalness -= 10;
    if (processing.artificialColors) naturalness -= 10;

    naturalness = Math.max(0, naturalness);

    logger.debug('Processing score calculated', { 
      productId: product.id, 
      novaClass: processing.novaClass,
      isUltraProcessed,
      naturalness
    });

    return {
      novaScore: processing.novaClass,
      isUltraProcessed,
      additiveCount,
      naturalness
    };
  }

  /**
   * Calcul du score de qualité global
   */
  private calculateOverallQuality(
    product: FoodProduct,
    nutriScore: QualityScores['nutriScore'],
    ecoScore: QualityScores['ecoScore'],
    processing: QualityScores['processing']
  ): QualityScores['quality'] {
    
    // Conversion des grades en scores numériques
    const nutriPoints = this.gradeToPoints(nutriScore.grade, 'nutri');
    const ecoPoints = ecoScore.points;
    const processPoints = processing.naturalness;

    // Score global pondéré
    const overallScore = Math.round(
      (nutriPoints * 0.4) + // 40% nutrition
      (ecoPoints * 0.3) +   // 30% environnement
      (processPoints * 0.3) // 30% transformation
    );

    // Génération des recommandations
    const recommendations = this.generateRecommendations(product, nutriScore, ecoScore, processing);
    const warnings = this.generateWarnings(product, nutriScore, ecoScore, processing);

    logger.info('Overall quality calculated', { 
      productId: product.id, 
      overallScore,
      nutriGrade: nutriScore.grade,
      ecoGrade: ecoScore.grade,
      novaClass: processing.novaScore
    });

    return {
      overallScore,
      labels: product.labels,
      recommendations,
      warnings
    };
  }

  /**
   * Conversion des grades en points numériques
   */
  private gradeToPoints(grade: string, type: 'nutri' | 'eco'): number {
    const nutriMapping: Record<string, number> = {
      'A': 100, 'B': 80, 'C': 60, 'D': 40, 'E': 20
    };
    
    const ecoMapping: Record<string, number> = {
      'A+': 100, 'A': 90, 'B': 70, 'C': 50, 'D': 30, 'E': 10
    };

    return type === 'nutri' ? nutriMapping[grade] : ecoMapping[grade];
  }

  /**
   * Estimation du pourcentage de fruits et légumes basé sur la catégorie
   */
  private estimateFruitsVegetablesPercentage(product: FoodProduct): number {
    const category = product.category.toLowerCase();
    
    if (category.includes('fruit') || category.includes('légume') || category.includes('legume')) {
      return 100;
    }
    if (category.includes('salade') || category.includes('soup')) {
      return 60;
    }
    if (category.includes('cereal') || category.includes('grain')) {
      return 0;
    }
    if (category.includes('protein') || category.includes('tofu') || category.includes('tempeh')) {
      return 0;
    }
    
    return 10; // Estimation par défaut
  }

  /**
   * Génération de recommandations personnalisées
   */
  private generateRecommendations(
    product: FoodProduct,
    nutriScore: QualityScores['nutriScore'],
    ecoScore: QualityScores['ecoScore'],
    processing: QualityScores['processing']
  ): string[] {
    const recommendations: string[] = [];

    // Recommandations nutritionnelles
    if (nutriScore.grade === 'D' || nutriScore.grade === 'E') {
      recommendations.push('Considérez limiter cet aliment dans votre alimentation quotidienne');
    }
    if (product.nutrition.sodium > 500) {
      recommendations.push('Aliment riche en sodium - à consommer avec modération');
    }
    if (product.nutrition.sugar > 20) {
      recommendations.push('Aliment riche en sucres - privilégier les versions non sucrées');
    }

    // Recommandations environnementales
    if (ecoScore.grade === 'D' || ecoScore.grade === 'E') {
      recommendations.push('Impact environnemental élevé - rechercher des alternatives locales');
    }
    if (product.environmental.carbonFootprint > 5) {
      recommendations.push('Empreinte carbone importante - envisager des alternatives végétales');
    }

    // Recommandations transformation
    if (processing.isUltraProcessed) {
      recommendations.push('Aliment ultra-transformé - privilégier des alternatives naturelles');
    }
    if (processing.additiveCount > 5) {
      recommendations.push('Nombreux additifs - vérifier la liste des ingrédients');
    }

    // Recommandations positives
    if (product.labels.organic) {
      recommendations.push('✓ Produit biologique - bon choix pour la santé et l\'environnement');
    }
    if (product.labels.local) {
      recommendations.push('✓ Produit local - soutient l\'économie locale et réduit l\'empreinte carbone');
    }

    return recommendations;
  }

  /**
   * Génération d'alertes et avertissements
   */
  private generateWarnings(
    product: FoodProduct,
    nutriScore: QualityScores['nutriScore'],
    ecoScore: QualityScores['ecoScore'],
    processing: QualityScores['processing']
  ): string[] {
    const warnings: string[] = [];

    // Alertes nutritionnelles critiques
    if (product.nutrition.sodium > 1000) {
      warnings.push('⚠️ Très riche en sodium (>1g/100g) - risque pour la tension artérielle');
    }
    if (product.nutrition.saturatedFat > 10) {
      warnings.push('⚠️ Très riche en graisses saturées - impact cardiovasculaire');
    }
    if (product.nutrition.sugar > 30) {
      warnings.push('⚠️ Très riche en sucres - risque de pic glycémique');
    }

    // Alertes transformation
    if (processing.novaScore === 4 && processing.additiveCount > 10) {
      warnings.push('⚠️ Aliment ultra-transformé avec de nombreux additifs');
    }
    if (product.processing.artificialColors && product.processing.artificialFlavors) {
      warnings.push('⚠️ Contient des colorants et arômes artificiels');
    }

    // Alertes environnementales
    if (product.environmental.carbonFootprint > 10) {
      warnings.push('⚠️ Empreinte carbone très élevée (>10kg CO2/100g)');
    }

    return warnings;
  }

  /**
   * Comparaison de deux produits
   */
  public compareProducts(product1: FoodProduct, product2: FoodProduct): any {
    const scores1 = this.calculateQualityScores(product1);
    const scores2 = this.calculateQualityScores(product2);

    return {
      product1: { name: product1.name, scores: scores1 },
      product2: { name: product2.name, scores: scores2 },
      comparison: {
        betterNutrition: scores1.quality.overallScore > scores2.quality.overallScore ? product1.name : product2.name,
        betterEnvironment: scores1.ecoScore.points > scores2.ecoScore.points ? product1.name : product2.name,
        lessProcessed: scores1.processing.naturalness > scores2.processing.naturalness ? product1.name : product2.name,
        recommendation: scores1.quality.overallScore > scores2.quality.overallScore ? 
          `${product1.name} est un meilleur choix global` : 
          `${product2.name} est un meilleur choix global`
      }
    };
  }

  /**
   * Recherche de produits par score de qualité
   */
  public filterByQuality(products: FoodProduct[], minScore: number): FoodProduct[] {
    return products.filter(product => {
      const scores = this.calculateQualityScores(product);
      return scores.quality.overallScore >= minScore;
    });
  }
}