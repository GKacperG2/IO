/*
  # Add foreign key from ratings to user_profiles
  
  1. Changes
    - Add foreign key constraint from ratings.user_id to user_profiles.id
    
  2. Security
    - No changes to RLS policies
    
  Note: This maintains the existing foreign key to users table while adding
  the direct relationship to user_profiles for efficient joins
*/

DO $$ 
BEGIN
  -- Add foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'ratings_user_id_user_profiles_fkey'
  ) THEN
    ALTER TABLE ratings
    ADD CONSTRAINT ratings_user_id_user_profiles_fkey
    FOREIGN KEY (user_id)
    REFERENCES user_profiles (id)
    ON DELETE CASCADE;
  END IF;
END $$;