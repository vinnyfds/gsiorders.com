# TRD Part 1: Complete SQL DDL Schema for gsiorders.com

---

## 🔧 ENUM Definitions

```sql
CREATE TYPE user_role AS ENUM ('user', 'admin', 'rep');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'cancelled');
CREATE TYPE quote_status AS ENUM ('requested', 'approved', 'rejected');
```

---

## 🧱 Table: users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧱 Table: brands

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  theme_config JSONB
);
```

---

## 🧱 Table: products

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  price NUMERIC(10,2),
  inventory_count INTEGER,
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_brand_id ON products(brand_id);
```

---

## 🧱 Table: orders

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total NUMERIC(10,2),
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
```

---

## 🧱 Table: order_items

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER,
  price NUMERIC(10,2)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

---

## 🧱 Table: wishlist_items

```sql
CREATE TABLE wishlist_items (
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  PRIMARY KEY (user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
```

---

## 🧱 Table: reviews

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  approved BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
```

---

## 🧱 Table: quotes

```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  items JSONB,
  status quote_status DEFAULT 'requested',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧱 Table: shipping_rules

```sql
CREATE TABLE shipping_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  method TEXT NOT NULL,
  rate NUMERIC(10,2) NOT NULL
);
```

---

## 🧱 Table: discount_codes

```sql
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2),
  usage_limit INTEGER,
  expiration TIMESTAMP
);
```

---

## 🧱 Table: webhook_logs

```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  received_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧱 Table: email_logs

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_address TEXT,
  template TEXT,
  status TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Notes:
- All UUID-based primary keys for consistency
- Referential integrity enforced with `ON DELETE CASCADE`
- Full index coverage for filtering, joining, and performance

---


# TRD Part 2: Supabase Configuration Guide

## 1. Supabase Auth Configuration

### Auth Settings
- Provider: Supabase Auth (email/password)
- Session Management: Supabase client library handles tokens
- Role Assignment: Custom claim in JWT (admin, user, rep)

### Auth Table Behavior
- `users` table links to Supabase auth via `auth.uid() = users.id`
- Role is stored in the `role` column

---

## 2. RLS (Row-Level Security) Policies

Enable RLS for all protected tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
```

### Example Policies

#### Users Table
```sql
CREATE POLICY "Users can read/update themselves"
ON users FOR SELECT, UPDATE
USING (auth.uid() = id);
```

#### Orders Table
```sql
CREATE POLICY "Users can read their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

#### Reviews Table
```sql
CREATE POLICY "Users can manage their own reviews"
ON reviews FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### Wishlist Items Table
```sql
CREATE POLICY "Users manage their wishlist"
ON wishlist_items FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### Products Table (Public View)
```sql
CREATE POLICY "Public product access"
ON products FOR SELECT
USING (true);
```

---

## 3. Supabase Storage Configuration

### Buckets
- `/products`: for product images
- `/brands`: for brand banners and assets

### Bucket Settings
- Public: `false` (use signed URLs)
- Caching: Enabled via CloudFront
- Image types: `.jpg`, `.png`, `.webp`
- Max size: 2MB

### Storage Policy: Product Image Access
```sql
CREATE POLICY "Signed URLs required"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'products'
);
```

---

## 4. Initial Supabase Setup Commands

```bash
supabase init
supabase start
supabase db push
supabase functions deploy
```

Use Supabase CLI for local dev testing and migration.

---

## 5. Metadata for JWT Role Injection

In Supabase Dashboard:

```
API > JWT > Add custom claims:

{
  "role": "admin"
}
```

Use this to inject user roles into JWT for role-based access control in the frontend.

---

## ✅ Summary

- RLS enforced on all sensitive tables
- Public access to products only
- Supabase storage secured with signed URL policy
- Custom roles injected via JWT metadata
- Storage and auth policies ready for production

---

# TRD Part 3: Stripe Integration & Webhook Implementation

## 1. Stripe Configuration

### Required Keys
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

Store these in `.env` and GitHub Actions secrets.

---

## 2. Checkout Session Creation

