import React, { useState, useEffect } from 'react';

interface WishlistButtonProps {
  productId: string;
  isSaved: boolean;
  onToggle?: (productId: string, isSaved?: boolean) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  productId, 
  isSaved, 
  onToggle 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentlySaved, setCurrentlySaved] = useState(isSaved);
  const [error, setError] = useState<string | null>(null);

  // Sync with prop changes
  useEffect(() => {
    setCurrentlySaved(isSaved);
  }, [isSaved]);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const action = currentlySaved ? 'remove' : 'add';
      
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          action: action
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle wishlist');
      }

      const data = await response.json();
      const newSavedState = data.isSaved !== undefined ? data.isSaved : !currentlySaved;
      setCurrentlySaved(newSavedState);
      
      // Call the optional callback with success state
      if (onToggle) {
        onToggle(productId, newSavedState);
      }

    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      
      // Set appropriate error message based on error type
      if (error.message.includes('Authentication required')) {
        setError('Please login to use wishlist');
      } else if (error.message.includes('Already in wishlist')) {
        setError('Already in wishlist');
      } else {
        setError('Failed to update wishlist');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className={`
          relative p-2 rounded-full transition-all duration-200
          ${isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-100 hover:scale-110 active:scale-95'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
        `}
        aria-label={currentlySaved ? 'Remove from wishlist' : 'Add to wishlist'}
        title={currentlySaved ? 'Remove from wishlist' : 'Add to wishlist'}
        data-testid="wishlist-button"
      >
        {/* Heart Icon - Filled when saved, outline when not saved */}
        {currentlySaved ? (
          // Filled heart (saved)
          <svg 
            className="w-6 h-6 text-red-500 drop-shadow-sm" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        ) : (
          // Outline heart (not saved)
          <svg 
            className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        )}

        {/* Loading spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Subtle animation effect when toggling */}
        <div className={`
          absolute inset-0 rounded-full
          ${currentlySaved 
            ? 'bg-red-50 animate-pulse' 
            : ''
          }
        `} />
      </button>

      {/* Error message display */}
      {error && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-red-50 border border-red-200 rounded-md shadow-sm z-10">
          <p className="text-red-600 text-sm whitespace-nowrap">{error}</p>
        </div>
      )}
    </div>
  );
};

export default WishlistButton; 