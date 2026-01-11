/*
  # Add online link field to products

  1. Changes
    - Add `online_link` column to `products` table
    - Field is optional (nullable) and stores URLs for online purchase
    - Used when product availability is 'online_only' or 'both'

  2. Notes
    - All existing products will have NULL value
    - Field accepts any valid URL string or NULL
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'online_link'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN online_link text;
  END IF;
END $$;