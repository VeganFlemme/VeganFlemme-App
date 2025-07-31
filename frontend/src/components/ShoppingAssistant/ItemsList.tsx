import React, { useState } from 'react';
import { ShoppingItem } from '../../types';
import { Plus, Check, Trash2 } from 'react-feather';

interface ItemsListProps {
  items: ShoppingItem[];
  onAddItem: (name: string, quantity: number, unit: string, category: string) => void;
  onToggleItem: (itemId: string, isChecked: boolean) => void;
  onRemoveItem: (itemId: string) => void;
}

const ItemsList: React.FC<ItemsListProps> = ({
  items,
  onAddItem,
  onToggleItem,
  onRemoveItem
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('item');
  const [newItemCategory, setNewItemCategory] = useState('produce');

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    onAddItem(newItemName, newItemQuantity, newItemUnit, newItemCategory);
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemUnit('item');
  };

  const categories = [
    { value: 'produce', label: 'Fruits & Vegetables' },
    { value: 'dairy', label: 'Plant-Based Dairy' },
    { value: 'protein', label: 'Plant Proteins' },
    { value: 'grains', label: 'Grains & Cereals' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'condiments', label: 'Condiments & Sauces' },
    { value: 'other', label: 'Other' }
  ];

  const units = [
    'item', 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'bunch', 'package'
  ];

  const sortedItems = [...items].sort((a, b) => {
    // Sort checked items to the bottom
    if (a.isChecked !== b.isChecked) {
      return a.isChecked ? 1 : -1;
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="items-list">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-md font-medium mb-3">Add Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="md:col-span-3">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
          </div>
          
          <div>
            <div className="flex">
              <input
                type="number"
                min="0.1"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-l"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(Number(e.target.value))}
              />
              <select
                className="p-2 border border-gray-300 border-l-0 rounded-r"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded flex items-center justify-center"
              onClick={handleAddItem}
              disabled={!newItemName.trim()}
            >
              <Plus size={18} className="mr-1" />
              Add Item
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-medium mb-3">Items ({items.length})</h3>
        
        {sortedItems.length === 0 ? (
          <p className="text-gray-500 italic text-center p-4 bg-gray-50 rounded">
            No items in this list yet. Add some items to get started.
          </p>
        ) : (
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
                  <div className="flex text-xs text-gray-500">
                    <span>{item.quantity} {item.unit}</span>
                    <span className="mx-1">•</span>
                    <span>{categories.find(c => c.value === item.category)?.label || item.category}</span>
                  </div>
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
        )}
      </div>
    </div>
  );
};

export default ItemsList;