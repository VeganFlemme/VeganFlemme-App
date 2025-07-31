import React, { useState, useEffect } from 'react';
import { MealPlan } from '../../types';

interface NutritionalOverviewProps {
  mealPlan: MealPlan;
}

const NutritionalOverview: React.FC<NutritionalOverviewProps> = ({ mealPlan }) => {
  const [dailyNutrition, setDailyNutrition] = useState<{
    [date: string]: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    }
  }>({});
  
  const [selectedMetric, setSelectedMetric] = useState<'calories' | 'protein' | 'carbs' | 'fat' | 'fiber'>('calories');

  useEffect(() => {
    // This is a placeholder calculation
    // In a real app, you would fetch the nutritional data for each recipe
    const calculateDailyNutrition = () => {
      const nutritionByDay: any = {};
      
      mealPlan.meals.forEach(meal => {
        const dateStr = new Date(meal.date).toISOString().split('T')[0];
        
        if (!nutritionByDay[dateStr]) {
          nutritionByDay[dateStr] = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          };
        }
        
        // Placeholder values - in a real app these would come from the recipe data
        nutritionByDay[dateStr].calories += 250 * meal.servings;
        nutritionByDay[dateStr].protein += 10 * meal.servings;
        nutritionByDay[dateStr].carbs += 30 * meal.servings;
        nutritionByDay[dateStr].fat += 8 * meal.servings;
        nutritionByDay[dateStr].fiber += 5 * meal.servings;
      });
      
      setDailyNutrition(nutritionByDay);
    };
    
    calculateDailyNutrition();
  }, [mealPlan]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMetricColor = (metric: string): string => {
    switch (metric) {
      case 'calories': return 'bg-red-500';
      case 'protein': return 'bg-blue-500';
      case 'carbs': return 'bg-yellow-500';
      case 'fat': return 'bg-purple-500';
      case 'fiber': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getMetricUnit = (metric: string): string => {
    switch (metric) {
      case 'calories': return 'kcal';
      case 'protein': return 'g';
      case 'carbs': return 'g';
      case 'fat': return 'g';
      case 'fiber': return 'g';
      default: return '';
    }
  };

  const getMaxValue = (): number => {
    const values = Object.values(dailyNutrition).map(day => day[selectedMetric]);
    return Math.max(...values, 1);
  };

  const datesSorted = Object.keys(dailyNutrition).sort();

  return (
    <div className="nutritional-overview">
      <h2 className="text-lg font-semibold mb-3">Nutritional Overview</h2>
      
      <div className="flex space-x-2 mb-4">
        {['calories', 'protein', 'carbs', 'fat', 'fiber'].map(metric => (
          <button
            key={metric}
            className={`text-xs px-2 py-1 rounded-full ${
              selectedMetric === metric 
                ? `${getMetricColor(metric)} text-white` 
                : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setSelectedMetric(metric as any)}
          >
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </button>
        ))}
      </div>
      
      {datesSorted.length === 0 ? (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No nutritional data available yet.</p>
          <p className="text-sm text-gray-400 mt-1">Add meals to your plan to see nutrition information.</p>
        </div>
      ) : (
        <div>
          <div className="space-y-2">
            {datesSorted.map(date => {
              const dayNutrition = dailyNutrition[date];
              const maxValue = getMaxValue();
              const percentage = (dayNutrition[selectedMetric] / maxValue) * 100;
              
              return (
                <div key={date} className="group">
                  <div className="flex items-center mb-1">
                    <span className="text-xs text-gray-600 w-20">{formatDate(date)}</span>
                    <div className="flex-grow h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getMetricColor(selectedMetric)} transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 ml-2 w-16 text-right">
                      {Math.round(dayNutrition[selectedMetric])} {getMetricUnit(selectedMetric)}
                    </span>
                  </div>
                  
                  <div className="hidden group-hover:flex text-xs text-gray-500 space-x-2 ml-20 mb-2">
                    <span>P: {dayNutrition.protein}g</span>
                    <span>C: {dayNutrition.carbs}g</span>
                    <span>F: {dayNutrition.fat}g</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Hover over bars to see detailed nutrition information
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionalOverview;