export interface User {
  id: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  createdAt: Date;
  transitionStage: TransitionStage;
  favoriteRecipes: string[];
  shoppingLists: ShoppingList[];
  mealPlans: MealPlan[];
}

export enum TransitionStage {
  CURIOUS = 'curious',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERIENCED = 'experienced'
}

export interface DietaryPreference {
  id: string;
  name: string;
  description?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  mealType: string[];
  cuisine: string;
  tags: string[];
  nutritionalInfo: NutritionalInfo;
  imageUrl?: string;
  authorId: string;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  substitutes?: string[];
  isAllergen?: boolean;
  greenweezProductId?: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
  vitaminB12?: number;
  iron?: number;
  calcium?: number;
  omega3?: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  meals: Meal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Meal {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  servings: number;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
  mealPlanId?: string;
  totalEstimatedCost?: number;
  metadata?: {
    generatedFromMenu?: boolean;
    menuId?: string;
    affiliatePartnersAvailable?: {
      amazon?: boolean;
      greenweez?: boolean;
    };
  };
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
  isCompleted: boolean;
  category: string;
  notes?: string;
  greenweezProductId?: string;
  greenweezProductUrl?: string;
  amazonProductId?: string;
  amazonProductUrl?: string;
}

export interface GreenweezProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  subcategory: string;
  tags: string[];
  nutritionalInfo?: NutritionalInfo;
  ingredients?: string;
  isOrganic: boolean;
  isFairTrade?: boolean;
  brand: string;
  packageSize: string;
  affiliateUrl: string;
}

export interface AmazonProduct {
  id: string;
  asin: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  subcategory?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  availability: string;
  affiliateUrl: string;
  features?: string[];
  isVegan?: boolean;
  isOrganic?: boolean;
  nutritionalInfo?: NutritionalInfo;
}

export interface TransitionPlan {
  id: string;
  userId: string;
  stage: TransitionStage;
  startDate: Date;
  goals: TransitionGoal[];
  weeklyTasks: TransitionTask[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransitionGoal {
  id: string;
  description: string;
  isCompleted: boolean;
  targetDate?: Date;
}

export interface TransitionTask {
  id: string;
  description: string;
  type: 'learning' | 'cooking' | 'shopping' | 'habit';
  isCompleted: boolean;
  dueDate: Date;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'recipe' | 'book';
  url: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUrls?: string[];
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionTracker {
  id: string;
  userId: string;
  date: Date;
  meals: TrackedMeal[];
  totalNutrients: NutritionalInfo;
}

export interface TrackedMeal {
  id: string;
  recipeId?: string;
  customName?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  nutrients: NutritionalInfo;
}