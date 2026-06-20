-- Allow admins to delete any board-images storage object, not just their own.
-- Members retain the ability to delete their own uploads.
drop policy if exists "members delete own board images" on storage.objects;
create policy "members or admins delete board images" on storage.objects for delete to authenticated
using (bucket_id = 'board-images' and (owner = (select auth.uid()) or public.admin_can_edit()));
