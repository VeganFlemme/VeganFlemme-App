import * as XLSX from 'xlsx';
import * as path from 'path';
import { logger } from '../utils/logger';

export interface CiqualFood {
  code: string;
  name: string;
  nameEn?: string;
  group?: string;
  subGroup?: string;
  // Nutritional values per 100g
  energy?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  sodium?: number;
  zinc?: number;
  vitaminC?: number;
  vitaminB1?: number;
  vitaminB2?: number;
  vitaminB3?: number;
  vitaminB6?: number;
  vitaminB9?: number;
  vitaminB12?: number;
  vitaminA?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
}

export interface CiqualSearchResult {
  foods: CiqualFood[];
  total: number;
}

/**
 * Service for processing CIQUAL nutritional data from Excel files
 * CIQUAL is the French food composition database from ANSES
 */
export class CiqualService {
  private foods: Map<string, CiqualFood> = new Map();
  private foodsByName: Map<string, CiqualFood[]> = new Map();
  private initialized: boolean = false;
  
  private readonly dataFiles = [
    'Table Ciqual 2020_FR_2020 07 07.xls',
    'Table Aliments moyens Ciqual 2020_2021 04 23.xlsx', 
    'CALNUT2020_2020_07_07.xlsx'
  ];

  constructor() {
    logger.info('CIQUAL Service initializing');
  }

  /**
   * Initialize the service by loading all CIQUAL data files
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      logger.info('Loading CIQUAL data files', { filesCount: this.dataFiles.length });
      
      for (const fileName of this.dataFiles) {
        await this.loadDataFile(fileName);
      }
      
      this.buildNameIndex();
      this.initialized = true;
      
      logger.info('CIQUAL Service initialized successfully', { 
        totalFoods: this.foods.size,
        uniqueNames: this.foodsByName.size 
      });
    } catch (error) {
      logger.error('Failed to initialize CIQUAL Service', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error(`CIQUAL Service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load a specific CIQUAL data file
   */
  private async loadDataFile(fileName: string): Promise<void> {
    const filePath = path.join(process.cwd(), '..', fileName);
    
    try {
      logger.info('Loading CIQUAL file', { fileName });
      
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (data.length < 2) {
        logger.warn('CIQUAL file has insufficient data', { fileName, rowCount: data.length });
        return;
      }
      
      const headers = data[0] as string[];
      logger.info('CIQUAL file headers detected', { fileName, headers: headers.slice(0, 5) });
      
      let processedCount = 0;
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 2) continue;
        
        const food = this.parseRow(headers, row, fileName);
        if (food) {
          this.foods.set(food.code, food);
          processedCount++;
        }
      }
      
