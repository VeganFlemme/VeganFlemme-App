import React from 'react';
import { ShoppingItem } from '../../types';
import { Check, Trash2, ChevronDown, ChevronUp } from 'react-feather';

interface CategoryGroupProps {
  category: string;
  items: ShoppingItem[];
  onToggleItem: (itemId: string, isChecked: boolean) => void;
  onRemoveItem: (itemId: string) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  items,
  onToggleItem,
  onRemoveItem
}) => {
  const [expanded, setExpanded] = React.useState(true);
  
  const categoryLabels: { [key: string]: string } = {
    'produce': 'Fruits & Vegetables',
    'dairy': 'Plant-Based Dairy',
    'protein': 'Plant Proteins',
    'grains': 'Grains & Cereals',
    'snacks': 'Snacks',
    'beverages': 'Beverages',
    'condiments': 'Condiments & Sauces',
    'other': 'Other'
  };
  
  const getCategoryIcon = (category: string): React.ReactNode => {
    // In a real app, this would return actual icons for each category
    return null;
  };
  
  const sortedItems = [...items].sort((a, b) => {
    // Sort checked items to the bottom
    if (a.isChecked !== b.isChecked) {
      return a.isChecked ? 1 : -1;
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });
  
  const completedCount = items.filter(item => item.isChecked).length;
  const progressPercentage = (completedCount / items.length) * 100;

  return (
    <div className="category-group mb-4">
      <div 
        className="flex items-center justify-between p-3 bg-gray-100 rounded-lg cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          {getCategoryIcon(category)}
          <h3 className="font-medium">
            {categoryLabels[category] || category}
          </h3>
          <span className="ml-2 text-sm text-gray-500">
            ({completedCount}/{items.length})
          </span>
        </div>
        
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {expanded && (
        <div className="mt-2 pl-2">
          <div className="h-1 bg-gray-200 rounded-full mb-3">
            <div
              className="h-1 bg-green-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="space-y-2">
            {sortedItems.map(item => (
              <div
                key={item.id}
                className={`flex items-center p-3 border rounded-lg ${
                  item.isChecked ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border ${
                    item.isChecked
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300'
                  } flex items-center justify-center mr-3 cursor-pointer`}
                  onClick={() => onToggleItem(item.id, !item.isChecked)}
                >
                  {item.isChecked && <Check size={16} />}
                </div>
                
                <div className="flex-grow">
                  <p className={`${item.isChecked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {item.name}
                  </p>
                  <span className="text-xs text-gray-500">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                
                {item.greenweezProductId && (
                  <a
                    href={item.greenweezProductUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 text-sm mr-3"
                  >
                    View
                  </a>
                )}
                
                <button
                  className="text-gray-400 hover:text-red-500 p-1"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryGroup;