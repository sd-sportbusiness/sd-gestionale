/*
  # SD Benessere & Sport - Initial Database Schema

  ## Description
  Complete database schema for the internal management system including:
  - User authentication with roles (admin/client)
  - Product inventory management
  - Contact management (customers/suppliers)
  - Price lists with custom pricing
  - Sales and discount codes
  - Stock load tracking

  ## Tables Created
  1. `users` - User accounts with role-based access
  2. `categories` - Product categories
  3. `products` - Product inventory
  4. `contacts` - Customer and supplier contacts
  5. `price_lists` - Price list definitions
  6. `price_list_items` - Custom prices per product per list
  7. `discount_codes` - Promotional discount codes
  8. `sales` - Sales transactions
  9. `sale_items` - Individual items in sales
  10. `stock_loads` - Stock load sessions
  11. `stock_load_items` - Items in stock loads
  12. `company_settings` - Company information for receipts

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated access
*/

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'client')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE,
  brand text,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  purchase_price decimal(10,2) DEFAULT 0,
  sale_price decimal(10,2) DEFAULT 0,
  stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('cliente', 'fornitore')),
  company_name text NOT NULL,
  vat text,
  fiscal_code text,
  address text,
  city text,
  postal_code text,
  province text,
  phone text,
  mobile text,
  email text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Price lists table
CREATE TABLE IF NOT EXISTS price_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read price lists"
  ON price_lists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert price lists"
  ON price_lists FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update price lists"
  ON price_lists FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete price lists"
  ON price_lists FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Price list items table
CREATE TABLE IF NOT EXISTS price_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id uuid REFERENCES price_lists(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  custom_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(price_list_id, product_id)
);

ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read price list items"
  ON price_list_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert price list items"
  ON price_list_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update price list items"
  ON price_list_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete price list items"
  ON price_list_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value decimal(10,2) NOT NULL,
  applies_to text NOT NULL CHECK (applies_to IN ('cart', 'product')),
  expiry_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read discount codes"
  ON discount_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert discount codes"
  ON discount_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update discount codes"
  ON discount_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete discount codes"
  ON discount_codes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number serial,
  customer_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  price_list_id uuid REFERENCES price_lists(id) ON DELETE SET NULL,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  discount_code text,
  discount_amount decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read sales"
  ON sales FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can insert sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_barcode text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read sale items"
  ON sale_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can insert sale items"
  ON sale_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Stock loads table
CREATE TABLE IF NOT EXISTS stock_loads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_number serial,
  total_items integer NOT NULL DEFAULT 0,
  total_pieces integer NOT NULL DEFAULT 0,
  total_value decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_loads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read stock loads"
  ON stock_loads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can insert stock loads"
  ON stock_loads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Stock load items table
CREATE TABLE IF NOT EXISTS stock_load_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id uuid REFERENCES stock_loads(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_barcode text,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_load_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read stock load items"
  ON stock_load_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can insert stock load items"
  ON stock_load_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Company settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT 'SD Benessere & Sport',
  tagline text DEFAULT 'Since 1984',
  website text DEFAULT 'www.sdsportbusiness.it',
  address text,
  phone text,
  email text,
  vat text,
  logo_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read company settings"
  ON company_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert company settings"
  ON company_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update company settings"
  ON company_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Insert default categories
INSERT INTO categories (name) VALUES
  ('Abbigliamento'),
  ('Attrezzature'),
  ('Integratori'),
  ('Accessori'),
  ('Calzature'),
  ('Elettronica')
ON CONFLICT (name) DO NOTHING;

-- Insert default company settings
INSERT INTO company_settings (id, company_name, tagline, website)
VALUES (gen_random_uuid(), 'SD Benessere & Sport', 'Since 1984', 'www.sdsportbusiness.it')
ON CONFLICT DO NOTHING;

-- Insert default price list
INSERT INTO price_lists (name, description, is_active, is_default)
VALUES ('Listino Standard', 'Listino prezzi base', true, true)
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_loads_created ON stock_loads(created_at);