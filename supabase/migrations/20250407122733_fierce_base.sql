/*
  # Add insert policy for profiles table

  1. Security Changes
    - Add RLS policy to allow users to insert their own profile
    - Policy ensures users can only create a profile with their own ID and email
    
  2. Notes
    - This policy is essential for the signup flow to work correctly
    - Uses auth.uid() to verify user ownership
    - Uses auth.email() to ensure email matches
*/

CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND 
    auth.email() = email
  );