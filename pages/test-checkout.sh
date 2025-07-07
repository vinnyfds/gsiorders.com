#!/bin/bash

echo "🧪 Testing your /api/checkout endpoint..."
echo "Make sure your Next.js dev server is running on localhost:3000"
echo ""

# Test your actual checkout endpoint with proper data
response=$(curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "cartItems": [
      {
        "name": "Test Product - Liquid Heaven",
        "price": 25.99,
        "quantity": 2
      },
      {
        "name": "Another Test Product",
        "price": 15.50,
        "quantity": 1
      }
    ]
  }')

echo "📤 Response from checkout API:"
echo "$response" | jq '.'

# Extract session ID for webhook testing
sessionId=$(echo "$response" | jq -r '.sessionId')

if [ "$sessionId" != "null" ] && [ "$sessionId" != "" ]; then
  echo ""
  echo "✅ Session created successfully!"
  echo "📋 Session ID: $sessionId"
  echo ""
  echo "🎯 Now trigger the webhook with:"
  echo "stripe trigger checkout.session.completed --add checkout_session:id=$sessionId"
  echo ""
  echo "💡 Alternative - use stripe CLI to listen and then complete the checkout in browser:"
  echo "stripe listen --forward-to localhost:3000/api/webhook"
  echo "Then visit the checkout URL in your browser and complete payment with test card: 4242 4242 4242 4242"
else
  echo "❌ Failed to create checkout session"
  echo "Check your Next.js server logs for errors"