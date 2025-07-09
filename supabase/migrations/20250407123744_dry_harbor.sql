/*
  # Add Product Policies

  1. Changes
    - Add RLS policies for products table to allow:
      - Public read access
      - Authenticated users to create products with validation
  
  2. Security
    - Enable RLS on products table
    - Add policies for product access control
*/

-- Enable RLS for products if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view products" ON products;
  DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
END $$;

-- Create new policies
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    size IN ('A4', 'A3', 'A2', 'A1', 'A0') AND
    frame_type IN ('none', 'standard', 'premium') AND
    base_price > 0
  );