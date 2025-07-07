import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartModal from '../../src/components/CartModal';
import { useCart } from '../../src/hooks/useCart';

// Mock the useCart hook
jest.mock('../../src/hooks/useCart');
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;

// Mock fetch for checkout API
global.fetch = jest.fn();

describe('CartModal', () => {
  const mockCart = {
    items: [
      {
        id: '1',
        product_id: 'prod-1',
        user_id: 'test-user',
        quantity: 2,
        created_at: '2025-01-05T10:00:00Z',
        updated_at: '2025-01-05T10:00:00Z',
        products: {
          id: 'prod-1',
          name: 'Test Product',
          price: 29.99,
          images: ['/test-image.jpg'],
          inventory_count: 10,
          brands: {
            name: 'Test Brand',
            slug: 'test-brand'
          }
        }
      }
    ],
    total: 59.98,
    itemCount: 2
  };

  const mockCartFunctions = {
    cart: mockCart,
    isLoading: false,
    updateQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
    addToCart: jest.fn(),
    refreshCart: jest.fn()
  };

  beforeEach(() => {
    mockUseCart.mockReturnValue(mockCartFunctions);
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // UNIT TESTS: As required by testing rules
  describe('Unit Tests', () => {
    it('renders cart items correctly', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText(/Shopping Cart/)).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      
      // Check for the two different $59.98 amounts - item total and overall total
      const amounts = screen.getAllByText('$59.98');
      expect(amounts).toHaveLength(2); // One for item total, one for overall total
    });

    it('quantity controls update cart', async () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      const increaseButton = screen.getByLabelText('Increase quantity');
      const decreaseButton = screen.getByLabelText('Decrease quantity');
      
      fireEvent.click(increaseButton);
      expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith('prod-1', 3);
      
      fireEvent.click(decreaseButton);
      expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith('prod-1', 1);
    });

    it('remove item functionality works', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      const removeButton = screen.getByLabelText('Remove from cart');
      fireEvent.click(removeButton);
      
      expect(mockCartFunctions.removeFromCart).toHaveBeenCalledWith('prod-1');
    });

    it('total calculation is accurate', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Total:')).toBeInTheDocument();
      // Use getAllByText since there are multiple $59.98 elements
      const amounts = screen.getAllByText('$59.98');
      expect(amounts.length).toBeGreaterThan(0);
    });

    it('checkout button navigates correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionUrl: 'https://checkout.stripe.com/test' })
      });

      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      const checkoutButton = screen.getByText('Checkout');
      fireEvent.click(checkoutButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItems: mockCart.items })
        });
      });
    });
  });

  // INTEGRATION TESTS: As required by testing rules
  describe('Integration Tests', () => {
    it('useCart hook integration', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      // Verify hook is called
      expect(mockUseCart).toHaveBeenCalled();
    });

    it('modal open/close animations', () => {
      const { rerender } = render(<CartModal isOpen={false} onClose={() => {}} />);
      
      // Modal should not be in DOM when closed
      expect(screen.queryByText(/Shopping Cart/)).not.toBeInTheDocument();
      
      // Modal should be in DOM when opened
      rerender(<CartModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByText(/Shopping Cart/)).toBeInTheDocument();
    });

    it('empty cart state display', () => {
      mockUseCart.mockReturnValue({
        ...mockCartFunctions,
        cart: { items: [], total: 0, itemCount: 0 }
      });

      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      // Continue Shopping button only appears when cart has items
      expect(screen.queryByText('Continue Shopping')).not.toBeInTheDocument();
    });
  });

  // ACCESSIBILITY TESTS: As required by testing rules
  describe('Accessibility Tests', () => {
    it('has proper ARIA labels', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Close cart')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      const closeButton = screen.getByLabelText('Close cart');
      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });
  });

  // ERROR HANDLING TESTS: As required by testing rules
  describe('Error Handling', () => {
    it('handles checkout API errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      const checkoutButton = screen.getByText('Checkout');
      fireEvent.click(checkoutButton);

      await waitFor(() => {
        // Check that alert was called instead of DOM content
        expect(window.alert).toHaveBeenCalledWith('Checkout failed. Please try again.');
      });
    });

    it('handles loading states', () => {
      mockUseCart.mockReturnValue({
        ...mockCartFunctions,
        isLoading: true
      });

      render(<CartModal isOpen={true} onClose={() => {}} />);
      
      // Check for spinner element instead of text
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });
}); 