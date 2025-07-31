import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Recipe, 
  TransitionPlan, 
  MealPlan, 
  ShoppingList,
  GreenweezProduct 
} from '../../types';
import { getFavoriteRecipes } from '../../lib/recipeService';
import { getTransitionPlan } from '../../lib/transitionService';
import { getMealPlans } from '../../lib/mealPlanService';
import { getShoppingLists } from '../../lib/shoppingListService';
import GreenweezService from '../../lib/GreenweezService';
import TransitionProgress from './TransitionProgress';
import FavoriteRecipes from './FavoriteRecipes';
import NextMeals from './NextMeals';
import ProductRecommendations from './ProductRecommendations';
import ShoppingReminder from './ShoppingReminder';
import TipOfTheDay from './TipOfTheDay';
import RecentActivity from './RecentActivity';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [transitionPlan, setTransitionPlan] = useState<TransitionPlan | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [recommendations, setRecommendations] = useState<GreenweezProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load data in parallel
        const [
          recipes,
          plan,
          meals,
          lists,
          products
        ] = await Promise.all([
          getFavoriteRecipes(user.id),
          getTransitionPlan(user.id),
          getMealPlans(user.id),
          getShoppingLists(user.id),
          GreenweezService.getRecommendations(['plant-based', 'vegan'], ['vegan'])
        ]);
        
        setFavoriteRecipes(recipes);
        setTransitionPlan(plan);
        setMealPlans(meals);
        setShoppingLists(lists);
        setRecommendations(products);
      } catch (err) {
        setError('Failed to load some dashboard data');
        // Error logged in development
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Please log in to view your dashboard</h2>
        <p className="mb-6">Sign in to access your personalized vegan transition journey.</p>
        <button 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.href = '/login'}
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading your dashboard...</div>;
  }

  // Get the active meal plan (current date falls within its date range)
  const activeMealPlan = mealPlans.find(plan => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const today = new Date();
    return today >= start && today <= end;
  });

  // Get incomplete shopping lists
  const incompleteShoppingLists = shoppingLists.filter(list => !list.isCompleted);

  return (
    <div className="dashboard">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome message */}
          <div className="bg-gradient-to-r from-green-500 to-teal-400 text-white p-6 rounded-lg">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user.displayName}!</h1>
            <p className="opacity-90">
              {transitionPlan 
                ? `You're making great progress on your vegan journey. Keep it up!` 
                : `Ready to start your vegan journey? Create a transition plan today!`}
            </p>
          </div>

          {/* Transition progress */}
          {transitionPlan && (
            <div className="bg-white rounded-lg shadow p-4">
              <TransitionProgress plan={transitionPlan} />
            </div>
          )}

          {/* Next meals */}
          {activeMealPlan && (
            <div className="bg-white rounded-lg shadow p-4">
              <NextMeals mealPlan={activeMealPlan} />
            </div>
          )}

          {/* Favorite recipes */}
          <div className="bg-white rounded-lg shadow p-4">
            <FavoriteRecipes recipes={favoriteRecipes.slice(0, 3)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shopping reminder */}
          {incompleteShoppingLists.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <ShoppingReminder shoppingLists={incompleteShoppingLists} />
            </div>
          )}

          {/* Product recommendations */}
          <div className="bg-white rounded-lg shadow p-4">
            <ProductRecommendations products={recommendations.slice(0, 3)} />
          </div>

          {/* Tip of the day */}
          <div className="bg-white rounded-lg shadow p-4">
            <TipOfTheDay />
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-lg shadow p-4">
            <RecentActivity userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;