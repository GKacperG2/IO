/*
  # Create avatars storage bucket

  1. Storage
    - Creates a new public storage bucket named 'avatars' for storing user profile pictures
  
  2. Security
    - Enables public access for viewing avatars
    - Restricts upload/update/delete operations to authenticated users
    - Users can only manage their own avatar files
*/

-- Create the avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Create policy to allow public access to avatars
create policy "Avatars are publicly accessible"
on storage.objects for select
to public
using ( bucket_id = 'avatars' );

-- Create policy to allow authenticated users to upload avatar files
create policy "Users can upload their own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to update their own avatar files
create policy "Users can update their own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
) 
with check (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own avatar files
create policy "Users can delete their own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);