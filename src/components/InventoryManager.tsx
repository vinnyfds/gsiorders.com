import React, { useState, useEffect } from "react";
import type { ProductWithInventory } from "../../pages/api/admin/products";
import type { UpdateInventoryRequest, UpdateInventoryResponse } from "../../pages/api/admin/inventory";

// Component Props
interface InventoryManagerProps {
  className?: string;
  onInventoryUpdate?: (productId: string, newCount: number) => void;
}

// Component State
interface EditingState {
  productId: string;
  newCount: number;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  className = "",
  onInventoryUpdate 
}) => {
  // State management
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Clear messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (updateError) {
      const timer = setTimeout(() => setUpdateError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [updateError]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/products");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Start editing a product's inventory
  const startEditing = (product: ProductWithInventory) => {
    setEditing({
      productId: product.id,
      newCount: product.inventory_count,
    });
    setUpdateError(null);
    setSuccessMessage(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditing(null);
    setUpdateError(null);
  };

  // Update inventory count
  const updateInventory = async () => {
    if (!editing) return;

    try {
      setUpdateLoading(editing.productId);
      setUpdateError(null);

      const requestBody: UpdateInventoryRequest = {
        product_id: editing.productId,
        new_inventory_count: editing.newCount,
      };

      const response = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Update failed: ${response.status}`);
      }

      const result: UpdateInventoryResponse = await response.json();

      // Update local state
      setProducts(prev => 
        prev.map(product => 
          product.id === editing.productId 
            ? { ...product, inventory_count: editing.newCount }
            : product
        )
      );

      // Call optional callback
      if (onInventoryUpdate) {
        onInventoryUpdate(editing.productId, editing.newCount);
      }

      setSuccessMessage(result.message);
      setEditing(null);

    } catch (err) {
      console.error("Error updating inventory:", err);
      setUpdateError(err instanceof Error ? err.message : "Failed to update inventory");
    } finally {
      setUpdateLoading(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get inventory status color
  const getInventoryStatusColor = (count: number) => {
    if (count === 0) return "text-red-600 bg-red-50";
    if (count < 10) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  // Get inventory status text
  const getInventoryStatusText = (count: number) => {
    if (count === 0) return "Out of Stock";
    if (count < 10) return "Low Stock";
    return "In Stock";
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Inventory Management
          </h2>
          <p className="text-gray-600 text-sm">
            Manage product stock levels
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Inventory Management
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Products
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Inventory Management
            </h2>
            <p className="text-gray-600 text-sm">
              Manage product stock levels ({products.length} products)
            </p>
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-600 text-xl mr-3">✅</div>
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {updateError && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600 text-xl mr-3">❌</div>
            <p className="text-red-800">{updateError}</p>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Brand</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Stock Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">ID: {product.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{product.brand_name}</td>
                    <td className="py-4 px-4 text-gray-700">{formatCurrency(product.price)}</td>
                    <td className="py-4 px-4">
                      {editing?.productId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editing.newCount}
                            onChange={(e) => setEditing({ ...editing, newCount: parseInt(e.target.value) || 0 })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={updateLoading === product.id}
                          />
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900">{product.inventory_count}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getInventoryStatusColor(product.inventory_count)}`}>
                        {getInventoryStatusText(product.inventory_count)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {editing?.productId === product.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={updateInventory}
                            disabled={updateLoading === product.id}
                            className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {updateLoading === product.id ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={updateLoading === product.id}
                            className="bg-gray-400 text-white px-3 py-1 text-sm rounded hover:bg-gray-500 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(product)}
                          className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager; 