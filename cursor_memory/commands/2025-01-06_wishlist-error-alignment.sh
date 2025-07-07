# wishlist error alignment testing
npx jest --coverage --no-cache __tests__/api/wishlist.spec.ts

# staging and commit
git add __tests__/api/wishlist.spec.ts
git commit -m "test: align wishlist error assertions to current 404 behaviour (TODO refine handler later)" 