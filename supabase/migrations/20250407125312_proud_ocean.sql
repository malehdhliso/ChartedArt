/*
  # Add payment reference to orders table

  1. Changes
    - Add payment_reference column to orders table
*/

ALTER TABLE orders
ADD COLUMN payment_reference text;