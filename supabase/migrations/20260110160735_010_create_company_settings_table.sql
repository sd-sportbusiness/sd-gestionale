/*
  # Create Company Settings Table
  
  1. New Tables
    - `company_settings`
      - `id` (uuid, primary key)
      - `company_name` (text, default 'SD Benessere & Sport')
      - `tagline` (text, default 'Since 1984')
      - `website` (text, default 'www.sdsportbusiness.it')
      - `address` (text, nullable)
      - `phone` (text, nullable)
      - `email` (text, nullable)
      - `vat` (text, nullable)
      - `logo_url` (text, nullable)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `company_settings` table
    - Add policies for anon to read and update
  
  3. Default Data
    - SD Benessere & Sport, Since 1984, www.sdsportbusiness.it
*/

CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT 'SD Benessere & Sport',
  tagline text DEFAULT 'Since 1984',
  website text DEFAULT 'www.sdsportbusiness.it',
  address text,
  phone text,
  email text,
  vat text,
  logo_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to select company_settings"
  ON company_settings FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert company_settings"
  ON company_settings FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update company_settings"
  ON company_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete company_settings"
  ON company_settings FOR DELETE TO anon USING (true);

INSERT INTO company_settings (company_name, tagline, website)
VALUES ('SD Benessere & Sport', 'Since 1984', 'www.sdsportbusiness.it')
ON CONFLICT DO NOTHING;