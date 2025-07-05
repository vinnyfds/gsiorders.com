
# Functional Requirements Document (FRD)

## Project: gsiorders.com - Unified E-commerce Platform

---

## 🔍 1. Project Overview

This e-commerce platform consolidates three existing brand websites — Liquid Heaven, Motaquila, and Last Genie — into a single unified experience hosted at **gsiorders.com**.

### Goals:
- Support D2C and B2B flows
- Feature AI-driven enhancements
- Streamline backend operations via Supabase + Stripe + AWS

---

## 🧩 2. Full Feature Matrix

| Feature                        | Guest | Registered User | Admin | Sales Rep |
|-------------------------------|-------|------------------|-------|-----------|
| Browse Products               | ✅    | ✅               | ✅    | ✅        |
| Add to Cart                   | ✅    | ✅               | ✅    | ✅        |
| Place Orders                  | ❌    | ✅               | ✅    | ✅        |
| Access Order History          | ❌    | ✅               | ✅    | ✅        |
| AI Chatbot Support            | ✅    | ✅               | ✅    | ✅        |
| Manage Inventory              | ❌    | ❌               | ✅    | ❌        |
| Upload Product Media          | ❌    | ❌               | ✅    | ❌        |
| Assign Brand Content          | ❌    | ❌               | ✅    | ❌        |
| Request Bulk Quotes           | ❌    | ✅               | ✅    | ✅        |
| Access B2B Pricing Tiers      | ❌    | ✅               | ✅    | ✅        |
| Generate Reports              | ❌    | ❌               | ✅    | ❌        |
| Manage Discounts/Promotions   | ❌    | ❌               | ✅    | ❌        |
| SEO Metadata Editor           | ❌    | ❌               | ✅    | ❌        |
| Leave Product Reviews         | ❌    | ✅               | ✅    | ❌        |
| Wishlist Functionality        | ❌    | ✅               | ❌    | ❌        |
| Shipping Management           | ❌    | ✅               | ✅    | ❌        |
| Tax Calculation Management    | ❌    | ✅               | ✅    | ❌        |

---

## 🧑‍💻 3. User Stories & Workflows

### User Story: Guest Browses Products
- Visit `gsiorders.com`
- Select a brand → Brand-specific landing page
- Use filters → View catalog
- Click a product → Product Detail Page (image, description, price)

### User Story: Registered User Places Order
- Log in
- Add items from multiple brands to cart
- Apply discount code
- Checkout with Stripe
- Receive email confirmation

### User Story: Admin Adds Product
- Login to Admin Panel
- Upload product media (images, videos)
- Enter description, price, assign brand
- Set inventory threshold → Enable low-stock alerts

### User Story: Sales Rep Login
- Login with Rep credentials
- View their orders + commissions
- Place new orders for clients
- Request commission payout (manual process)

### User Story: Customer Leaves a Review
- After purchasing a product, user sees "Leave a Review" button
- Can rate 1–5 stars and write a review
- Admin moderates reviews

### User Story: Wishlist Functionality
- Logged-in users can click "♥ Save" on any product
- Wishlist is accessible from user profile

### User Story: Configure Shipping by Region
- Admin logs into shipping settings
- Sets flat rates or rules per state/zone
- Integrated with checkout logic

---

## 🌐 4. Brand Routing Architecture

- All brands are routed under:
  - `gsiorders.com/liquidheaven`
  - `gsiorders.com/motaquila`
  - `gsiorders.com/lastgenie`
- Legacy domains (`*.com`) will redirect (301) to their respective brand paths
- Each path loads unique styling, filters, and meta content

---

## 📦 5. E-commerce Core Feature Set

### Confirmed for MVP
- Multi-brand architecture
- Stripe checkout
- Inventory control
- Role-based user access
- Admin product management
- Email notification system
- Analytics dashboard
- SEO metadata management

### Confirmed for Phase 2
- Product reviews and ratings
- Wishlist functionality
- Shipping region logic
- Tax calculation engine
- Quote request system for B2B
- Sales rep commission tracking
- AI-assisted inventory prediction

---

## 🧠 6. Cursor AI Compatibility (Prompt Structure)

Each feature will be broken down like this:

```
User Story: As a user, I want to add products to my cart from multiple brands.

Component: CartModal.tsx
API Endpoint: POST /api/cart
Input: { product_id, quantity, brand }
Output: Updated cart
Validation: Stock available? Is user logged in?
```

---

## 🛡️ 7. Error Handling & Edge Cases

| Scenario                    | Handling Strategy                       |
|----------------------------|----------------------------------------|
| Stripe Payment Failure     | Show error + log webhook error         |
| Product Out of Stock       | Disable "Add to Cart" + notify user    |
| Auth Error (expired)       | Force re-login                         |
| Admin CRUD Error           | Display error toast + rollback state   |

---

## 🧱 8. Technical Stack Details

### Supabase
- PostgreSQL DB
- Auth with Role-based Access
- Storage for product media
- RLS (Row Level Security) for multi-brand control

### Stripe
- Checkout Sessions
- Webhooks for order confirmation

### AWS
- Route53 domain management
- EC2 for backend if needed
- S3 + CloudFront for static front-end

### Frontend
- React with Tailwind CSS via V0.dev
- Cursor AI prompts to drive UI generation

---

## 🗃️ 9. Database Schema Snapshot (Draft)

### Tables:
- `users` (id, email, role, created_at)
- `products` (id, name, brand_id, price, inventory_count, images[])
- `brands` (id, name, slug, theme_config)
- `orders` (id, user_id, total, status, created_at)
- `order_items` (order_id, product_id, quantity, price)
- `quotes` (id, user_id, requested_items, approved)
- `reviews` (id, user_id, product_id, rating, text, approved)
- `wishlist_items` (user_id, product_id)

---

## 📈 10. Analytics & Admin Features

- Admin dashboard (revenue, order volume, low-stock alerts)
- Brand-level performance view
- SEO insights: most viewed products, traffic source
- Coupon creation, usage stats

---

## 📬 11. Notifications System

- Order confirmation email
- Shipping status update
- Password reset
- Low inventory alert (admin only)

---

## 📅 12. MVP vs Phase 2 Timeline

| Feature                             | Phase     |
|------------------------------------|-----------|
| Multi-brand browsing               | MVP       |
| Stripe checkout                    | MVP       |
| Inventory management               | MVP       |
| Shipping zone logic                | Phase 2   |
| Wishlist/reviews                   | Phase 2   |
| B2B quote system                   | Phase 2   |
| AI-powered inventory prediction    | Phase 2   |
| Admin analytics & SEO tools        | MVP       |

---

## ✅ 13. Success Criteria

- Users can buy from any brand with unified checkout
- Admin can manage all product/media/content without dev help
- Stripe, Email, and SEO fully functional
- Site loads under 2 seconds per page

---
