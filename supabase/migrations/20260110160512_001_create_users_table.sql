/*
  # Create Users Table
  
  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique, not null)
      - `password_hash` (text, not null)
      - `role` (text, not null - 'admin' or 'client')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `users` table
    - Add policy for anon to read users
  
  3. Default Data
    - Admin user: admin/admin2024
    - Client user: cliente/cliente2024
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'client')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to read users"
  ON users
  FOR SELECT
  TO anon
  USING (true);

INSERT INTO users (username, password_hash, role)
VALUES 
  ('admin', 'admin2024', 'admin'),
  ('cliente', 'cliente2024', 'client')
ON CONFLICT (username) DO NOTHING;