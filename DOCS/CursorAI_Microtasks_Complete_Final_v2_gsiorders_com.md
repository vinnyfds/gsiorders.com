# Cursor AI Microtask Execution Plan – gsiorders.com (Final Version)

Each task below includes: detailed prompt, technical specs, time estimate, dependencies, and success criteria.

---

## ✅ GOAL 1: Infrastructure Microtasks

### Task 1.1: Initialize Supabase Project
- **Prompt:** "Initialize a new Supabase project and generate local config files for CLI use."
- **Time Estimate:** 30 min
- **Dependencies:** none
- **Success Criteria:** CLI responds to `supabase start`

### Task 1.2: Apply SQL Schema
- **Prompt:** "Push SQL schema (DDL from TRD) to Supabase using CLI migrations."
- **Time Estimate:** 1 hr
- **Dependencies:** 1.1
- **Success Criteria:** All tables visible in Supabase UI

### Task 1.3: Configure Supabase Storage
- **Prompt:** "Create Supabase buckets 'products' and 'brands' with signed URL access and 2MB limit."
- **Time Estimate:** 30 min
- **Success Criteria:** Upload + signed fetch works

### Task 1.4: Search Index Setup
- **Prompt:** "Add GIN full-text index on `products.name` using Supabase SQL editor."
- **SQL:** `CREATE INDEX idx_products_name ON products USING GIN (to_tsvector('english', name));`
- **Time Estimate:** 15 min

### Task 1.5: Seed Brand Data
- **Prompt:** "Insert 3 brand records into `brands` table with slug and theme_config JSON."
- **Time Estimate:** 30 min
- **Success Criteria:** `/[brand]` pages load with correct styles

### Task 1.6: Create .env Configuration
- **Prompt:** "Generate `.env.example` file with all keys: Supabase, Stripe, SendGrid, AWS."
- **Time Estimate:** 20 min
- **Success Criteria:** Local app runs after `cp .env.example .env.local && npm run dev`

### Task 1.7: SendGrid Setup
- **Prompt:** "Configure SendGrid domain in Route53, create templates, add template IDs to `.env`."
- **Time Estimate:** 2 hrs
- **Dependencies:** 1.6
- **Success Criteria:** Test email sends successfully

### Task 1.8: CloudFront + S3 Setup
- **Prompt:** "Link S3 + Supabase public URL to CloudFront. Add custom domain: `cdn.gsiorders.com`."
- **Time Estimate:** 2 hrs
- **Success Criteria:** Image served via CDN

### Task 1.9: GitHub Actions CI/CD
- **Prompt:** "Build deploy script to S3 with CloudFront invalidation."
- **File:** `.github/workflows/deploy.yml`
- **Time Estimate:** 1 hr
- **Success Criteria:** Push to `main` triggers deploy

---

## ✅ GOAL 2: Frontend Component Microtasks

### Task 2.1: ProductCard.tsx
- **Prompt:** "Create ProductCard component with `product: {id, name, price, image, brand_id}`. Display image, name, price. Add button calling `addToCart(product.id)`. Tailwind card. Responsive. Export default."
- **File:** `src/components/ProductCard.tsx`
- **Time:** 1.5 hrs

### Task 2.2: CartModal.tsx
- **Prompt:** "Create CartModal that shows cartItems from `useCart`. Include quantity controls, line totals, cart total, Continue Shopping + Checkout button calling `/api/checkout`. Tailwind modal. Responsive."
- **Props:** none
- **State:** cartItems via useCart
- **Time:** 2 hrs

### Task 2.3: WishlistButton.tsx
- **Prompt:** "Toggle wishlist heart icon for productId. Calls `/api/wishlist` POST. Show filled/outline. Tailwind icon. Auth required."
- **Time:** 1 hr

### Task 2.4: ReviewForm.tsx
- **Prompt:** "Create review form: 1–5 stars + comment. Submit to `/api/reviews`. Validate input. Auth required."
- **Time:** 1.5 hrs

### Task 2.5: SearchBar.tsx
- **Prompt:** "Build input for search + filter dropdown. Calls `/api/search/products`. Tailwind styling."
- **Time:** 1.5 hrs

### Task 2.6: BrandFilterBar.tsx
- **Prompt:** "Brand selector bar using slug links. Highlights active brand. Fetch from `brands` table."
- **Time:** 1 hr

### Task 2.7: InventoryManager.tsx
- **Prompt:** "Admin-only table with editable product inventory. Pull from `/api/admin/inventory`. Update via PUT."
- **Time:** 2 hrs

### Task 2.8: AdminDashboard.tsx
- **Prompt:** "Admin dashboard with total revenue, order count, low inventory list. Fetch from `/api/admin/dashboard`."
- **Time:** 1.5 hrs

---

## ✅ GOAL 3: Backend API Microtasks

