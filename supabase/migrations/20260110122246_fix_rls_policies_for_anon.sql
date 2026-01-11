/*
  # Fix RLS Policies for Anonymous Access

  ## Description
  Ensures all RLS policies explicitly allow the anon role to perform
  CRUD operations, fixing category and discount code creation bugs.

  ## Changes
  - Recreates policies with explicit TO anon role
  - Adds missing SELECT policies for categories and discount_codes
  - Adds policies for brands table
*/

-- Fix categories policies
DROP POLICY IF EXISTS "Authenticated users can read categories" ON categories;
DROP POLICY IF EXISTS "Allow inserting categories" ON categories;
DROP POLICY IF EXISTS "Allow updating categories" ON categories;
DROP POLICY IF EXISTS "Allow deleting categories" ON categories;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert categories"
  ON categories FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update categories"
  ON categories FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete categories"
  ON categories FOR DELETE
  TO anon
  USING (true);

-- Fix discount_codes policies
DROP POLICY IF EXISTS "Authenticated users can read discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Allow inserting discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Allow updating discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Allow deleting discount codes" ON discount_codes;

CREATE POLICY "Anyone can read discount codes"
  ON discount_codes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert discount codes"
  ON discount_codes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update discount codes"
  ON discount_codes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete discount codes"
  ON discount_codes FOR DELETE
  TO anon
  USING (true);

-- Add brands table policies
DROP POLICY IF EXISTS "Anyone can read brands" ON brands;
DROP POLICY IF EXISTS "Anyone can insert brands" ON brands;
DROP POLICY IF EXISTS "Anyone can update brands" ON brands;
DROP POLICY IF EXISTS "Anyone can delete brands" ON brands;

CREATE POLICY "Anyone can read brands"
  ON brands FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert brands"
  ON brands FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update brands"
  ON brands FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete brands"
  ON brands FOR DELETE
  TO anon
  USING (true);

-- Fix products policies to include anon
DROP POLICY IF EXISTS "Authenticated users can read products" ON products;
DROP POLICY IF EXISTS "Allow inserting products" ON products;
DROP POLICY IF EXISTS "Allow updating products" ON products;
DROP POLICY IF EXISTS "Allow deleting products" ON products;

CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert products"
  ON products FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update products"
  ON products FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete products"
  ON products FOR DELETE
  TO anon
  USING (true);

-- Fix all other tables for anon access
DROP POLICY IF EXISTS "Allow reading users for login" ON users;
CREATE POLICY "Anon can read users"
  ON users FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow reading contacts" ON contacts;
DROP POLICY IF EXISTS "Allow inserting contacts" ON contacts;
DROP POLICY IF EXISTS "Allow updating contacts" ON contacts;
DROP POLICY IF EXISTS "Allow deleting contacts" ON contacts;

CREATE POLICY "Anon can read contacts"
  ON contacts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert contacts"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update contacts"
  ON contacts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete contacts"
  ON contacts FOR DELETE
  TO anon
  USING (true);

-- Fix price_lists
DROP POLICY IF EXISTS "Authenticated users can read price lists" ON price_lists;
DROP POLICY IF EXISTS "Allow inserting price lists" ON price_lists;
DROP POLICY IF EXISTS "Allow updating price lists" ON price_lists;
DROP POLICY IF EXISTS "Allow deleting price lists" ON price_lists;

CREATE POLICY "Anon can read price lists"
  ON price_lists FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert price lists"
  ON price_lists FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update price lists"
  ON price_lists FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete price lists"
  ON price_lists FOR DELETE
  TO anon
  USING (true);

-- Fix price_list_items
DROP POLICY IF EXISTS "Authenticated users can read price list items" ON price_list_items;
DROP POLICY IF EXISTS "Allow inserting price list items" ON price_list_items;
DROP POLICY IF EXISTS "Allow updating price list items" ON price_list_items;
DROP POLICY IF EXISTS "Allow deleting price list items" ON price_list_items;

CREATE POLICY "Anon can read price list items"
  ON price_list_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert price list items"
  ON price_list_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update price list items"
  ON price_list_items FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete price list items"
  ON price_list_items FOR DELETE
  TO anon
  USING (true);

-- Fix sales
DROP POLICY IF EXISTS "Allow reading sales" ON sales;
DROP POLICY IF EXISTS "Allow inserting sales" ON sales;
DROP POLICY IF EXISTS "Allow updating sales" ON sales;

CREATE POLICY "Anon can read sales"
  ON sales FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert sales"
  ON sales FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update sales"
  ON sales FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Fix sale_items
DROP POLICY IF EXISTS "Allow reading sale items" ON sale_items;
DROP POLICY IF EXISTS "Allow inserting sale items" ON sale_items;

CREATE POLICY "Anon can read sale items"
  ON sale_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert sale items"
  ON sale_items FOR INSERT
  TO anon
  WITH CHECK (true);

-- Fix stock_loads
DROP POLICY IF EXISTS "Allow reading stock loads" ON stock_loads;
DROP POLICY IF EXISTS "Allow inserting stock loads" ON stock_loads;

CREATE POLICY "Anon can read stock loads"
  ON stock_loads FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert stock loads"
  ON stock_loads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Fix stock_load_items
DROP POLICY IF EXISTS "Allow reading stock load items" ON stock_load_items;
DROP POLICY IF EXISTS "Allow inserting stock load items" ON stock_load_items;

CREATE POLICY "Anon can read stock load items"
  ON stock_load_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert stock load items"
  ON stock_load_items FOR INSERT
  TO anon
  WITH CHECK (true);

-- Fix company_settings
DROP POLICY IF EXISTS "Authenticated users can read company settings" ON company_settings;
DROP POLICY IF EXISTS "Allow inserting company settings" ON company_settings;
DROP POLICY IF EXISTS "Allow updating company settings" ON company_settings;

CREATE POLICY "Anon can read company settings"
  ON company_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert company settings"
  ON company_settings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update company settings"
  ON company_settings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
