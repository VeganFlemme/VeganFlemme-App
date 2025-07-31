import React from 'react';
import { TransitionPlan, TransitionStage } from '../../types';
import { ChevronRight } from 'react-feather';

interface TransitionProgressProps {
  plan: TransitionPlan;
}

const TransitionProgress: React.FC<TransitionProgressProps> = ({ plan }) => {
  const stages = [
    {
      value: TransitionStage.CURIOUS,
      label: 'Curious',
      description: 'Learning about veganism'
    },
    {
      value: TransitionStage.BEGINNER,
      label: 'Beginner',
      description: 'First steps with plant-based foods'
    },
    {
      value: TransitionStage.INTERMEDIATE,
      label: 'Intermediate',
      description: 'Mostly vegan diet'
    },
    {
      value: TransitionStage.EXPERIENCED,
      label: 'Experienced',
      description: 'Fully committed to veganism'
    }
  ];

  const currentStageIndex = stages.findIndex(s => s.value === plan.stage);
  
  const completedGoals = plan.goals.filter(goal => goal.isCompleted).length;
  const completedTasks = plan.weeklyTasks.filter(task => task.isCompleted).length;
  
  const nextTasksDue = plan.weeklyTasks
    .filter(task => !task.isCompleted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 2);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Your Vegan Journey</h2>
      
      <div className="relative mb-6">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-green-500 rounded-full"
            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2">
          {stages.map((stage, index) => (
            <div
              key={stage.value}
              className={`flex flex-col items-center ${
                index <= currentStageIndex ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  index <= currentStageIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
              <span className="text-xs font-medium mt-1">{stage.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-green-800">Current Stage: {stages[currentStageIndex].label}</h3>
            <p className="text-sm text-green-700">{stages[currentStageIndex].description}</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{plan.progress}%</div>
            <div className="text-xs text-green-700">Overall Progress</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="text-lg font-semibold text-gray-700">{completedGoals}/{plan.goals.length}</div>
          <div className="text-sm text-gray-600">Goals Completed</div>
        </div>
        
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="text-lg font-semibold text-gray-700">{completedTasks}/{plan.weeklyTasks.length}</div>
          <div className="text-sm text-gray-600">Tasks Completed</div>
        </div>
      </div>
      
      {nextTasksDue.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Upcoming Tasks</h3>
          <div className="space-y-2">
            {nextTasksDue.map(task => (
              <div key={task.id} className="border rounded-lg p-3 bg-white">
                <p className="text-sm">{task.description}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    task.type === 'learning' ? 'bg-blue-100 text-blue-800' :
                    task.type === 'cooking' ? 'bg-yellow-100 text-yellow-800' :
                    task.type === 'shopping' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-3 text-center">
        <a 
          href="/transition"
          className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
        >
          View full transition plan <ChevronRight size={16} />
        </a>
      </div>
    </div>
  );
};

export default TransitionProgress;