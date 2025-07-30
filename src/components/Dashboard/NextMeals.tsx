import React from 'react';
import { MealPlan, Meal } from '../../types';
import { ChevronRight, Coffee, Sun, Moon, Clock } from 'react-feather';

interface NextMealsProps {
  mealPlan: MealPlan;
}

const NextMeals: React.FC<NextMealsProps> = ({ mealPlan }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const getMealsForDate = (date: Date): Meal[] => {
    return mealPlan.meals.filter(meal => {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === date.getTime();
    });
  };
  
  const todaysMeals = getMealsForDate(today);
  const tomorrowsMeals = getMealsForDate(tomorrow);
  
  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee size={16} />;
      case 'lunch':
        return <Sun size={16} />;
      case 'dinner':
        return <Moon size={16} />;
      case 'snack':
        return <Clock size={16} />;
      default:
        return <Clock size={16} />;
    }
  };
  
  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800';
      case 'lunch':
        return 'bg-orange-100 text-orange-800';
      case 'dinner':
        return 'bg-blue-100 text-blue-800';
      case 'snack':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const renderMealsList = (meals: Meal[], emptyMessage: string) => {
    if (meals.length === 0) {
      return (
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      );
    }
    
    const sortedMeals = [...meals].sort((a, b) => {
      const mealOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
      return mealOrder[a.mealType] - mealOrder[b.mealType];
    });
    
    return (
      <div className="space-y-2">
        {sortedMeals.map((meal, index) => (
          <div key={index} className="flex items-center p-2 border rounded-lg">
            <div className={`p-2 rounded-full mr-2 ${getMealTypeColor(meal.mealType)}`}>
              {getMealTypeIcon(meal.mealType)}
            </div>
            
            <div>
              <div className="flex items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getMealTypeColor(meal.mealType)}`}>
                  {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                </span>
              </div>
              <p className="text-sm font-medium">Recipe ID: {meal.recipeId}</p>
              <p className="text-xs text-gray-500">Servings: {meal.servings}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Upcoming Meals</h2>
      
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Today</h3>
        {renderMealsList(todaysMeals, "No meals planned for today.")}
      </div>
      
      <div className="mb-3">
        <h3 className="text-md font-medium mb-2">Tomorrow</h3>
        {renderMealsList(tomorrowsMeals, "No meals planned for tomorrow.")}
      </div>
      
      <div className="text-center">
        <a 
          href="/meal-planner"
          className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
        >
          View full meal plan <ChevronRight size={16} />
        </a>
      </div>
    </div>
  );
};

export default NextMeals;