'use client';

import RecipeExplorer from '../../components/RecipeExplorer/RecipeCard';

export default function RecipeExplorerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Recipe Explorer</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* This would be populated with actual recipes */}
          <div className="text-center text-gray-500 py-12">
            Recipe explorer functionality coming soon!
          </div>
        </div>
      </div>
    </div>
  );
}