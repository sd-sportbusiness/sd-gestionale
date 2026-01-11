/*
  # Add Typologies (Tipologie) Table

  1. New Tables
    - `typologies`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null) - Typology name
      - `created_at` (timestamptz)

  2. Schema Changes
    - Add `typology_id` column to `products` table (FK to typologies.id, nullable)

  3. Security
    - Enable RLS on typologies table
    - Add policies for anon to perform all operations

  4. Indexes
    - idx_products_typology - For typology lookups
*/

CREATE TABLE IF NOT EXISTS typologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE typologies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select typologies"
  ON typologies FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert typologies"
  ON typologies FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update typologies"
  ON typologies FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete typologies"
  ON typologies FOR DELETE TO anon USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'typology_id'
  ) THEN
    ALTER TABLE products ADD COLUMN typology_id uuid REFERENCES typologies(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_typology ON products(typology_id);
