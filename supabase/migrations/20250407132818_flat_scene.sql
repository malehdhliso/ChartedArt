/*
  # Fix profiles table RLS policies

  1. Changes
    - Add proper RLS policies for profile creation during signup
    - Ensure authenticated users can only create their own profile
    - Maintain existing policies for profile management

  2. Security
    - Enable RLS on profiles table (if not already enabled)
    - Add policy for profile creation during signup
    - Preserve existing policies for profile management
*/

-- First, ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Allow profile creation during signup'
  ) THEN
    DROP POLICY "Allow profile creation during signup" ON profiles;
  END IF;
END $$;

-- Create new insert policy that properly handles profile creation
CREATE POLICY "Allow profile creation during signup" ON profiles
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = id AND 
  auth.jwt()->>'email' = email
);