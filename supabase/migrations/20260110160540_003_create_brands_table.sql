/*
  # Create Brands Table
  
  1. New Tables
    - `brands`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `brands` table
    - Add policies for anon to perform all operations
*/

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select brands"
  ON brands FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert brands"
  ON brands FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update brands"
  ON brands FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete brands"
  ON brands FOR DELETE TO anon USING (true);