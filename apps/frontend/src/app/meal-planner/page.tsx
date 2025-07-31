'use client';

import MealPlanner from '../../components/MealPlanner/MealPlanner';

export default function MealPlannerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meal Planner</h1>
        <MealPlanner />
      </div>
    </div>
  );
}