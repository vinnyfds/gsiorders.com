import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from '../../src/components/CartItem';

const mockItem = {
  id: '1',
  product_id: 'prod-123',
  quantity: 2,
  products: {
    name: 'Test Product',
    price: 29.99,
    inventory_count: 10,
    brands: {
      name: 'Test Brand'
    }
  }
};

const mockHandlers = {
  onUpdateQuantity: jest.fn(),
  onRemove: jest.fn()
};

describe('CartItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('$29.99 each')).toBeInTheDocument();
    expect(screen.getByText('• 10 in stock')).toBeInTheDocument();
    expect(screen.getByText('$59.98')).toBeInTheDocument();
    expect(screen.getByText('$29.99 × 2')).toBeInTheDocument();
  });

  it('displays quantity controls with correct values', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByTestId('quantity-decrease')).toBeInTheDocument();
    expect(screen.getByTestId('quantity-increase')).toBeInTheDocument();
  });

  it('calls onUpdateQuantity when quantity buttons are clicked', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
      />
    );

    fireEvent.click(screen.getByTestId('quantity-increase'));
    expect(mockHandlers.onUpdateQuantity).toHaveBeenCalledWith('prod-123', 3);

    fireEvent.click(screen.getByTestId('quantity-decrease'));
    expect(mockHandlers.onUpdateQuantity).toHaveBeenCalledWith('prod-123', 1);
  });

  it('calls onRemove when remove button is clicked', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
      />
    );

    fireEvent.click(screen.getByTestId('remove-item'));
    expect(mockHandlers.onRemove).toHaveBeenCalledWith('prod-123');
  });

  it('disables decrease button when quantity is 1', () => {
    const itemWithQuantityOne = {
      ...mockItem,
      quantity: 1
    };

    render(
      <CartItem
        item={itemWithQuantityOne}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
      />
    );

    expect(screen.getByTestId('quantity-decrease')).toBeDisabled();
  });

  it('disables increase button when quantity reaches inventory limit', () => {
    const itemAtInventoryLimit = {
      ...mockItem,
      quantity: 10
    };

    render(
      <CartItem
        item={itemAtInventoryLimit}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
      />
    );

    expect(screen.getByTestId('quantity-increase')).toBeDisabled();
  });

  it('disables all buttons when loading', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('quantity-decrease')).toBeDisabled();
    expect(screen.getByTestId('quantity-increase')).toBeDisabled();
    expect(screen.getByTestId('remove-item')).toBeDisabled();
  });

  it('handles missing brand name gracefully', () => {
    const itemWithoutBrand = {
      ...mockItem,
      products: {
        ...mockItem.products,
        brands: undefined
      }
    };

    render(
      <CartItem
        item={itemWithoutBrand}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
      />
    );

    expect(screen.getByText('Unknown Brand')).toBeInTheDocument();
  });

  it('displays product image with alt text', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
      />
    );

    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveClass('w-20', 'h-20', 'object-cover', 'rounded-lg');
  });

  it('calculates line total correctly', () => {
    const itemWithQuantityThree = {
      ...mockItem,
      quantity: 3
    };

    render(
      <CartItem
        item={itemWithQuantityThree}
        onUpdateQuantity={mockHandlers.onUpdateQuantity}
        onRemove={mockHandlers.onRemove}
      />
    );

    expect(screen.getByText('$89.97')).toBeInTheDocument();
    expect(screen.getByText('$29.99 × 3')).toBeInTheDocument();
  });
}); 