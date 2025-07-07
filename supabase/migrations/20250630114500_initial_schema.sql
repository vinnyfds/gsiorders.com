-- ENUM types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'rep');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'cancelled');
CREATE TYPE quote_status AS ENUM ('requested', 'approved', 'rejected');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Brands table
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  theme_config JSONB
);

-- Products table
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

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total NUMERIC(10,2),
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER,
  price NUMERIC(10,2)
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Wishlist
CREATE TABLE wishlist_items (
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  PRIMARY KEY (user_id, product_id)
);
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);

-- Reviews
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

-- B2B Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  items JSONB,
  status quote_status DEFAULT 'requested',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shipping rules
CREATE TABLE shipping_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  method TEXT NOT NULL,
  rate NUMERIC(10,2) NOT NULL
);

-- Discount codes
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2),
  usage_limit INTEGER,
  expiration TIMESTAMP
);

-- Webhook logs
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  received_at TIMESTAMP DEFAULT NOW()
);

-- Email logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_address TEXT,
  template TEXT,
  status TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own user row
CREATE POLICY "Users can read themselves"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own user row
CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (auth.uid() = id);


-- Users can read their own orders
CREATE POLICY "Users can read their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own reviews
CREATE POLICY "Users can manage their own reviews"
  ON reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users manage their wishlist
CREATE POLICY "Users manage their wishlist"
  ON wishlist_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public can view products
CREATE POLICY "Public product access"
  ON products FOR SELECT
  USING (true);
