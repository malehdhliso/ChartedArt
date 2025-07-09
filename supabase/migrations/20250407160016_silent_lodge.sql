/*
  # Add Additional Profile Fields

  1. Changes
    - Add phone_number field
    - Add date_of_birth field
    - Add bio field
    - Add preferences field (JSONB)
    - Add social_links field (JSONB)

  2. Notes
    - All new fields are optional
    - preferences stores notification and communication preferences
    - social_links stores social media profile URLs
*/

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN phone_number TEXT,
ADD COLUMN date_of_birth DATE,
ADD COLUMN bio TEXT,
ADD COLUMN preferences JSONB DEFAULT jsonb_build_object(
  'email_notifications', true,
  'sms_notifications', true,
  'marketing_emails', true
),
ADD COLUMN social_links JSONB DEFAULT jsonb_build_object(
  'facebook', '',
  'instagram', '',
  'twitter', ''
);

-- Add validation for phone number format (South African format)
ALTER TABLE profiles
ADD CONSTRAINT phone_number_format CHECK (
  phone_number IS NULL OR 
  phone_number ~ '^(\+27|0)[1-9][0-9]{8}$'
);

-- Add validation for date_of_birth (must be at least 13 years old)
ALTER TABLE profiles
ADD CONSTRAINT date_of_birth_minimum_age CHECK (
  date_of_birth IS NULL OR 
  date_of_birth <= CURRENT_DATE - INTERVAL '13 years'
);

-- Add validation for bio length
ALTER TABLE profiles
ADD CONSTRAINT bio_length CHECK (
  bio IS NULL OR 
  length(bio) <= 500
);