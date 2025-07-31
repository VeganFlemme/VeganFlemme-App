import React from 'react';
import { GreenweezProduct } from '../../types';
import { X, ShoppingBag, Info, Check } from 'react-feather';

interface GreenweezProductModalProps {
  product: GreenweezProduct;
  onClose: () => void;
  onAddToList: (product: GreenweezProduct) => void;
}

const GreenweezProductModal: React.FC<GreenweezProductModalProps> = ({
  product,
  onClose,
  onAddToList
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
        
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <span className="text-lg font-bold text-green-600">
                    €{product.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full rounded-lg object-cover"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.isOrganic && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Organic
                        </span>
                      )}
                      {product.isFairTrade && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Fair Trade
                        </span>
                      )}
                      {product.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-sm">
                      <p><span className="font-medium">Brand:</span> {product.brand}</p>
                      <p><span className="font-medium">Package Size:</span> {product.packageSize}</p>
                      <p><span className="font-medium">Category:</span> {product.category}</p>
                    </div>
                  </div>
                </div>
                
                {product.nutritionalInfo && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-2 flex items-center">
                      <Info size={16} className="mr-1" /> Nutritional Information
                    </h4>
                    <div className="bg-gray-50 p-3 rounded grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      <div><span className="font-medium">Calories:</span> {product.nutritionalInfo.calories}kcal</div>
                      <div><span className="font-medium">Protein:</span> {product.nutritionalInfo.protein}g</div>
                      <div><span className="font-medium">Carbs:</span> {product.nutritionalInfo.carbs}g</div>
                      <div><span className="font-medium">Fat:</span> {product.nutritionalInfo.fat}g</div>
                      <div><span className="font-medium">Fiber:</span> {product.nutritionalInfo.fiber}g</div>
                      {product.nutritionalInfo.sugar && (
                        <div><span className="font-medium">Sugar:</span> {product.nutritionalInfo.sugar}g</div>
                      )}
                    </div>
                  </div>
                )}
                
                {product.ingredients && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium mb-2">Ingredients</h4>
                    <p className="text-sm text-gray-600">{product.ingredients}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => onAddToList(product)}
            >
              <ShoppingBag size={18} className="mr-2" /> Add to Shopping List
            </button>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              View on Greenweez
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenweezProductModal;