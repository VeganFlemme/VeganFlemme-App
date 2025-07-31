import React from 'react';
import { ShoppingBag, X, Check } from 'react-feather';
import { ShoppingList } from '../../types';

interface ShoppingListSelectorProps {
  activeLists: ShoppingList[];
  completedLists?: ShoppingList[];
  activeList?: ShoppingList;
  onSelectList: (list: ShoppingList) => void;
  onDeleteList: (listId: string) => void;
}

const ShoppingListSelector: React.FC<ShoppingListSelectorProps> = ({
  activeLists,
  completedLists = [],
  activeList,
  onSelectList,
  onDeleteList
}) => {
  return (
    <div>
          {activeLists.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Active Lists</h3>
              <div className="space-y-2">
                {activeLists.map(list => (
                  <div 
                    key={list.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      activeList?.id === list.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectList(list)}
                  >
                    <ShoppingBag size={18} className="text-gray-500 mr-3" />
                    
                    <div className="flex-grow">
                      <h3 className="font-medium">{list.name}</h3>
                      <p className="text-xs text-gray-500">
                        {list.items.length} items • Created {new Date(list.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      className="text-gray-400 hover:text-red-500 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteList(list.id);
                      }}
                      aria-label="Delete list"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {completedLists.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Completed Lists</h3>
              <div className="space-y-2">
                {completedLists.map(list => (
                  <div 
                    key={list.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors bg-gray-50 ${
                      activeList?.id === list.id ? 'border-green-500' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => onSelectList(list)}
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                      <Check size={14} />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-medium">{list.name}</h3>
                      <p className="text-xs text-gray-500">
                        {list.items.length} items • Completed {new Date(list.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      className="text-gray-400 hover:text-red-500 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteList(list.id);
                      }}
                      aria-label="Delete list"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
    </div>
  );
};

export default ShoppingListSelector;