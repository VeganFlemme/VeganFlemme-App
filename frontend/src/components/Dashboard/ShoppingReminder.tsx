import React from 'react';
import { ShoppingList } from '../../types';
import { ShoppingBag, ChevronRight } from 'react-feather';

interface ShoppingReminderProps {
  shoppingLists: ShoppingList[];
}

const ShoppingReminder: React.FC<ShoppingReminderProps> = ({ shoppingLists }) => {
  if (shoppingLists.length === 0) {
    return null;
  }

  // Sort by most recent first
  const sortedLists = [...shoppingLists].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get the most recent list
  const mostRecentList = sortedLists[0];
  
  // Calculate item count stats
  const totalItems = mostRecentList.items.length;
  const checkedItems = mostRecentList.items.filter(item => item.isChecked).length;
  const percentComplete = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Shopping Reminder</h2>
      
      <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg mb-3">
        <div className="flex items-start">
          <ShoppingBag className="text-blue-500 mr-3 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-blue-800">You have an active shopping list</h3>
            <p className="text-sm text-blue-700 mt-1">
              {mostRecentList.name} ({checkedItems}/{totalItems} items checked)
            </p>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-blue-700 mt-1">
            {percentComplete}% complete
          </div>
        </div>
      </div>
      
      {sortedLists.length > 1 && (
        <p className="text-sm text-gray-600 mb-3">
          You have {sortedLists.length} active shopping lists.
        </p>
      )}
      
      <div className="text-center">
        <a 
          href="/shopping"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          Go to shopping <ChevronRight size={16} />
        </a>
      </div>
    </div>
  );
};

export default ShoppingReminder;