import React, { useState } from 'react';
import { TransitionGoal } from '../../types';
import { Check, Plus, Trash2, Edit } from 'react-feather';

interface GoalTrackerProps {
  goals: TransitionGoal[];
  onGoalToggle: (goalId: string, isCompleted: boolean) => void;
  onAddGoal?: (description: string, targetDate?: Date) => void;
  onEditGoal?: (goalId: string, description: string, targetDate?: Date) => void;
  onDeleteGoal?: (goalId: string) => void;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({
  goals,
  onGoalToggle,
  onAddGoal,
  onEditGoal,
  onDeleteGoal
}) => {
  const [newGoal, setNewGoal] = useState('');
  const [newGoalDate, setNewGoalDate] = useState<string>('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalText, setEditGoalText] = useState('');
  const [editGoalDate, setEditGoalDate] = useState<string>('');

  const handleAddGoal = () => {
    if (!newGoal.trim() || !onAddGoal) return;
    
    const targetDate = newGoalDate ? new Date(newGoalDate) : undefined;
    onAddGoal(newGoal, targetDate);
    setNewGoal('');
    setNewGoalDate('');
  };

  const handleEditGoal = (goalId: string) => {
    if (!editGoalText.trim() || !onEditGoal) return;
    
    const targetDate = editGoalDate ? new Date(editGoalDate) : undefined;
    onEditGoal(goalId, editGoalText, targetDate);
    setEditingGoalId(null);
  };

  const startEditing = (goal: TransitionGoal) => {
    setEditingGoalId(goal.id);
    setEditGoalText(goal.description);
    setEditGoalDate(goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '');
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="goal-tracker">
      <h2 className="text-xl font-semibold mb-4">Your Vegan Goals</h2>
      
      <div className="space-y-4 mb-6">
        {goals.length === 0 ? (
          <p className="text-gray-500 italic">No goals set yet. Add some goals to track your progress.</p>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="border rounded-lg p-4 bg-white">
              {editingGoalId === goal.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={editGoalText}
                    onChange={(e) => setEditGoalText(e.target.value)}
                  />
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={editGoalDate}
                    onChange={(e) => setEditGoalDate(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                      onClick={() => handleEditGoal(goal.id)}
                    >
                      Save
                    </button>
                    <button
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                      onClick={() => setEditingGoalId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border ${
                      goal.isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300'
                    } flex items-center justify-center mr-3 cursor-pointer`}
                    onClick={() => onGoalToggle(goal.id, !goal.isCompleted)}
                  >
                    {goal.isCompleted && <Check size={16} />}
                  </div>
                  
                  <div className="flex-grow">
                    <p className={`${goal.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {goal.description}
                    </p>
                    {goal.targetDate && (
                      <p className="text-sm text-gray-500 mt-1">
                        Target: {formatDate(goal.targetDate)}
                      </p>
                    )}
                  </div>
                  
                  {(onEditGoal || onDeleteGoal) && (
                    <div className="flex space-x-1 ml-2">
                      {onEditGoal && (
                        <button
                          className="text-gray-500 hover:text-gray-700 p-1"
                          onClick={() => startEditing(goal)}
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {onDeleteGoal && (
                        <button
                          className="text-gray-500 hover:text-red-600 p-1"
                          onClick={() => onDeleteGoal(goal.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {onAddGoal && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-md font-medium mb-3">Add New Goal</h3>
          <div className="space-y-3">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
            />
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Target date (optional)"
              value={newGoalDate}
              onChange={(e) => setNewGoalDate(e.target.value)}
            />
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center"
              onClick={handleAddGoal}
              disabled={!newGoal.trim()}
            >
              <Plus size={16} className="mr-1" />
              Add Goal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;