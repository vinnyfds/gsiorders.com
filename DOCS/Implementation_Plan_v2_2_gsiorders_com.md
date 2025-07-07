
# Implementation Plan v2.2 – gsiorders.com (Final Production-Ready)

This version completes the remaining Phase 2 features (AI chatbot, tax engine), adds time estimates, and generalizes the ProductCard prompt pattern across components for Cursor AI microtask execution.

---

## ✅ GOAL 1: Infrastructure Setup (Est. Time: 3 days)

Includes database, storage, email, CDN, environment setup, and CI/CD automation.

(Tasks 1.1 – 1.10 already defined in v2.1)

---

## ✅ GOAL 2: Frontend Components & Routing (Est. Time: 4–5 days)

Expanded Cursor prompts:

### Task: Create CartModal.tsx
**Cursor Prompt:**  
```
Build a modal that displays cart items. Each item should show product name, quantity, and price. Include a Stripe Checkout button that calls /api/checkout. Use Tailwind styling. Export default CartModal.
```

### Task: Create WishlistButton.tsx
**Cursor Prompt:**  
```
Build a toggle button that receives productId and isSaved. Show heart icon (filled or outline) based on isSaved. On click, call POST /api/wishlist. Use Tailwind for styling.
```

### Task: Create ReviewForm.tsx
**Cursor Prompt:**  
```
Create a form with a 1–5 star rating input and a comment field. Submit to POST /api/reviews. Add validation for empty fields. Use Tailwind and export default ReviewForm.
```

### Task: Create AdminDashboard.tsx
**Cursor Prompt:**  
```
Create an admin dashboard with cards for total revenue, order volume, and low inventory products. Fetch from /api/admin/dashboard. Use Tailwind components. Responsive layout.
```

---

## ✅ GOAL 3: Backend API + System Integration (Est. Time: 5–6 days)

| Endpoint                  | Description                         | Dependencies             |
|---------------------------|--------------------------------------|--------------------------|
| POST /api/chatbot         | AI Chatbot prompt API                | OpenAI or Claude API     |
| POST /api/calculate-tax   | Tax estimate based on user region    | Stripe Tax (future), fallback: 7% FL flat |
| POST /api/webhooks/stripe | Stripe signature, inventory update   | Stripe secret + DB       |

### AI Chatbot Integration (Phase 2, Non-Blocking)
- Add `/api/chatbot` handler
- Inject page context: product ID, brand, cart state
- Pass to Claude or GPT-4 API

### Tax Calculation Logic
- Simple flat rate function:
```ts
function calculateTax(subtotal) {
  return subtotal * 0.07; // Florida sales tax estimate
}
```
- Future: Integrate with Stripe Tax API

---

## ✅ GOAL 4: Testing & QA (Est. Time: 3 days)

| Layer       | Tools         | Tasks                            |
|-------------|---------------|-----------------------------------|
| Unit        | Jest, Vitest  | Test ProductCard, Wishlist toggle|
| API         | Postman       | Auth, Cart, Checkout, Webhooks   |
| E2E         | Cypress       | Full flow simulation              |
| RLS         | Supabase CLI  | Test access control policies      |

---

## ✅ Time Estimates Summary

| Goal               | Est. Time        |
|--------------------|------------------|
| Infrastructure     | 3 days           |
| Frontend UI        | 4–5 days         |
| Backend APIs       | 5–6 days         |
| Testing + QA       | 3 days           |
| Buffer + Fixes     | 2 days           |
| **Total Estimate** | **~2.5 weeks**   |

---

## ✅ Final Task Dependency Tree

- ProductCard → Product type + Product API
- CartModal → ProductCard + useCart + Checkout API
- AdminDashboard → Auth + Metrics API
- AI Chatbot → Page context + Claude API key
- Tax → Checkout page + user location
- Wishlist → Supabase session + toggle state

---

## ✅ Summary of Changes in v2.2

- ✅ Added AI Chatbot integration task
- ✅ Added Tax Calculation logic placeholder
- ✅ Expanded Cursor prompts for all components
- ✅ Time estimates per goal
- ✅ Reinforced testing layers and deployment flow

This is the final implementation plan, fully optimized for development, microtask execution, and production deployment.

---
