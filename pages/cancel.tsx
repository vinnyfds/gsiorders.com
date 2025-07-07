// pages/cancel.tsx
import { useRouter } from "next/router";

export default function Cancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mb-2"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
