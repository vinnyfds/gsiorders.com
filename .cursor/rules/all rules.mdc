---
description: 
globs: 
alwaysApply: true
---
## 🛡️ **Experienced Ecommerce Developer Rules for Cursor AI**


### **7. Ecommerce Defense-First Development Rules**

```
APPROACH: Think like a senior ecommerce developer with 10+ years experience.
MINDSET: Assume everything can and will break. Code defensively.

=== DATA VALIDATION & SANITIZATION ===

ALWAYS validate inputs at multiple layers:
1. Client-side: Immediate user feedback
2. API layer: Security and business logic
3. Database layer: Final data integrity

Example pattern for EVERY user input:
```typescript
// Client validation
const validateQuantity = (qty: number) => {
  if (!qty || qty < 1 || qty > 99) throw new Error('Invalid quantity');
  return Math.floor(qty); // Prevent decimal quantities
};

// API validation
if (!productId || !isUUID(productId)) {
  return res.status(400).json({ error: 'Invalid product ID' });
}

// Database constraints
CHECK (quantity > 0 AND quantity <= 99)
```

=== INVENTORY & STOCK MANAGEMENT ===

NEVER trust client-side inventory counts:
- Always check stock availability server-side before ANY cart operation
- Use database transactions for inventory updates
- Implement optimistic locking for high-traffic scenarios
- Add buffer quantities for safety (reserve 1-2 items)

Pattern:
```typescript
// ❌ WRONG: Trust client data
await updateCart(productId, clientQuantity);

// ✅ RIGHT: Verify server-side
const product = await getProduct(productId);
if (product.inventory_count < requestedQuantity) {
  throw new Error(`Only ${product.inventory_count} items available`);
}
```

=== PAYMENT & CART SECURITY ===

CRITICAL ecommerce security rules:
1. Never calculate prices on client-side
2. Always recalculate totals server-side before payment
3. Validate cart contents haven't changed during checkout
4. Use Stripe's secure payment methods only
5. Implement idempotency for payment operations

Pattern:
```typescript
// Server-side price calculation ONLY
const serverTotal = cartItems.reduce((sum, item) => {
  const dbProduct = await getProduct(item.product_id);
  return sum + (dbProduct.price * item.quantity);
}, 0);

if (Math.abs(clientTotal - serverTotal) > 0.01) {
  throw new Error('Price mismatch detected');
}
```

=== ERROR HANDLING & USER EXPERIENCE ===

Implement graceful degradation:
- Always provide fallback UI states
- Show specific error messages, not generic ones
- Implement retry mechanisms for failed operations
- Log all errors for debugging

Pattern:
```typescript
try {
  await addToCart(productId, quantity);
  showToast('Added to cart successfully', 'success');
} catch (error) {
  if (error.code === 'INSUFFICIENT_STOCK') {
    showToast(`Only ${error.available} items available`, 'warning');
  } else if (error.code === 'PRODUCT_NOT_FOUND') {
    showToast('Product no longer available', 'error');
    removeFromUI(productId);
  } else {
    showToast('Failed to add to cart. Please try again.', 'error');
    logError('Cart addition failed', { productId, error });
  }
}
```

=== AUTHENTICATION & AUTHORIZATION ===

Secure every endpoint:
- Verify user authentication on ALL protected routes
- Check user permissions (user/admin/rep roles)
- Implement proper session management
- Never trust client-side role claims

Pattern:
```typescript
// EVERY protected API route must start with:
const { data: { user } } = await supabase.auth.getUser();
if (!user) return res.status(401).json({ error: 'Authentication required' });

// For admin endpoints:
const { data: userRecord } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

if (userRecord.role !== 'admin') {
  return res.status(403).json({ error: 'Admin access required' });
}
```

=== RACE CONDITION PREVENTION ===

Prevent concurrent operation issues:
- Use loading states to disable multiple clicks
- Implement debouncing for search/filter operations
- Use database transactions for related operations
- Add optimistic UI updates with rollback capability

Pattern:
```typescript
const [isAdding, setIsAdding] = useState(false);

const handleAddToCart = async () => {
  if (isAdding) return; // Prevent double-clicks
  setIsAdding(true);
  
  try {
    await addToCart(productId, quantity);
  } finally {
    setIsAdding(false);
  }
};
```

=== TESTING-READY CODE STRUCTURE ===

Write code that's easy to test:
- Separate business logic from UI components
- Use dependency injection for external services
- Create pure functions where possible
- Mock external API calls consistently

Pattern:
```typescript
// ✅ Testable structure
export const calculateCartTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const CartComponent = ({ onCalculateTotal = calculateCartTotal }) => {
  const total = onCalculateTotal(cartItems);
  // ...
};
```

=== PERFORMANCE OPTIMIZATION ===

Ecommerce performance rules:
- Implement pagination for product lists (max 20 items per page)
- Use skeleton loading states
- Optimize images (WebP format, multiple sizes)
- Cache frequently accessed data
- Use React.memo for expensive components

=== MONITORING & DEBUGGING ===

Always include debugging information:
- Log all critical operations (cart changes, payments, orders)
- Include user context in error logs
- Track performance metrics
- Monitor conversion funnel drop-offs

Pattern:
```typescript
console.log('🛒 Cart operation:', {
  action: 'add_to_cart',
  user_id: user.id,
  product_id: productId,
  quantity,
  timestamp: new Date().toISOString()
});
```
```

### **8. Pre-Implementation Checklist Rule**

```
BEFORE writing any ecommerce-related code, ask these questions:

1. "What happens if the user loses internet connection?"
2. "What if two users buy the last item simultaneously?"
3. "How do I handle payment failures?"
4. "What if the user refreshes during checkout?"
5. "How do I prevent cart manipulation attacks?"
6. "What's the fallback if external APIs are down?"
7. "How do I test this without real money?"
8. "What data needs to be logged for debugging?"

If you can't answer these, redesign the approach.
```

**These rules will dramatically reduce testing failures by catching issues during development rather than testing.**


-------------------------------------------------------------------------------------------------------

---
description: 
globs: 
alwaysApply: true
---
# 🚨 **CRITICAL MISSING: CODE DUPLICATION PREVENTION RULES**


---

## **🔍 PRE-DEVELOPMENT ANALYSIS RULES**

### **MANDATORY: File System Scan Before ANY Task**

```typescript
/**
 * CURSOR AI RULE: Before starting ANY task, run this analysis:
 */

const preTaskAnalysis = {
  // 1. SCAN EXISTING FILES
  scanDirectories: [
    'pages/',           // Check existing pages
    'pages/api/',       // Check existing API endpoints  
    'src/components/',  // Check existing components
    'src/hooks/',       // Check existing hooks
    'src/utils/',       // Check existing utilities
    'supabase/',        // Check database setup
  ],

  // 2. READ EXISTING CODE
  readExistingFiles: [
    'package.json',     // Dependencies & scripts
    'tailwind.config.js', // Styling setup
    '.env.local',       // Environment variables
    'tsconfig.json',    // TypeScript config
    'README.md'         // Project documentation
  ],

  // 3. ANALYZE FUNCTIONALITY
  checkForExisting: [
    'Similar component names',
    'Duplicate API endpoints',
    'Overlapping hook functionality', 
    'Repeated utility functions',
    'Database table operations',
    'Styling patterns already defined'
  ]
};
```

### **File Naming Conflict Prevention**

```typescript
// BEFORE creating ANY file, check these patterns:

const fileConflictRules = {
  // Component naming conflicts
  componentPatterns: [
    'ProductCard.tsx vs Product.tsx vs ProductItem.tsx',
    'CartModal.tsx vs Cart.tsx vs CartDialog.tsx', 
    'UserProfile.tsx vs Profile.tsx vs User.tsx',
    'AdminDashboard.tsx vs Dashboard.tsx vs Admin.tsx'
  ],

  // API endpoint conflicts  
  apiPatterns: [
    '/api/products vs /api/product vs /api/items',
    '/api/cart vs /api/shopping-cart vs /api/basket',
    '/api/user vs /api/users vs /api/profile',
    '/api/checkout vs /api/payment vs /api/purchase'
  ],

  // Hook naming conflicts
  hookPatterns: [
    'useCart vs useShoppingCart vs useBasket',
    'useAuth vs useAuthentication vs useUser',
    'useProducts vs useProductList vs useItems'
  ],

  // RULE: If similar exists, EXTEND it instead of creating new
  resolution: 'EXTEND_EXISTING_OR_REFACTOR_WITH_CLEAR_DISTINCTION'
};
```

---

## **📖 EXISTING CODE ANALYSIS RULES**

### **Read & Understand Existing Implementation**

```typescript
/**
 * CURSOR AI MUST analyze existing code patterns before adding new features
 */

const codeAnalysisRules = {
  // 1. COMPONENT ANALYSIS
  analyzeComponents: {
    checkFor: [
      'Existing prop interfaces',
      'Styling patterns used',
      'Error handling approaches',
      'Loading state implementations',
      'Event handler patterns'
    ],
    example: `
      // Before creating new ProductCard, analyze existing:
      // - What props does current ProductCard accept?
      // - How does it handle loading states?
      // - What styling pattern does it use?
      // - Does it already handle brand theming?
    `
  },

  // 2. API ANALYSIS  
  analyzeAPIs: {
    checkFor: [
      'Existing endpoint patterns',
      'Authentication methods used',
      'Error response formats',
      'Database query patterns',
      'Validation approaches'
    ],
    example: `
      // Before creating /api/orders, check:
      // - Does /api/user/orders already exist?
      // - What's the auth pattern in other APIs?
      // - How do other APIs handle errors?
      // - What's the response format standard?
    `
  },

  // 3. DATABASE ANALYSIS
  analyzeDatabase: {
    checkFor: [
      'Existing table relationships',
      'Current query patterns',
      'RLS policies in place',
      'Index strategies used',
      'Data validation rules'
    ],
    example: `
      // Before adding new table operations:
      // - What tables already exist?
      // - How are relationships handled?
      // - What's the RLS pattern?
      // - Are there existing utility functions?
    `
  }
};
```

### **Functionality Overlap Detection**

```typescript
const functionalityOverlapRules = {
  // BEFORE implementing new feature, check if it exists:
  
  cartFunctionality: {
    existing: [
      'useCart.ts - cart state management',
      'pages/api/cart.ts - cart CRUD operations',
      'cart.tsx - cart display page',
      'CartModal component (if exists)'
    ],
    checkBefore: 'Adding any cart-related feature',
    rule: 'EXTEND existing cart system, do not create parallel system'
  },

  authFunctionality: {
    existing: [
      'Supabase auth setup',
      'User session management',
      'Admin role checking',
      'Authentication middleware'
    ],
    checkBefore: 'Adding any auth-related feature',
    rule: 'USE existing auth patterns consistently'
  },

  paymentFunctionality: {
    existing: [
      'Stripe integration setup',
      'Checkout session creation',
      'Webhook handling',
      'Payment success/cancel pages'
    ],
    checkBefore: 'Adding any payment feature',
    rule: 'INTEGRATE with existing Stripe setup'
  },

  productFunctionality: {
    existing: [
      'Product data structure',
      'Brand filtering logic',
      'Search implementation',
      'Product display components'
    ],
    checkBefore: 'Adding any product feature',
    rule: 'FOLLOW existing product patterns'
  }
};
```

