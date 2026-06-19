-- CRITICAL regression fix: the 2nd-pass hardening removed `status` from the
-- authenticated UPDATE grant on posts/post_comments to stop authors re-publishing
-- their own hidden content. But admin moderation runs as the SAME `authenticated`
-- role (anon key + admin cookie; no service role exists), and Postgres checks
-- column-level UPDATE privilege BEFORE the enforce_status_moderation BEFORE-trigger
-- fires, so admins got `permission denied for column status` (moderation broke).
-- The trigger already reverts status changes for non-admins (admin_can_edit()=false),
-- so re-granting the status column is safe AND required for admin moderation.
grant update (status) on public.posts to authenticated;
grant update (status) on public.post_comments to authenticated;
