/*
  # Add storage policies for notes bucket

  1. Storage Policies
    - Add policies to allow authenticated users to upload files
    - Add policies to allow users to read their own files
    - Add policies to allow users to delete their own files

  2. Security
    - Ensure users can only access their own files
    - File paths must start with the user's ID
*/

-- Create notes bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name)
  VALUES ('notes', 'notes')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- Policy for file uploads
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'notes' AND
  (storage.foldername(name))[1]::uuid = auth.uid()
);

-- Policy for reading files
CREATE POLICY "Allow users to read their own files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'notes' AND
  (storage.foldername(name))[1]::uuid = auth.uid()
);

-- Policy for deleting files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'notes' AND
  (storage.foldername(name))[1]::uuid = auth.uid()
);