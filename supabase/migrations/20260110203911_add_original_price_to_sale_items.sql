/*
  # Add Original Price to Sale Items

  1. Changes
    - Add `original_price` column to `sale_items` table
      - Stores the product's base sale price (from product card)
      - This allows distinguishing between original price and list price on receipts
    
  2. Purpose
    - Enable receipts to show:
      - Original price (product's sale_price)
      - List price (unit_price from selected price list)
      - List discount (difference between original and list price)
      - Discount codes applied to products
      - Final price after all discounts

  3. Notes
    - Existing records will have NULL original_price
    - New sales will populate this field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sale_items' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE sale_items ADD COLUMN original_price decimal(10,2);
  END IF;
END $$;
