/*
  # Initial Schema Setup for Paint-by-Numbers E-commerce Platform

  1. Tables Created
    - profiles (user profiles)
    - products (product configurations)
    - orders (order details)
    - order_items (items within orders)
    - testimonials (user testimonials)
    - events (art events)
    - blog_posts (blog content)
    - gallery_submissions (user artwork)

  2. Security
    - RLS enabled on all tables
    - Policies set for appropriate access control

  3. Extensions
    - Enable UUID generation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  avatar_url text,
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table (for storing product configurations)
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  size text NOT NULL CHECK (size IN ('A4', 'A3', 'A2', 'A1', 'A0')),
  frame_type text NOT NULL CHECK (frame_type IN ('none', 'standard', 'premium')),
  base_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  image_url text NOT NULL,
  quantity integer DEFAULT 1,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Testimonials table
CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  event_date timestamptz NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id),
  status text NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  featured_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gallery submissions table
CREATE TABLE gallery_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  order_item_id uuid REFERENCES order_items(id),
  image_url text NOT NULL,
  description text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Products: Anyone can read products
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO public
  USING (true);

-- Orders: Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Order Items: Users can read their own order items
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Testimonials: Anyone can read approved testimonials
CREATE POLICY "Anyone can read approved testimonials"
  ON testimonials FOR SELECT
  TO public
  USING (is_approved = true);

-- Events: Anyone can read approved events
CREATE POLICY "Anyone can read approved events"
  ON events FOR SELECT
  TO public
  USING (is_approved = true);

-- Blog Posts: Anyone can read published posts
CREATE POLICY "Anyone can read published posts"
  ON blog_posts FOR SELECT
  TO public
  USING (status = 'published');

-- Gallery: Anyone can read approved submissions
CREATE POLICY "Anyone can read approved gallery submissions"
  ON gallery_submissions FOR SELECT
  TO public
  USING (is_approved = true);

-- Insert policies for authenticated users
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can submit to gallery"
  ON gallery_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);