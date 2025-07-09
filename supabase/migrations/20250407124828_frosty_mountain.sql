/*
  # Add INSERT policy for order_items table

  1. Changes
    - Add INSERT policy for order_items table to allow authenticated users to insert new order items
    - Policy ensures users can only insert order items for orders they own

  2. Security
    - New RLS policy for INSERT operations
    - Validates order ownership through orders table join
*/

CREATE POLICY "Users can insert own order items"
ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);