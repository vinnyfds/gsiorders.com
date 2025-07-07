# 🧪 Test Plan – gsiorders.com (Expanded v2)

## 1. Testing Layers

| Layer        | Tool        | Targets                                 |
|--------------|-------------|------------------------------------------|
| Unit         | Jest/Vitest | All UI components + hooks               |
| API          | Postman     | All REST endpoints                      |
| E2E          | Cypress     | Full flows: browse → cart → checkout    |
| Security     | Supabase CLI| RLS policy validation per role          |

## 2. Component Test Coverage

- **ProductCard**: image, name, price, button → addToCart()
- **CartModal**: cartItems from hook, quantity control, total calc
- **WishlistButton**: toggles saved item, works for logged-in users
- **SearchBar**: filters, debounce, responsive
- **BrandFilterBar**: correct brands shown, active state highlighting
- **AdminDashboard**: displays real-time metrics
- **InventoryManager**: modifies product stock

## 3. API Test Coverage

- **GET /api/products**: pagination, filters, search
- **POST /api/upload/product-image**: file validation, CDN output
- **GET /api/admin/dashboard**: metrics valid only for admin
- **POST /api/admin/inventory**: updates inventory count
- **POST /api/webhooks/stripe**: signature valid, inventory adjusted

## 4. Integration Tests

- ✅ Brand routing via `[brand]/index.tsx`
- ✅ File upload pipeline to Supabase CDN
- ✅ Email system using SendGrid templates
- ✅ Stripe checkout test card: `4242 4242 4242 4242`

## 5. Acceptance Criteria

- ProductCard displays image (max 200px), name in h3, price formatted
- Responsive on mobile (375px), desktop (1920px)
- Cart total updates when quantity changes
- Image appears on product card within 30s of upload
- Checkout completes via Stripe test card
- Admin can update inventory and see real-time change
## 🚀 Performance Testing Strategy

- Load testing: 100 concurrent users
- Stress testing: 500+ peak traffic burst
- Supabase query performance: <100ms
- CDN image load time: <1s
- Lighthouse mobile score: >90

## 🌐 Browser Compatibility Matrix

| Browser             | Supported |
|---------------------|-----------|
| Chrome 90+          | ✅        |
| Firefox 88+         | ✅        |
| Safari 14+          | ✅        |
| Edge 90+            | ✅        |
| iOS Safari 14+      | ✅        |
| Android Chrome 90+  | ✅        |

## ♿ Accessibility Testing (WCAG 2.1 AA)

- Screen reader: NVDA, JAWS compatible
- Keyboard navigation fully supported
- All form fields with labels
- Alt text validation
- Color contrast 4.5:1 minimum

## 🔐 Security Testing Expansion

- SQL injection attempts (Supabase RLS validation)
- XSS injection via inputs/comments
- Supabase auth bypass simulation
- File upload safety (MIME check, size limit)
- API rate limiting and abuse detection
- HTTPS/TLS certificate enforcement
