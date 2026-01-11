/*
  # Add availability field to products

  1. Changes
    - Add `availability` column to `products` table with enum type
    - Default value is 'both' (available in store and online)
    - Three possible values:
      - 'store_only': Product available only in physical store
      - 'online_only': Product available only online
      - 'both': Product available both in store and online

  2. Notes
    - All existing products will default to 'both'
    - Field is required (NOT NULL)
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'availability'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN availability text NOT NULL DEFAULT 'both' 
    CHECK (availability IN ('store_only', 'online_only', 'both'));
  END IF;
END $$;