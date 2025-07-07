import React from 'react';
import Link from 'next/link';
import { useCart } from '../src/hooks/useCart';

export default function Home() {
  const { cart } = useCart();

  // Brand configuration
  const brands = [
    {
      name: 'Liquid Heaven',
      slug: 'liquidheaven',
      color: '#10b981',
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Premium wellness and CBD products for a better lifestyle.',
      features: ['Premium Quality', 'Lab Tested', 'Organic Ingredients']
    },
    {
      name: 'Motaquila',
      slug: 'motaquila',
      color: '#ec4899',
      gradient: 'from-pink-500 to-pink-600',
      description: 'Exquisite premium beverages crafted for the discerning palate.',
      features: ['Craft Beverages', 'Premium Ingredients', 'Unique Flavors']
    },
    {
      name: 'Last Genie',
      slug: 'lastgenie',
      color: '#6366f1',
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Specialty products that bring magic to your everyday life.',
      features: ['Limited Edition', 'Exclusive Designs', 'Collector Items']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to GSI Orders
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">
            Your premier destination for three exceptional brands: Liquid Heaven, Motaquila, and Last Genie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Explore All Products
            </Link>
            <div className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center">
              🛒 Cart: {cart.itemCount} items • ${cart.total.toFixed(2)}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Selection Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Brand
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each brand offers unique products tailored to different lifestyles and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {brands.map((brand, index) => (
              <div
                key={brand.slug}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
              >
                {/* Brand Header */}
                <div className={`bg-gradient-to-r ${brand.gradient} text-white p-8 text-center`}>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <span className="text-2xl font-bold">{brand.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{brand.name}</h3>
                  <p className="text-white/90">{brand.description}</p>
                </div>

                {/* Brand Features */}
                <div className="p-8">
                  <ul className="space-y-3 mb-8">
                    {brand.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Brand Action Button */}
                  <Link
                    href={`/${brand.slug}`}
                    className={`w-full bg-gradient-to-r ${brand.gradient} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center group-hover:scale-105`}
                  >
                    Shop {brand.name}
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Access
            </h2>
            <p className="text-gray-600">
              Jump directly to the sections you need
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/products"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">All Products</h3>
              <p className="text-sm text-white/80">Browse our complete catalog</p>
            </Link>

            <Link
              href="/cart"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m4.5 0h6m-6 0a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Shopping Cart</h3>
              <p className="text-sm text-white/80">{cart.itemCount} items • ${cart.total.toFixed(2)}</p>
            </Link>

            <Link
              href="/orders"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Order History</h3>
              <p className="text-sm text-white/80">View your past orders</p>
            </Link>

            <Link
              href="/admin"
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Admin Panel</h3>
              <p className="text-sm text-white/80">Manage products & orders</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-emerald-400">3</div>
              <div className="text-xl font-semibold mb-1">Premium Brands</div>
              <div className="text-gray-400">Liquid Heaven, Motaquila, Last Genie</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-pink-400">100+</div>
              <div className="text-xl font-semibold mb-1">Quality Products</div>
              <div className="text-gray-400">Carefully curated for excellence</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-400">24/7</div>
              <div className="text-xl font-semibold mb-1">Online Store</div>
              <div className="text-gray-400">Shop anytime, anywhere</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
