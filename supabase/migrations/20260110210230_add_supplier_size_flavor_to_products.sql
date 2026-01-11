/*
  # Add Supplier, Size, and Flavor fields to Products

  1. Schema Changes
    - Add `supplier_id` column to products (FK to contacts.id, nullable)
    - Add `size` column to products (text, nullable) - for clothing products
    - Add `flavor` column to products (text, nullable) - for supplements products

  2. Indexes
    - idx_products_supplier - For supplier lookups

  3. Notes
    - supplier_id references contacts table (only contacts with type='fornitore' should be used)
    - size field is intended for products in "Abbigliamento" category
    - flavor field is intended for products in "Integratori" category
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'supplier_id'
  ) THEN
    ALTER TABLE products ADD COLUMN supplier_id uuid REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'size'
  ) THEN
    ALTER TABLE products ADD COLUMN size text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'flavor'
  ) THEN
    ALTER TABLE products ADD COLUMN flavor text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
