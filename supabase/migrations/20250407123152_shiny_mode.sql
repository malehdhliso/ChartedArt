/*
  # Create Storage Bucket for Image Uploads

  1. New Storage Bucket
    - Name: 'uploads'
    - Public access enabled
    - File size limit: 10MB
    - Allowed mime types: image/jpeg, image/png

  2. Security
    - RLS policies for authenticated users
    - Public read access for all users
*/

-- Create bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('uploads', 'uploads', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Set bucket size limit to 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png']
WHERE id = 'uploads';

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the storage bucket
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can download files" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'uploads' AND
      owner = auth.uid()
    );

  CREATE POLICY "Authenticated users can update their own files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'uploads' AND
      owner = auth.uid()
    );

  CREATE POLICY "Authenticated users can delete their own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'uploads' AND
      owner = auth.uid()
    );

  CREATE POLICY "Anyone can download files"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'uploads');
END $$;