import React from 'react';
import { GreenweezProduct } from '../../types';
import { ShoppingBag, ExternalLink } from 'react-feather';

interface ProductRecommendationsProps {
  products: GreenweezProduct[];
  onAddToList?: (product: GreenweezProduct) => void;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ 
  products,
  onAddToList
}) => {
  if (products.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">Recommended Products</h2>
        <p className="text-gray-500 text-sm">Loading product recommendations...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Recommended Products</h2>
      <div className="space-y-4">
        {products.map(product => (
          <div key={product.id} className="flex items-center border-b border-gray-100 pb-3">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded-md mr-3"
            />
            <div className="flex-grow">
              <h3 className="text-sm font-medium">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{product.brand} • {product.packageSize}</p>
              <div className="flex items-center">
                <span className="text-green-600 font-semibold mr-2">€{product.price.toFixed(2)}</span>
                {product.isOrganic && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    Organic
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              {onAddToList && (
                <button 
                  className="text-gray-600 hover:text-gray-800 p-1"
                  onClick={() => onAddToList(product)}
                >
                  <ShoppingBag size={18} />
                </button>
              )}
              <a 
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 p-1"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>
      <a 
        href="/shopping"
        className="block text-center text-sm text-green-600 hover:text-green-700 mt-3"
      >
        View all recommendations
      </a>
    </div>
  );
};

export default ProductRecommendations;