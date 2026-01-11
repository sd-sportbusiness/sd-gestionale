/*
  # Add Brands Table and Update Products

  ## Description
  - Creates a new brands table for managing product brands
  - Adds image_data column to products for base64 image storage
  - Adds brand_id foreign key to products table

  ## Tables Created
  1. `brands`
    - `id` (uuid, primary key)
    - `name` (text, unique, required)
    - `created_at` (timestamp)

  ## Modified Tables
  1. `products`
    - Added `image_data` (text) - for base64 encoded images
    - Added `brand_id` (uuid, foreign key to brands)

  ## Security
  - RLS enabled on brands table
  - Policies allow all operations for the custom auth system
*/

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policies for brands
CREATE POLICY "Allow reading brands"
  ON brands FOR SELECT
  USING (true);

CREATE POLICY "Allow inserting brands"
  ON brands FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updating brands"
  ON brands FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow deleting brands"
  ON brands FOR DELETE
  USING (true);

-- Add image_data column to products (for base64 images)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_data'
  ) THEN
    ALTER TABLE products ADD COLUMN image_data text;
  END IF;
END $$;

-- Add brand_id column to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'brand_id'
  ) THEN
    ALTER TABLE products ADD COLUMN brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for brand_id
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);