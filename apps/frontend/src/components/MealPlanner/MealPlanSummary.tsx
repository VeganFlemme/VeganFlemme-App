import React, { useState } from 'react';
import { MealPlan } from '../../types';
import { Calendar, Plus, ShoppingCart, Trash2 } from 'react-feather';

interface MealPlanSummaryProps {
  mealPlans: MealPlan[];
  activePlan: MealPlan | null;
  onCreatePlan: (name: string, startDate: Date, endDate: Date) => void;
  onDeletePlan: (planId: string) => void;
  onSelectPlan: (plan: MealPlan) => void;
  onGenerateShoppingList: () => void;
}

const MealPlanSummary: React.FC<MealPlanSummaryProps> = ({
  mealPlans,
  activePlan,
  onCreatePlan,
  onDeletePlan,
  onSelectPlan,
  onGenerateShoppingList
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCreatePlan = () => {
    if (!newPlanName.trim() || !startDate || !endDate) return;
    
    onCreatePlan(
      newPlanName,
      new Date(startDate),
      new Date(endDate)
    );
    
    setNewPlanName('');
    setStartDate('');
    setEndDate('');
    setShowCreateForm(false);
  };

  const formatDateRange = (start: Date, end: Date): string => {
    const startStr = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="meal-plan-summary">
      <h2 className="text-xl font-semibold mb-4">Meal Plans</h2>
      
      {showCreateForm ? (
        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
          <h3 className="text-md font-medium mb-3">Create New Meal Plan</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Weekly meal plan"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                onClick={handleCreatePlan}
                disabled={!newPlanName.trim() || !startDate || !endDate}
              >
                Create Plan
              </button>
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={18} className="mr-2" />
          Create New Plan
        </button>
      )}
      
      {mealPlans.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No meal plans created yet.</p>
          <p className="text-sm text-gray-400 mt-1">Create your first meal plan to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mealPlans.map(plan => (
            <div 
              key={plan.id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                activePlan?.id === plan.id 
                  ? 'border-green-500 bg-green-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectPlan(plan)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{plan.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    {formatDateRange(plan.startDate, plan.endDate)}
                  </div>
                  <p className="text-sm mt-1">
                    {plan.meals.length} meals planned
                  </p>
                </div>
                
                <button
                  className="text-gray-400 hover:text-red-500 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePlan(plan.id);
                  }}
                  aria-label="Delete plan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activePlan && (
        <div className="mt-6">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
            onClick={onGenerateShoppingList}
          >
            <ShoppingCart size={18} className="mr-2" />
            Generate Shopping List
          </button>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-md font-medium mb-1">Active Plan Stats</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Total meals:</span>
                <span className="font-medium">{activePlan.meals.length}</span>
              </li>
              <li className="flex justify-between">
                <span>Breakfast:</span>
                <span className="font-medium">
                  {activePlan.meals.filter(m => m.mealType === 'breakfast').length}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Lunch:</span>
                <span className="font-medium">
                  {activePlan.meals.filter(m => m.mealType === 'lunch').length}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Dinner:</span>
                <span className="font-medium">
                  {activePlan.meals.filter(m => m.mealType === 'dinner').length}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Snacks:</span>
                <span className="font-medium">
                  {activePlan.meals.filter(m => m.mealType === 'snack').length}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanSummary;