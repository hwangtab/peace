-- Drop board_id from the client UPDATE grant: a member must not move their post
-- to another board (the edit form never changes board_id). Insert grant keeps board_id.
revoke update on public.posts from authenticated;
grant update (title, body, rating, status, updated_at) on public.posts to authenticated;
