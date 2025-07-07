import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
}

interface SearchFilters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price-low' | 'price-high' | 'newest';
}

interface SearchResult {
  id: string;
  name: string;
  price: number;
  brand_id: string;
  brands?: {
    name: string;
    slug: string;
  };
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search products...",
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const handleSearch = async () => {
    if (!query.trim() && !filters.brand) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters - use existing products API
      const params = new URLSearchParams();
      if (query.trim()) params.append('search', query.trim());
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.products || []);
      setShowResults(true);
      
      // Call optional callback
      if (onSearch) {
        onSearch(query, filters);
      }

    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    setSearchResults([]);
    setShowResults(false);
    setError(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          role="searchbox"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />

        {/* Filter Toggle & Clear Button */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          <button
            onClick={clearSearch}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded transition-colors ${showFilters ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="Toggle filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-12 flex items-center pr-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Brand Filter */}
            <div>
              <label htmlFor="brand-filter" className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                id="brand-filter"
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange({ brand: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">All Brands</option>
                <option value="liquidheaven">Liquid Heaven</option>
                <option value="motaquila">Motaquila</option>
                <option value="lastgenie">Last Genie</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label htmlFor="min-price-filter" className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                id="min-price-filter"
                type="number"
                min="0"
                step="0.01"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label htmlFor="max-price-filter" className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                id="max-price-filter"
                type="number"
                min="0"
                step="0.01"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="$1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                id="sort-filter"
                value={filters.sortBy || ''}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as SearchFilters['sortBy'] || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Relevance</option>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && !error && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-20">
          <div className="p-2">
            <div className="text-sm text-gray-500 px-3 py-2 border-b border-gray-100">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
            
            {searchResults.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                onClick={() => {
                  // Navigate to product page or handle selection
                  console.log('Selected product:', product);
                  setShowResults(false);
                }}
              >
                <img
                  src={`https://picsum.photos/48/48?random=${product.id}`}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.brands?.name}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-20">
          <div className="text-center text-red-500">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 14.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* No Results (not error) */}
      {showResults && searchResults.length === 0 && query.length >= 2 && !isLoading && !error && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-20">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No products found for "{query}"</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 