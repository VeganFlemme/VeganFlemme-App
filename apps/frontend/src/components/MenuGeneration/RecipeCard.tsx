import { useState } from 'react';
import Image from 'next/image';
import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onViewDetails }: RecipeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="rounded-lg overflow-hidden shadow-md bg-white transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(recipe)}
    >
      <div className="relative h-48 w-full">
        {recipe.image ? (
          <Image 
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        {/* Quality Score Badge */}
        {recipe.qualityScore && (
          <div className="absolute top-2 right-2 flex items-center space-x-2">
            <span className={`text-xs font-bold py-1 px-2 rounded-full ${
              recipe.qualityScore.nutriScore === 'A' ? 'bg-green-500' :
              recipe.qualityScore.nutriScore === 'B' ? 'bg-light-green-500' :
              recipe.qualityScore.nutriScore === 'C' ? 'bg-yellow-500' :
              recipe.qualityScore.nutriScore === 'D' ? 'bg-orange-500' :
              'bg-red-500'
            } text-white`}>
              {recipe.qualityScore.nutriScore}
            </span>
            
            <span className={`text-xs font-bold py-1 px-2 rounded-full ${
              recipe.qualityScore.ecoScore === 'A' ? 'bg-green-500' :
              recipe.qualityScore.ecoScore === 'B' ? 'bg-light-green-500' :
              recipe.qualityScore.ecoScore === 'C' ? 'bg-yellow-500' :
              recipe.qualityScore.ecoScore === 'D' ? 'bg-orange-500' :
              'bg-red-500'
            } text-white`}>
              Eco-{recipe.qualityScore.ecoScore}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
        
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span>Ready in {recipe.readyInMinutes} min</span>
          <span>{recipe.servings} servings</span>
        </div>
        
        {recipe.nutrition && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-sm font-medium">{Math.round(recipe.nutrition.calories || 0)}</div>
              <div className="text-xs text-gray-500">calories</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{Math.round(recipe.nutrition.protein || 0)}g</div>
              <div className="text-xs text-gray-500">protein</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{Math.round(recipe.nutrition.carbs || 0)}g</div>
              <div className="text-xs text-gray-500">carbs</div>
            </div>
          </div>
        )}
        
        <button 
          className="w-full py-2 mt-2 text-center bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(recipe);
          }}
        >
          View Recipe
        </button>
      </div>
    </div>
  );
}