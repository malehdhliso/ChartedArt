/*
  # Fix Profiles Table RLS Policies

  1. Changes
    - Drop existing RLS policies on profiles table
    - Create new RLS policies that allow:
      - Users to create their own profile during signup
      - Users to read and update their own profile
      - Service role to manage all profiles

  2. Security
    - Enable RLS on profiles table
    - Add policies for insert, select, and update operations
    - Ensure users can only access their own data
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);