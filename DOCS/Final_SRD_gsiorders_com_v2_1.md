
# System Requirements Document (SRD) - v2.1

## Project: gsiorders.com - Unified E-commerce Platform

---

## 🔧 1. System Architecture Overview

(Identical to v2 — not repeated here for brevity)

---

## 🔄 2. System Integration Flows

(Identical to v2 — not repeated here for brevity)

---

## 🔗 3. API Specifications (Expanded)

### POST /api/products
(Already defined in v2)

### POST /api/checkout
(Already defined in v2)

### GET /api/products
```
Query Parameters:
  brand: string
  search: string
  limit: number
  page: number

Response:
200 OK [
  { id, name, price, brand_id, image_url }
]

Errors:
400 Bad Request
```

### POST /api/reviews
```
Headers:
  Authorization: Bearer {token}

Body:
{
  product_id: uuid,
  rating: number (1–5),
  comment: string
}

Response:
201 Created

Errors:
400, 401, 403
```

### GET /api/user/orders
```
Headers:
  Authorization: Bearer {token}

Response:
200 OK [
  { order_id, status, total, created_at }
]

Errors:
401 Unauthorized
```

### POST /api/admin/inventory
```
Headers:
  Authorization: Bearer {admin-token}

Body:
{
  product_id: uuid,
  new_inventory_count: number
}

Response:
200 OK

Errors:
400, 401, 403
```

---

## 🖼️ 4. File Upload & Media Management System

- **Supabase Storage Buckets:**
  - `/products`: Stores product images
  - `/brands`: Stores brand assets and banners

- **Image Processing:**
  - Resize to 3 formats (thumbnail, medium, large)
  - Compress to under 200KB
  - Convert to `.webp` format

- **Validation Rules:**
  - Max file size: 2MB
  - Accepted types: .jpg, .png, .webp
  - Virus scan via Supabase plugin or pre-upload filter

- **CDN Delivery:**
  - CloudFront serves all images from Supabase Storage
  - Signed URLs for access control on restricted media

---

## 🧱 5. Database Constraints & Indexes

### Foreign Keys:
- `products.brand_id` → `brands.id`
- `orders.user_id` → `users.id`
- `order_items.order_id` → `orders.id`
- `reviews.product_id` → `products.id`

### Indexes:
- `products.brand_id` (for filtering by brand)
- `orders.user_id` (for user order history)
- `order_items.order_id` (for performance joins)
- `wishlist_items.user_id + product_id` (composite index)
- `reviews.product_id` (for product detail page)

---

## ✅ 6. Acceptance Criteria (No Change)

(Already validated — same as v2)

---

## 🏁 7. Final Notes

This version incorporates:
- Full file upload/media system design
- Four additional API endpoints
- Key database indexes and constraints

✅ This document is now **TRD-ready**, fully scoped, validated, and implementation-driven.

---
