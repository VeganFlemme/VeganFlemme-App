import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { MealPlan, Meal, Recipe, ShoppingList } from '../../types';
import { getMealPlans, createMealPlan, updateMealPlan, deleteMealPlan } from '../../services/mealPlanService';
import { searchRecipes } from '../../services/recipeService';
import { createShoppingList } from '../../services/shoppingListService';
import Calendar from './Calendar';
import MealList from './MealList';
import RecipeSearch from './RecipeSearch';
import MealPlanSummary from './MealPlanSummary';
import NutritionalOverview from './NutritionalOverview';

const MealPlanner: React.FC = () => {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const loadMealPlans = async () => {
      try {
        setLoading(true);
        const plans = await getMealPlans(user.id);
        setMealPlans(plans);
        
        // Set active plan to the current one or the most recent one
        const currentPlan = plans.find(plan => {
          const start = new Date(plan.startDate);
          const end = new Date(plan.endDate);
          const today = new Date();
          return today >= start && today <= end;
        }) || plans[0] || null;
        
        setActivePlan(currentPlan);
      } catch (err) {
        setError('Failed to load meal plans');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadMealPlans();
  }, [user]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setLoading(true);
      setSearchQuery(query);
      const results = await searchRecipes({ query, limit: 10 });
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (recipe: Recipe, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', servings: number) => {
    if (!activePlan || !user) return;
    
    try {
      const newMeal: Meal = {
        id: `temp-${Date.now()}`, // Will be replaced by server
        date: selectedDate,
        mealType,
        recipeId: recipe.id,
        servings
      };
      
      const updatedPlan = {
        ...activePlan,
        meals: [...activePlan.meals, newMeal]
      };
      
      const savedPlan = await updateMealPlan(updatedPlan);
      
      // Update local state
      setMealPlans(prevPlans => 
        prevPlans.map(plan => plan.id === savedPlan.id ? savedPlan : plan)
      );
      setActivePlan(savedPlan);
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      setError('Failed to add meal to plan');
      console.error(err);
    }
  };

  const handleRemoveMeal = async (mealId: string) => {
    if (!activePlan) return;
    
    try {
      const updatedPlan = {
        ...activePlan,
        meals: activePlan.meals.filter(meal => meal.id !== mealId)
      };
      
      const savedPlan = await updateMealPlan(updatedPlan);
      
      // Update local state
      setMealPlans(prevPlans => 
        prevPlans.map(plan => plan.id === savedPlan.id ? savedPlan : plan)
      );
      setActivePlan(savedPlan);
    } catch (err) {
      setError('Failed to remove meal from plan');
      console.error(err);
    }
  };

  const handleCreatePlan = async (name: string, startDate: Date, endDate: Date) => {
    if (!user) return;
    
    try {
      const newPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        name,
        startDate,
        endDate,
        meals: []
      };
      
      const savedPlan = await createMealPlan(newPlan);
      
      // Update local state
      setMealPlans(prevPlans => [...prevPlans, savedPlan]);
      setActivePlan(savedPlan);
    } catch (err) {
      setError('Failed to create meal plan');
      console.error(err);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteMealPlan(planId);
      
      // Update local state
      setMealPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      
      if (activePlan?.id === planId) {
        setActivePlan(mealPlans.length > 0 ? mealPlans[0] : null);
      }
    } catch (err) {
      setError('Failed to delete meal plan');
      console.error(err);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!activePlan || !user) return;
    
    try {
      const shoppingList: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        name: `Shopping for ${activePlan.name}`,
        items: [],
        isCompleted: false,
        mealPlanId: activePlan.id
      };
      
      const savedList = await createShoppingList(shoppingList);
      
      // Redirect to shopping list
      window.location.href = `/shopping-lists/${savedList.id}`;
    } catch (err) {
      setError('Failed to generate shopping list');
      console.error(err);
    }
  };

  if (loading && mealPlans.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading your meal plans...</div>;
  }

  return (
    <div className="meal-planner">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-2 rounded text-sm"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <Calendar 
              mealPlan={activePlan} 
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Meals for {selectedDate.toDateString()}</h2>
            <MealList 
              meals={activePlan?.meals.filter(meal => {
                const mealDate = new Date(meal.date);
                return mealDate.toDateString() === selectedDate.toDateString();
              }) || []}
              onRemoveMeal={handleRemoveMeal}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Add Meals</h2>
            <RecipeSearch 
              onSearch={handleSearch} 
              searchResults={searchResults}
              loading={loading}
              onAddMeal={handleAddMeal}
            />
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <MealPlanSummary 
              mealPlans={mealPlans}
              activePlan={activePlan}
              onCreatePlan={handleCreatePlan}
              onDeletePlan={handleDeletePlan}
              onSelectPlan={setActivePlan}
              onGenerateShoppingList={handleGenerateShoppingList}
            />
          </div>

          {activePlan && (
            <div className="bg-white rounded-lg shadow p-4">
              <NutritionalOverview mealPlan={activePlan} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;