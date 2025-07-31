import React, { useState } from 'react';
import { ShoppingBag, Plus, X } from 'react-feather';
import { ShoppingList } from '../../types';

interface ShoppingListSelectorProps {
  lists: ShoppingList[];
  activeList: ShoppingList | null;
  onSelectList: (list: ShoppingList) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (listId: string) => void;
}

const ShoppingListSelector: React.FC<ShoppingListSelectorProps> = ({
  lists,
  activeList,
  onSelectList,
  onCreateList,
  onDeleteList
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
      setShowCreateForm(false);
    }
  };

  const activeLists = lists.filter(list => !list.isCompleted);
  const completedLists = lists.filter(list => list.isCompleted);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shopping Lists</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={16} className="mr-2" />
          New List
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateList} className="bg-gray-50 p-4 rounded-lg">
          <div className="mb-3">
            <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-1">
              List Name
            </label>
            <input
              type="text"
              id="listName"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter list name..."
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Create
            </button>
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
              onClick={() => {
                setShowCreateForm(false);
                setNewListName('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
      </div>

      {lists.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No shopping lists yet. Create your first list to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ShoppingListSelector;