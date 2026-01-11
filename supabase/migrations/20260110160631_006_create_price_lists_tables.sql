/*
  # Create Price Lists Tables
  
  1. New Tables
    - `price_lists`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, nullable)
      - `is_active` (boolean, default true)
      - `is_default` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `price_list_items`
      - `id` (uuid, primary key)
      - `price_list_id` (uuid, FK to price_lists.id)
      - `product_id` (uuid, FK to products.id)
      - `custom_price` (decimal, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - UNIQUE constraint on (price_list_id, product_id)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for anon to perform all operations
  
  3. Default Data
    - 'Listino Standard' (active, default)
*/

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

CREATE POLICY "Allow anon to select price_lists"
  ON price_lists FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert price_lists"
  ON price_lists FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update price_lists"
  ON price_lists FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete price_lists"
  ON price_lists FOR DELETE TO anon USING (true);

CREATE TABLE IF NOT EXISTS price_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id uuid NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  custom_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(price_list_id, product_id)
);

ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select price_list_items"
  ON price_list_items FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert price_list_items"
  ON price_list_items FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update price_list_items"
  ON price_list_items FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete price_list_items"
  ON price_list_items FOR DELETE TO anon USING (true);

INSERT INTO price_lists (name, is_active, is_default)
VALUES ('Listino Standard', true, true)
ON CONFLICT DO NOTHING;