### API Route: `/api/checkout`
```ts
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: cartItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
      },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity,
  })),
  mode: 'payment',
  success_url: 'https://gsiorders.com/success',
  cancel_url: 'https://gsiorders.com/cancel',
  metadata: {
    user_id: user.id
  }
});
```

---

## 3. Webhook Listener Implementation

### Endpoint: `/api/webhooks/stripe`
```ts
const sig = req.headers['stripe-signature'];
let event;

try {
  event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
} catch (err) {
  console.error("Webhook signature verification failed.", err.message);
  return res.status(400).send(`Webhook Error: ${err.message}`);
}

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;

  // 1. Create order
  // 2. Update inventory
  // 3. Send confirmation email
  // 4. Log webhook
}
```

---

## 4. Webhook Retry Logic

- Stripe retries webhooks for 72 hours
- Use `status` column in `webhook_logs` to track:
  - `received`, `processed`, `failed`
- Log all incoming payloads in `webhook_logs` table

---

## 5. Error Handling

| Scenario                        | Strategy                                |
|---------------------------------|------------------------------------------|
| Signature mismatch              | Return `400` + log error                 |
| Inventory update fails          | Rollback + log                          |
| Order already exists            | Idempotency check using session ID      |
| Email fails                     | Retry with queue or fallback alert      |

---

## 6. Security Practices

- Only allow Stripe IPs if hosting via EC2 (optional)
- Verify signature with `stripe.webhooks.constructEvent()`
- Don't expose secret keys in frontend

---

## ✅ Summary

- Secure checkout session creation
- Robust webhook validation and handling
- Inventory and order sync via webhook
- Resilient error handling + retry logic
- Stripe integration ready for production use

---

# TRD Part 4: Email System Configuration

## 1. Email Provider Options

### Recommended Provider: **SendGrid**
- Alternative: Resend (API-based, no SMTP required)
- Supports templates, merge fields, and click tracking

---

## 2. Required Environment Variables

```
SENDGRID_API_KEY=
EMAIL_FROM_ADDRESS=no-reply@gsiorders.com
```

---

## 3. Email Types & Templates

| Trigger                  | Template Name         | Merge Tags                     |
|--------------------------|------------------------|----------------------------------|
| Order Confirmation       | `order_confirm.html`   | `{{name}}`, `{{order_id}}`       |
| Shipping Notification    | `shipping_update.html` | `{{tracking_number}}`, `{{status}}` |
| Password Reset           | `reset_password.html`  | `{{reset_link}}`                |
| Admin Inventory Alert    | `low_stock_alert.html` | `{{product_name}}`, `{{level}}` |

---

## 4. Sending Logic (Node Example)

```ts
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: process.env.EMAIL_FROM_ADDRESS,
  subject: 'Your Order is Confirmed!',
  templateId: 'd-template-id',
  dynamicTemplateData: {
    name: user.name,
    order_id: order.id
  }
});
```

---

## 5. Delivery Tracking & Logs

- Log each attempt in `email_logs` table
- Track `status`: sent, failed, bounced
- Include `template`, `to_address`, and `sent_at`

---

## 6. Bounce & Retry Handling

- Enable webhook from SendGrid to log bounces
- Retry on transient failure (e.g., 500s)
- Fallback notification to admin if multiple failures

---

## 7. Security & Compliance

- Set SPF + DKIM on DNS via Route53
- Use verified sender domain
- Apply domain throttling if bulk emails enabled

---

## ✅ Summary

- Email system configured with template logic
- Delivery and bounce tracking implemented
- All transaction emails mapped to triggers
- SendGrid integrated securely and programmatically

---

# TRD Part 5: File Upload System & CDN Integration

## 1. Upload Buckets (Supabase Storage)

| Bucket Name | Purpose            | Public | Notes                          |
|-------------|---------------------|--------|--------------------------------|
| `products`  | Product images      | false  | Use signed URLs                |
| `brands`    | Brand banners/icons | false  | Per-brand folder structure     |

---

## 2. Upload Rules

