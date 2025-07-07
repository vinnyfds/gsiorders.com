// __tests__/components/InventoryManager.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InventoryManager from '../../src/components/InventoryManager';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    inventory_count: 10,
    price: 29.99,
    brand_id: 'brand-1',
    brand_name: 'Test Brand',
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Product 2',
    inventory_count: 0,
    price: 39.99,
    brand_id: 'brand-1',
    brand_name: 'Test Brand',
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Test Product 3',
    inventory_count: 5,
    price: 19.99,
    brand_id: 'brand-2',
    brand_name: 'Another Brand',
    created_at: '2023-01-01T00:00:00Z',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (fetch as jest.MockedFunction<typeof fetch>).mockClear();
});

describe('InventoryManager Component', () => {
  describe('Loading State', () => {
    it('should display loading state initially', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ products: mockProducts }),
              } as Response)
            )
          )
      );

      render(<InventoryManager />);

      expect(screen.getByText('Loading products...')).toBeInTheDocument();
      expect(screen.getByText('Loading products...')).toBeInTheDocument();
    });

    it('should hide loading state after data loads', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: mockProducts }),
      } as Response);

      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Inventory Management')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error state when fetch fails', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
        new Error('Network error')
      );

      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Products')).toBeInTheDocument();
      });

      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should display error state for HTTP errors', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Products')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to fetch products: 500')).toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ products: mockProducts }),
        } as Response);

      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try Again'));

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    beforeEach(async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: mockProducts }),
      } as Response);
    });

    it('should display product list correctly', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('Test Product 3')).toBeInTheDocument();
      expect(screen.getByText(/3 products/)).toBeInTheDocument();
    });

    it('should display product details correctly', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      // Check brand names
      expect(screen.getAllByText('Test Brand')).toHaveLength(2);
      expect(screen.getByText('Another Brand')).toBeInTheDocument();

      // Check prices
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('$39.99')).toBeInTheDocument();
      expect(screen.getByText('$19.99')).toBeInTheDocument();
    });

    it('should display inventory counts correctly', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      // Find stock level cells and check their content
      const stockCells = screen.getAllByText(/^\d+$/);
      expect(stockCells).toHaveLength(3);
    });

    it('should display correct inventory status', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Out of Stock')).toBeInTheDocument(); // Product 2
      expect(screen.getByText('Low Stock')).toBeInTheDocument(); // Product 3
      expect(screen.getByText('In Stock')).toBeInTheDocument(); // Product 1
    });

    it('should display empty state when no products', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: [] }),
      } as Response);

      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('No products found')).toBeInTheDocument();
      });
    });
  });

  describe('Editing Functionality', () => {
    beforeEach(async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: mockProducts }),
      } as Response);
    });

    it('should start editing when Edit button is clicked', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should cancel editing when Cancel button is clicked', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByDisplayValue('10')).not.toBeInTheDocument();
      expect(screen.getAllByText('Edit')).toHaveLength(3);
    });

    it('should update inventory count input value', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const input = screen.getByDisplayValue('10');
      fireEvent.change(input, { target: { value: '20' } });

      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    beforeEach(async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: mockProducts }),
      } as Response);
    });

    it('should save inventory update successfully', async () => {
      const mockUpdateResponse = {
        success: true,
        product_id: '1',
        new_count: 20,
        message: 'Successfully updated inventory for "Test Product 1"',
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ products: mockProducts }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUpdateResponse),
        } as Response);

      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      // Start editing
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Change value
      const input = screen.getByDisplayValue('10');
      fireEvent.change(input, { target: { value: '20' } });

      // Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      // Check API call
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/inventory', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: '1',
            new_inventory_count: 20,
          }),
        });
      });

      // Check success message
      await waitFor(() => {
        expect(screen.getByText('Successfully updated inventory for "Test Product 1"')).toBeInTheDocument();
      });
    });

    it('should handle save errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ products: mockProducts }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Update failed' }),
        } as Response);

      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      // Start editing and save
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      // Check error message
      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    it('should show loading state during save', async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ products: mockProducts }),
        } as Response)
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(() =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ success: true }),
                } as Response)
              )
            )
        );

      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      // Start editing and save
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should call onInventoryUpdate callback when provided', async () => {
      const mockCallback = jest.fn();

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ products: mockProducts }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            product_id: '1',
            new_count: 20,
            message: 'Updated',
          }),
        } as Response);

      render(<InventoryManager onInventoryUpdate={mockCallback} />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      // Start editing, change value, and save
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const input = screen.getByDisplayValue('10');
      fireEvent.change(input, { target: { value: '20' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith('1', 20);
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh button is clicked', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: mockProducts }),
      } as Response);

      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      // Should call fetch again
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: mockProducts }),
      } as Response);
    });

    it('should have proper table structure', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(6);
      expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 data rows
    });

    it('should have accessible buttons', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      expect(editButtons).toHaveLength(3);

      const refreshButton = screen.getByRole('button', { name: /Refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it('should have accessible form inputs when editing', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('min', '0');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: mockProducts }),
      } as Response);
    });

    it('should have responsive table wrapper', async () => {
      render(<InventoryManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const tableWrapper = screen.getByRole('table').parentElement;
      expect(tableWrapper).toHaveClass('overflow-x-auto');
    });
  });
}); 