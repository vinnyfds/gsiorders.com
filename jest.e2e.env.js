// Mock environment variables for E2E testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-supabase-url.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-service-key-for-testing';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_stripe_key_for_testing';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_stripe_key_for_testing';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_webhook_secret_for_testing';
process.env.TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
process.env.NODE_ENV = 'test';

console.log('🧪 E2E Test Environment: Mock environment variables set'); 