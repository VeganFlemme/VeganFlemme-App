export interface NutrientProfile {
  [key: string]: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fiber: number;
  sugar: number;
  fat: number;
  saturatedFat: number;
  monounsaturatedFat: number;
  polyunsaturatedFat: number;
  omega3: number;
  omega6: number;
  cholesterol: number;
  sodium: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  iron: number;
  zinc: number;
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitaminB6: number;
  folate: number;
  vitaminB12: number;
  biotin: number;
  pantothenicAcid: number;
  iodine: number;
  selenium: number;
}

export interface Food {
  id: string;
  name: string;
  description?: string;
  category: string[];
  nutrients: NutrientProfile;
  servingSize: {
    amount: number;
    unit: string;
  };
  allergens: string[];
  sustainabilityScore?: number;
  carbonFootprint?: number;
  waterUsage?: number;
  seasonality?: {
    regions: string[];
    months: number[];
  };
  processingLevel: 'whole' | 'minimally-processed' | 'processed' | 'ultra-processed';
  organicOption: boolean;
  localAvailability?: string[];
  price?: {
    average: number;
    currency: string;
    pricePerUnit: string;
  };
  image?: string;
  isStaple?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: {
    foodId: string;
    amount: number;
    unit: string;
    preparation?: string;
  }[];
  instructions: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  mealType: ('breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert')[];
  cuisineType: string[];
  tags: string[];
  nutrients?: NutrientProfile;
  rating?: number;
  reviewCount?: number;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  video?: string;
  equipmentNeeded?: string[];
  substituteIngredientGroups?: {
    groupId: string;
    ingredients: string[];
  }[];
  isFeatured?: boolean;
  isApproved?: boolean;
}

export interface UserProfile {
  id: string;
  age: number;
  biologicalSex: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  goal: 'weight-loss' | 'weight-maintenance' | 'weight-gain' | 'muscle-gain' | 'health-improvement' | 'athletic-performance';
  veganSince?: Date;
  veganTransitionStage?: 'considering' | 'beginning' | 'intermediate' | 'established';
  healthConditions?: string[];
  allergies?: string[];
  intolerances?: string[];
  dislikedIngredients?: string[];
  favoriteIngredients?: string[];
  favoriteRecipes?: string[];
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  cookingTime: 'minimal' | 'moderate' | 'extended';
  budgetLevel: 'economic' | 'moderate' | 'premium';
  cuisinePreferences?: string[];
  mealPreferences?: {
    breakfast: boolean;
    morningSnack: boolean;
    lunch: boolean;
    afternoonSnack: boolean;
    dinner: boolean;
    eveningSnack: boolean;
  };
  dietaryFocus?: ('whole-food' | 'high-protein' | 'low-fat' | 'high-carb' | 'raw' | 'gluten-free')[];
  supplements?: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  nutritionalDeficiencies?: {
    nutrient: string;
    level: 'low' | 'borderline' | 'severe';
    date: Date;
  }[];
  healthMetrics?: {
    date: Date;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    cholesterol?: {
      total: number;
      hdl: number;
      ldl: number;
      triglycerides: number;
    };
    bloodSugar?: number;
    ironLevel?: number;
    vitaminB12?: number;
    vitaminD?: number;
    omega3?: number;
  }[];
}

export interface MealPlan {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  name?: string;
  description?: string;
  days: MealPlanDay[];
  targetNutrients: NutrientProfile;
  actualNutrients?: NutrientProfile;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  feedback?: {
    rating: number;
    comments: string;
    adherenceRate?: number;
  };
  adaptations?: {
    date: Date;
    reason: string;
    changes: string;
  }[];
}

export interface MealPlanDay {
  date: Date;
  meals: Meal[];
  nutrients?: NutrientProfile;
  groceryList?: {
    foodId: string;
    amount: number;
    unit: string;
  }[];
  notes?: string;
  completed?: boolean;
}

export interface Meal {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  time?: Date;
  recipes: {
    recipeId: string;
    servings: number;
  }[];
  foods?: {
    foodId: string;
    amount: number;
    unit: string;
  }[];
  nutrients?: NutrientProfile;
  completed?: boolean;
  userRating?: number;
  userComments?: string;
}