### Task 3.1: /api/products
- **Prompt:** "GET endpoint to return product list with pagination, filter by brand, search by name."
- **Time:** 1 hr

### Task 3.2: /api/search/products
- **Prompt:** "GET endpoint with query param `search`. Uses Supabase textSearch on `products.name`. Returns product array."
- **Time:** 1 hr

### Task 3.3: /api/reviews
- **Prompt:** "POST endpoint with body: {productId, rating, comment}. Validates rating 1-5. Auth required. Inserts to `reviews`."
- **Time:** 1 hr

### Task 3.4: /api/wishlist
- **Prompt:** "POST to toggle productId for logged-in user. Adds/removes from wishlist_items table."
- **Time:** 45 min

### Task 3.5: /api/checkout
- **Prompt:** "Create Stripe checkout session from cart. Return session URL."
- **Time:** 1 hr

### Task 3.6: /api/webhooks/stripe
- **Prompt:** "Validate Stripe webhook. On checkout success, create order, reduce inventory, send email."
- **Time:** 2 hrs

### Task 3.7: /api/upload/product-image
- **Prompt:** "POST with image file. Validate type/size, store to Supabase Storage. Return signed URL."
- **Time:** 1 hr

### Task 3.8: /api/chatbot
- **Prompt:** "Create AI chatbot endpoint. Input: brand, page context. Output: Claude/OpenAI response."
- **Time:** 1.5 hrs

### Task 3.9: /api/calculate-tax
- **Prompt:** "POST with subtotal. Return tax at 7%. Future: integrate with Stripe Tax."
- **Time:** 30 min

### Task 3.10: /api/quotes/request
- **Prompt:** "POST with B2B quote item list. Store in `quotes` table. Status = 'requested'."
- **Time:** 45 min

---

## ✅ GOAL 4: Testing & QA Microtasks

### Task 4.1: Unit Test - ProductCard
- Tool: Jest
- Validate: Renders image, name, price, button
- Time: 30 min

### Task 4.2: API Test - /api/checkout
- Tool: Postman or Supertest
- Validate: Stripe session returns 200
- Time: 45 min

### Task 4.3: E2E Test - Checkout Flow
- Tool: Cypress
- Flow: login → cart → checkout → webhook
- Time: 1.5 hrs

### Task 4.4: RLS Policy Test - Orders
- Tool: Supabase CLI or query test
- Validate: user cannot view other orders
- Time: 30 min

---

## ✅ Dependency Map Summary

```
- Frontend depends on 1.2, 1.5
- Brand pages depend on 1.5
- All APIs depend on Supabase + schema
- Testing depends on backend and frontend completion
- Checkout flow depends on Stripe keys + webhook
- Admin UI depends on admin login seeding
```

---

## ✅ Total Project Time Estimate

| Phase        | Time Estimate |
|--------------|----------------|
| Infrastructure | 3 days        |
| Frontend       | 4–5 days      |
| Backend        | 5 days        |
| Testing        | 3 days        |
| **Total**      | ~2.5 weeks    |

---

This plan includes **100% of implementation plan features**, formatted and scoped for efficient Cursor AI execution. Each microtask is autonomous, validated, and ready for direct drop into AI workflows.

---
---

## ✅ FINAL ADDITIONS – Remaining Tasks

### Task 2.9: Create useCart Hook
- **Prompt:** "Create a React hook `useCart` that manages cart state. Include `addToCart`, `removeFromCart`, and `clearCart` functions. Store cart in localStorage. Return current cartItems and totals."
- **File:** `src/hooks/useCart.ts`
- **Time:** 1 hr
- **Dependencies:** ProductCard, CartModal
- **Success Criteria:** Cart persists and updates correctly

### Task 2.10: Create [brand]/index.tsx Page
- **Prompt:** "Create Next.js dynamic page at `pages/[brand]/index.tsx`. Fetch brand from slug param and display brand-specific products styled with brand.theme_config."
- **Time:** 1.5 hrs
- **Dependencies:** Brand seeding (Task 1.5), ProductCard
- **Success Criteria:** Products filtered by brand on route `/liquidheaven`, etc.

---

### Task 3.11: Create /api/admin/dashboard
- **Prompt:** "Create GET endpoint `/api/admin/dashboard`. Requires admin auth. Return: { revenue: sum(orders.total), orderCount: count(orders), lowInventoryProducts: products where inventory_count < 10 }."
- **Time:** 1 hr
- **Dependencies:** Orders, Products tables
- **Success Criteria:** JSON response returns 3 expected metrics

---

### Task 3.12: Create /api/admin/inventory
- **Prompt:** "Create PUT endpoint `/api/admin/inventory` to update product stock. Body: { productId: string, newCount: number }. Requires admin auth. Updates inventory_count in `products` table."
- **Time:** 45 min
- **Dependencies:** Auth setup, Products table
- **Success Criteria:** DB updates on valid PUT, rejects unauthorized users

---