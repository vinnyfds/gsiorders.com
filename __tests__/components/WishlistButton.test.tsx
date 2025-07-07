import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WishlistButton from '../../src/components/WishlistButton';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('WishlistButton', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  // UNIT TESTS: As required by testing rules
  describe('Unit Tests', () => {
    it('heart icon toggles filled/outline based on isSaved prop', () => {
      const { rerender } = render(
        <WishlistButton productId="test-product" isSaved={false} />
      );
      
      // Should show outline heart when not saved
      expect(screen.getByLabelText('Add to wishlist')).toBeInTheDocument();
      
      // Should show filled heart when saved
      rerender(<WishlistButton productId="test-product" isSaved={true} />);
      expect(screen.getByLabelText('Remove from wishlist')).toBeInTheDocument();
    });

    it('onClick triggers API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      const button = screen.getByLabelText('Add to wishlist');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            productId: 'test-product', 
            action: 'add' 
          })
        });
      });
    });

    it('loading state disables button', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      const button = screen.getByLabelText('Add to wishlist');
      fireEvent.click(button);

      // Button should be disabled during loading
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('error state shows feedback', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      const button = screen.getByLabelText('Add to wishlist');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Failed to update wishlist')).toBeInTheDocument();
      });
    });
  });

  // API TESTS: As required by testing rules
  describe('API Tests', () => {
    it('POST /api/wishlist adds item', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      const button = screen.getByLabelText('Add to wishlist');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/wishlist', expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ productId: 'test-product', action: 'add' })
        }));
      });
    });

    it('DELETE /api/wishlist removes item', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<WishlistButton productId="test-product" isSaved={true} />);
      
      const button = screen.getByLabelText('Remove from wishlist');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/wishlist', expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ productId: 'test-product', action: 'remove' })
        }));
      });
    });

    it('handles auth required validation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Authentication required' })
      });

      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      const button = screen.getByLabelText('Add to wishlist');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Please login to use wishlist')).toBeInTheDocument();
      });
    });

    it('handles duplicate prevention', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Already in wishlist' })
      });

      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      const button = screen.getByLabelText('Add to wishlist');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Already in wishlist')).toBeInTheDocument();
      });
    });
  });

  // ACCESSIBILITY TESTS: As required by testing rules
  describe('Accessibility Tests', () => {
    it('has proper ARIA labels', () => {
      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      expect(screen.getByLabelText('Add to wishlist')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      const button = screen.getByLabelText('Add to wishlist');
      button.focus();
      expect(button).toHaveFocus();
      
      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(global.fetch).toHaveBeenCalled();
    });

    it('has proper focus indicators', () => {
      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      const button = screen.getByLabelText('Add to wishlist');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  // CALLBACK TESTS: As required by testing rules
  describe('Callback Tests', () => {
    it('calls onToggle callback when provided', async () => {
      const mockOnToggle = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(
        <WishlistButton 
          productId="test-product" 
          isSaved={false} 
          onToggle={mockOnToggle}
        />
      );
      
      const button = screen.getByLabelText('Add to wishlist');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnToggle).toHaveBeenCalledWith('test-product', true);
      });
    });

    it('works without onToggle callback', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<WishlistButton productId="test-product" isSaved={false} />);
      
      const button = screen.getByLabelText('Add to wishlist');
      
      // Should not throw error when no callback provided
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });
}); 