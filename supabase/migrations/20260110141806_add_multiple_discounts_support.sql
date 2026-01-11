/*
  # Add Multiple Discounts Support

  1. Changes
    - Add `cart_discounts` JSONB column to `sales` table to store multiple cart-level discounts
    - Add `discounts` JSONB column to `sale_items` table to store product-level discounts
    - Keep existing `discount_code` and `discount_amount` for backward compatibility

  2. Notes
    - cart_discounts will store an array of AppliedDiscount objects:
      [{ code, type, value, amount }]
    - discounts in sale_items will store the same structure for product-specific discounts
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'cart_discounts'
  ) THEN
    ALTER TABLE sales ADD COLUMN cart_discounts jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sale_items' AND column_name = 'discounts'
  ) THEN
    ALTER TABLE sale_items ADD COLUMN discounts jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
