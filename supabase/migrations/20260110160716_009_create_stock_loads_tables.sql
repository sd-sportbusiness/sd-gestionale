/*
  # Create Stock Loads Tables
  
  1. New Tables
    - `stock_loads`
      - `id` (uuid, primary key)
      - `load_number` (serial)
      - `total_items` (integer, not null)
      - `total_pieces` (integer, not null)
      - `total_value` (decimal, not null)
      - `created_at` (timestamptz)
    
    - `stock_load_items`
      - `id` (uuid, primary key)
      - `load_id` (uuid, FK to stock_loads.id)
      - `product_id` (uuid, FK to products.id)
      - `product_name` (text, not null)
      - `product_barcode` (text, nullable)
      - `quantity` (integer, not null)
      - `unit_cost` (decimal, not null)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for anon to perform all operations
  
  3. Indexes
    - idx_stock_loads_created
*/

CREATE TABLE IF NOT EXISTS stock_loads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_number serial,
  total_items integer NOT NULL DEFAULT 0,
  total_pieces integer NOT NULL DEFAULT 0,
  total_value decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_loads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select stock_loads"
  ON stock_loads FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert stock_loads"
  ON stock_loads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update stock_loads"
  ON stock_loads FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete stock_loads"
  ON stock_loads FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_stock_loads_created ON stock_loads(created_at);

CREATE TABLE IF NOT EXISTS stock_load_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id uuid NOT NULL REFERENCES stock_loads(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_barcode text,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_load_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select stock_load_items"
  ON stock_load_items FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert stock_load_items"
  ON stock_load_items FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update stock_load_items"
  ON stock_load_items FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete stock_load_items"
  ON stock_load_items FOR DELETE TO anon USING (true);