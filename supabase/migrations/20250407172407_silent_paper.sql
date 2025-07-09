/*
  # Add DELETE policy for cart items

  1. Changes
    - Add DELETE policy for cart_items table
    - Ensure users can only delete items from their own cart

  2. Security
    - Verify cart ownership through carts table join
    - Maintain RLS protection
*/

-- Add DELETE policy for cart items
CREATE POLICY "Users can delete items from own cart"
ON cart_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);