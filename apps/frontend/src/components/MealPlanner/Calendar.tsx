import React, { useState } from 'react';
import { MealPlan, Meal } from '../../types';
import { ChevronLeft, ChevronRight } from 'react-feather';

interface CalendarProps {
  mealPlan: MealPlan | null;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ mealPlan, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get meals for a specific date
  const getMealsForDate = (date: Date): Meal[] => {
    if (!mealPlan) return [];
    
    return mealPlan.meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate.toDateString() === date.toDateString();
    });
  };
  
  // Generate an array of dates for the current month view
  const getDaysInMonth = (month: Date): Date[] => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Get the first day of the week of the month
    const firstDayOfWeek = firstDay.getDay();
    
    // Create array for all days to display
    const days: Date[] = [];
    
    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, monthIndex, 1 - i);
      days.push(prevDate);
    }
    
    // Add all days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, monthIndex, day));
    }
    
    // Add days from next month to complete the last week
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const nextDate = new Date(year, monthIndex + 1, i);
      days.push(nextDate);
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isSelected = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const hasMeals = (date: Date): boolean => {
    return getMealsForDate(date).length > 0;
  };
  
  const isInMealPlanRange = (date: Date): boolean => {
    if (!mealPlan) return false;
    
    const start = new Date(mealPlan.startDate);
    const end = new Date(mealPlan.endDate);
    
    return date >= start && date <= end;
  };

  return (
    <div className="meal-plan-calendar">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Meal Calendar</h2>
        <div className="flex items-center space-x-4">
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={handlePrevMonth}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-medium">{formatMonth(currentMonth)}</span>
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={handleNextMonth}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-sm text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {days.map((date, index) => {
          const dayMeals = getMealsForDate(date);
          
          return (
            <div 
              key={index}
              className={`
                p-1 border rounded-md min-h-[70px] cursor-pointer transition-colors
                ${!isCurrentMonth(date) ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                ${isSelected(date) ? 'border-green-500' : 'border-gray-200'}
                ${isInMealPlanRange(date) ? 'hover:bg-green-50' : 'hover:bg-gray-50'}
              `}
              onClick={() => onSelectDate(date)}
            >
              <div className={`
                text-center text-sm font-medium py-1 mb-1 rounded-t-md
                ${isToday(date) ? 'bg-green-500 text-white' : ''}
              `}>
                {date.getDate()}
              </div>
              
              {dayMeals.length > 0 && (
                <div className="space-y-1 px-1">
                  {dayMeals.slice(0, 2).map((meal, i) => (
                    <div 
                      key={i}
                      className={`
                        text-xs px-1 py-0.5 rounded whitespace-nowrap overflow-hidden text-ellipsis
                        ${meal.mealType === 'breakfast' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${meal.mealType === 'lunch' ? 'bg-orange-100 text-orange-800' : ''}
                        ${meal.mealType === 'dinner' ? 'bg-blue-100 text-blue-800' : ''}
                        ${meal.mealType === 'snack' ? 'bg-purple-100 text-purple-800' : ''}
                      `}
                    >
                      {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                    </div>
                  ))}
                  
                  {dayMeals.length > 2 && (
                    <div className="text-xs text-center text-gray-500">
                      +{dayMeals.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;