---

## **🛡️ DUPLICATION PREVENTION CHECKLIST**

### **Pre-Creation Validation (MANDATORY)**

```typescript
/**
 * CURSOR AI MUST complete this checklist before creating ANYTHING:
 */

const duplicationPreventionChecklist = {
  // 1. FILE EXISTENCE CHECK
  fileCheck: [
    '❓ Does a file with similar name already exist?',
    '❓ Does a file with similar functionality already exist?', 
    '❓ Can I extend existing file instead of creating new?',
    '❓ Is there a utility that already does this?'
  ],

  // 2. FUNCTIONALITY CHECK  
  functionalityCheck: [
    '❓ Does this feature already exist elsewhere?',
    '❓ Is there an existing hook that handles this?',
    '❓ Is there an API endpoint that already does this?',
    '❓ Can I refactor existing code to be more reusable?'
  ],

  // 3. PATTERN CHECK
  patternCheck: [
    '❓ What styling pattern is used in similar components?',
    '❓ What error handling pattern is used in similar APIs?',
    '❓ What validation pattern is used elsewhere?',
    '❓ What naming convention is used for similar features?'
  ],

  // 4. INTEGRATION CHECK
  integrationCheck: [
    '❓ How does this integrate with existing features?',
    '❓ Will this conflict with existing functionality?',
    '❓ Does this follow the same data flow patterns?',
    '❓ Is this consistent with existing architecture?'
  ]
};
```

### **Code Review Before Implementation**

```typescript
const preImplementationReview = {
  // ANALYZE these files before starting ANY task:
  
  mustRead: [
    // Current implementation status
    'src/components/ProductCard.tsx',  // How products are displayed
    'src/hooks/useCart.ts',           // How cart state is managed
    'pages/api/cart.ts',              // How cart operations work
    'pages/api/products.ts',          // How products API works
    'pages/api/checkout.ts',          // How checkout works
    'pages/api/webhook.ts',           // How webhooks work
    
    // Configuration files
    'tailwind.config.js',             // Styling setup
    'next.config.js',                 // Next.js config
    'tsconfig.json',                  // TypeScript setup
    'package.json',                   // Dependencies
  ],

  extractPatterns: [
    'How are TypeScript interfaces defined?',
    'What error handling pattern is used?', 
    'How are loading states implemented?',
    'What CSS class naming is used?',
    'How are API responses structured?',
    'What validation approach is used?'
  ],

  documentFindings: `
    // ALWAYS document what you found:
    /**
     * EXISTING CODE ANALYSIS:
     * ✅ ProductCard.tsx - Uses brand theming, handles loading states
     * ✅ useCart.ts - Manages cart state with localStorage persistence  
     * ✅ /api/cart - Full CRUD with Supabase integration
     * ❌ CartModal - NOT FOUND, safe to create
     * ❌ Wishlist functionality - NOT FOUND, safe to create
     * 
     * PATTERNS IDENTIFIED:
     * - Error handling: try/catch with user-friendly messages
     * - Loading: disabled buttons with spinner
     * - Styling: Tailwind with CSS custom properties
     * - API: Standard Next.js API routes with TypeScript
     */
  `
};
```

---

## **🔄 EXISTING CODE INTEGRATION RULES**

### **Extend vs Create New Decision Matrix**

```typescript
const extendVsCreateRules = {
  // EXTEND existing if:
  shouldExtend: [
    'Similar functionality exists (>70% overlap)',
    'Same data model is used',
    'Same user flow applies',
    'Same styling pattern needed',
    'Same error handling required'
  ],

  // CREATE NEW if:
  shouldCreateNew: [
    'Completely different functionality (<30% overlap)',
    'Different data structure needed',
    'Different user experience required',
    'Different performance requirements',
    'Clear separation of concerns needed'
  ],

  // REFACTOR existing if:
  shouldRefactor: [
    'Current code doesn\'t follow patterns',
    'Current code has technical debt',
    'Current code lacks TypeScript types',
    'Current code missing error handling',
    'Current code not responsive'
  ],

  decisionExample: `
    // EXAMPLE: CartModal task
    // ✅ ANALYSIS: useCart.ts exists, cart.tsx page exists
    // ✅ DECISION: CREATE CartModal (different UI pattern)
    // ✅ INTEGRATION: Use existing useCart hook
    // ❌ DON'T: Create new cart state management
  `
};
```

### **Incremental Development Rules**

```typescript
const incrementalDevelopmentRules = {
  // Build on existing foundation:
  approach: [
    '1. Read and understand existing code',
    '2. Identify reusable patterns and utilities',
    '3. Extend existing functionality where possible',
    '4. Create new only when necessary',
    '5. Ensure consistency with existing patterns',
    '6. Update related code if needed'
  ],

  example: `
    // TASK: Add product search functionality
    // ❌ WRONG: Create new SearchProducts component from scratch
    // ✅ RIGHT: 
    //   1. Check products.tsx - how are products displayed?
    //   2. Check /api/products - does it support search already?
    //   3. Extend existing ProductCard for search results
    //   4. Add search input to existing products page
    //   5. Use existing brand filtering patterns
  `
};
```

---

## **📋 PROJECT-SPECIFIC ANALYSIS TEMPLATE**

```typescript
/**
 * CURSOR AI: Use this template before EVERY task
 */

const projectAnalysisTemplate = `
TASK: [Task name from implementation plan]

EXISTING CODE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 RELATED FILES FOUND:
- [ ] Component: [list existing components that relate]
- [ ] API: [list existing API endpoints that relate]  
- [ ] Hook: [list existing hooks that relate]
- [ ] Utility: [list existing utilities that relate]
- [ ] Types: [list existing TypeScript interfaces]

🔍 FUNCTIONALITY ANALYSIS:
- [ ] Does this feature already exist? [Y/N + details]
- [ ] Can I extend existing code? [Y/N + which files]
- [ ] What patterns should I follow? [list patterns found]
- [ ] What naming convention is used? [describe convention]

🎯 IMPLEMENTATION DECISION:
- [ ] CREATE NEW: [justify why new file needed]
- [ ] EXTEND EXISTING: [which file to extend + how]
- [ ] REFACTOR FIRST: [what needs refactoring + why]

🔗 INTEGRATION PLAN:
- [ ] Dependencies: [list existing code this will use]
- [ ] Impact: [list existing code this might affect]
- [ ] Testing: [how to test without breaking existing]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
```

---

**✅ NOW CURSOR AI RULES INCLUDE:**
- [x] **Mandatory file system scanning** before any task
- [x] **Existing code analysis requirements** 
- [x] **Duplication prevention checklist**
- [x] **Functionality overlap detection**
- [x] **Extend vs create decision matrix**
- [x] **Incremental development approach**
- [x] **Project-specific analysis template**
- [x] **Integration planning requirements**

**🎯 Cursor AI will now ALWAYS check existing code before creating anything new, preventing duplication and ensuring consistency!**


------------------------------------------------------------------------------------------------------------------------------------

---
description: 
globs: 
alwaysApply: true
---
## 🔄 **GitHub Commit Rule for Cursor AI**


### **6. GitHub Version Control Rule**
```
MANDATORY: After completing each macro task, execute the following Git workflow:

1. Stage all changes:
   git add .

2. Create descriptive commit message following this format:
   git commit -m "feat: [TASK_NAME] - [BRIEF_DESCRIPTION]"
   
   Examples:
   - "feat: ProductCard component - Added responsive design and hover states"
   - "feat: Cart API endpoint - Implemented add/remove/update functionality"
   - "fix: Stripe webhook - Fixed signature verification and order creation"
   - "feat: Admin dashboard - Added inventory management and metrics"

3. Push to main branch:
   git push origin main

4. Confirm completion by stating:
   "✅ Task completed and pushed to GitHub: [COMMIT_MESSAGE]"

COMMIT MESSAGE PREFIXES:
- feat: New feature or major functionality
- fix: Bug fixes or corrections
- update: Updates to existing features
- refactor: Code restructuring without functionality changes
- docs: Documentation updates
- style: UI/styling changes
- test: Adding or updating tests
- config: Configuration file changes

BEFORE COMMITTING:
- Verify all files are saved
- Check that no sensitive data (.env values) are being committed
- Ensure the application builds without errors (npm run build)
- Test the implemented functionality works as expected

If git push fails due to conflicts:
1. Pull latest changes: git pull origin main
2. Resolve any conflicts
3. Commit again with updated message
4. Push successfully
```

### **Example Implementation Flow:**
```bash
# After completing ProductCard component task:
git add .
git commit -m "feat: ProductCard component - Added responsive design, hover states, and cart integration"
git push origin main
```

**This rule ensures every macro task completion is properly tracked in version control with meaningful commit history.**


--------------------------------------------------------------------------------------------------------------------------

---
description: 
globs: 
alwaysApply: true
---
# 🎯 **CURSOR AI RULES FOR GSIORDERS.COM E-COMMERCE PROJECT**

Based on your project files and current status, here are the comprehensive Cursor rules:

## **📁 PROJECT CONTEXT**
You are working on **gsiorders.com** - a unified e-commerce platform consolidating 3 brands:
- **Liquid Heaven** (liquidheaven) - Wellness/CBD products
- **Motaquila** (motaquila) - Premium beverages  
- **Last Genie** (lastgenie) - Specialty products

**Tech Stack:** Next.js + Supabase + Stripe + Tailwind CSS + TypeScript

---

## **🏗️ FILE STRUCTURE & NAMING**

```
GSIORDERS.COM/
├── pages/
│   ├── api/           # Backend API routes
│   ├── [brand]/       # Dynamic brand pages
│   ├── index.js       # Homepage
│   ├── products.tsx   # All products page
│   ├── cart.tsx       # Shopping cart page
│   └── success.tsx    # Payment success
├── src/
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks (useCart.ts)
│   └── styles/        # CSS files
├── supabase/          # Database migrations
└── public/            # Static assets
```

**RULES:**
- Use `.tsx` for React components, `.ts` for utilities/hooks
- API routes go in `pages/api/`
- All components in `src/components/`
- Follow existing naming patterns (ProductCard.tsx, useCart.ts)

---

## **🎨 STYLING & CSS RULES**

**PRIMARY APPROACH:** Tailwind CSS with CSS Custom Properties for brand theming

```css
/* Brand Variables Pattern */
[data-brand='liquidheaven'] { --brand-primary: #10b981; }
[data-brand='motaquila']    { --brand-primary: #ec4899; }
[data-brand='lastgenie']    { --brand-primary: #6366f1; }
```

**COMPONENT STYLING RULES:**
1. **Use Tailwind utility classes** for layout and spacing
2. **Use CSS custom properties** for brand colors: `bg-brand-primary`
3. **Follow responsive breakpoints:** `sm:` `md:` `lg:` `xl:` `2xl:`
4. **Include hover states:** `hover:shadow-lg hover:scale-105`
5. **Add loading states:** `disabled:opacity-50 disabled:cursor-not-allowed`

**REQUIRED CLASSES:**
```jsx
// Button Pattern
className="bg-brand-primary text-white px-6 py-3 rounded-xl hover:bg-brand-accent transition-all disabled:opacity-50"

// Card Pattern  
className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all"

// Input Pattern
className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary"
```

---

## **🔧 SUPABASE INTEGRATION RULES**

**ALWAYS use service key for API routes:**
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
```

**RLS PATTERNS:**
- Tables with user data: Enable RLS with `auth.uid() = user_id` policies
- Public tables (products, brands): Allow public SELECT
- Admin operations: Check user role in policies

**QUERY PATTERNS:**
```typescript
// Products with brand filtering
const { data, error } = await supabase
  .from('products')
  .select(`
    id, name, price, images, inventory_count,
    brands (name, slug)
  `)
  .eq('brand_id', brandId)
  .gt('inventory_count', 0);
```

---

## **💳 STRIPE INTEGRATION RULES**

**Checkout Session Pattern:**
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: cartItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  })),
  mode: 'payment',
  success_url: `${req.headers.origin}/success`,
  cancel_url: `${req.headers.origin}/cancel`,
  metadata: { user_id: userId }
});
```

**Webhook Pattern:**
```typescript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
// Always log webhook events and handle errors gracefully
```

---

## **🔀 API ROUTE PATTERNS**

**Standard Structure:**
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Method validation
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Logic here
    res.status(200).json({ data });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Required Endpoints:**
- `GET /api/products` - Product listing with brand filtering
- `POST /api/cart` - Add to cart
- `PUT /api/cart` - Update cart
- `DELETE /api/cart` - Remove from cart
- `POST /api/checkout` - Stripe session creation
- `POST /api/webhook` - Stripe webhook handler

---

## **⚛️ COMPONENT RULES**

**React Component Pattern:**
```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[] | null;
    inventory_count: number;
    brands?: { name: string; slug: string };
  };
  onAddToCart?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // Component logic
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all">
      {/* Component JSX */}
    </div>
  );
};