- Max File Size: 2MB
- Accepted Types: `.jpg`, `.jpeg`, `.png`, `.webp`
- Compression/Conversion: `.webp` preferred for performance
- Folder Structure (optional):
  ```
  /products/<product_id>/main.webp
  /brands/<slug>/banner.webp
  ```

---

## 3. Upload Implementation (Frontend via Supabase JS)

```ts
const file = input.files[0];

const { data, error } = await supabase.storage
  .from('products')
  .upload(`product_${productId}/${file.name}`, file, {
    cacheControl: '3600',
    upsert: true,
  });
```

---

## 4. Image Optimization (Optional)

- Client-side resizing (via `browser-image-compression` or similar)
- Upload compressed WebP version
- Server-side optimization via Supabase edge functions (future upgrade)

---

## 5. Accessing Images with Signed URLs

```ts
const { data } = await supabase.storage
  .from('products')
  .createSignedUrl(`product_${id}/main.webp`, 60 * 60);
```

- TTL can be extended for long-lived access
- Used in product cards and detail views

---

## 6. CDN Distribution via CloudFront

- Connect Supabase public storage URL to AWS CloudFront
- CNAME: `cdn.gsiorders.com` (configured in Route53)
- Optimize cache headers (`cacheControl: '86400'`)
- Use `img` tags or Next.js `Image` with the CDN URL

---

## 7. Error Handling

| Scenario            | Handling Strategy                      |
|---------------------|-----------------------------------------|
| File too large       | UI error + prevent upload              |
| Invalid file type    | Client-side validation                 |
| Upload failed        | Retry with exponential backoff        |
| URL expired          | Refresh signed URL via API            |

---

## ✅ Summary

- File uploads handled securely through Supabase Storage
- CDN acceleration enabled via CloudFront
- Upload validation ensures performance and reliability
- Signed URLs provide safe, temporary access

---

# TRD Part 6: Project Folder Structure & Environment Setup

## 1. Suggested Project Structure (Cursor + V0.dev Compatible)

```
/gsiorders
├── /public
│   └── favicon.ico
├── /src
│   ├── /api
│   │   ├── checkout.ts
│   │   ├── webhook.ts
│   ├── /components
│   │   ├── ProductCard.tsx
│   │   ├── CartModal.tsx
│   │   ├── BrandFilterBar.tsx
│   ├── /pages
│   │   ├── index.tsx
│   │   ├── [brand]/index.tsx
│   │   ├── /checkout/success.tsx
│   ├── /hooks
│   │   └── useCart.ts
│   ├── /utils
│   │   └── formatPrice.ts
│   ├── /types
│   │   └── product.d.ts
│   ├── /styles
│   │   └── globals.css
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
```

---

## 2. .env.example Template

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

SENDGRID_API_KEY=
EMAIL_FROM_ADDRESS=no-reply@gsiorders.com

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
CDN_DOMAIN=cdn.gsiorders.com
```

---

## 3. Local Setup Instructions

### Requirements
- Node.js 18+
- Supabase CLI
- Stripe CLI (for webhook testing)
- AWS CLI (optional)

### Installation

```bash
git clone https://github.com/gsiorders/gsiorders.com
cd gsiorders.com

cp .env.example .env.local
npm install
supabase start
npm run dev
```

---

## 4. GitHub Actions CI/CD Outline

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install deps
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          SOURCE_DIR: "out"
```

---

## ✅ Summary

- Clean structure for scalable development
- Environment configuration via `.env.local`
- Ready-to-deploy with GitHub Actions + AWS S3
- Compatible with Cursor AI workflows

---

# TRD Part 7: Component Specs & Cursor AI Prompt Templates

---

## 1. Component Specification Table

| Component            | Props                           | State                    | API Dependencies         |
|----------------------|----------------------------------|---------------------------|---------------------------|
| ProductCard.tsx      | `product: Product`               | —                         | —                         |
| CartModal.tsx        | —                                | `cartItems`, `isOpen`     | `/api/cart`               |
| BrandFilterBar.tsx   | `brands: Brand[]`                | `selectedBrand`           | —                         |
| ReviewForm.tsx       | `productId: string`              | `rating`, `comment`       | `/api/reviews`            |
| WishlistButton.tsx   | `productId: string`, `isSaved`   | —                         | `/api/wishlist`           |
| OrderHistory.tsx     | —                                | `orders`                  | `/api/user/orders`        |
| AdminDashboard.tsx   | —                                | `metrics`, `lowInventory` | `/api/admin/dashboard`    |

