-- 게시판 쓰기(글·댓글) 서버측 빈도 제한 — 도배(flood) 방지.
--
-- 배경: posts/post_comments 삽입은 브라우저 → Supabase 직결(PostForm.tsx,
-- CommentSection.tsx)이고, RLS INSERT 정책(20260620032741 등)은 "본인 여부 + 게시판
-- 활성/부모 공개"만 검사할 뿐 빈도 제한이 없었다. 컬럼 grant 하드닝
-- (20260620032741, 20260622023501)으로 created_at/status 위조는 이미 막혔지만,
-- 초당 다수 삽입(도배)은 여전히 가능했다. 여기서 BEFORE INSERT 트리거로 동일
-- author_id 의 최근 삽입 건수를 세어 임계치 이상이면 예외를 던진다.
--
-- 스타일: 기존 enforce_status_moderation / enforce_post_rating_board 와 동일하게
-- SECURITY DEFINER + search_path 고정. DEFINER 로 실행돼 카운트 쿼리가 RLS 를 우회하므로
-- 숨김(hidden) 글까지 포함해 저자의 실제 삽입 총량을 세어 우회를 막는다.
--
-- 임계치 — 각 윈도우에 "이미 존재하는" 저자 행 수가 이 값 이상이면 새 삽입을 거부한다
-- (사실상 윈도우당 최대 N건 허용, N+1 번째부터 차단):
--   posts        : 60초 3건, 24시간 30건
--   post_comments: 60초 6건, 24시간 300건
-- 예외 메시지는 'rate_limit_exceeded: ...' 로 식별 가능하게 둔다. 클라이언트는 삽입
-- 오류를 기존 generic 저장 실패 UI(t('error.saveFailed'))로 처리하므로 클라이언트 변경 불필요.

-- 카운트 쿼리가 (author_id, created_at) 범위 스캔을 타도록 복합 인덱스를 보장한다.
-- posts 엔 (author_id) 단일 인덱스(posts_author_idx)만 있어 created_at 범위를 못 좁혔고,
-- post_comments 엔 author 기준 인덱스가 아예 없었다((post_id, created_at)만 존재).
create index if not exists posts_author_created_idx
  on public.posts (author_id, created_at);
create index if not exists post_comments_author_created_idx
  on public.post_comments (author_id, created_at);

-- posts: 60초 3건 / 24시간 30건 초과 삽입 차단
create or replace function public.enforce_post_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  recent_count int;
  daily_count int;
begin
  select count(*) into recent_count
  from public.posts
  where author_id = new.author_id
    and created_at > now() - interval '60 seconds';
  if recent_count >= 3 then
    raise exception 'rate_limit_exceeded: posts per 60s (max 3)';
  end if;

  select count(*) into daily_count
  from public.posts
  where author_id = new.author_id
    and created_at > now() - interval '24 hours';
  if daily_count >= 30 then
    raise exception 'rate_limit_exceeded: posts per 24h (max 30)';
  end if;

  return new;
end;
$$;

drop trigger if exists posts_enforce_rate_limit on public.posts;
create trigger posts_enforce_rate_limit before insert on public.posts
for each row execute function public.enforce_post_rate_limit();

-- post_comments: 60초 6건 / 24시간 300건 초과 삽입 차단
create or replace function public.enforce_comment_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  recent_count int;
  daily_count int;
begin
  select count(*) into recent_count
  from public.post_comments
  where author_id = new.author_id
    and created_at > now() - interval '60 seconds';
  if recent_count >= 6 then
    raise exception 'rate_limit_exceeded: comments per 60s (max 6)';
  end if;

  select count(*) into daily_count
  from public.post_comments
  where author_id = new.author_id
    and created_at > now() - interval '24 hours';
  if daily_count >= 300 then
    raise exception 'rate_limit_exceeded: comments per 24h (max 300)';
  end if;

  return new;
end;
$$;

drop trigger if exists post_comments_enforce_rate_limit on public.post_comments;
create trigger post_comments_enforce_rate_limit before insert on public.post_comments
for each row execute function public.enforce_comment_rate_limit();
