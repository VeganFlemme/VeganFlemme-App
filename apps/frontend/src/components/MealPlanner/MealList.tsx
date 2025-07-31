import React from 'react';
import { Meal } from '../../types';
import { Trash2, Coffee, Sun, Moon, Clock } from 'react-feather';

interface MealListProps {
  meals: Meal[];
  onRemoveMeal: (mealId: string) => void;
}

const MealList: React.FC<MealListProps> = ({ meals, onRemoveMeal }) => {
  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee size={16} />;
      case 'lunch':
        return <Sun size={16} />;
      case 'dinner':
        return <Moon size={16} />;
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

  const sortedMeals = [...meals].sort((a, b) => {
    const mealOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
    return mealOrder[a.mealType] - mealOrder[b.mealType];
  });

  if (sortedMeals.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No meals planned for this day.</p>
        <p className="text-sm text-gray-400 mt-1">Use the meal search below to add meals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedMeals.map(meal => (
        <div key={meal.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
          <div className={`p-2 rounded-full mr-3 ${getMealTypeColor(meal.mealType)}`}>
            {getMealTypeIcon(meal.mealType)}
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center">
              <span className={`text-xs px-2 py-0.5 rounded-full mb-1 ${getMealTypeColor(meal.mealType)}`}>
                {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
              </span>
            </div>
            <h3 className="font-medium">Recipe ID: {meal.recipeId}</h3>
            <p className="text-sm text-gray-500">
              Servings: {meal.servings}
            </p>
          </div>
          
          <button
            className="text-gray-400 hover:text-red-500 p-2"
            onClick={() => onRemoveMeal(meal.id)}
            aria-label="Remove meal"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default MealList;