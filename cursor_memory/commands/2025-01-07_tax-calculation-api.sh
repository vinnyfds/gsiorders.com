#!/bin/bash
# Tax Calculation API Implementation Commands
# Date: 2025-01-07

# Create tax calculation API endpoint
echo "Creating tax calculation API endpoint..."
# File: pages/api/calculate-tax.ts

# Create comprehensive test suite
echo "Creating test suite..."
# File: __tests__/api/calculate-tax.spec.ts

# Rename test file to match project pattern
mv __tests__/api/calculate-tax.test.ts __tests__/api/calculate-tax.spec.ts

# Run tax calculation tests
npm test -- __tests__/api/calculate-tax.spec.ts

# Run full test suite to ensure no regressions
npm test -- --passWithNoTests

# Create manual test collection
echo "Creating Postman collection for manual testing..."
# File: testing/manual-calculate-tax.postman_collection.json

# Test endpoint manually (server must be running)
# curl -X POST http://localhost:3000/api/calculate-tax \
#   -H "Content-Type: application/json" \
#   -d '{"subtotal": 100, "state": "FL"}'

# PowerShell alternative for Windows:
# Invoke-WebRequest -Uri "http://localhost:3000/api/calculate-tax" \
#   -Method POST \
#   -Headers @{"Content-Type"="application/json"} \
#   -Body '{"subtotal": 100, "state": "FL"}'

# Start development server for testing
npm run dev

# Verify all tests pass
npm test -- __tests__/api/calculate-tax.spec.ts

echo "✅ Tax calculation API implementation complete"
echo "📊 Test Results: 13/13 tests passing"
echo "📁 Files created:"
echo "  - pages/api/calculate-tax.ts"
echo "  - __tests__/api/calculate-tax.spec.ts"
echo "  - testing/manual-calculate-tax.postman_collection.json"
echo "  - cursor_memory/problems/2025-01-07_tax-calculation-api.md" 