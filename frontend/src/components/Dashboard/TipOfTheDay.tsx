import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from 'react-feather';

const TipOfTheDay: React.FC = () => {
  const [tip, setTip] = useState<{
    text: string;
    category: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  
  const veganTips = [
    {
      text: "Replace dairy milk with plant-based alternatives like oat, almond, or soy milk in your morning coffee or cereal.",
      category: "dairy-free"
    },
    {
      text: "Try nutritional yeast on popcorn or pasta for a cheesy flavor without the dairy.",
      category: "nutrition"
    },
    {
      text: "Beans, lentils, and tofu are excellent sources of plant-based protein.",
      category: "nutrition"
    },
    {
      text: "Make sure to include a reliable source of vitamin B12 in your diet, either through fortified foods or supplements.",
      category: "nutrition"
    },
    {
      text: "Ground flaxseeds or chia seeds can replace eggs in many baking recipes.",
      category: "cooking"
    },
    {
      text: "Meal prep on weekends to make plant-based eating easier during busy weekdays.",
      category: "lifestyle"
    },
    {
      text: "Mushrooms can add a meaty texture and umami flavor to many dishes.",
      category: "cooking"
    },
    {
      text: "Aquafaba (the liquid from canned chickpeas) can be whipped like egg whites for meringues and other desserts.",
      category: "cooking"
    },
    {
      text: "Start with veganizing your favorite meals rather than trying completely new dishes at first.",
      category: "lifestyle"
    },
    {
      text: "Dark leafy greens like kale and spinach are excellent sources of calcium and iron.",
      category: "nutrition"
    }
  ];
  
  const loadRandomTip = () => {
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * veganTips.length);
      setTip(veganTips[randomIndex]);
      setLoading(false);
    }, 500);
  };
  
  useEffect(() => {
    loadRandomTip();
  }, [loadRandomTip]);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition':
        return 'bg-green-100 text-green-800';
      case 'cooking':
        return 'bg-yellow-100 text-yellow-800';
      case 'lifestyle':
        return 'bg-blue-100 text-blue-800';
      case 'dairy-free':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Tip of the Day</h2>
        <button 
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          onClick={loadRandomTip}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {tip ? (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex">
            <Lightbulb className="text-yellow-500 mr-3 flex-shrink-0" size={24} />
            <div>
              <p className="text-gray-800">{tip.text}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${getCategoryColor(tip.category)}`}>
                {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">Loading today&apos;s tip...</p>
        </div>
      )}
      
      <div className="mt-3 text-center">
        <a 
          href="/resources"
          className="text-sm text-yellow-600 hover:text-yellow-700"
        >
          View all tips & resources
        </a>
      </div>
    </div>
  );
};

export default TipOfTheDay;