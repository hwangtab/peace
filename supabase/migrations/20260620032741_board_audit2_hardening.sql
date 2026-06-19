-- Second-pass audit hardening.

-- FIX 1 (HIGH): moderation bypass — an author could re-publish their own
-- admin-hidden post/comment via direct REST because `status` is in the author
-- UPDATE grant and RLS allows the author. Block non-admins from changing status
-- with a BEFORE UPDATE trigger (keeps the change silently no-op'd to old value),
-- and drop `status` from the authenticated column grants so only admins (via
-- admin_can_edit in the trigger path) can move moderation status.

create or replace function public.enforce_status_moderation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and not public.admin_can_edit() then
    new.status := old.status;  -- non-admins cannot change moderation status
  end if;
  return new;
end;
$$;

drop trigger if exists posts_enforce_status on public.posts;
create trigger posts_enforce_status before update on public.posts
for each row execute function public.enforce_status_moderation();

drop trigger if exists post_comments_enforce_status on public.post_comments;
create trigger post_comments_enforce_status before update on public.post_comments
for each row execute function public.enforce_status_moderation();

-- Drop status from author write grants on posts (insert keeps status so initial
-- create can default 'published'; remove from UPDATE grant). Re-grant explicitly.
revoke update on public.posts from authenticated;
grant update (title, body, rating, updated_at) on public.posts to authenticated;

-- FIX 2 (MEDIUM): post_comments still had blanket grants → created_at/status
-- forgeable. Narrow to specific columns (mirror posts/profiles hardening).
revoke insert, update on public.post_comments from authenticated;
grant insert (post_id, author_id, body) on public.post_comments to authenticated;
grant update (body, updated_at) on public.post_comments to authenticated;
-- (status intentionally excluded from both; admins moderate via trigger-allowed path.)

-- FIX 3 (MEDIUM): posts.body had no server-side length limit (DoS). Mirror the
-- title/comment bounds.
alter table public.posts add constraint posts_body_len check (char_length(body) <= 10000) not valid;
alter table public.posts validate constraint posts_body_len;

-- FIX 4 (LOW): INSERT policies didn't require the parent board active / parent
-- post published, allowing writes onto deactivated boards / hidden posts via REST.
drop policy if exists "members create own posts" on public.posts;
create policy "members create own posts" on public.posts for insert to authenticated
with check (
  (select auth.uid()) is not null
  and author_id = (select auth.uid())
  and exists (select 1 from public.boards b where b.id = board_id and b.is_active)
);

drop policy if exists "members create own comments" on public.post_comments;
create policy "members create own comments" on public.post_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and exists (
    select 1 from public.posts p join public.boards b on b.id = p.board_id
    where p.id = post_id and p.status = 'published' and b.is_active
  )
);

drop policy if exists "members like as self" on public.post_likes;
create policy "members like as self" on public.post_likes for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.posts p join public.boards b on b.id = p.board_id
    where p.id = post_id and p.status = 'published' and b.is_active
  )
);

-- FIX 5 (LOW): board-images upload must enforce the per-user folder prefix the
-- UPDATE policy already assumes.
drop policy if exists "members upload board images" on storage.objects;
create policy "members upload board images" on storage.objects for insert to authenticated
with check (bucket_id = 'board-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- FIX 6 (LOW): rating must not be set on a board with has_rating=false. Enforce
-- via trigger (CHECK can't subquery).
create or replace function public.enforce_post_rating_board()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.rating is not null
     and not exists (select 1 from public.boards b where b.id = new.board_id and b.has_rating) then
    new.rating := null;
  end if;
  return new;
end;
$$;

drop trigger if exists posts_enforce_rating on public.posts;
create trigger posts_enforce_rating before insert or update on public.posts
for each row execute function public.enforce_post_rating_board();

-- FIX 7 (LOW): nickname DB-layer charset guard (client validateNickname is
-- bypassable via direct signUp metadata → SECURITY DEFINER trigger insert).
alter table public.profiles
  add constraint profiles_nickname_chars
  check (nickname ~ '^[^[:space:][:cntrl:]%_\\]{2,20}$') not valid;
-- 'not valid' so existing rows aren't retro-rejected; new writes are checked.

-- FIX 8 (LOW): handle_new_user must not abort auth signup on a nickname unique
-- collision — fall back to a generated handle.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  begin
    insert into public.profiles (id, nickname)
    values (
      new.id,
      coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), '회원' || substr(new.id::text, 1, 8))
    );
  exception when unique_violation then
    insert into public.profiles (id, nickname)
    values (new.id, '회원' || substr(new.id::text, 1, 8))
    on conflict (id) do nothing;
  end;
  return new;
end;
$$;
