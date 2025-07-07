// pages/success.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      console.log("Payment successful for session:", session_id);
      setLoading(false);
    }
  }, [session_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900">
            Processing your order...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Icon & Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600">Thank you for your order</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Confirmation
          </h2>

          <div className="border-l-4 border-green-500 pl-4 mb-6 bg-green-50 py-3">
            <p className="text-sm text-green-800">
              <strong>Your payment has been processed successfully!</strong>
              You will receive an order confirmation email within the next few
              minutes.
            </p>
          </div>

          {session_id && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">Transaction ID:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm ml-2">
                {session_id}
              </code>
            </div>
          )}

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Order confirmation email will be sent shortly</span>
            </div>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <span>Your order will be processed within 1-2 business days</span>
            </div>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Questions? Contact us at orders@gsiorders.com</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="bg-gray-100 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
          >
            Back to Home
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            Need help? Check our{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              FAQ
            </Link>{" "}
            or contact support
          </p>
        </div>
      </div>
    </div>
  );
}
