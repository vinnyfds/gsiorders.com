import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cart from '../../src/components/Cart';

const mockItems = [
  {
    id: '1',
    product_id: 'prod-123',
    quantity: 2,
    products: {
      name: 'Test Product 1',
      price: 29.99,
      inventory_count: 10,
      brands: {
        name: 'Test Brand'
      }
    }
  },
  {
    id: '2',
    product_id: 'prod-456',
    quantity: 1,
    products: {
      name: 'Test Product 2',
      price: 19.99,
      inventory_count: 5,
      brands: {
        name: 'Another Brand'
      }
    }
  }
];

const mockHandlers = {
  onUpdateQuantity: jest.fn(),
  onRemoveItem: jest.fn(),
  onClearCart: jest.fn(),
  onCheckout: jest.fn()
};

describe('Cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty cart state when no items', () => {
    render(
      <Cart
        items={[]}
        itemCount={0}
        total={0}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Start shopping to add items to your cart.')).toBeInTheDocument();
    expect(screen.getByText('Start Shopping')).toBeInTheDocument();
  });

  it('renders cart items and summary when items exist', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    expect(screen.getByText('Your Cart')).toBeInTheDocument();
    expect(screen.getByText('Cart Items (3 items)')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });

  it('displays correct item count and total', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    expect(screen.getByText('Cart Items (3 items)')).toBeInTheDocument();
    expect(screen.getByText('Subtotal (3 items)')).toBeInTheDocument();
    // Use getAllByText to handle multiple instances of the same total
    const totalElements = screen.getAllByText('$79.97');
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it('calls onClearCart when clear cart button is clicked', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    fireEvent.click(screen.getByTestId('clear-cart'));
    expect(mockHandlers.onClearCart).toHaveBeenCalled();
  });

  it('calls onCheckout when checkout button is clicked', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    fireEvent.click(screen.getByTestId('checkout-button'));
    expect(mockHandlers.onCheckout).toHaveBeenCalled();
  });

  it('disables clear cart button when loading', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        isLoading={true}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    expect(screen.getByTestId('clear-cart')).toBeDisabled();
    expect(screen.getByText('Clearing...')).toBeInTheDocument();
  });

  it('disables checkout button when checking out', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        isCheckingOut={true}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    expect(screen.getByTestId('checkout-button')).toBeDisabled();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows free shipping message when total >= 50', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    expect(screen.getByText('🎉 You qualify for free shipping!')).toBeInTheDocument();
  });

  it('shows shipping cost message when total < 50', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={29.99}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    expect(screen.getByText('Add $20.01 more for free shipping')).toBeInTheDocument();
  });

  it('shows FREE shipping in summary when total >= 50', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    expect(screen.getByText('FREE')).toBeInTheDocument();
  });

  it('shows calculated shipping message when total < 50', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={29.99}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    // Use getAllByText to handle multiple instances
    const shippingElements = screen.getAllByText('Calculated at checkout');
    expect(shippingElements.length).toBeGreaterThan(0);
  });

  it('renders continue shopping link', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    const continueShoppingLink = screen.getByText('Continue Shopping');
    expect(continueShoppingLink).toBeInTheDocument();
    expect(continueShoppingLink).toHaveAttribute('href', '/products');
  });

  it('passes correct props to CartItem components', () => {
    render(
      <Cart
        items={mockItems}
        itemCount={3}
        total={79.97}
        isLoading={true}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemoveItem={mockHandlers.onRemoveItem}
        onClearCart={mockHandlers.onClearCart}
        onCheckout={mockHandlers.onCheckout}
      />
    );

    // Verify CartItem components are rendered with correct data
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('Another Brand')).toBeInTheDocument();
  });
}); 