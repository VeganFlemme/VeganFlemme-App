import React from 'react';
import { Recipe } from '../../types';
import { Heart, Clock, Users, Award } from 'react-feather';
import { useAuth } from '../../hooks/useAuth';
import { toggleFavoriteRecipe } from '../../services/userService';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  const { user, refreshUser } = useAuth();
  
  const isFavorite = user?.favoriteRecipes.includes(recipe.id) || false;
  
  const totalTime = recipe.prepTime + recipe.cookTime;
  
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      await toggleFavoriteRecipe(user.id, recipe.id);
      refreshUser();
    } catch (error) {
      console.error('Failed to toggle favorite recipe:', error);
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="recipe-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onSelect(recipe)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.imageUrl || '/images/default-recipe.jpg'} 
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <button 
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'
          }`}
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={isFavorite ? 'white' : 'none'} />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{recipe.title}</h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
        
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </span>
          
          {recipe.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{totalTime} min</span>
          </div>
          
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>{recipe.servings}</span>
          </div>
          
          <div className="flex items-center">
            <Award size={16} className="mr-1" />
            <span>{recipe.averageRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;