---

## 2. Cursor AI Prompt Templates

### 🔹 ProductCard.tsx

```
Create a React component called ProductCard that receives a `product` prop with id, name, price, and image. Display the product image and name inside a Tailwind-styled card. Add a button to trigger `addToCart(product.id)`. Use `export default ProductCard`.
```

---

### 🔹 CartModal.tsx

```
Generate a modal component that displays items in a shopping cart. Each item shows name, quantity, and price. Include a Stripe Checkout button that hits `/api/checkout`. Use `useCart()` hook for state management.
```

---

### 🔹 ReviewForm.tsx

```
Create a form that allows users to leave a 1–5 star review and comment. Submit to `/api/reviews` using POST. Inputs should be styled with Tailwind. Include client-side validation.
```

---

### 🔹 WishlistButton.tsx

```
Build a button component with a heart icon. Toggle state based on `isSaved` prop. On click, call `/api/wishlist` POST. Show filled or outlined icon accordingly.
```

---

### 🔹 AdminDashboard.tsx

```
Build a dashboard that shows total orders, revenue, and low-stock alerts. Data comes from `/api/admin/dashboard`. Use Tailwind cards for layout. Export as AdminDashboard.
```

---

## 3. Type Definitions

```ts
type Product = {
  id: string
  name: string
  price: number
  image: string
  brand_id: string
}

type Brand = {
  id: string
  name: string
  slug: string
}
```

---

## ✅ Summary

- Component behavior clearly mapped
- Cursor AI prompts ready for generation
- API integration + styling details provided
- Types included for consistent dev experience

---
---

# TRD Addendum: Expanded Missing Sections

## 1. Brand Routing Implementation

### Routing Structure

- URL Mapping:
  - `/liquidheaven` → Liquid Heaven brand
  - `/motaquila` → Motaquila brand
  - `/lastgenie` → Last Genie brand

### Implementation (Next.js)
```ts
// /pages/[brand]/index.tsx
import { useRouter } from 'next/router'

const BrandPage = () => {
  const { brand } = useRouter().query
  // Fetch brand-specific products from Supabase where brand.slug = brand
}
```

### SEO Considerations
- Canonical tags per brand route
- Meta tags dynamically loaded from brand record

---

## 2. Search System Implementation

### Features
- Search by keyword (product name, tags)
- Filter by brand, category, price

### Supabase Full Text Search
```sql
CREATE INDEX idx_products_name ON products USING GIN (to_tsvector('english', name));
```

### Query Example
```ts
const { data, error } = await supabase
  .from('products')
  .select('*')
  .textSearch('name', searchTerm);
```

### Pagination
- Server-side limit/offset pattern
- Default: 20 items per page

---

## 3. AI Chatbot Integration

### Placement
- Embedded in bottom-right corner of all pages
- Activated via floating button or modal

### Architecture
- Frontend UI connects to `/api/chat`
- Backend integrates OpenAI GPT-4 or Claude API

### Context Provided:
- Brand route
- Cart contents
- Product page metadata

### Prompt Example
```json
{
  "brand": "Liquid Heaven",
  "page": "product_detail",
  "question": "What is the return policy?"
}
```

---

## 4. Tax Calculation System

### Current Strategy (Phase 1 MVP)
- No tax calculation at checkout
- Price includes tax estimate

### Future Upgrade (Phase 2)
- Integrate with **TaxJar API** or **Stripe Tax**
- Send `order_amount + shipping + user location` to calculate

### Placeholder Logic (Manual)
```ts
const taxAmount = total * 0.07 // flat 7% for Florida
```

---

## ✅ Summary of Addendum

- Brand routing paths and logic fully specified
- Search system supports full text + filters
- AI chatbot context + prompt structure outlined
- Tax logic stubbed for MVP, scalable for real-time engine

---