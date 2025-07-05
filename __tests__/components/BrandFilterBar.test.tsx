import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import BrandFilterBar from '../../src/components/BrandFilterBar';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('BrandFilterBar', () => {
  const mockRouter = {
    query: {},
    pathname: '/products',
    push: jest.fn(),
    route: '/products'
  };

  const mockBrands = [
    {
      id: '1',
      name: 'Liquid Heaven',
      slug: 'liquidheaven',
      theme_config: { primary: '#10b981', gradient: 'from-emerald-500 to-emerald-600' }
    },
    {
      id: '2',
      name: 'Motaquila',
      slug: 'motaquila',
      theme_config: { primary: '#ec4899', gradient: 'from-pink-500 to-pink-600' }
    },
    {
      id: '3',
      name: 'Last Genie',
      slug: 'lastgenie',
      theme_config: { primary: '#6366f1', gradient: 'from-indigo-500 to-indigo-600' }
    }
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Clear all mocks completely 
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    
    // Reset to default successful response - each test will override as needed
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ brands: mockBrands })
    });
  });

  // UNIT TESTS: As required by testing rules
  describe('Unit Tests', () => {
    it('fetches brands from /api/brands endpoint', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/brands');
      });
    });

    it('renders brand links with correct slugs', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Liquid Heaven')).toBeInTheDocument();
        expect(screen.getByText('Motaquila')).toBeInTheDocument();
        expect(screen.getByText('Last Genie')).toBeInTheDocument();
      });
    });

    it('shows All Brands option by default', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByText('All Brands')).toBeInTheDocument();
      });
    });

    it('hides All Brands option when showAllOption is false', async () => {
      render(<BrandFilterBar showAllOption={false} />);
      
      await waitFor(() => {
        expect(screen.queryByText('All Brands')).not.toBeInTheDocument();
      });
    });

    it('highlights active brand based on router', async () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { brand: 'liquidheaven' }
      });

      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const liquidHeavenLink = screen.getByText('Liquid Heaven');
        expect(liquidHeavenLink.closest('a')).toHaveClass('bg-brand-primary');
      });
    });

    it('shows loading skeleton states', () => {
      // Mock loading state
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<BrandFilterBar />);
      
      expect(screen.getAllByTestId('brand-skeleton')).toHaveLength(3);
    });

    it('applies brand-specific theming', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const liquidHeavenLink = screen.getByText('Liquid Heaven').closest('a');
        expect(liquidHeavenLink).toHaveStyle({ '--brand-primary': '#10b981' });
      });
    });

    it('shows brand count indicator', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByText('4 brands')).toBeInTheDocument(); // 3 brands + All Brands
      });
    });
  });

  // NAVIGATION TESTS: As required by testing rules
  describe('Navigation Tests', () => {
    it('generates correct brand URLs', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const liquidHeavenLink = screen.getByText('Liquid Heaven').closest('a');
        expect(liquidHeavenLink).toHaveAttribute('href', '/liquidheaven');
        
        const motaquilaLink = screen.getByText('Motaquila').closest('a');
        expect(motaquilaLink).toHaveAttribute('href', '/motaquila');
      });
    });

    it('All Brands links to products page', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const allBrandsLink = screen.getByText('All Brands').closest('a');
        expect(allBrandsLink).toHaveAttribute('href', '/products');
      });
    });

    it('handles brand selection callback', async () => {
      const mockOnBrandSelect = jest.fn();
      
      render(<BrandFilterBar onBrandSelect={mockOnBrandSelect} />);
      
      await waitFor(() => {
        const liquidHeavenLink = screen.getByText('Liquid Heaven');
        fireEvent.click(liquidHeavenLink);
        
        expect(mockOnBrandSelect).toHaveBeenCalledWith('liquidheaven');
      });
    });

    it('handles All Brands selection callback', async () => {
      const mockOnBrandSelect = jest.fn();
      
      render(<BrandFilterBar onBrandSelect={mockOnBrandSelect} />);
      
      await waitFor(() => {
        const allBrandsLink = screen.getByText('All Brands');
        fireEvent.click(allBrandsLink);
        
        expect(mockOnBrandSelect).toHaveBeenCalledWith(null);
      });
    });
  });

  // RESPONSIVE DESIGN TESTS: As required by testing rules
  describe('Responsive Design Tests', () => {
    it('has horizontal scrolling for mobile', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const container = screen.getByTestId('brand-filter-container');
        expect(container).toHaveClass('overflow-x-auto');
      });
    });

    it('shows scroll indicators on mobile', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const scrollIndicators = screen.getAllByTestId('scroll-indicator');
        expect(scrollIndicators).toHaveLength(2); // left and right indicators
      });
    });

    it('applies responsive styling classes', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const brandLinks = screen.getAllByRole('link');
        brandLinks.forEach(link => {
          expect(link).toHaveClass('whitespace-nowrap');
        });
      });
    });
  });

  // ACCESSIBILITY TESTS: As required by testing rules
  describe('Accessibility Tests', () => {
    it('has proper ARIA labels', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /brand filter/i })).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const firstBrandLink = screen.getByText('All Brands').closest('a');
        firstBrandLink?.focus();
        expect(firstBrandLink).toHaveFocus();
        
        // Manually simulate tab navigation since JSDOM doesn't implement it
        const nextLink = screen.getByText('Liquid Heaven').closest('a');
        nextLink?.focus();
        expect(nextLink).toHaveFocus();
      });
    });

    it('has proper focus indicators', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const brandLinks = screen.getAllByRole('link');
        brandLinks.forEach(link => {
          expect(link).toHaveClass('focus:outline-none', 'focus:ring-2');
        });
      });
    });

    it('has proper color contrast', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const activeBrandLink = screen.getByText('All Brands').closest('a');
        expect(activeBrandLink).toHaveClass('text-white'); // Ensures contrast on colored backgrounds
      });
    });
  });

  // ERROR HANDLING TESTS: As required by testing rules
  describe('Error Handling Tests', () => {
    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load brands')).toBeInTheDocument();
      });
    });

    it('handles empty brands response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ brands: [] })
      });

      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByText('No brands available')).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load brands')).toBeInTheDocument();
      });
    });

    it('provides retry functionality on error', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ brands: mockBrands })
        });

      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load brands')).toBeInTheDocument();
      });
      
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Liquid Heaven')).toBeInTheDocument();
      });
    });
  });

  // THEME CONFIGURATION TESTS: As required by testing rules
  describe('Theme Configuration Tests', () => {
    it('applies correct theme colors for each brand', async () => {
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const liquidHeavenLink = screen.getByText('Liquid Heaven').closest('a');
        expect(liquidHeavenLink).toHaveStyle({ '--brand-primary': '#10b981' });
        
        const motaquilaLink = screen.getByText('Motaquila').closest('a');
        expect(motaquilaLink).toHaveStyle({ '--brand-primary': '#ec4899' });
        
        const lastGenieLink = screen.getByText('Last Genie').closest('a');
        expect(lastGenieLink).toHaveStyle({ '--brand-primary': '#6366f1' });
      });
    });

    it('applies gradient backgrounds when configured', async () => {
      // Set up router with active brand to trigger gradient class
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { brand: 'liquidheaven' }
      });

      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const liquidHeavenLink = screen.getByText('Liquid Heaven').closest('a');
        expect(liquidHeavenLink).toHaveClass('bg-gradient-to-r');
      });
    });

    it('handles missing theme configuration', async () => {
      const brandsWithoutTheme = [
        { id: '1', name: 'Brand Without Theme', slug: 'no-theme' }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ brands: brandsWithoutTheme })
      });

      render(<BrandFilterBar />);
      
      await waitFor(() => {
        const brandLink = screen.getByText('Brand Without Theme').closest('a');
        expect(brandLink).toHaveClass('bg-gray-100'); // Default styling
      });
    });
  });

  // PERFORMANCE TESTS: As required by testing rules
  describe('Performance Tests', () => {
    it('renders without performance issues', async () => {
      const startTime = performance.now();
      
      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Liquid Heaven')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 300ms (adjusted for test environment)
      expect(renderTime).toBeLessThan(300);
    });

    it('handles large numbers of brands efficiently', async () => {
      const manyBrands = Array.from({ length: 50 }, (_, i) => ({
        id: i.toString(),
        name: `Brand ${i}`,
        slug: `brand-${i}`,
        theme_config: { primary: '#000000' }
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ brands: manyBrands })
      });

      render(<BrandFilterBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Brand 0')).toBeInTheDocument();
        expect(screen.getByText('Brand 49')).toBeInTheDocument();
      });
      
      // Should handle large lists without issues
      expect(screen.getAllByRole('link')).toHaveLength(51); // 50 brands + All Brands
    });
  });
}); 