#!/usr/bin/env node

/**
 * Script to convert CIQUAL Excel files to optimized JSON format
 * This will dramatically improve loading performance
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class CiqualDataOptimizer {
  constructor() {
    this.foods = new Map();
    this.dataFiles = [
      'Table Ciqual 2020_FR_2020 07 07.xls',
      'Table Aliments moyens Ciqual 2020_2021 04 23.xlsx', 
      'CALNUT2020_2020_07_07.xlsx'
    ];
  }

  /**
   * Process all CIQUAL Excel files and convert to optimized JSON
   */
  async processFiles() {
    console.log('🔄 Processing CIQUAL Excel files...');
    
    const dataDir = process.env.CIQUAL_DATA_DIR || path.join(process.cwd(), 'data');
    
    for (const fileName of this.dataFiles) {
      await this.processFile(path.join(dataDir, fileName), fileName);
    }
    
    console.log(`✅ Processed ${this.foods.size} unique foods`);
    
    // Convert Map to Object for JSON serialization
    const foodsArray = Array.from(this.foods.values());
    
    // Generate optimized data structure
    const optimizedData = {
      metadata: {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        totalFoods: this.foods.size,
        sourceFiles: this.dataFiles,
        description: 'Optimized CIQUAL database for fast loading'
      },
      foods: foodsArray,
      // Create search indices for faster lookups
      indices: this.createSearchIndices(foodsArray)
    };
    
    // Write optimized JSON file
    const outputPath = path.join(dataDir, 'ciqual-optimized.json');
    fs.writeFileSync(outputPath, JSON.stringify(optimizedData, null, 2));
    
    console.log(`📁 Optimized data saved to: ${outputPath}`);
    console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    return optimizedData;
  }
  
  /**
   * Process individual Excel file
   */
  async processFile(filePath, fileName) {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${fileName}`);
      return;
    }
    
    console.log(`📖 Processing: ${fileName}`);
    
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length < 2) {
        console.warn(`⚠️  Insufficient data in ${fileName}`);
        return;
      }
      
      const headers = data[0];
      let processedCount = 0;
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 2) continue;
        
        const food = this.parseRow(headers, row, fileName);
        if (food) {
          // Use code as key, but handle duplicates by keeping the most complete entry
          const existingFood = this.foods.get(food.code);
          if (!existingFood || this.isMoreComplete(food, existingFood)) {
            this.foods.set(food.code, food);
          }
          processedCount++;
        }
      }
      
      console.log(`  ✅ Processed ${processedCount} foods from ${fileName}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
    }
  }
  
  /**
   * Parse a row of data from Excel file
   */
  parseRow(headers, row, fileName) {
    try {
      const food = {
        code: this.getCellValue(row, this.findColumnIndex(headers, ['alim_code', 'code', 'Code'])) || `${fileName}-${Math.random()}`,
        name: this.getCellValue(row, this.findColumnIndex(headers, ['alim_nom_fr', 'nom_fr', 'Nom', 'name', 'FOOD_LABEL'])) || 'Unknown',
        nameEn: this.getCellValue(row, this.findColumnIndex(headers, ['alim_nom_eng', 'nom_eng', 'English name'])),
        group: this.getCellValue(row, this.findColumnIndex(headers, ['alim_grp_nom_fr', 'groupe', 'Group'])),
        subGroup: this.getCellValue(row, this.findColumnIndex(headers, ['alim_ssgrp_nom_fr', 'sous_groupe', 'Subgroup'])),
        source: fileName
      };
      
      // Parse nutritional values (per 100g)
      food.energy = this.getNumericValue(row, this.findColumnIndex(headers, ['Energie', 'energie', 'Energy', 'kcal', 'nrj_kcal']));
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
      console.warn(`⚠️  Error parsing row in ${fileName}:`, error.message);
      return null;
    }
  }
  
  /**
   * Create search indices for faster lookups
   */
  createSearchIndices(foods) {
    const nameIndex = {};
    const groupIndex = {};
    const veganFoods = [];
    
    const veganKeywords = [
      'légume', 'fruit', 'céréale', 'légumineuse', 'noix', 'graine',
      'végétal', 'plante', 'huile végétale', 'farine', 'pain'
    ];
    
    const nonVeganKeywords = [
      'viande', 'poisson', 'lait', 'fromage', 'beurre', 'oeuf',
      'porc', 'boeuf', 'agneau', 'volaille', 'crustacé', 'mollusque',
      'miel', 'gélatine'
    ];
    
    foods.forEach((food, index) => {
      // Name index for search
      const nameLower = food.name.toLowerCase();
      const words = nameLower.split(/\s+/);
      
      words.forEach(word => {
        if (word.length > 2) { // Skip very short words
          if (!nameIndex[word]) nameIndex[word] = [];
          nameIndex[word].push(index);
        }
      });
      
      // Group index
      if (food.group) {
        const groupLower = food.group.toLowerCase();
        if (!groupIndex[groupLower]) groupIndex[groupLower] = [];
        groupIndex[groupLower].push(index);
      }
      
      // Vegan classification
      const isVeganByKeyword = veganKeywords.some(keyword => 
        nameLower.includes(keyword) || (food.group && food.group.toLowerCase().includes(keyword))
      );
      
      const isNonVeganByKeyword = nonVeganKeywords.some(keyword => 
        nameLower.includes(keyword) || (food.group && food.group.toLowerCase().includes(keyword))
      );
      
      if (isVeganByKeyword && !isNonVeganByKeyword) {
        veganFoods.push(index);
      }
    });
    
    return {
      nameIndex,
      groupIndex,
      veganFoods
    };
  }
  
  /**
   * Helper methods
   */
  findColumnIndex(headers, possibleNames) {
    for (const name of possibleNames) {
      const index = headers.findIndex(header => 
        header && header.toLowerCase().includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  }
  
  getCellValue(row, index) {
    if (index === -1 || !row[index]) return undefined;
    return String(row[index]).trim();
  }
  
  getNumericValue(row, index) {
    if (index === -1 || row[index] === undefined || row[index] === null || row[index] === '') return undefined;
    const value = Number(row[index]);
    return isNaN(value) ? undefined : value;
  }
  
  isMoreComplete(food1, food2) {
    // Simple completeness score based on available nutritional data
    const score1 = this.getCompletenessScore(food1);
    const score2 = this.getCompletenessScore(food2);
    return score1 > score2;
  }
  
  getCompletenessScore(food) {
    let score = 0;
    const nutritionFields = ['energy', 'protein', 'carbohydrates', 'fat', 'fiber', 'calcium', 'iron', 'vitaminC', 'vitaminB12'];
    nutritionFields.forEach(field => {
      if (food[field] !== undefined && food[field] !== null) score++;
    });
    return score;
  }
}

// Run if called directly
if (require.main === module) {
  const optimizer = new CiqualDataOptimizer();
  optimizer.processFiles()
    .then((data) => {
      console.log('🎉 CIQUAL data optimization completed successfully!');
      console.log(`📊 Generated optimized database with ${data.foods.length} foods`);
    })
    .catch((error) => {
      console.error('❌ Error during optimization:', error);
      process.exit(1);
    });
}

module.exports = CiqualDataOptimizer;