import React from 'react';
import { GreenweezProduct } from '../../types';
import { ShoppingBag, ExternalLink } from 'react-feather';

interface ProductSuggestionsProps {
  products: GreenweezProduct[];
  onProductSelect: (product: GreenweezProduct) => void;
  onAddToList: (product: GreenweezProduct) => void;
}

const ProductSuggestions: React.FC<ProductSuggestionsProps> = ({
  products,
  onProductSelect,
  onAddToList
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No product suggestions available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {products.map(product => (
        <div
          key={product.id}
          className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-md mr-3"
              onClick={() => onProductSelect(product)}
            />
            
            <div className="flex-grow" onClick={() => onProductSelect(product)}>
              <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
              <div className="flex items-center">
                <span className="text-green-600 font-semibold text-sm mr-2">
                  €{product.price.toFixed(2)}
                </span>
                
                {product.isOrganic && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    Bio
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 ml-2">
              <button
                className="text-gray-600 hover:text-gray-800 p-1"
                onClick={() => onAddToList(product)}
                title="Add to shopping list"
              >
                <ShoppingBag size={18} />
              </button>
              
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 p-1"
                title="View on Greenweez"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSuggestions;