/*
  # Create Products Table
  
  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `barcode` (text, unique, nullable)
      - `brand` (text, nullable - legacy field)
      - `brand_id` (uuid, FK to brands.id)
      - `name` (text, not null)
      - `description` (text, nullable)
      - `category_id` (uuid, FK to categories.id)
      - `purchase_price` (decimal)
      - `sale_price` (decimal)
      - `stock` (integer)
      - `min_stock` (integer)
      - `availability` (text - 'store_only', 'online_only', 'both')
      - `online_link` (text, nullable)
      - `image_url` (text, nullable)
      - `image_data` (text, nullable - base64)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `products` table
    - Add policies for anon to perform all operations
  
  3. Indexes
    - idx_products_barcode
    - idx_products_category
    - idx_products_stock
    - idx_products_brand
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE,
  brand text,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  purchase_price decimal(10,2) DEFAULT 0,
  sale_price decimal(10,2) DEFAULT 0,
  stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  availability text NOT NULL DEFAULT 'both' CHECK (availability IN ('store_only', 'online_only', 'both')),
  online_link text,
  image_url text,
  image_data text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select products"
  ON products FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert products"
  ON products FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update products"
  ON products FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete products"
  ON products FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);