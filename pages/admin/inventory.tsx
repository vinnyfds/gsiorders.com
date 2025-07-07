import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import InventoryManager from "../../src/components/InventoryManager";

const AdminInventoryPage: React.FC = () => {
  const router = useRouter();

  // Handle successful inventory updates
  const handleInventoryUpdate = (productId: string, newCount: number) => {
    console.log(`✅ Inventory updated: Product ${productId} now has ${newCount} items`);
    // You could add additional logic here like:
    // - Showing notifications
    // - Updating other UI elements
    // - Triggering analytics events
  };

  return (
    <>
      <Head>
        <title>Inventory Management - Admin | GSI Orders</title>
        <meta name="description" content="Manage product inventory and stock levels" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Inventory Management
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  View Store
                </Link>
                <Link
                  href="/admin"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Product Inventory
            </h2>
            <p className="text-gray-600 mt-2">
              Manage stock levels for all products across all brands. Make sure to keep inventory updated to prevent overselling.
            </p>
          </div>

          {/* Inventory Management Component */}
          <InventoryManager
            className="mb-8"
            onInventoryUpdate={handleInventoryUpdate}
          />

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Practices */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Best Practices
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Keep inventory updated in real-time
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Monitor low stock alerts regularly
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Set realistic buffer quantities
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Review inventory reports weekly
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/admin"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-3">📊</div>
                    <span className="text-sm font-medium text-gray-900">
                      View Dashboard
                    </span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
                
                <Link
                  href="/orders"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="text-green-600 mr-3">📋</div>
                    <span className="text-sm font-medium text-gray-900">
                      View Orders
                    </span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
                
                <Link
                  href="/products"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="text-purple-600 mr-3">🛍️</div>
                    <span className="text-sm font-medium text-gray-900">
                      View Products
                    </span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminInventoryPage; 