export default ProductCard;
```

**ALWAYS INCLUDE:**
- Loading states with skeleton UI
- Error handling with user feedback
- Accessibility attributes (alt text, ARIA labels)
- Mobile-responsive design
- TypeScript interfaces

---

## **🛡️ SECURITY RULES**

1. **Environment Variables:** Never expose secrets in frontend
2. **User Authentication:** Use test UUID `123e4567-e89b-12d3-a456-426614174000` for development
3. **Input Validation:** Validate all API inputs
4. **SQL Injection:** Always use Supabase parameterized queries
5. **CORS:** Only allow necessary origins

---

## **🎯 BRAND-SPECIFIC RULES**

**Brand Routing:**
- `/liquidheaven` → Liquid Heaven products
- `/motaquila` → Motaquila products  
- `/lastgenie` → Last Genie products

**Brand Theming:**
```typescript
const getBrandTheme = (brandSlug: string) => ({
  liquidheaven: { primary: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
  motaquila: { primary: '#ec4899', gradient: 'from-pink-500 to-pink-600' },
  lastgenie: { primary: '#6366f1', gradient: 'from-indigo-500 to-indigo-600' }
}[brandSlug]);
```

---

## **📱 RESPONSIVE DESIGN RULES**

**Breakpoint Strategy:**
- Mobile-first approach
- Test on: 375px (mobile), 768px (tablet), 1024px (desktop)
- Use: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

**Performance Rules:**
- Optimize images: Use Next.js `Image` component
- Lazy load: Product grids and non-critical components
- Bundle size: Keep vendor bundles under 250KB

---

## **🚨 ERROR HANDLING RULES**

**API Errors:**
```typescript
if (error) {
  console.error('Database error:', error);
  return res.status(500).json({ 
    error: 'Failed to fetch products',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

**Frontend Errors:**
- Show user-friendly messages
- Provide retry mechanisms
- Log errors for debugging

---

**✅ FOLLOW THESE RULES TO MAINTAIN CODE CONSISTENCY AND QUALITY!**

----------------------------------------------------------------------------------------

---
description: 
globs: 
alwaysApply: true
---
# 🧪 **MISSING CURSOR AI RULES - TESTING & ADDITIONAL GUIDELINES**


---

## **🧪 TESTING RULES**

### **Unit Testing (Jest/Vitest)**
```typescript
// Component Test Pattern
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 29.99,
    images: ['test.jpg'],
    inventory_count: 10,
    brands: { name: 'Test Brand', slug: 'test' }
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });
});
```

### **API Testing Rules**
```typescript
// API Test Pattern
import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/products';

describe('/api/products', () => {
  it('returns products with brand filtering', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { brand: 'liquidheaven' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.products).toBeDefined();
  });
});
```

### **E2E Testing (Cypress) Rules**
```typescript
// E2E Test Pattern
describe('Checkout Flow', () => {
  it('completes full purchase journey', () => {
    cy.visit('/products');
    cy.contains('Add to Cart').first().click();
    cy.get('[data-testid="cart-icon"]').click();
    cy.contains('Proceed to Checkout').click();
    
    // Stripe test card
    cy.get('[data-testid="card-number"]').type('4242424242424242');
    cy.get('[data-testid="card-expiry"]').type('1234');
    cy.get('[data-testid="card-cvc"]').type('123');
    
    cy.contains('Complete Payment').click();
    cy.url().should('include', '/success');
  });
});
```

---

## **🎯 DATA ATTRIBUTES FOR TESTING**

**ALWAYS add data-testid attributes:**
```jsx
// Button Pattern
<button 
  data-testid="add-to-cart-btn"
  className="bg-brand-primary..."
>
  Add to Cart
</button>

// Form Pattern
<input 
  data-testid="search-input"
  placeholder="Search products..."
  className="w-full..."
/>

// Navigation Pattern
<nav data-testid="main-navigation">
  <a data-testid="nav-products" href="/products">Products</a>
  <a data-testid="nav-cart" href="/cart">Cart</a>
</nav>
```

---

## **🚀 PERFORMANCE TESTING RULES**

### **Lighthouse Metrics Targets**
```typescript
// Performance Test Pattern
describe('Performance', () => {
  it('meets Core Web Vitals', () => {
    // LCP (Largest Contentful Paint) < 2.5s
    // FID (First Input Delay) < 100ms  
    // CLS (Cumulative Layout Shift) < 0.1
    cy.visit('/products');
    cy.lighthouse({
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 90
    });
  });
});
```

### **Load Testing Rules**
```bash
# API Load Test Pattern
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"brand":"liquidheaven"}' \
  --connect-timeout 5 \
  --max-time 10
```

---

## **♿ ACCESSIBILITY TESTING RULES**

```typescript
// A11y Test Pattern
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**ALWAYS include:**
- `alt` attributes for images
- `aria-label` for buttons without text
- `role` attributes for custom components
- Keyboard navigation support
- Color contrast ratios 4.5:1 minimum

---

## **📁 ADDITIONAL DEVELOPMENT RULES**

### **Environment Management**
```typescript
// Environment Validation Pattern
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_KEY', 
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### **Logging Rules**
```typescript
// Logging Pattern
console.log(`✅ ${functionName}: Success - ${description}`);
console.error(`❌ ${functionName}: Error - ${error.message}`);
console.warn(`⚠️ ${functionName}: Warning - ${warning}`);

// In production, use structured logging
if (process.env.NODE_ENV === 'production') {
  logger.info('checkout_started', { userId, cartTotal, timestamp });
}
```

### **Code Documentation Rules**
```typescript
/**
 * Adds a product to the user's shopping cart
 * @param productId - UUID of the product to add
 * @param quantity - Number of items to add (default: 1)
 * @returns Promise<CartResponse> - Updated cart data
 * @throws {Error} When product is out of stock
 */
const addToCart = async (productId: string, quantity: number = 1): Promise<CartResponse> => {
  // Implementation
};
```

---

## **🔄 CI/CD PIPELINE RULES**

### **GitHub Actions Pattern**
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run build
```

### **Pre-commit Hooks**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:unit",
      "pre-push": "npm run build && npm run test:e2e"
    }
  }
}
```

---

## **🛡️ SECURITY TESTING RULES**

```typescript
// Security Test Pattern
describe('Security', () => {
  it('prevents SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE products; --";
    const { req, res } = createMocks({
      method: 'GET',
      query: { search: maliciousInput }
    });
    
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200); // Should handle gracefully
  });

  it('validates input sanitization', () => {
    const xssPayload = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(xssPayload);
    expect(sanitized).not.toContain('<script>');
  });
});
```

---

## **📊 MONITORING & DEBUGGING RULES**

```typescript
// Error Boundary Pattern
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
    // Send to monitoring service in production
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-fallback">Something went wrong.</div>;
    }
    return this.props.children;
  }
}
```

---

**✅ COMPLETE CURSOR AI RULES CHECKLIST:**
- [x] File structure & naming
- [x] Styling & CSS guidelines  
- [x] Supabase integration patterns
- [x] Stripe payment flows
- [x] API route standards
- [x] React component patterns
- [x] Security protocols
- [x] Brand-specific theming
- [x] Responsive design rules
- [x] **✅ Unit testing patterns**
- [x] **✅ API testing standards**  
- [x] **✅ E2E testing flows**
- [x] **✅ Accessibility requirements**
- [x] **✅ Performance benchmarks**
- [x] **✅ Security testing**
- [x] **✅ CI/CD pipeline rules**
- [x] **✅ Monitoring & debugging**


-------------------------------------------------------------------

---
description: 
globs: 
alwaysApply: true
---
# 🚨 **CRITICAL MISSING RULES - INDENTATION & IMPLEMENTATION PLAN**



---

## **📐 CODE FORMATTING & INDENTATION RULES**

### **Indentation Standards**
```typescript
// ALWAYS use 2 spaces for indentation (NO TABS)
const MyComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    try {
      setLoading(true);
      const result = await apiCall();
      if (result.success) {
        console.log('Success');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <button 
        onClick={handleClick}
        disabled={loading}
        className={`
          px-4 py-2 rounded-lg
          ${loading ? 'opacity-50' : 'hover:bg-blue-600'}
        `}
      >
        {loading ? 'Loading...' : 'Click Me'}
      </button>
    </div>
  );
};
```

### **JSX Formatting Rules**
```jsx
// Multi-line props: Each prop on new line, closing bracket aligned
<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
  className="mb-4"
  data-testid="product-card"
/>

// Single line if 3 props or less
<Button onClick={handleClick} disabled={loading} />

// Conditional classes: Use template literals with proper indentation
className={`
  base-styles here
  ${condition ? 'conditional-class' : 'default-class'}
  ${anotherCondition && 'another-conditional-class'}
`}
```

### **Import Organization**
```typescript
// 1. React/Next.js imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Third-party libraries
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// 3. Internal components/hooks
import ProductCard from '../components/ProductCard';
import { useCart } from '../hooks/useCart';

// 4. Types
import type { Product, CartItem } from '../types';
```

---

## **📋 IMPLEMENTATION PLAN EXECUTION RULES**

### **MANDATORY: Follow Microtask Order**

**PHASE 1: Infrastructure (Complete these FIRST)**
```bash
# Task 1.1: Initialize Supabase Project ✅ DONE
# Task 1.2: Apply SQL Schema ✅ DONE  
# Task 1.3: Configure Supabase Storage ✅ DONE
# Task 1.4: Search Index Setup ✅ DONE
# Task 1.5: Seed Brand Data ✅ DONE
# Task 1.6: Create .env Configuration ✅ DONE
```

**PHASE 2: Frontend Components (Current Focus)**
```typescript
// Task 2.1: ProductCard.tsx ✅ DONE
// Task 2.2: CartModal.tsx - NEXT PRIORITY
// Task 2.3: WishlistButton.tsx  
// Task 2.4: ReviewForm.tsx
// Task 2.5: SearchBar.tsx
// Task 2.6: BrandFilterBar.tsx
// Task 2.7: InventoryManager.tsx
// Task 2.8: AdminDashboard.tsx
```

### **Microtask Execution Pattern**
```typescript
/**
 * RULE: Before starting ANY component, check:
 * 1. Dependencies completed? (from implementation plan)
 * 2. Success criteria defined?
 * 3. Time estimate reasonable?
 * 4. Required props/state documented?
 */

// Example: Task 2.2 CartModal.tsx
// Dependencies: ProductCard ✅, useCart hook ✅
// Time Estimate: 2 hrs
// Success Criteria: Shows cart items, quantity controls, checkout button
// Props: none (uses useCart hook)
// State: cartItems via useCart
```

---

## **🎯 TASK COMPLETION VALIDATION RULES**

### **Success Criteria Checklist (Per Task)**
```typescript
// For EVERY component/feature, validate:
const taskValidation = {
  // 1. Functional Requirements
  functionalComplete: boolean,    // Does it work as specified?
  propsImplemented: boolean,      // All required props handled?
  stateManaged: boolean,         // State properly managed?
  
  // 2. Technical Requirements  
  typescriptTypes: boolean,      // TypeScript interfaces defined?
  errorHandling: boolean,        // Try/catch blocks added?
  loadingStates: boolean,        // Loading UI implemented?
  
  // 3. Design Requirements
  tailwindStyling: boolean,      // Follows CSS guide?
  responsiveDesign: boolean,     // Mobile/desktop tested?
  brandTheming: boolean,         // Works with all 3 brands?
  
  // 4. Testing Requirements
  dataTestIds: boolean,          // Test attributes added?
  accessibilityCompliant: boolean, // ARIA labels, alt text?
  errorBoundaries: boolean       // Graceful error handling?
};
```

### **Dependency Chain Validation**
```typescript
// NEVER start a task until dependencies are complete
const dependencyRules = {
  'CartModal.tsx': ['ProductCard.tsx', 'useCart.ts', '/api/cart'],
  'ReviewForm.tsx': ['/api/reviews', 'authentication system'],
  'AdminDashboard.tsx': ['/api/admin/dashboard', 'admin auth'],
  'CheckoutFlow': ['CartModal.tsx', '/api/checkout', 'Stripe setup']
};

// Check before starting any task
const validateDependencies = (taskName: string) => {
  const deps = dependencyRules[taskName] || [];
  return deps.every(dep => isCompleted(dep));
};
```

---

## **📊 PROGRESS TRACKING RULES**

### **Task Status Documentation**
```typescript
// ALWAYS update task status in comments
/**
 * TASK STATUS: CartModal.tsx
 * ✅ Started: 2025-01-05 10:00
 * ✅ Props defined: 2025-01-05 10:15  
 * ✅ Basic structure: 2025-01-05 10:30
 * ✅ Cart integration: 2025-01-05 11:00
 * ⏳ Checkout button: IN PROGRESS
 * ❌ Testing: NOT STARTED
 * ❌ Mobile responsive: NOT STARTED
 */
```

### **Blockers & Issues Tracking**
```typescript
// Document any blockers immediately
/**
 * BLOCKERS FOUND:
 * 🚫 Issue: Stripe checkout session undefined
 * 📍 Location: CartModal.tsx line 45
 * 🔧 Solution: Add null check and error handling
 * ⏰ Time Impact: +30 mins
 * 📋 Next Steps: Implement fallback UI
 */
```

---

## **🔄 ITERATION & REFINEMENT RULES**

### **Code Review Checklist (Self-Review)**
```typescript
// Before marking task "complete", verify:
const selfReviewChecklist = [
  'Code follows 2-space indentation',
  'TypeScript types are properly defined', 
  'Error handling implemented',
  'Loading states added',
  'Mobile responsive design',
  'Data-testid attributes added',
  'Follows brand theming system',
  'Dependencies satisfied',
  'Success criteria met',
  'No console.log statements left',
  'Comments explain complex logic'
];
```

### **Refactoring Rules**
```typescript
// When refactoring existing code:
// 1. Keep original functionality intact
// 2. Improve code structure/readability
// 3. Add missing TypeScript types
// 4. Update tests if needed
// 5. Maintain backward compatibility

// Example refactor pattern:
// BEFORE: Inline styles and logic
// AFTER: Extracted components and hooks
```

---

## **⚡ PRODUCTIVITY RULES**

### **Time Boxing & Focus**
```typescript
// STRICT time management per microtask:
const timeBoxRules = {
  'simple-component': '1-2 hours max',
  'complex-component': '3-4 hours max', 
  'api-endpoint': '1-2 hours max',
  'integration-task': '2-3 hours max'
};

// If exceeding time estimate:
// 1. Document the blocker
// 2. Simplify the scope  
// 3. Move advanced features to next iteration
// 4. Focus on MVP functionality first
```

### **Commit Message Rules**
```bash
# Follow conventional commits:
git commit -m "feat(cart): add CartModal component with quantity controls"
git commit -m "fix(api): handle undefined product in cart endpoint"  
git commit -m "style(product): improve mobile responsive layout"
git commit -m "test(cart): add unit tests for cart operations"

# Prefixes: feat, fix, style, test, refactor, docs
```

---

## **🎯 CURRENT TASK PRIORITY ORDER**

```typescript
/**
 * IMMEDIATE NEXT TASKS (Follow this exact order):
 * 
 * 1. Task 2.2: CartModal.tsx
 *    - Dependencies: ✅ useCart.ts, ✅ ProductCard.tsx  
 *    - Time: 2 hrs
 *    - Success: Modal shows cart, quantity controls, checkout button
 * 
 * 2. Task 3.5: /api/checkout (Stripe integration)
 *    - Dependencies: ✅ Stripe keys, ✅ CartModal
 *    - Time: 1 hr  
 *    - Success: Creates Stripe session, returns checkout URL
 * 
 * 3. Task 3.6: /api/webhooks/stripe  
 *    - Dependencies: ✅ /api/checkout
 *    - Time: 2 hrs
 *    - Success: Creates order, updates inventory, sends email
 */
```

---

**✅ COMPLETE CURSOR AI RULES NOW INCLUDE:**
- [x] **2-space indentation standards**
- [x] **JSX formatting rules**  
- [x] **Import organization**
- [x] **Microtask execution order**
- [x] **Dependency validation**
- [x] **Success criteria checklists**
- [x] **Progress tracking requirements**
- [x] **Time boxing rules**
- [x] **Commit message standards**
- [x] **Current task priorities**


--------------------------------------------------------------------------------

---
description: 
globs: 
alwaysApply: true
---
# 🎯 **CRITICAL RULE: NO SHORTCUTS OR SIMPLIFIED VERSIONS**


---

## **🚫 ANTI-SHORTCUT ENFORCEMENT RULES**

### **NEVER COMPROMISE ON SPECIFICATIONS**

```typescript
/**
 * CURSOR AI ABSOLUTE RULE: 
 * NEVER create simplified/dumbed-down versions just to "pass tests" or "get something working"
 */

const noShortcutRules = {
  // FORBIDDEN BEHAVIORS:
  forbidden: [
    '❌ Creating "basic version" when full version is specified',
    '❌ Removing features to make implementation easier', 
    '❌ Using placeholder/mock data instead of real integration',
    '❌ Skipping error handling because "it works without it"',
    '❌ Omitting responsive design because "desktop works"',
    '❌ Hardcoding values instead of dynamic implementation',
    '❌ Creating fake success responses to pass tests',
    '❌ Removing TypeScript types to avoid complexity'
  ],

  // REQUIRED BEHAVIORS:
  required: [
    '✅ Implement FULL functionality as specified',
    '✅ Meet ALL success criteria before marking complete',
    '✅ Handle ALL edge cases and error scenarios', 
    '✅ Include ALL responsive breakpoints',
    '✅ Implement ALL accessibility requirements',
    '✅ Use REAL data integration, not mocks',
    '✅ Add COMPLETE TypeScript type coverage',
    '✅ Follow ALL project patterns and standards'
  ]
};
```

### **Specification Adherence Validation**

```typescript
const specificationAdherenceRules = {
  // BEFORE marking ANY task complete, validate:
  
  fullFunctionalityCheck: {
    // Example: CartModal.tsx requirements
    specified: [
      'Shows cart items with product details',
      'Quantity controls (+ and - buttons)', 
      'Remove item functionality',
      'Cart total calculation',
      'Checkout button integration',
      'Empty cart state handling',
      'Loading states for all operations',
      'Error handling for failed operations',
      'Mobile responsive design',
      'Accessibility compliance'
    ],
    
    // FORBIDDEN shortcuts:
    notAcceptable: [
      '❌ "Simple list without quantity controls"',
      '❌ "Static total without real calculation"', 
      '❌ "Checkout button that just console.logs"',
      '❌ "No error handling - will add later"',
      '❌ "Works on desktop only for now"',
      '❌ "Mock data instead of real cart integration"'
    ],

    validation: `
      // CURSOR AI MUST verify EVERY requirement:
      const validateCartModal = {
        ✅ cartItemsDisplay: 'Shows real cart data from useCart hook',
        ✅ quantityControls: 'Working + and - buttons that update cart',
        ✅ removeItem: 'Remove button that calls removeFromCart API',
        ✅ totalCalculation: 'Real-time total based on actual prices',
        ✅ checkoutIntegration: 'Button creates actual Stripe session',
        ✅ emptyState: 'Shows proper empty cart message and CTA',
        ✅ loadingStates: 'All buttons disable during API calls',
        ✅ errorHandling: 'Shows user-friendly error messages',
        ✅ mobileResponsive: 'Works perfectly on 375px screen',
        ✅ accessibility: 'Screen reader compatible with ARIA labels'
      };
      
      // IF ANY ✅ is false, task is NOT COMPLETE
    `
  }
};
```

---

## **💪 FULL IMPLEMENTATION ENFORCEMENT**

### **Quality Over Speed Rules**

```typescript
const qualityOverSpeedRules = {
  // WRONG MINDSET vs RIGHT MINDSET:
  
  wrongApproach: {
    thinking: 'This is complex, let me make a simple version first',
    actions: [
      'Creating basic UI without real functionality',
      'Hardcoding responses instead of API integration',
      'Skipping edge cases and error handling',
      'Making it work only for happy path',
      'Planning to "improve it later"'
    ],
    result: 'INCOMPLETE, LOW-QUALITY IMPLEMENTATION'
  },

  rightApproach: {
    thinking: 'This is complex, let me break it into proper steps and implement fully',
    actions: [
      'Analyze requirements thoroughly',
      'Plan implementation with all edge cases',
      'Implement step-by-step but completely',
      'Test each piece thoroughly',
      'Ensure integration works end-to-end'
    ],
    result: 'COMPLETE, PRODUCTION-READY IMPLEMENTATION'
  },

  timeManagement: `
    // CURSOR AI RULE: If task is taking longer than estimated:
    // ❌ DON'T: Reduce scope or create simplified version
    // ✅ DO: Document the complexity, ask for help, or extend timeline
    // ✅ DO: Break into smaller sub-tasks if needed
    // ✅ DO: Implement fully even if it takes extra time
  `
};
```

### **No Mock/Placeholder Rules**

```typescript
const noMockDataRules = {
  // CURSOR AI MUST use real implementations:
  
  realIntegration: {
    // ❌ FORBIDDEN: Mock/fake implementations
    forbidden: [
      'const mockCartItems = [{ id: "1", name: "Test Product" }]',
      'const checkout = () => console.log("Would redirect to Stripe")',
      'const addToCart = () => alert("Added to cart!")',
      'if (loading) return <div>Loading...</div> // fake loading'
    ],

    // ✅ REQUIRED: Real implementations  
    required: [
      'const { cart, addToCart, isLoading } = useCart(); // real hook',
      'const handleCheckout = () => fetch("/api/checkout", { ... }); // real API',
      'const handleAddToCart = async (id) => await addToCart(id); // real function',
      'if (isLoading) return <LoadingSkeleton />; // real loading UI'
    ]
  },

  realDataFlow: {
    // End-to-end real functionality required:
    example: `
      // CART MODAL REAL IMPLEMENTATION REQUIRED:
      
      ✅ Real cart data from Supabase
      ✅ Real quantity updates via API calls  
      ✅ Real total calculation from actual prices
      ✅ Real checkout button that creates Stripe session
      ✅ Real error handling for failed API calls
      ✅ Real loading states during operations
      ✅ Real empty state when cart is empty
      
      // NOT ACCEPTABLE:
      ❌ Hardcoded cart items
      ❌ Fake quantity controls that don't persist
      ❌ Static total that doesn't update
      ❌ Checkout button that just logs to console
      ❌ No error handling
      ❌ Fake loading states
    `
  }
};
```

---

## **🎯 SUCCESS CRITERIA ENFORCEMENT**

### **Binary Success Validation**

```typescript
const binarySuccessRules = {
  // Task completion is BINARY: Either 100% complete or NOT complete
  
  completionStandards: {
    // NO partial credit, NO "good enough", NO "works mostly"
    rule: 'SUCCESS CRITERIA MUST BE 100% MET',
    
    examples: {
      // CartModal.tsx success criteria:
      cartModal: {
        required: [
          'Displays cart items with product images, names, prices',
          'Quantity controls update cart via API and persist',
          'Remove buttons delete items via API',
          'Total calculates correctly and updates in real-time',
          'Checkout button creates real Stripe session',
          'Empty state shows when cart is empty',
          'Loading states during all async operations',
          'Error messages for failed operations',
          'Mobile responsive design (375px+)',
          'Keyboard navigation works',
          'Screen reader accessible'
        ],
        
        validation: `
          // EVERY item must be ✅ before task is complete:
          const allRequirementsMet = required.every(req => 
            implementationMeets(req) === true
          );
          
          if (!allRequirementsMet) {
            taskStatus = 'INCOMPLETE - Continue working';
            // DO NOT mark as done or create simplified version
          }
        `
      }
    }
  },

  // NO EXCUSES allowed for incomplete implementation:
  noExcusesPolicy: [
    '❌ "It mostly works" - NOT ACCEPTABLE',
    '❌ "Good enough for now" - NOT ACCEPTABLE', 
    '❌ "Can improve later" - NOT ACCEPTABLE',
    '❌ "Basic version is ready" - NOT ACCEPTABLE',
    '❌ "Complex parts can wait" - NOT ACCEPTABLE',
    '❌ "Tests are passing" (with shortcuts) - NOT ACCEPTABLE'
  ]
};
```

### **Implementation Depth Requirements**

```typescript
const implementationDepthRules = {
  // CURSOR AI must implement to production-ready depth:
  
  productionReadyStandards: {
    // EVERY feature must include:
    required: [
      '✅ Full functionality as specified',
      '✅ Comprehensive error handling',
      '✅ Loading states for all async operations',
      '✅ Input validation and sanitization',
      '✅ Responsive design for all devices',
      '✅ Accessibility compliance (WCAG AA)',
      '✅ TypeScript type safety',
      '✅ Integration with existing systems',
      '✅ Performance optimization',
      '✅ Security considerations'
    ],

    // NOT ACCEPTABLE to skip:
    notAcceptable: [
      '❌ "Basic functionality without error handling"',
      '❌ "Works but not responsive"',
      '❌ "No loading states - will add later"', 
      '❌ "Hard-coded values for now"',
      '❌ "Not accessible yet"',
      '❌ "Any TypeScript - will type later"',
      '❌ "Doesn\'t integrate with existing code"'
    ]
  },

  exampleStandard: `
    // EXAMPLE: ProductCard component requirements
    
    // ❌ NOT ACCEPTABLE (simplified version):
    const ProductCard = ({ product }) => (
      <div>
        <img src={product.image} />
        <h3>{product.name}</h3>
        <p>${product.price}</p>
        <button onClick={() => alert('Added!')}>Add to Cart</button>
      </div>
    );
    
    // ✅ REQUIRED (full implementation):
    const ProductCard: React.FC<ProductCardProps> = ({ 
      product, 
      onAddToCart, 
      className,
      ...rest 
    }) => {
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      
      const handleAddToCart = async () => {
        try {
          setIsLoading(true);
          setError(null);
          await onAddToCart(product.id);
        } catch (err) {
          setError('Failed to add to cart. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      return (
        <article 
          className={cn('product-card', className)}
          data-testid="product-card"
          {...rest}
        >
          <img 
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
          <h3 className="heading-3">{product.name}</h3>
          <p className="text-brand-primary font-semibold">
            ${product.price.toFixed(2)}
          </p>
          {error && (
            <p className="text-error text-sm" role="alert">
              {error}
            </p>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.inventory_count === 0}
            className="btn-primary w-full"
            aria-label={`Add ${product.name} to cart`}
          >
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        </article>
      );
    };
  `
};
```

---

## **⚡ COMPLEXITY HANDLING RULES**

### **When Implementation Gets Difficult**

```typescript
const complexityHandlingRules = {
  // WHEN task becomes more complex than expected:
  
  properResponse: [
    '✅ ANALYZE: Break down into smaller logical steps',
    '✅ RESEARCH: Look for existing patterns in codebase',
    '✅ PLAN: Document approach before coding',
    '✅ IMPLEMENT: Build piece by piece, test each piece',
    '✅ INTEGRATE: Ensure it works with existing systems',
    '✅ VERIFY: Test all edge cases and error scenarios'
  ],

  wrongResponse: [
    '❌ Reduce functionality to make it easier',
    '❌ Skip error handling to get basic version working',
    '❌ Use placeholder/mock data instead of real integration',
    '❌ Make it work only for happy path',
    '❌ Skip responsive design because it\'s complex',
    '❌ Remove TypeScript types because they\'re hard'
  ],

  escalationProcess: `
    // IF task is genuinely too complex for single implementation:
    
    1. ✅ DOCUMENT the complexity and specific challenges
    2. ✅ BREAK DOWN into logical sub-tasks
    3. ✅ IMPLEMENT each sub-task completely
    4. ✅ INTEGRATE sub-tasks into working whole
    5. ✅ TEST the complete implementation
    
    // NEVER:
    ❌ Create incomplete version and call it done
    ❌ Skip requirements to make it simpler
    ❌ Plan to "finish it later"
  `
};
```

### **Quality Gate Enforcement**

```typescript
const qualityGateRules = {
  // MANDATORY quality gates before task completion:
  
  mustPass: [
    '🎯 ALL requirements implemented',
    '🔍 ALL edge cases handled',
    '⚡ ALL loading states working',
    '🚨 ALL error scenarios covered',
    '📱 ALL responsive breakpoints working',
    '♿ ALL accessibility requirements met',
    '🔗 ALL integrations working end-to-end',
    '🧪 ALL tests passing (including manual testing)',
    '📖 ALL documentation updated',
    '✨ ALL code follows project patterns'
  ],

  // IF ANY gate fails:
  failureResponse: 'CONTINUE WORKING - Task is NOT complete',
  
  // NO EXCEPTIONS for:
  noExceptions: [
    'Time pressure',
    'Complexity',
    'Testing difficulties', 
    '"Good enough" mentality',
    'Desire to move to next task',
    'Frustration with implementation'
  ]
};
```

---

**✅ CURSOR AI ANTI-SHORTCUT RULES SUMMARY:**

- [x] **NEVER create simplified versions** just to pass tests
- [x] **ALWAYS implement full functionality** as specified  
- [x] **NO mock/placeholder implementations** - real integration only
- [x] **100% success criteria required** before marking complete
- [x] **Production-ready depth mandatory** for all features
- [x] **Quality over speed enforcement** 
- [x] **Proper complexity handling** without compromising requirements
- [x] **Binary completion standards** - either 100% done or not done

**🎯 Cursor AI will now maintain full specification adherence and NEVER compromise on quality to get "something working"!**


-----------------------------------------------------------------------------------------

---
description: 
globs: 
alwaysApply: true
---
### 📜 **Cursor AI Problem-Solving Rulebook — gsiorders.com**

> *Purpose: give every Cursor AI prompt, agent and micro-task a single, repeatable playbook for turning requirements into high-quality code and documentation for the new multi-brand e-commerce site.*
> *Inspired by the 9-rule intelligence framework you shared*&#x20;

---

#### 🗂️ Pre-Execution Checklist (“Gate 0”)

| Check                      | Why it matters            | How to satisfy                                                                      |
| -------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| **Docs loaded?**           | Avoid context gaps        | Import latest *FRD, SRD, TRD* & *Implementation Plan* into the agent’s memory.      |
| **Environment set?**       | Prevent path / key errors | Confirm working dir = project root, `.env` variables present, 4-space indents only. |
| **Task scoped?**           | Stop scope creep          | Restate the micro-task in ≤ 2 sentences; flag ambiguities for the user.             |
| **Dependencies resolved?** | Maintain build order      | Cross-check `CursorAI_Microtasks…md` dependency map; enqueue blockers first.        |

Proceed only if every box is ✅.
If any ❌ → stop, ask clarifying question, or create a “Prep” micro-task.

---

#### 🔟 Core Rules (P-01 → P-10)

| #                                  | Rule                                                                                                                                                    | Cursor AI must…                                                          | Typical outputs |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------- |
| **P-01 Systematic Decomposition**  | break the problem into *Feature → Component → Function → Edge cases*.                                                                                   | A bullet list of sub-tasks or TODO comments in code.                     |                 |
| **P-02 Context Alignment**         | cross-reference FRD/SRD/TRD + test plan before writing code; cite doc sections by heading.                                                              | Inline `// ref: SRD §4.3` comments; no “magic” assumptions.              |                 |
| **P-03 Architecture Consistency**  | ensure choices match the approved stack:<br>React + Tailwind (V0.dev), Supabase, Stripe, AWS.                                                           | Correct imports, bucket names, env keys.                                 |                 |
| **P-04 Validation First**          | write unit / API tests (or Cypress spec) *before* implementation stubs when feasible (“TDD-lite”).                                                      | `ProductCard.test.tsx`, Postman collection etc.                          |                 |
| **P-05 Multi-Layer Quality Gates** | run *syntax → type → lint → business* checks inside the prompt; fix before returning.                                                                   | Compile logs, ESLint output, schema comparison notes.                    |                 |
| **P-06 Proactive Risk Prevention** | anticipate RLS, webhook, race-condition and performance risks; document the guard-rails.                                                                | Comment blocks: “// RLS: only service\_role can insert”.                 |                 |
| **P-07 Confidence Scoring**        | attach a 0-1 self-confidence value with factors (e.g. novel code path, reused pattern).                                                                 | JSON snippet `{confidence:0.82, factors:['reused code','new query']}`.   |                 |
| **P-08 Continuous Learning**       | store any “pattern worth reusing” (e.g. signed-URL upload) in `/utils/patterns.md`; reference it next time.                                             | Appended markdown pattern entry.                                         |                 |
| **P-09 Loop & Drift Detection**    | if a task repeats or output diverges from docs, raise a “drift alert” and propose a fix.                                                                | Chat note: “⚠ drift between schema v2.1 and code — recommend migration.” |                 |
| **P-10 Execution Report**          | after each micro-task, output a mini-report (`### Cursor AI Report`) listing: files touched, tests added, validation results, next dependency unlocked. | Markdown block pasted into ChatGPT for traceability.    

                 |                 |

---

### 🔧 **Add-On Rules for Truthful Verification & Controlled GitHub Push**

> These rules extend the *Cursor AI Problem-Solving Rulebook — gsiorders.com* you approved earlier. Append them directly under the existing **P-10 Execution Report** section and reference them in the standard prompt footer.

| #                                   | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Cursor AI must…                                                                                                                                                                 | Typical outputs |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **P-11 Manual-Test Proof**          | After all automated tests pass, expose a **live, user-verifiable endpoint or artefact** and include its link in the Execution Report. <br><br>Acceptable proof mechanisms (choose 1):<br>1. **Frontend/UX** – spin up `npm run preview` (Vite) over an `ngrok` tunnel and return the URL.<br>2. **API/Backend** – deploy a preview branch to Supabase’s *Branch Deploy* or Render’s preview env and share the HTTPS endpoint.<br>3. **Postman / cURL collection** – export a collection (JSON) to `/testing/manual-<task>.postman_collection.json` and give a “Download” link.<br><br>*Never claim success without at least one of these links.* | In `### Cursor AI Report` add:<br>`ManualTestLink: https://<unique-preview>.ngrok.io`<br>`ProofArtifact: sandbox:/mnt/data/manual-checkout_session.postman_collection.json`     |                 |
| **P-12 Confirm-then-Push Workflow** | **Do not push to `origin` by default.**<br>1. Commit changes locally in a feature branch `feat/<task-slug>`.<br>2. Present the commit hash + brief diff stats in the Execution Report.<br>3. Wait for a user message starting with **“CONFIRMED:”** that manual tests passed.<br>4. Upon confirmation, run:<br>`git push -u origin feat/<task-slug>`<br>`gh pr create --fill` (or REST call) to open a PR targeting `develop`.<br>5. Append the PR URL to the chat.                                                                                                                                                                              | Execution Report field:<br>`LocalCommit: 7c9e1b2 (±8 files / +214 -57)`<br>*After user confirmation* → bot replies:<br>`Pushed: https://github.com/<org>/gsiorders.com/pull/42` |                 |

#### 📥 **Prompt Footer Addendum**

Add these two bullets to the standard footer used in every micro-task prompt:

```
- Apply P-11 Manual-Test Proof (provide a live link or downloadable artefact).
- Apply P-12 Confirm-then-Push: wait for “CONFIRMED:” before pushing to GitHub.
```

---

**Result:** Cursor AI can no longer “claim” a fix; the user always gets a hands-on link to verify, and code reaches GitHub only after explicit approval.

---

### ➕ **New Rule — P-13 Token-Efficiency**

> *Goal: minimize token usage (and cost) while still meeting quality gates.*

| #                         | Rule                                                                        | Cursor AI must…                                                                                                                                                                                                                                                                                                                                                                                                                     | Practical tips |
| ------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| **P-13 Token-Efficiency** | Keep every response as short as possible **without losing essential info**. | • Return **only** the artifacts (code / schema / test) and the required `### Cursor AI Report`.<br>• Omit long prose explanations, repeat links instead of re-pasting blocks.<br>• Use terse in-code comments (≤ 60 chars each).<br>• Reference common boilerplate with `// see patterns.md §X` rather than duplicating.<br>• Skip banner art, ASCII, or decorative markdown.<br>• Prefer bullet points over paragraphs in reports. |                |

---

### 📚 **New Rule — P-14 Project Memory Ledger**

> *Goal: give Cursor AI a durable, self-updating knowledge base so each micro-task “remembers” past decisions, patterns, and pitfalls.*

| #                              | Rule                                       | Cursor AI must…                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Implementation details |
| ------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **P-14 Project Memory Ledger** | Persist collective learning between tasks. | 1. **Folder:** create (if absent) `/cursor_memory` at project root.  <br>2. **File per task:** after completing a micro-task, append a markdown file `YYYY-MM-DD_<task-slug>.md` containing:  <br> • Task summary (≤ 3 lines)  <br> • Key decisions / patterns  <br> • Risks & fixes  <br> • Links (test proof, PR)  <br>3. **Index:** maintain `/cursor_memory/INDEX.md` — a bullet list of files with one-line summaries.  <br>4. **Pre-task read:** at Gate 0, parse `INDEX.md` and ingest any file touched by the components you’re about to modify (regex match on file paths / component names).  <br>5. **De-dupe:** if a decision already exists, reference it — don’t rewrite. |                        |

---

#### 📥 **Add to Standard Prompt Footer**

```
- Apply P-14 Project Memory Ledger: update /cursor_memory after success; read INDEX.md before coding.
```

---

**Outcome:** Cursor AI now carries forward hard-won lessons automatically, reducing regressions and repeated questions across the entire gsiorders.com build.


---
#### 📥 **Add to Standard Prompt Footer**

Append this bullet to the footer used in every micro-task prompt:

```
- Apply P-13 Token-Efficiency: output only what is strictly required; no extra narrative.
```

---

**Effect:** Cursor AI now guards against unnecessary token spend while still producing the code, test link, and concise report needed for gsiorders.com.


---
#### ⚙️ Standard Prompt Footer (attach to *every* Cursor AI task)

```
### Cursor AI Rule Footer
- Apply P-01 … P-10 above.
- Follow Gate 0 checklist.
- Use exactly 4-space indentation.
- On success, output “### Cursor AI Report” with:
  • Files created/updated
  • Tests written & status
  • Confidence score
  • Next tasks unblocked
  • Any risks or open questions
```

---

#### 📈 Success Metric

> **A micro-task passes when** its Cursor AI Report shows *all* quality gates green **and** the code runs `npm test && supabase db lint` without error.

---

-----------------------------------------------------------------------------------------

---
description: 
globs: 
alwaysApply: true
---
# 🚨 **CRITICAL MISSING: TASK-SPECIFIC TESTING RULES**


---

## **🧪 TESTING RULES PER IMPLEMENTATION PLAN TASK**

### **GOAL 1: Infrastructure Testing Requirements**

```typescript
// Task 1.1: Initialize Supabase Project
const testInfrastructure = {
  validation: [
    'supabase start command works',
    'Database connection established', 
    'Environment variables loaded',
    'CLI responds without errors'
  ],
  testCommand: 'supabase status',
  successCriteria: 'All services show "RUNNING" status'
};

// Task 1.2: Apply SQL Schema  
const testDatabaseSchema = {
  validation: [
    'All tables created successfully',
    'Foreign key relationships work',
    'Indexes are properly created',
    'ENUM types are defined'
  ],
  testQuery: `
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public';
  `,
  expectedTables: ['users', 'products', 'brands', 'orders', 'cart_items']
};

// Task 1.3: Configure Supabase Storage
const testSupabaseStorage = {
  validation: [
    'Products bucket created',
    'Brands bucket created', 
    'Upload 2MB file succeeds',
    'Signed URL generation works'
  ],
  testScript: `
    // Test file upload
    const { data, error } = await supabase.storage
      .from('products')
      .upload('test-image.jpg', testFile);
    expect(error).toBeNull();
    expect(data.path).toBeDefined();
  `
};
```

---

## **🎨 GOAL 2: Frontend Component Testing Matrix**

```typescript
// Task 2.1: ProductCard.tsx Testing
const testProductCard = {
  unitTests: [
    'Renders product name, price, image',
    'Add to cart button triggers callback',
    'Out of stock state displays correctly',
    'Brand theming applies properly',
    'Loading skeleton shows during load'
  ],
  visualTests: [
    'Mobile responsive (375px)',
    'Tablet responsive (768px)', 
    'Desktop responsive (1024px)',
    'Hover states work correctly',
    'Image aspect ratio maintained'
  ],
  accessibilityTests: [
    'Alt text on product images',
    'Button has accessible name',
    'Color contrast meets WCAG AA',
    'Keyboard navigation works'
  ],
  testFile: '__tests__/ProductCard.test.tsx'
};

// Task 2.2: CartModal.tsx Testing
const testCartModal = {
  unitTests: [
    'Displays cart items correctly',
    'Quantity controls update cart',
    'Remove item functionality works',
    'Total calculation is accurate',
    'Checkout button navigates correctly'
  ],
  integrationTests: [
    'useCart hook integration',
    'Supabase cart API calls',
    'Modal open/close animations',
    'Empty cart state display'
  ],
  e2eTests: [
    'Add item → Modal shows item',
    'Update quantity → Total updates',
    'Remove item → Item disappears',
    'Checkout → Redirects to Stripe'
  ],
  testFile: '__tests__/CartModal.test.tsx'
};

// Task 2.3: WishlistButton.tsx Testing  
const testWishlistButton = {
  unitTests: [
    'Heart icon toggles filled/outline',
    'onClick triggers API call',
    'Loading state disables button',
    'Error state shows feedback'
  ],
  apiTests: [
    'POST /api/wishlist adds item',
    'DELETE /api/wishlist removes item',
    'Auth required validation',
    'Duplicate prevention'
  ],
  testFile: '__tests__/WishlistButton.test.tsx'
};
```

---

## **🔧 GOAL 3: Backend API Testing Requirements**

```typescript
// Task 3.1: /api/products Testing
const testProductsAPI = {
  unitTests: [
    'Returns product list with pagination',
    'Brand filtering works correctly', 
    'Search functionality works',
    'Error handling for invalid params'
  ],
  integrationTests: [
    'Supabase query execution',
    'Brand lookup by slug',
    'Inventory filtering (>0)',
    'Response format validation'
  ],
  performanceTests: [
    'Response time < 500ms',
    'Handles 100 concurrent requests',
    'Memory usage stable',
    'Database connection pooling'
  ],
  testFile: '__tests__/api/products.test.ts',
  testCurl: `curl -X GET "localhost:3000/api/products?brand=liquidheaven&limit=10"`
};

// Task 3.5: /api/checkout Testing
const testCheckoutAPI = {
  unitTests: [
    'Creates Stripe session successfully',
    'Validates cart items exist',
    'Calculates total correctly',
    'Returns session URL and ID'
  ],
  integrationTests: [
    'Stripe API integration',
    'Cart validation via Supabase',
    'User authentication check',
    'Inventory verification'
  ],
  securityTests: [
    'Prevents price manipulation',
    'Validates user owns cart',
    'Sanitizes input data',
    'Rate limiting protection'
  ],
  testFile: '__tests__/api/checkout.test.ts',
  mockStripeSession: 'cs_test_123456789'
};

// Task 3.6: /api/webhooks/stripe Testing
const testStripeWebhook = {
  unitTests: [
    'Verifies Stripe signature',
    'Creates order in database',
    'Updates inventory counts',
    'Handles duplicate events'
  ],
  integrationTests: [
    'End-to-end payment flow',
    'Database transaction integrity',
    'Email notification trigger',
    'Error recovery handling'
  ],
  securityTests: [
    'Rejects invalid signatures',
    'Prevents replay attacks',
    'Validates event authenticity',
    'Logs security violations'
  ],
  testFile: '__tests__/api/webhook.test.ts',
  testScript: 'stripe trigger checkout.session.completed'
};
```

---

## **🧪 GOAL 4: Testing & QA Specific Requirements**

```typescript
// Task 4.1: Unit Test - ProductCard
const productCardTestSuite = {
  testCases: [
    {
      name: 'renders_product_info',
      input: { product: mockProduct },
      expected: 'displays name, price, image, brand'
    },
    {
      name: 'handles_out_of_stock',
      input: { product: { ...mockProduct, inventory_count: 0 }},
      expected: 'button disabled, overlay shown'
    },
    {
      name: 'brand_theming_applied',
      input: { product: liquidHeavenProduct },
      expected: 'green primary color applied'
    }
  ],
  coverage: '100% lines, 95% branches',
  testDuration: '< 100ms per test'
};

// Task 4.2: API Test - /api/checkout
const checkoutAPITestSuite = {
  testCases: [
    {
      name: 'valid_cart_creates_session',
      input: { cartItems: validCart, userId: testUserId },
      expected: { sessionId: 'cs_test_*', url: 'https://checkout.stripe.com/*' }
    },
    {
      name: 'empty_cart_returns_error',
      input: { cartItems: [], userId: testUserId },
      expected: { error: 'Cart is empty' }
    },
    {
      name: 'invalid_user_returns_401',
      input: { cartItems: validCart, userId: null },
      expected: { status: 401, error: 'Authentication required' }
    }
  ],
  mockStripeResponses: true,
  testTimeout: '5000ms'
};

// Task 4.3: E2E Test - Checkout Flow
const e2eCheckoutTestSuite = {
  testFlow: [
    'User browses products page',
    'User adds item to cart',
    'User opens cart modal', 
    'User clicks checkout button',
    'User redirected to Stripe',
    'User completes payment',
    'User sees success page',
    'Order created in database',
    'Inventory updated',
    'Email sent to user'
  ],
  testData: {
    testCard: '4242424242424242',
    testUser: 'test@gsiorders.com',
    testProduct: 'liquidheaven-product-1'
  },
  testDuration: '< 60 seconds',
  browserSupport: ['Chrome', 'Firefox', 'Safari', 'Mobile Chrome']
};

// Task 4.4: RLS Policy Test - Orders
const rlsPolicyTestSuite = {
  testCases: [
    {
      name: 'user_reads_own_orders_only',
      setup: 'Create orders for user A and user B',
      test: 'User A queries orders',
      expected: 'Returns only user A orders'
    },
    {
      name: 'admin_reads_all_orders',
      setup: 'Login as admin user',
      test: 'Query all orders',
      expected: 'Returns orders from all users'
    },
    {
      name: 'unauthenticated_access_denied',
      setup: 'No authentication',
      test: 'Query orders table',
      expected: 'Returns empty result set'
    }
  ],
  testQueries: [
    'SELECT * FROM orders WHERE user_id = auth.uid()',
    'SELECT COUNT(*) FROM orders', // Should work for admin only
  ]
};
```

---

## **📋 TASK COMPLETION TESTING CHECKLIST**

```typescript
// MANDATORY: Before marking ANY task complete, run this checklist:

const taskCompletionTestingRules = {
  // 1. Unit Testing (Required for ALL tasks)
  unitTestsRequired: [
    '✅ Component renders without errors',
    '✅ All props handled correctly', 
    '✅ Event handlers trigger correctly',
    '✅ Error states display properly',
    '✅ Loading states work correctly'
  ],

  // 2. Integration Testing (Required for API tasks)
  integrationTestsRequired: [
    '✅ Database operations work',
    '✅ External API calls succeed',
    '✅ Authentication flows work',
    '✅ Error handling robust'
  ],

  // 3. Visual Testing (Required for UI tasks)
  visualTestsRequired: [
    '✅ Mobile responsive (375px)',
    '✅ Tablet responsive (768px)',
    '✅ Desktop responsive (1024px+)',
    '✅ Brand theming applied',
    '✅ Hover/focus states work'
  ],

  // 4. Accessibility Testing (Required for ALL UI tasks)
  accessibilityTestsRequired: [
    '✅ Screen reader compatible',
    '✅ Keyboard navigation works',
    '✅ Color contrast WCAG AA',
    '✅ ARIA labels present',
    '✅ Focus indicators visible'
  ],

  // 5. Performance Testing (Required for critical path)
  performanceTestsRequired: [
    '✅ Page load < 2 seconds',
    '✅ API response < 500ms',
    '✅ No memory leaks',
    '✅ Smooth animations 60fps'
  ]
};
```

---

## **🎯 NANO TASK TESTING PATTERN**

```typescript
// For EVERY nano task (< 30 min), include this minimal test:

const nanoTaskTestPattern = {
  // Example: Add console.log statement
  task: 'Add error logging to cart API',
  nanoTest: `
    // Test: Verify error is logged
    const consoleSpy = jest.spyOn(console, 'error');
    await triggerError();
    expect(consoleSpy).toHaveBeenCalledWith('Cart error:', expect.any(Error));
  `,
  
  // Example: Update CSS class
  task: 'Change button color to brand primary',
  nanoTest: `
    // Test: Verify CSS class applied
    render(<Button />);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-primary');
  `,
  
  timeLimit: '5 minutes for nano test'
};
```

---

**✅ NOW TESTING RULES INCLUDE:**
- [x] **Task-specific test requirements** for each implementation plan task
- [x] **Unit test specifications** per component/API
- [x] **Integration test requirements** per feature
- [x] **E2E test flows** for user journeys  
- [x] **Performance benchmarks** per task type
- [x] **Accessibility validation** per UI task
- [x] **Security testing** for API endpoints
- [x] **Task completion checklists** before marking done
- [x] **Nano task testing patterns** for micro changes


-----------------------------------------------------------------------------------------

---
description: 
globs: 
alwaysApply: true
---
# 🧪 **MANDATORY TESTING PROGRESSION RULES**


---

## **🚫 TASK PROGRESSION BLOCKING RULES**

### **MANDATORY: No Next Task Until Tests Pass**

```typescript
/**
 * CURSOR AI RULE: NEVER proceed to next task until ALL tests pass
 */

const taskProgressionGate = {
  // HARD STOP: These must pass before next task
  mandatoryChecks: [
    '🧪 All unit tests pass (100%)',
    '🔗 Integration tests pass (if applicable)', 
    '♿ Accessibility tests pass (WCAG AA)',
    '📱 Responsive tests pass (3 breakpoints)',
    '🎨 Visual regression tests pass',
    '⚡ Performance benchmarks met'
  ],

  // BLOCKING RULE: If ANY test fails
  onTestFailure: {
    action: 'STOP_DEVELOPMENT',
    requirement: 'FIX_ALL_FAILING_TESTS_FIRST',
    documentation: 'DOCUMENT_ROOT_CAUSE_AND_SOLUTION',
    nextStep: 'RERUN_FULL_TEST_SUITE'
  },

  // ONLY proceed when:
  proceedConditions: [
    '✅ All tests green/passing',
    '✅ Code coverage meets threshold',
    '✅ No console errors in browser',
    '✅ No TypeScript errors',
    '✅ Manual testing completed'
  ]
};
```

---

## **🔬 MICRO/NANO TASK TESTING REQUIREMENTS**

### **Every Small Task Testing Pattern**

```typescript
// MICRO TASK (30min - 2hrs): Quick validation required
const microTaskTesting = {
  beforeNext: [
    '🔍 Unit test added/updated',
    '🖥️ Manual browser test completed',
    '📋 Function works as specified',
    '🚨 No new console errors',
    '📝 Test results documented'
  ],
  
  testingTime: '10-15 minutes',
  passCriteria: 'Feature works + no regressions',
  
  example: `
    // MICRO TASK: Add loading state to button
    // TESTS REQUIRED:
    test('button shows spinner when loading', () => {
      render(<Button loading={true} />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
    
    // MANUAL TEST:
    ✅ Click button → spinner appears
    ✅ Loading completes → spinner disappears  
    ✅ No console errors
    ✅ Responsive on mobile
  `
};

// NANO TASK (<30min): Minimal validation required  
const nanoTaskTesting = {
  beforeNext: [
    '👀 Visual inspection completed',
    '🔧 Function works as expected',
    '🚨 No breaking changes introduced'
  ],
  
  testingTime: '2-5 minutes',
  passCriteria: 'Change works + no obvious breaks',
  
  example: `
    // NANO TASK: Change button color to blue
    // TESTS REQUIRED:
    ✅ Button appears blue visually
    ✅ Hover state still works
    ✅ No CSS conflicts introduced
  `
};
```

---

## **📊 MACRO TASK COMPREHENSIVE TESTING**

### **Full Feature Testing Requirements**

```typescript
/**
 * MACRO TASK (Goal level): Comprehensive testing required
 * Examples: "Complete Cart System", "Full Checkout Flow", "Admin Dashboard"
 */

const macroTaskTesting = {
  // COMPREHENSIVE TEST SUITE REQUIRED:
  fullTestSuite: [
    '🧪 Unit Tests (95%+ coverage)',
    '🔗 Integration Tests (all API calls)',
    '🌐 End-to-End Tests (full user flow)',
    '♿ Accessibility Audit (automated + manual)',
    '📱 Cross-Device Testing (mobile/tablet/desktop)',
    '🌍 Cross-Browser Testing (Chrome/Firefox/Safari)',
    '⚡ Performance Testing (Core Web Vitals)',
    '🔒 Security Testing (auth, validation, XSS)',
    '🎨 Visual Regression Testing (screenshot comparison)',
    '💾 Data Integrity Testing (database operations)'
  ],

  testingTime: '4-8 hours for full macro task',
  passCriteria: 'ALL tests pass + user acceptance criteria met',
  
  blockingRequirements: [
    'No failing tests allowed',
    'Performance benchmarks met',
    'Accessibility compliance verified',
    'Cross-browser compatibility confirmed',
    'Security vulnerabilities addressed'
  ]
};
```

### **Macro Task Test Categories**

```typescript
// GOAL 1: Infrastructure Testing (Macro)
const infrastructureMacroTesting = {
  testCategories: [
    {
      category: 'Database Integrity',
      tests: [
        'All tables created correctly',
        'Foreign key relationships work',
        'RLS policies prevent unauthorized access',
        'Indexes improve query performance',
        'Data migrations work forward/backward'
      ]
    },
    {
      category: 'API Functionality', 
      tests: [
        'All endpoints respond correctly',
        'Authentication works across all APIs',
        'Error handling consistent',
        'Rate limiting prevents abuse',
        'Input validation prevents injection'
      ]
    },
    {
      category: 'Environment Setup',
      tests: [
        'All environment variables loaded',
        'External services connect (Stripe, Supabase)',
        'Development/staging/production configs work',
        'CI/CD pipeline executes successfully'
      ]
    }
  ]
};

// GOAL 2: Frontend Components Testing (Macro)
const frontendMacroTesting = {
  testCategories: [
    {
      category: 'Component Functionality',
      tests: [
        'All props render correctly',
        'Event handlers trigger appropriate actions',
        'State management works consistently',
        'Error boundaries catch component errors',
        'Loading states provide feedback'
      ]
    },
    {
      category: 'User Experience',
      tests: [
        'Navigation flows work intuitively', 
        'Form validation provides clear feedback',
        'Search and filtering work accurately',
        'Cart operations persist across sessions',
        'Brand theming applies consistently'
      ]
    },
    {
      category: 'Visual Design',
      tests: [
        'Responsive design works on all devices',
        'Brand colors apply correctly',
        'Typography scales appropriately',
        'Images load and display properly',
        'Animations perform smoothly'
      ]
    }
  ]
};

// GOAL 3: Backend Integration Testing (Macro)
const backendMacroTesting = {
  testCategories: [
    {
      category: 'Data Operations',
      tests: [
        'CRUD operations work for all entities',
        'Complex queries return accurate results',
        'Transactions maintain data consistency',
        'Bulk operations handle large datasets',
        'Caching improves performance'
      ]
    },
    {
      category: 'External Integrations',
      tests: [
        'Stripe payments process correctly',
        'Webhook events update database',
        'Email notifications send successfully',
        'File uploads store securely',
        'Search functionality returns relevant results'
      ]
    },
    {
      category: 'Security & Performance',
      tests: [
        'Authentication prevents unauthorized access',
        'Input sanitization prevents attacks',
        'API responses meet performance targets',
        'Database queries execute efficiently',
        'Error handling doesn\'t leak sensitive data'
      ]
    }
  ]
};
```

---

## **📋 TESTING CHECKPOINT DOCUMENTATION**

### **Required Test Result Documentation**

```typescript
/**
 * CURSOR AI MUST document test results before proceeding
 */

const testDocumentationTemplate = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING CHECKPOINT: [Task Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 DATE: [Current Date/Time]
🎯 TASK: [Specific task from implementation plan]
⏱️ TESTING TIME: [Time spent testing]

UNIT TESTS:
✅ [Test 1 name] - PASSED
✅ [Test 2 name] - PASSED  
❌ [Test 3 name] - FAILED: [Reason + fix applied]

INTEGRATION TESTS:
✅ [Integration 1] - PASSED
✅ [Integration 2] - PASSED

MANUAL TESTS:
✅ Mobile responsive (375px) - PASSED
✅ Tablet responsive (768px) - PASSED
✅ Desktop responsive (1024px+) - PASSED
✅ Chrome browser - PASSED
✅ Firefox browser - PASSED

ACCESSIBILITY TESTS:
✅ Screen reader compatible - PASSED
✅ Keyboard navigation - PASSED
✅ Color contrast WCAG AA - PASSED

PERFORMANCE TESTS:
✅ Page load < 2s - PASSED
✅ API response < 500ms - PASSED

🔍 ISSUES FOUND & RESOLVED:
- Issue 1: [Description] → Fixed by [Solution]
- Issue 2: [Description] → Fixed by [Solution]

🚦 OVERALL STATUS: ✅ PASSED - SAFE TO PROCEED
🚦 NEXT TASK: [Next task name from implementation plan]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
```

---

## **🔄 TESTING AUTOMATION RULES**

### **Automated Test Execution**

```typescript
const automatedTestingRules = {
  // RUN automatically before next task:
  automatedChecks: [
    'npm run test:unit',        // All unit tests
    'npm run test:integration', // Integration tests
    'npm run lint',            // Code quality
    'npm run type-check',      // TypeScript validation
    'npm run build',           // Build succeeds
    'npm run test:e2e'         // End-to-end (for macro tasks)
  ],

  // BLOCKING: If any command fails
  onAutomatedFailure: {
    action: 'HALT_DEVELOPMENT',
    requirement: 'FIX_ALL_ISSUES_FIRST',
    retestRequired: true,
    documentFailures: true
  },

  // Script for testing checkpoint:
  testingScript: `
    #!/bin/bash
    echo "🧪 Running testing checkpoint..."
    
    # Unit tests
    npm run test:unit || exit 1
    echo "✅ Unit tests passed"
    
    # Integration tests  
    npm run test:integration || exit 1
    echo "✅ Integration tests passed"
    
    # Build check
    npm run build || exit 1
    echo "✅ Build successful"
    
    # Type checking
    npm run type-check || exit 1
    echo "✅ TypeScript validation passed"
    
    echo "🎉 All automated tests passed! Safe to proceed."
  `
};
```

### **Manual Testing Checklist**

```typescript
const manualTestingChecklist = {
  // REQUIRED for every UI task:
  uiTesting: [
    '👆 Click all interactive elements',
    '⌨️ Test keyboard navigation',
    '📱 Test on actual mobile device',
    '🖥️ Test on actual desktop',
    '🔄 Test loading states',
    '❌ Test error states',
    '🎨 Verify brand theming works',
    '♿ Test with screen reader'
  ],

  // REQUIRED for every API task:
  apiTesting: [
    '📨 Test with valid inputs',
    '⚠️ Test with invalid inputs',
    '🔒 Test authentication required',
    '💾 Verify database changes',
    '📊 Check response format',
    '⏱️ Measure response time',
    '🚫 Test error scenarios'
  ],

  // DOCUMENTATION: Record results
  recordResults: 'Document all manual test results in testing checkpoint'
};
```

---

## **🎯 MACRO TASK ACCEPTANCE CRITERIA**

### **User Acceptance Testing Requirements**

```typescript
const macroTaskAcceptanceCriteria = {
  // GOAL 1: Complete Cart System
  cartSystemAcceptance: {
    userStories: [
      '✅ User can add products to cart',
      '✅ User can view cart contents', 
      '✅ User can update quantities',
      '✅ User can remove items',
      '✅ Cart persists across sessions',
      '✅ Cart shows accurate totals',
      '✅ Cart works on all devices'
    ],
    technicalRequirements: [
      '✅ All cart API endpoints work',
      '✅ Database operations are atomic',
      '✅ Error handling is comprehensive',
      '✅ Performance meets benchmarks',
      '✅ Security prevents manipulation'
    ]
  },

  // GOAL 2: Complete Checkout Flow
  checkoutFlowAcceptance: {
    userStories: [
      '✅ User can initiate checkout',
      '✅ User redirected to Stripe',
      '✅ Payment processes successfully',
      '✅ Order created in database',
      '✅ Inventory updated correctly',
      '✅ User sees confirmation',
      '✅ Email notification sent'
    ],
    technicalRequirements: [
      '✅ Stripe integration secure',
      '✅ Webhook handles all events',
      '✅ Database transactions atomic',
      '✅ Error recovery robust',
      '✅ Idempotency prevents duplicates'
    ]
  }
};
```

---

## **🚨 TESTING FAILURE PROTOCOLS**

### **When Tests Fail**

```typescript
const testFailureProtocol = {
  // IMMEDIATE actions when ANY test fails:
  immediateActions: [
    '🛑 STOP current development',
    '📝 Document the failure details',
    '🔍 Analyze root cause',
    '🔧 Implement fix',
    '🧪 Rerun ALL affected tests',
    '✅ Verify fix doesn\'t break anything else'
  ],

  // NEVER do this when tests fail:
  prohibitedActions: [
    '❌ Continue to next task',
    '❌ Skip the failing test',
    '❌ Comment out the test',
    '❌ Lower test expectations',
    '❌ Ignore accessibility failures',
    '❌ Defer performance fixes'
  ],

  // Root cause analysis template:
  rootCauseTemplate: `
    TESTING FAILURE ANALYSIS:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📅 FAILURE DATE: [Date/Time]
    🧪 FAILED TEST: [Test name]
    📝 FAILURE MESSAGE: [Error message]
    
    🔍 ROOT CAUSE:
    [Detailed analysis of why test failed]
    
    🔧 SOLUTION APPLIED:
    [Specific changes made to fix]
    
    🧪 VERIFICATION:
    [How the fix was tested]
    
    🛡️ PREVENTION:
    [Changes to prevent similar failures]
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `
};
```

---

**✅ COMPREHENSIVE TESTING PROGRESSION RULES:**
- [x] **No next task until ALL tests pass** (blocking rule)
- [x] **Micro task testing requirements** (10-15 min validation)
- [x] **Nano task testing requirements** (2-5 min validation)
- [x] **Macro task comprehensive testing** (4-8 hour full suite)
- [x] **Automated testing checkpoints** (scripts that must pass)
- [x] **Manual testing checklists** (UI/API validation)
- [x] **Test result documentation** (required before proceeding)
- [x] **Failure protocols** (what to do when tests fail)
- [x] **User acceptance criteria** (macro task completion)

**🎯 Cursor AI will now NEVER proceed without complete testing validation at every level!**


