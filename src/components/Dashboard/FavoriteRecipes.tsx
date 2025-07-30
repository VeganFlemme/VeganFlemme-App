import React from 'react';
import { Recipe } from '../../types';
import { Clock, ChevronRight } from 'react-feather';

interface FavoriteRecipesProps {
  recipes: Recipe[];
}

const FavoriteRecipes: React.FC<FavoriteRecipesProps> = ({ recipes }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Favorite Recipes</h2>
      
      {recipes.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven't saved any favorite recipes yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Explore our recipe collection and save your favorites.
          </p>
          <a 
            href="/recipes"
            className="mt-3 inline-block text-green-600 hover:text-green-700"
          >
            Browse Recipes
          </a>
        </div>
      ) : (
        <div>
          <div className="space-y-3 mb-3">
            {recipes.map(recipe => (
              <a 
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="flex items-start border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
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
                  <h3 className="font-medium line-clamp-1">{recipe.title}</h3>
                  <p className="text-xs text-gray-500 mb-1 line-clamp-2">{recipe.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                    
                    <span className="mx-1">•</span>
                    <span className="capitalize">{recipe.difficulty}</span>
                    
                    <span className="mx-1">•</span>
                    <span className="flex items-center">
                      <svg className="w-3 h-3 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {recipe.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          <div className="text-center">
            <a 
              href="/recipes/favorites"
              className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
            >
              View all favorites <ChevronRight size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteRecipes;