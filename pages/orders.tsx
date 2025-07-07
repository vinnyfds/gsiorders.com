// pages/orders.tsx - Fixed layout and styling
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    images: string[] | null;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders?include_items=true");

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Products
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              When you place your first order, it will appear here.
            </p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {order.order_items && order.order_items.length > 0 ? (
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Items ({order.order_items.length})
                    </h4>
                    <div className="space-y-4">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                            <img
                              src={
                                item.products.images?.[0] ||
                                `https://picsum.photos/seed/${item.products.name}/80/80`
                              }
                              alt={item.products.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log(
                                  "Image failed to load, using fallback"
                                );
                                e.currentTarget.src = `https://picsum.photos/seed/${item.id}/80/80`;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 truncate">
                              {item.products.name}
                            </h5>
                            <p className="text-gray-600">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Qty</p>
                            <p className="font-semibold text-gray-900">
                              {item.quantity}
                            </p>
                          </div>
                          <div className="text-right min-w-0">
                            <p className="text-lg font-bold text-gray-900">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>Order items not available</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
