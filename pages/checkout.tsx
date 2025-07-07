import React, { useState } from 'react';
import { useRouter } from 'next/router';

const CheckoutPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* TODO: pass cart items if needed */ }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('No checkout URL received');
      }
    } catch (err) {
      setError('Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
          onClick={handleCheckout}
          disabled={isLoading}
          data-testid="complete-payment-btn"
        >
          {isLoading ? 'Processing...' : 'Complete Checkout'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage; 