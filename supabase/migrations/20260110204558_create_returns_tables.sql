/*
  # Create Returns (Resi) Tables

  1. New Tables
    - `returns`
      - `id` (uuid, primary key)
      - `return_number` (serial, unique) - Progressive number for returns (R-0001, R-0002...)
      - `customer_id` (uuid, FK to contacts.id, nullable) - Optional customer reference
      - `reason` (text, not null) - Reason for return (required)
      - `notes` (text, nullable) - Additional notes
      - `total` (decimal, not null) - Total refund amount (negative value)
      - `created_at` (timestamptz)

    - `return_items`
      - `id` (uuid, primary key)
      - `return_id` (uuid, FK to returns.id) - Reference to parent return
      - `product_id` (uuid, FK to products.id, nullable) - Reference to product
      - `product_name` (text, not null) - Product name snapshot
      - `product_barcode` (text, nullable) - Product barcode snapshot
      - `quantity` (integer, not null) - Quantity returned
      - `unit_price` (decimal, not null) - Unit price at time of return
      - `subtotal` (decimal, not null) - Line subtotal (negative value)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for anon to perform all operations

  3. Indexes
    - idx_returns_customer - For customer lookups
    - idx_returns_created - For date filtering
    - idx_return_items_return - For fetching items by return
*/

CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number serial UNIQUE,
  customer_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  reason text NOT NULL,
  notes text,
  total decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select returns"
  ON returns FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert returns"
  ON returns FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update returns"
  ON returns FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete returns"
  ON returns FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_returns_customer ON returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_created ON returns(created_at);

CREATE TABLE IF NOT EXISTS return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_barcode text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select return_items"
  ON return_items FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert return_items"
  ON return_items FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update return_items"
  ON return_items FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete return_items"
  ON return_items FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_return_items_return ON return_items(return_id);
