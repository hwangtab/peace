-- Mirror title/comment minimums: body must be 1..10000. NOT VALID so any existing
-- empty-body rows are not retro-rejected; new writes are checked.
alter table public.posts drop constraint if exists posts_body_len;
alter table public.posts add constraint posts_body_len check (char_length(body) between 1 and 10000) not valid;
alter table public.posts validate constraint posts_body_len;
