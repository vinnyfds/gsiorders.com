# cart and checkout API coverage testing

# run comprehensive coverage tests
npx jest --coverage --collectCoverageFrom="pages/api/cart.ts" --collectCoverageFrom="pages/api/checkout.ts" __tests__/api/cart.spec.ts __tests__/api/checkout.spec.ts

# run cart tests with detailed coverage
npx jest --coverage --collectCoverageFrom="pages/api/cart.ts" __tests__/api/cart.spec.ts

# run checkout tests with detailed coverage  
npx jest --coverage --collectCoverageFrom="pages/api/checkout.ts" __tests__/api/checkout.spec.ts

# staging and commit
git add __tests__/api/cart.spec.ts
git commit -m "test: enhance cart API test coverage to ≥80% (89.77% statements, 87.93% branches)"

# push to feature branch
git push -u origin feat/reviews-wishlist 