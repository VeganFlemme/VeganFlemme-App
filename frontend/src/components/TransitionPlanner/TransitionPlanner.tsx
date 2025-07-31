import React, { useState, useEffect } from 'react';
import { TransitionStage, TransitionPlan, TransitionGoal, TransitionTask } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import TransitionStageSelector from './TransitionStageSelector';
import GoalTracker from './GoalTracker';
import WeeklyTaskList from './WeeklyTaskList';
import ResourceLibrary from './ResourceLibrary';
import ProgressChart from './ProgressChart';
import { getTransitionPlan, updateTransitionPlan } from '../../lib/transitionService';

const TransitionPlanner: React.FC = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<TransitionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const loadPlan = async () => {
      try {
        setLoading(true);
        const userPlan = await getTransitionPlan(user.id);
        setPlan(userPlan);
      } catch (err) {
        setError('Failed to load your transition plan. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [user]);

  const handleStageChange = async (stage: TransitionStage) => {
    if (!plan || !user) return;
    
    try {
      const updatedPlan = { ...plan, stage };
      await updateTransitionPlan(updatedPlan);
      setPlan(updatedPlan);
    } catch (err) {
      setError('Failed to update your transition stage. Please try again.');
      console.error(err);
    }
  };

  const handleGoalToggle = async (goalId: string, isCompleted: boolean) => {
    if (!plan || !user) return;
    
    try {
      const updatedGoals = plan.goals.map(goal => 
        goal.id === goalId ? { ...goal, isCompleted } : goal
      );
      
      const updatedPlan = { 
        ...plan, 
        goals: updatedGoals,
        progress: calculateProgress(updatedGoals, plan.weeklyTasks)
      };
      
      await updateTransitionPlan(updatedPlan);
      setPlan(updatedPlan);
    } catch (err) {
      setError('Failed to update your goal. Please try again.');
      console.error(err);
    }
  };

  const handleTaskToggle = async (taskId: string, isCompleted: boolean) => {
    if (!plan || !user) return;
    
    try {
      const updatedTasks = plan.weeklyTasks.map(task => 
        task.id === taskId ? { ...task, isCompleted } : task
      );
      
      const updatedPlan = { 
        ...plan, 
        weeklyTasks: updatedTasks,
        progress: calculateProgress(plan.goals, updatedTasks)
      };
      
      await updateTransitionPlan(updatedPlan);
      setPlan(updatedPlan);
    } catch (err) {
      setError('Failed to update your task. Please try again.');
      console.error(err);
    }
  };

  const calculateProgress = (goals: TransitionGoal[], tasks: TransitionTask[]): number => {
    const totalItems = goals.length + tasks.length;
    if (totalItems === 0) return 0;
    
    const completedItems = 
      goals.filter(goal => goal.isCompleted).length + 
      tasks.filter(task => task.isCompleted).length;
    
    return (completedItems / totalItems) * 100;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading your transition plan...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-2 rounded text-sm"
          onClick={() => setError(null)}
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Start Your Vegan Journey</h2>
        <p className="mb-6">Create a personalized transition plan to help you go vegan at your own pace.</p>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Create My Plan
        </button>
      </div>
    );
  }

  return (
    <div className="transition-planner">
      <div className="bg-gradient-to-r from-green-500 to-teal-400 text-white p-6 rounded-lg mb-8">
        <h1 className="text-2xl font-bold mb-2">Your Vegan Transition Plan</h1>
        <p className="text-white/80 mb-4">
          Track your progress and complete tasks to move forward on your vegan journey.
        </p>
        <ProgressChart progress={plan.progress} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <TransitionStageSelector 
            currentStage={plan.stage} 
            onStageChange={handleStageChange} 
          />
        </div>
        <div>
          <GoalTracker 
            goals={plan.goals} 
            onGoalToggle={handleGoalToggle} 
          />
        </div>
      </div>

      <div className="mb-8">
        <WeeklyTaskList 
          tasks={plan.weeklyTasks} 
          onTaskToggle={handleTaskToggle} 
        />
      </div>

      <div>
        <ResourceLibrary stage={plan.stage} />
      </div>
    </div>
  );
};

export default TransitionPlanner;