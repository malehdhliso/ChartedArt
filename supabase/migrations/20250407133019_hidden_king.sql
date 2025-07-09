/*
  # Update profiles table RLS policies

  1. Changes
    - Safely drop and recreate policies using DO blocks
    - Ensure no duplicate policies are created
    - Maintain all necessary security policies

  2. Security
    - Enable RLS
    - Service role full access
    - User profile management
    - Secure signup flow
*/

-- First ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Safely handle policy creation/updates
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
  DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  
  -- Recreate all policies
  -- Service role full access
  CREATE POLICY "Service role can manage all profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

  -- Allow profile creation during signup
  CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND 
    auth.jwt()->>'email' = email
  );

  -- Users can read own profile
  CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

  -- Users can update own profile
  CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
END
$$;