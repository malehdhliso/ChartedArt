/*
  # Create Competitions and Community Challenges Tables

  1. New Tables
    - `competitions` - Stores competition information
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `theme` (text)
      - `start_date` (timestamptz, not null)
      - `end_date` (timestamptz, not null)
      - `prize_details` (text)
      - `is_active` (boolean, default: true)
      - `created_at` (timestamptz, default: now())

    - `competition_submissions` - Links gallery submissions to competitions
      - `id` (uuid, primary key)
      - `competition_id` (uuid, references competitions)
      - `submission_id` (uuid, references gallery_submissions)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz, default: now())

    - `votes` - Tracks user votes for submissions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `submission_id` (uuid, references competition_submissions)
      - `created_at` (timestamptz, default: now())

    - `user_awards` - Stores badges and awards
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `award_name` (text, not null)
      - `award_description` (text)
      - `competition_id` (uuid, references competitions)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  theme text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  prize_details text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create competition_submissions table
CREATE TABLE IF NOT EXISTS competition_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id uuid REFERENCES competitions(id) NOT NULL,
  submission_id uuid REFERENCES gallery_submissions(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(competition_id, submission_id)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  submission_id uuid REFERENCES competition_submissions(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, submission_id)
);

-- Create user_awards table
CREATE TABLE IF NOT EXISTS user_awards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  award_name text NOT NULL,
  award_description text,
  competition_id uuid REFERENCES competitions(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for competitions
CREATE POLICY "Anyone can view competitions"
  ON competitions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage competitions"
  ON competitions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for competition_submissions
CREATE POLICY "Anyone can view competition submissions"
  ON competition_submissions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can submit to competitions"
  ON competition_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON competition_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can cast votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_awards
CREATE POLICY "Anyone can view awards"
  ON user_awards FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view own awards"
  ON user_awards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage awards"
  ON user_awards FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitions_active ON competitions(is_active);
CREATE INDEX IF NOT EXISTS idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_competition_submissions_competition ON competition_submissions(competition_id);
CREATE INDEX IF NOT EXISTS idx_votes_submission ON votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_user_awards_user ON user_awards(user_id);