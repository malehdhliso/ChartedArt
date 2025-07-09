/*
  # Add Admin Users Table and Policies

  1. New Table
    - `admin_users` - Stores authorized admin user IDs
      - `user_id` (uuid, primary key, references auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for service role access
    - Add policy for public read access
*/

-- Create admin_users table
CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Admins can manage admin users"
ON admin_users
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anyone can read admin users"
ON admin_users
FOR SELECT
TO public
USING (true);