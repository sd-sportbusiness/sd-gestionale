/*
  # Seed Default Users

  ## Description
  Creates the default admin and client users for the application.

  ## Users Created
  1. Admin user
    - Username: admin
    - Password: admin2024
    - Role: admin

  2. Client user
    - Username: cliente
    - Password: cliente2024
    - Role: client

  ## Security Note
  These are default credentials for initial setup.
  Passwords should be changed after first login.
*/

INSERT INTO users (username, password_hash, role)
VALUES 
  ('admin', 'admin2024', 'admin'),
  ('cliente', 'cliente2024', 'client')
ON CONFLICT (username) DO NOTHING;