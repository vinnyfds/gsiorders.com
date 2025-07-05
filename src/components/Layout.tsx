import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../hooks/useCart';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Brand configuration
  const brands = [
    { name: 'Liquid Heaven', slug: 'liquidheaven', color: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
    { name: 'Motaquila', slug: 'motaquila', color: '#ec4899', gradient: 'from-pink-500 to-pink-600' },
    { name: 'Last Genie', slug: 'lastgenie', color: '#6366f1', gradient: 'from-indigo-500 to-indigo-600' }
  ];

  // Get current brand from URL
  const currentBrandSlug = router.asPath.split('/')[1];
  const currentBrand = brands.find(b => b.slug === currentBrandSlug);

  // Apply brand theming
  const brandColor = currentBrand?.color || '#6366f1';
  const brandGradient = currentBrand?.gradient || 'from-blue-500 to-blue-600';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className={`bg-gradient-to-r ${brandGradient} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-xl">GSI</span>
                </div>
                <div className="text-white">
                  <h1 className="text-xl font-bold">GSI Orders</h1>
                  {currentBrand && (
                    <p className="text-sm text-white/80">{currentBrand.name}</p>
                  )}
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              
              {/* Main Navigation Links */}
              <div className="flex items-center space-x-6">
                <Link 
                  href="/"
                  className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === '/' ? 'bg-white/20' : ''
                  }`}
                >
                  Home
                </Link>
                <Link 
                  href="/products"
                  className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === '/products' ? 'bg-white/20' : ''
                  }`}
                >
                  All Products
                </Link>
                <Link 
                  href="/orders"
                  className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === '/orders' ? 'bg-white/20' : ''
                  }`}
                >
                  Orders
                </Link>
                <Link 
                  href="/admin"
                  className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === '/admin' ? 'bg-white/20' : ''
                  }`}
                >
                  Admin
                </Link>
              </div>

              {/* Brand Switcher */}
              <div className="flex items-center space-x-2">
                <span className="text-white/80 text-sm">Brands:</span>
                {brands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/${brand.slug}`}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      currentBrandSlug === brand.slug
                        ? 'bg-white text-gray-900'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>

              {/* Cart Icon */}
              <Link 
                href="/cart"
                className="relative bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                aria-label={`Cart with ${cart.itemCount} items`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m4.5 0h6m-6 0a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                {cart.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.itemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-white/80 p-2"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/20 backdrop-blur-sm border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/products"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Products
              </Link>
              <Link 
                href="/orders"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders
              </Link>
              <Link 
                href="/admin"
                className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
              
              {/* Mobile Brand Links */}
              <div className="border-t border-white/20 pt-2 mt-2">
                <p className="px-3 py-2 text-white/60 text-sm font-medium">Brands</p>
                {brands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/${brand.slug}`}
                    className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Cart Link */}
              <div className="border-t border-white/20 pt-2 mt-2">
                <Link 
                  href="/cart"
                  className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart ({cart.itemCount} items)
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">GSI Orders</h3>
              <p className="text-gray-400 mb-4">
                Your premier destination for Liquid Heaven, Motaquila, and Last Genie products.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">GSI</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/products" className="text-gray-400 hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/orders" className="text-gray-400 hover:text-white transition-colors">Orders</Link></li>
                <li><Link href="/cart" className="text-gray-400 hover:text-white transition-colors">Cart</Link></li>
              </ul>
            </div>

            {/* Brands */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Our Brands</h4>
              <ul className="space-y-2">
                {brands.map((brand) => (
                  <li key={brand.slug}>
                    <Link href={`/${brand.slug}`} className="text-gray-400 hover:text-white transition-colors">
                      {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Admin Panel</Link></li>
                <li><span className="text-gray-400">Email: support@gsiorders.com</span></li>
                <li><span className="text-gray-400">Phone: (555) 123-4567</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GSI Orders. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 