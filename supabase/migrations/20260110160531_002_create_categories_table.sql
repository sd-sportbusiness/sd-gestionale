/*
  # Create Categories Table
  
  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `categories` table
    - Add policies for anon to perform all operations
  
  3. Default Data
    - Abbigliamento, Attrezzature, Integratori, Accessori, Calzature, Elettronica
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select categories"
  ON categories FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert categories"
  ON categories FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update categories"
  ON categories FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete categories"
  ON categories FOR DELETE TO anon USING (true);

INSERT INTO categories (name)
VALUES 
  ('Abbigliamento'),
  ('Attrezzature'),
  ('Integratori'),
  ('Accessori'),
  ('Calzature'),
  ('Elettronica')
ON CONFLICT (name) DO NOTHING;