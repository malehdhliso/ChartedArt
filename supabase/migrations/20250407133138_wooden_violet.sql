/*
  # Add missing profiles table policies

  1. Changes
    - Add missing INSERT policy for authenticated users
    - Ensure proper email verification during signup
    - Maintain existing security policies

  2. Security
    - Verify user authentication
    - Validate email matches JWT claim
    - Maintain RLS enforcement
*/

-- First ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Safely handle policy creation
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  
  -- Create new insert policy
  CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND 
    auth.jwt()->>'email' = email
  );
END
$$;