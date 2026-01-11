/*
  # Create Sales Tables
  
  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `sale_number` (serial)
      - `customer_id` (uuid, FK to contacts.id)
      - `price_list_id` (uuid, FK to price_lists.id)
      - `subtotal` (decimal, not null)
      - `discount_code` (text, nullable - legacy)
      - `discount_amount` (decimal - legacy)
      - `cart_discounts` (jsonb - array of multiple discounts)
      - `total` (decimal, not null)
      - `created_at` (timestamptz)
    
    - `sale_items`
      - `id` (uuid, primary key)
      - `sale_id` (uuid, FK to sales.id)
      - `product_id` (uuid, FK to products.id)
      - `product_name` (text, not null)
      - `product_barcode` (text, nullable)
      - `quantity` (integer, not null)
      - `unit_price` (decimal, not null)
      - `subtotal` (decimal, not null)
      - `discounts` (jsonb - array of discounts per product)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for anon to perform all operations
  
  3. Indexes
    - idx_sales_customer
    - idx_sales_created
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number serial,
  customer_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  price_list_id uuid REFERENCES price_lists(id) ON DELETE SET NULL,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  discount_code text,
  discount_amount decimal(10,2) DEFAULT 0,
  cart_discounts jsonb DEFAULT '[]'::jsonb,
  total decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select sales"
  ON sales FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert sales"
  ON sales FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update sales"
  ON sales FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete sales"
  ON sales FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);

CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_barcode text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  discounts jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select sale_items"
  ON sale_items FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert sale_items"
  ON sale_items FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update sale_items"
  ON sale_items FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete sale_items"
  ON sale_items FOR DELETE TO anon USING (true);