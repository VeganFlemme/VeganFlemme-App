'use client';

import { useState } from 'react';

interface SearchResult {
  searchResult?: {
    items?: any[];
  };
  error?: string;
  message?: string;
}

export default function VeganSearchTest() {
  const [query, setQuery] = useState('vegan protein powder');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/vegan-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          searchIndex: 'Grocery',
          resources: [
            'ItemInfo.Title',
            'Offers.Listings.Price',
            'Images.Primary.Medium'
          ]
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-6">
            🌱 Vegan Search Test
          </h1>
          
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for vegan products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Search Results:
              </h3>
              <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.searchResult?.items && result.searchResult.items.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    Found {result.searchResult.items.length} items:
                  </h4>
                  <div className="grid gap-3">
                    {result.searchResult.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-800">
                          {item.ItemInfo?.Title?.DisplayValue || 'No title'}
                        </div>
                        {item.Offers?.Listings?.[0]?.Price && (
                          <div className="text-green-600 font-semibold">
                            {item.Offers.Listings[0].Price.DisplayAmount}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🧪 Test Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Endpoint:</span> /api/vegan-search
            </div>
            <div>
              <span className="font-medium">Method:</span> POST
            </div>
            <div>
              <span className="font-medium">Search Index:</span> Grocery
            </div>
            <div>
              <span className="font-medium">Resources:</span> Title, Price, Image
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}