      logger.info('CIQUAL file processed', { 
        fileName, 
        totalRows: data.length - 1,
        processedFoods: processedCount 
      });
      
    } catch (error) {
      logger.error('Error loading CIQUAL file', { 
        fileName, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      // Don't throw here, just log the error and continue with other files
    }
  }

  /**
   * Parse a row of data from CIQUAL Excel file
   */
  private parseRow(headers: string[], row: any[], fileName: string): CiqualFood | null {
    try {
      // The exact column mapping might vary between files, so we'll be flexible
      const food: CiqualFood = {
        code: this.getCellValue(row, this.findColumnIndex(headers, ['alim_code', 'code', 'Code'])) || `${fileName}-${Math.random()}`,
        name: this.getCellValue(row, this.findColumnIndex(headers, ['alim_nom_fr', 'nom_fr', 'Nom', 'name'])) || 'Unknown',
        nameEn: this.getCellValue(row, this.findColumnIndex(headers, ['alim_nom_eng', 'nom_eng', 'English name'])),
        group: this.getCellValue(row, this.findColumnIndex(headers, ['alim_grp_nom_fr', 'groupe', 'Group'])),
        subGroup: this.getCellValue(row, this.findColumnIndex(headers, ['alim_ssgrp_nom_fr', 'sous_groupe', 'Subgroup']))
      };
      
      // Parse nutritional values (per 100g)
      food.energy = this.getNumericValue(row, this.findColumnIndex(headers, ['Energie', 'energie', 'Energy', 'kcal']));
      food.protein = this.getNumericValue(row, this.findColumnIndex(headers, ['Proteines', 'proteines', 'Protein']));
      food.carbohydrates = this.getNumericValue(row, this.findColumnIndex(headers, ['Glucides', 'glucides', 'Carbohydrates']));
      food.fat = this.getNumericValue(row, this.findColumnIndex(headers, ['Lipides', 'lipides', 'Fat']));
      food.fiber = this.getNumericValue(row, this.findColumnIndex(headers, ['Fibres', 'fibres', 'Fiber']));
      
      // Minerals
      food.calcium = this.getNumericValue(row, this.findColumnIndex(headers, ['Calcium', 'calcium', 'Ca']));
      food.iron = this.getNumericValue(row, this.findColumnIndex(headers, ['Fer', 'fer', 'Iron', 'Fe']));
      food.magnesium = this.getNumericValue(row, this.findColumnIndex(headers, ['Magnesium', 'magnesium', 'Mg']));
      food.phosphorus = this.getNumericValue(row, this.findColumnIndex(headers, ['Phosphore', 'phosphore', 'Phosphorus', 'P']));
      food.potassium = this.getNumericValue(row, this.findColumnIndex(headers, ['Potassium', 'potassium', 'K']));
      food.sodium = this.getNumericValue(row, this.findColumnIndex(headers, ['Sodium', 'sodium', 'Na']));
      food.zinc = this.getNumericValue(row, this.findColumnIndex(headers, ['Zinc', 'zinc', 'Zn']));
      
      // Vitamins
      food.vitaminC = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine C', 'vitamine_c', 'Vitamin C']));
      food.vitaminB1 = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine B1', 'vitamine_b1', 'Thiamine']));
      food.vitaminB2 = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine B2', 'vitamine_b2', 'Riboflavine']));
      food.vitaminB3 = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine B3', 'vitamine_b3', 'Niacine']));
      food.vitaminB6 = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine B6', 'vitamine_b6']));
      food.vitaminB9 = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine B9', 'vitamine_b9', 'Folates']));
      food.vitaminB12 = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine B12', 'vitamine_b12']));
      food.vitaminA = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine A', 'vitamine_a', 'Retinol']));
      food.vitaminD = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine D', 'vitamine_d']));
      food.vitaminE = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine E', 'vitamine_e']));
      food.vitaminK = this.getNumericValue(row, this.findColumnIndex(headers, ['Vitamine K', 'vitamine_k']));
      
      return food;
    } catch (error) {
      logger.warn('Error parsing CIQUAL row', { 
        fileName, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  /**
   * Find column index by potential header names
   */
  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex(header => 
        header && header.toLowerCase().includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  }

  /**
   * Get cell value as string
   */
  private getCellValue(row: any[], index: number): string | undefined {
    if (index === -1 || !row[index]) return undefined;
    return String(row[index]).trim();
  }

  /**
   * Get cell value as number
   */
  private getNumericValue(row: any[], index: number): number | undefined {
    if (index === -1 || row[index] === undefined || row[index] === null || row[index] === '') return undefined;
    const value = Number(row[index]);
    return isNaN(value) ? undefined : value;
  }

  /**
   * Build search index by food names
   */
  private buildNameIndex(): void {
    this.foodsByName.clear();
    
    for (const food of this.foods.values()) {
      const name = food.name.toLowerCase();
      if (!this.foodsByName.has(name)) {
        this.foodsByName.set(name, []);
      }
      this.foodsByName.get(name)!.push(food);
      
      // Also index by English name if available
      if (food.nameEn) {
        const nameEn = food.nameEn.toLowerCase();
        if (!this.foodsByName.has(nameEn)) {
          this.foodsByName.set(nameEn, []);
        }
        this.foodsByName.get(nameEn)!.push(food);
      }
    }
  }

  /**
   * Get food by CIQUAL code
   */
  async getFoodByCode(code: string): Promise<CiqualFood | null> {
    await this.ensureInitialized();
    return this.foods.get(code) || null;
  }

  /**
   * Search foods by name
   */
  async searchFoodsByName(query: string, limit: number = 20): Promise<CiqualSearchResult> {
    await this.ensureInitialized();
    
    const queryLower = query.toLowerCase();
    const results: CiqualFood[] = [];
    
    // Exact match first
    const exactMatch = this.foodsByName.get(queryLower);
    if (exactMatch) {
      results.push(...exactMatch);
    }
    
    // Partial matches
    for (const [name, foods] of this.foodsByName.entries()) {
      if (name.includes(queryLower) && !results.some(r => r.code === foods[0].code)) {
        results.push(...foods);
      }
      if (results.length >= limit) break;
    }
    
    logger.info('CIQUAL search completed', { 
      query, 
      resultsCount: results.length 
    });
    
    return {
      foods: results.slice(0, limit),
      total: results.length
    };
  }

  /**
   * Get foods by category/group
   */
  async getFoodsByGroup(group: string, limit: number = 50): Promise<CiqualSearchResult> {
    await this.ensureInitialized();
    
    const results: CiqualFood[] = [];
    const groupLower = group.toLowerCase();
    
    for (const food of this.foods.values()) {
      if (food.group?.toLowerCase().includes(groupLower) || 
          food.subGroup?.toLowerCase().includes(groupLower)) {
        results.push(food);
        if (results.length >= limit) break;
      }
    }
    
    logger.info('CIQUAL group search completed', { 
      group, 
      resultsCount: results.length 
    });
    
    return {
      foods: results,
      total: results.length
    };
  }

  /**
   * Get foods suitable for vegan diet
   */
  async getVeganFoods(limit: number = 100): Promise<CiqualFood[]> {
    await this.ensureInitialized();
    
    const veganKeywords = [
      'légume', 'fruit', 'céréale', 'légumineuse', 'noix', 'graine',
      'végétal', 'plante', 'huile végétale', 'farine', 'pain',
      'végétarien', 'végétalien', 'tofu', 'tempeh', 'seitan'
    ];
    
    const nonVeganKeywords = [
      'viande', 'poisson', 'lait', 'fromage', 'beurre', 'oeuf',
      'porc', 'boeuf', 'agneau', 'volaille', 'crustacé', 'mollusque',
      'miel', 'gélatine'
    ];
    
    const results: CiqualFood[] = [];
    
    for (const food of this.foods.values()) {
      const nameLower = food.name.toLowerCase();
      const groupLower = (food.group || '').toLowerCase();
      
      const isVeganByKeyword = veganKeywords.some(keyword => 
        nameLower.includes(keyword) || groupLower.includes(keyword)
      );
      
      const isNonVeganByKeyword = nonVeganKeywords.some(keyword => 
        nameLower.includes(keyword) || groupLower.includes(keyword)
      );
      
      if (isVeganByKeyword && !isNonVeganByKeyword) {
        results.push(food);
        if (results.length >= limit) break;
      }
    }
    
    logger.info('CIQUAL vegan foods retrieved', { 
      veganFoodsCount: results.length 
    });
    
    return results;
  }

  /**
   * Get nutritional information for a food
   */
  getNutritionSummary(food: CiqualFood) {
    return {
      energy: food.energy || 0,
      protein: food.protein || 0,
      carbohydrates: food.carbohydrates || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0,
      minerals: {
        calcium: food.calcium,
        iron: food.iron,
        magnesium: food.magnesium,
        phosphorus: food.phosphorus,
        potassium: food.potassium,
        sodium: food.sodium,
        zinc: food.zinc
      },
      vitamins: {
        c: food.vitaminC,
        b1: food.vitaminB1,
        b2: food.vitaminB2,
        b3: food.vitaminB3,
        b6: food.vitaminB6,
        b9: food.vitaminB9,
        b12: food.vitaminB12,
        a: food.vitaminA,
        d: food.vitaminD,
        e: food.vitaminE,
        k: food.vitaminK
      }
    };
  }

  /**
   * Check if service is ready
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get total number of foods loaded
   */
  getTotalFoodsCount(): number {
    return this.foods.size;
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// Export singleton instance
export const ciqualService = new CiqualService();