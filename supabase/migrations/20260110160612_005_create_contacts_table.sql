/*
  # Create Contacts Table
  
  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `type` (text - 'cliente' or 'fornitore')
      - `company_name` (text, not null)
      - `vat` (text, nullable - P.IVA)
      - `fiscal_code` (text, nullable - Codice Fiscale)
      - `address` (text, nullable)
      - `city` (text, nullable)
      - `postal_code` (text, nullable)
      - `province` (text, nullable)
      - `phone` (text, nullable)
      - `mobile` (text, nullable)
      - `email` (text, nullable)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `contacts` table
    - Add policies for anon to perform all operations
  
  3. Indexes
    - idx_contacts_type
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('cliente', 'fornitore')),
  company_name text NOT NULL,
  vat text,
  fiscal_code text,
  address text,
  city text,
  postal_code text,
  province text,
  phone text,
  mobile text,
  email text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select contacts"
  ON contacts FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert contacts"
  ON contacts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update contacts"
  ON contacts FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete contacts"
  ON contacts FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);