/*
  # Fix user profiles RLS policies

  1. Changes
    - Remove conflicting RLS policies for user_profiles table
    - Add simplified RLS policies that properly handle all cases
    
  2. Security
    - Enable RLS on user_profiles table
    - Add policy for public profile viewing
    - Add policy for users to manage their own profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;

-- Create new simplified policies
CREATE POLICY "Public profiles are viewable by everyone"
ON public.user_profiles
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage their own profile"
ON public.user_profiles
FOR ALL
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);