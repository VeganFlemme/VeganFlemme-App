import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShoppingList, ShoppingItem, GreenweezProduct } from '../../types';
import { getShoppingLists, updateShoppingList, createShoppingList, deleteShoppingList } from '../../services/shoppingListService';
import GreenweezService from '../../services/GreenweezService';
import ShoppingListSelector from './ShoppingListSelector';
import ItemsList from './ItemsList';
import CategoryGroup from './CategoryGroup';
import ProductSuggestions from './ProductSuggestions';
import GreenweezProductModal from './GreenweezProductModal';

const ShoppingAssistant: React.FC = () => {
  const { user } = useAuth();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [productSuggestions, setProductSuggestions] = useState<GreenweezProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GreenweezProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<GreenweezProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const loadShoppingLists = async () => {
      try {
        setLoading(true);
        const lists = await getShoppingLists(user.id);
        setShoppingLists(lists);
        
        // Set active list to the first incomplete one or the most recent one
        const incompleteList = lists.find(list => !list.isCompleted);
        setActiveList(incompleteList || lists[0] || null);
      } catch (err) {
        setError('Failed to load shopping lists');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadShoppingLists();
  }, [user]);

  useEffect(() => {
    if (!activeList) return;
    
    // Generate product suggestions based on items in the list
    const loadSuggestions = async () => {
      try {
        const itemNames = activeList.items.map(item => item.name);
        if (itemNames.length === 0) return;
        
        // Get product categories from items
        const categories = [...new Set(activeList.items
          .map(item => item.category)
          .filter(category => category && category !== 'other')
        )];
        
        const suggestions = await GreenweezService.getRecommendations(
          categories.length > 0 ? categories : ['vegan', 'plant-based'],
          ['vegan']
        );
        
        setProductSuggestions(suggestions);
      } catch (err) {
        console.error('Failed to load product suggestions:', err);
      }
    };
    
    loadSuggestions();
  }, [activeList]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchLoading(true);
      setSearchQuery(query);
      
      const results = await GreenweezService.searchProducts(query, {
        isOrganic: true
      });
      
      setSearchResults(results.products);
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddItem = async (name: string, quantity: number, unit: string, category: string) => {
    if (!activeList || !user) return;
    
    try {
      const newItem: ShoppingItem = {
        id: `temp-${Date.now()}`, // Will be replaced by server
        name,
        quantity,
        unit,
        isChecked: false,
        category: category || 'other'
      };
      
      const updatedList = {
        ...activeList,
        items: [...activeList.items, newItem]
      };
      
      const savedList = await updateShoppingList(updatedList);
      
      // Update local state
      setShoppingLists(prevLists => 
        prevLists.map(list => list.id === savedList.id ? savedList : list)
      );
      setActiveList(savedList);
    } catch (err) {
      setError('Failed to add item to list');
      console.error(err);
    }
  };

  const handleToggleItem = async (itemId: string, isChecked: boolean) => {
    if (!activeList) return;
    
    try {
      const updatedList = {
        ...activeList,
        items: activeList.items.map(item => 
          item.id === itemId ? { ...item, isChecked } : item
        )
      };
      
      const savedList = await updateShoppingList(updatedList);
      
      // Update local state
      setShoppingLists(prevLists => 
        prevLists.map(list => list.id === savedList.id ? savedList : list)
      );
      setActiveList(savedList);
    } catch (err) {
      setError('Failed to update item');
      console.error(err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!activeList) return;
    
    try {
      const updatedList = {
        ...activeList,
        items: activeList.items.filter(item => item.id !== itemId)
      };
      
      const savedList = await updateShoppingList(updatedList);
      
      // Update local state
      setShoppingLists(prevLists => 
        prevLists.map(list => list.id === savedList.id ? savedList : list)
      );
      setActiveList(savedList);
    } catch (err) {
      setError('Failed to remove item');
      console.error(err);
    }
  };

  const handleCreateList = async (name: string) => {
    if (!user) return;
    
    try {
      const newList: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        name,
        items: [],
        isCompleted: false
      };
      
      const savedList = await createShoppingList(newList);
      
      // Update local state
      setShoppingLists(prevLists => [...prevLists, savedList]);
      setActiveList(savedList);
    } catch (err) {
      setError('Failed to create shopping list');
      console.error(err);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteShoppingList(listId);
      
      // Update local state
      setShoppingLists(prevLists => prevLists.filter(list => list.id !== listId));
      
      if (activeList?.id === listId) {
        setActiveList(shoppingLists.length > 0 ? shoppingLists[0] : null);
      }
    } catch (err) {
      setError('Failed to delete shopping list');
      console.error(err);
    }
  };

  const handleCompleteList = async () => {
    if (!activeList) return;
    
    try {
      const updatedList = {
        ...activeList,
        isCompleted: true
      };
      
      const savedList = await updateShoppingList(updatedList);
      
      // Update local state
      setShoppingLists(prevLists => 
        prevLists.map(list => list.id === savedList.id ? savedList : list)
      );
      
      // Set next active list
      const nextList = shoppingLists.find(list => list.id !== activeList.id && !list.isCompleted);
      setActiveList(nextList || null);
    } catch (err) {
      setError('Failed to complete shopping list');
      console.error(err);
    }
  };

  const handleAddProductToList = async (product: GreenweezProduct) => {
    if (!activeList || !user) return;
    
    try {
      const newItem: ShoppingItem = {
        id: `temp-${Date.now()}`, // Will be replaced by server
        name: product.name,
        quantity: 1,
        unit: product.packageSize || 'item',
        isChecked: false,
        category: product.category || 'other',
        greenweezProductId: product.id,
        greenweezProductUrl: product.affiliateUrl
      };
      
      const updatedList = {
        ...activeList,
        items: [...activeList.items, newItem]
      };
      
      const savedList = await updateShoppingList(updatedList);
      
      // Update local state
      setShoppingLists(prevLists => 
        prevLists.map(list => list.id === savedList.id ? savedList : list)
      );
      setActiveList(savedList);
      
      // Close product modal if open
      setSelectedProduct(null);
    } catch (err) {
      setError('Failed to add product to list');
      console.error(err);
    }
  };

  if (loading && shoppingLists.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading your shopping lists...</div>;
  }

  return (
    <div className="shopping-assistant">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-2 rounded text-sm"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <ShoppingListSelector 
              lists={shoppingLists}
              activeList={activeList}
              onSelectList={setActiveList}
              onCreateList={handleCreateList}
              onDeleteList={handleDeleteList}
            />
          </div>

          {activeList && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{activeList.name}</h2>
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  onClick={handleCompleteList}
                >
                  Complete List
                </button>
              </div>

              <ItemsList 
                items={activeList.items}
                onAddItem={handleAddItem}
                onToggleItem={handleToggleItem}
                onRemoveItem={handleRemoveItem}
              />

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Items by Category</h3>
                {Array.from(new Set(activeList.items.map(item => item.category))).map(category => (
                  <CategoryGroup 
                    key={category}
                    category={category}
                    items={activeList.items.filter(item => item.category === category)}
                    onToggleItem={handleToggleItem}
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Find Vegan Products</h2>
            <div className="mb-4">
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Search for vegan products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              />
              <button 
                className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => handleSearch(searchQuery)}
                disabled={searchLoading}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Search Results</h3>
                <ProductSuggestions 
                  products={searchResults} 
                  onProductSelect={setSelectedProduct}
                  onAddToList={handleAddProductToList}
                />
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-3">Recommended for You</h3>
              <ProductSuggestions 
                products={productSuggestions} 
                onProductSelect={setSelectedProduct}
                onAddToList={handleAddProductToList}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <GreenweezProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToList={handleAddProductToList}
        />
      )}
    </div>
  );
};

export default ShoppingAssistant;