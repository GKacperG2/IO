/*
  # Add user profile fields and avatar support

  1. Changes
    - Add new columns to user_profiles table for additional user information
    - Add avatar_url column for profile pictures
    - Add university, major, and study_start_year fields
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS university text,
ADD COLUMN IF NOT EXISTS major text,
ADD COLUMN IF NOT EXISTS study_start_year smallint;

-- Add check constraint for study_start_year
ALTER TABLE user_profiles
ADD CONSTRAINT study_start_year_check
CHECK (study_start_year >= 2000 AND study_start_year <= extract(year from current_date));