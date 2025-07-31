import React, { useState, useEffect } from 'react';
import { Resource, TransitionStage } from '../../types';
import { getResources } from '../../lib/transitionService';
import { Book, Video, FileText, ExternalLink, Search } from 'react-feather';

interface ResourceLibraryProps {
  stage: TransitionStage;
}

const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ stage }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const data = await getResources(stage);
        setResources(data);
        setFilteredResources(data);
      } catch (err) {
        setError('Failed to load resources');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadResources();
  }, [stage]);

  useEffect(() => {
    // Filter resources based on selected type and search query
    let filtered = resources;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        resource => 
          resource.title.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredResources(filtered);
  }, [selectedType, searchQuery, resources]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText size={18} />;
      case 'video':
        return <Video size={18} />;
      case 'recipe':
        return <FileText size={18} />;
      case 'book':
        return <Book size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'recipe':
        return 'bg-green-100 text-green-800';
      case 'book':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-32">Loading resources...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="resource-library">
      <h2 className="text-xl font-semibold mb-4">Learning Resources</h2>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex-shrink-0">
          <select
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="video">Videos</option>
            <option value="recipe">Recipes</option>
            <option value="book">Books</option>
          </select>
        </div>
      </div>
      
      {filteredResources.length === 0 ? (
        <p className="text-gray-500 italic">No resources found for your current filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-md mr-3 ${getResourceTypeColor(resource.type)}`}>
                  {getResourceIcon(resource.type)}
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="text-md font-medium text-gray-900">{resource.title}</h3>
                    <ExternalLink size={14} className="ml-1 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full capitalize ${getResourceTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-center">
        <a href="/resources" className="text-green-600 hover:text-green-700 text-sm font-medium">
          View all resources for {stage} stage
        </a>
      </div>
    </div>
  );
};

export default ResourceLibrary;