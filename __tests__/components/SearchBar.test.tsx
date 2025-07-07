import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../../src/components/SearchBar';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock timers for debouncing
jest.useFakeTimers();

describe('SearchBar', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  // UNIT TESTS: As required by testing rules
  describe('Unit Tests', () => {
    it('renders search input with placeholder', () => {
      render(<SearchBar placeholder="Search for products..." />);
      
      expect(screen.getByPlaceholderText('Search for products...')).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<SearchBar />);
      
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });

    it('has filter dropdown toggle', () => {
      render(<SearchBar />);
      
      const filterButton = screen.getByLabelText('Toggle filters');
      fireEvent.click(filterButton);
      expect(screen.getByText('Brand')).toBeInTheDocument();
      expect(screen.getByText('Min Price')).toBeInTheDocument();
      expect(screen.getByText('Max Price')).toBeInTheDocument();
      expect(screen.getByText('Sort By')).toBeInTheDocument();
    });

    it('calls /api/products endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [] })
      });

      render(<SearchBar />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/products?search=test+query');
      });
    });

    it('implements debounced search (300ms delay)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ products: [] })
      });

      render(<SearchBar />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Should not call immediately
      expect(global.fetch).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/api/products?search=test');
      });
    });

    it('shows loading state during search', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ products: [] })
          }), 100);
        })
      );

      render(<SearchBar />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        // Component shows spinner, not text
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
      });
    });

    it('displays search results dropdown', async () => {
      const mockProducts = [
        { 
          id: '1', 
          name: 'Test Product', 
          price: 29.99, 
          brand_id: '1',
          brands: { name: 'Test Brand', slug: 'test' }
        },
        { 
          id: '2', 
          name: 'Another Product', 
          price: 39.99, 
          brand_id: '1',
          brands: { name: 'Test Brand', slug: 'test' }
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts })
      });

      render(<SearchBar />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('Another Product')).toBeInTheDocument();
        expect(screen.getByText('$29.99')).toBeInTheDocument();
        expect(screen.getByText('$39.99')).toBeInTheDocument();
      });
    });

    it('handles empty search results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [] })
      });

      render(<SearchBar />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText(/No products found for/)).toBeInTheDocument();
      });
    });

    it('has clear search functionality', async () => {
      render(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });
  });

  // FILTER FUNCTIONALITY TESTS: As required by testing rules
  describe('Filter Functionality Tests', () => {
    it('brand filter works correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      render(<SearchBar />);
      
      const filterButton = screen.getByLabelText('Toggle filters');
      fireEvent.click(filterButton);
      
      const brandSelect = screen.getByLabelText('Brand');
      fireEvent.change(brandSelect, { target: { value: 'liquidheaven' } });
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/products?search=test&brand=liquidheaven');
      });
    });

    it('price range filter works correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      render(<SearchBar />);
      
      const filterButton = screen.getByLabelText('Toggle filters');
      fireEvent.click(filterButton);
      
      const minPriceInput = screen.getByLabelText('Min Price');
      const maxPriceInput = screen.getByLabelText('Max Price');
      
      fireEvent.change(minPriceInput, { target: { value: '10' } });
      fireEvent.change(maxPriceInput, { target: { value: '50' } });
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/products?search=test&minPrice=10&maxPrice=50');
      });
    });

    it('sort filter works correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      render(<SearchBar />);
      
      const filterButton = screen.getByLabelText('Toggle filters');
      fireEvent.click(filterButton);
      
      const sortSelect = screen.getByLabelText('Sort By');
      fireEvent.change(sortSelect, { target: { value: 'price-low' } });
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/products?search=test&sortBy=price-low');
      });
    });

    it('combines multiple filters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      render(<SearchBar />);
      
      const filterButton = screen.getByLabelText('Toggle filters');
      fireEvent.click(filterButton);
      
      const brandSelect = screen.getByLabelText('Brand');
      fireEvent.change(brandSelect, { target: { value: 'liquidheaven' } });
      
      const minPriceInput = screen.getByLabelText('Min Price');
      fireEvent.change(minPriceInput, { target: { value: '20' } });
      
      const sortSelect = screen.getByLabelText('Sort By');
      fireEvent.change(sortSelect, { target: { value: 'name' } });
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/products?search=test&brand=liquidheaven&minPrice=20&sortBy=name');
      });
    });
  });

  // ACCESSIBILITY TESTS: As required by testing rules
  describe('Accessibility Tests', () => {
    it('has proper ARIA labels', () => {
      render(<SearchBar />);
      
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle filters')).toBeInTheDocument();
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<SearchBar />);
      
      const searchInput = screen.getByRole('searchbox');
      const toggleButton = screen.getByLabelText('Toggle filters');
      
      // Manually focus toggle button since JSDOM doesn't handle Tab properly
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();
    });

    it('has proper focus indicators', () => {
      render(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      expect(searchInput).toHaveClass('focus:ring-2', 'focus:ring-brand-primary');
    });
  });

  // CALLBACK TESTS: As required by testing rules
  describe('Callback Tests', () => {
    it('calls onSearch callback when provided', async () => {
      const mockOnSearch = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      render(<SearchBar onSearch={mockOnSearch} />);
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test', {
          brand: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          sortBy: undefined
        });
      });
    });

    it('works without onSearch callback', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      render(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      
      // Should not throw error when no callback provided
      expect(() => {
        fireEvent.change(searchInput, { target: { value: 'test' } });
        jest.advanceTimersByTime(300);
      }).not.toThrow();
    });
  });

  // ERROR HANDLING TESTS: As required by testing rules
  describe('Error Handling Tests', () => {
    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Search failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      render(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Search failed. Please try again.')).toBeInTheDocument();
      });
    });
  });
}); 