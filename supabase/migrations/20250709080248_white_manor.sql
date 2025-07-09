/*
  # Create Art for Action Tables

  1. New Tables
    - `initiatives` - Stores information about each cause/initiative
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `organizer_id` (uuid, references profiles)
      - `related_event_id` (uuid, references events, nullable)
      - `status` (text, default: 'active')
      - `created_at` (timestamptz, default: now())
    
    - `collage_submissions` - Individual art pieces for initiatives
      - `id` (uuid, primary key)
      - `initiative_id` (uuid, references initiatives)
      - `user_id` (uuid, references profiles)
      - `image_url` (text, not null)
      - `description` (text)
      - `is_approved` (boolean, default: false)
      - `created_at` (timestamptz, default: now())
    
    - `event_rsvps` - Manage attendance for assembly events
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references profiles)
      - `status` (text, e.g., 'attending', 'interested')
      - `created_at` (timestamptz, default: now())
      - UNIQUE constraint on (event_id, user_id)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
*/

-- Create initiatives table
CREATE TABLE initiatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  organizer_id uuid REFERENCES profiles(id) NOT NULL,
  related_event_id uuid REFERENCES events(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create collage_submissions table
CREATE TABLE collage_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid REFERENCES initiatives(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  image_url text NOT NULL,
  description text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create event_rsvps table
CREATE TABLE event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  status text DEFAULT 'attending' CHECK (status IN ('attending', 'interested', 'not_attending')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE collage_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for initiatives
CREATE POLICY "Anyone can view active initiatives"
  ON initiatives FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Authenticated users can create initiatives"
  ON initiatives FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their initiatives"
  ON initiatives FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- RLS Policies for collage_submissions
CREATE POLICY "Anyone can view approved collage submissions"
  ON collage_submissions FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Users can view their own collage submissions"
  ON collage_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit collages"
  ON collage_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collage submissions"
  ON collage_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for event_rsvps
CREATE POLICY "Users can view RSVPs for events"
  ON event_rsvps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own RSVPs"
  ON event_rsvps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVPs"
  ON event_rsvps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVPs"
  ON event_rsvps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_organizer ON initiatives(organizer_id);
CREATE INDEX idx_collage_submissions_initiative ON collage_submissions(initiative_id);
CREATE INDEX idx_collage_submissions_user ON collage_submissions(user_id);
CREATE INDEX idx_collage_submissions_approved ON collage_submissions(is_approved);
CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user ON event_rsvps(user_id);