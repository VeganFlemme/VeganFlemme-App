import React, { useState } from 'react';
import { Recipe } from '../../types';
import { Search, Coffee, Sun, Moon, Clock } from 'react-feather';

interface RecipeSearchProps {
  onSearch: (query: string) => void;
  searchResults: Recipe[];
  loading: boolean;
  onAddMeal: (recipe: Recipe, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', servings: number) => void;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({
  onSearch,
  searchResults,
  loading,
  onAddMeal
}) => {
  const [query, setQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('dinner');
  const [servings, setServings] = useState(2);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddMeal = () => {
    if (selectedRecipe) {
      onAddMeal(selectedRecipe, mealType, servings);
      setSelectedRecipe(null);
    }
  };

  return (
    <div className="recipe-search">
      <div className="mb-4">
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md"
              placeholder="Search for recipes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-md"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-6">
          <p className="text-gray-500">Searching for recipes...</p>
        </div>
      ) : selectedRecipe ? (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">{selectedRecipe.title}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              onClick={handleAddMeal}
            >
              Add to Meal Plan
            </button>
            <button
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
              onClick={() => setSelectedRecipe(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          <h3 className="text-md font-medium mb-2">Search Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {searchResults.map(recipe => (
              <div 
                key={recipe.id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="flex items-start">
                  {recipe.imageUrl ? (
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.title}
                      className="w-16 h-16 object-cover rounded-md mr-3"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium line-clamp-1">{recipe.title}</h4>
                    <p className="text-xs text-gray-500 mb-1 line-clamp-2">{recipe.description}</p>
                    <div className="flex space-x-1">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                        {recipe.prepTime + recipe.cookTime} min
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : query ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No recipes found for "{query}".</p>
          <p className="text-sm text-gray-400 mt-1">Try different keywords or browse recipes.</p>
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Search for recipes to add to your meal plan.</p>
          <div className="flex justify-center space-x-3 mt-3">
            <button 
              className="px-3 py-1.5 border rounded-md flex items-center text-sm hover:bg-gray-100"
              onClick={() => onSearch('breakfast')}
            >
              <Coffee size={16} className="mr-1" /> Breakfast
            </button>
            <button 
              className="px-3 py-1.5 border rounded-md flex items-center text-sm hover:bg-gray-100"
              onClick={() => onSearch('lunch')}
            >
              <Sun size={16} className="mr-1" /> Lunch
            </button>
            <button 
              className="px-3 py-1.5 border rounded-md flex items-center text-sm hover:bg-gray-100"
              onClick={() => onSearch('dinner')}
            >
              <Moon size={16} className="mr-1" /> Dinner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeSearch;