/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing policies
    - Create new policies that allow:
      - Profile creation during signup
      - Profile reading/updating by authenticated users
    - Add policy for service role to manage profiles

  2. Security
    - Maintains RLS protection
    - Ensures users can only access their own profiles
    - Allows initial profile creation during signup
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage all profiles"
ON profiles FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation during signup"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);