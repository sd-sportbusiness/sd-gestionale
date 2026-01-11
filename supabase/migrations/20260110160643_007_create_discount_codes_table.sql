/*
  # Create Discount Codes Table
  
  1. New Tables
    - `discount_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique, not null)
      - `type` (text - 'percentage' or 'fixed')
      - `value` (decimal, not null)
      - `applies_to` (text - 'cart' or 'product')
      - `expiry_date` (timestamptz, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `discount_codes` table
    - Add policies for anon to perform all operations
*/

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

CREATE POLICY "Allow anon to select discount_codes"
  ON discount_codes FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert discount_codes"
  ON discount_codes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update discount_codes"
  ON discount_codes FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete discount_codes"
  ON discount_codes FOR DELETE TO anon USING (true);