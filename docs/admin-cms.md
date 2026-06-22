# PEACE 관리자 CMS v1

## 목적

제3회 캠프 이후 웹사이트 운영의 중심은 행사 운영판이 아니라 아카이브 관리입니다.
관리자는 `/admin`에서 웹사이트 문구, 비디오, 갤러리, 언론보도를 직접 추가하거나 공개에서 내릴 수 있습니다.

## 초기 설정 순서

1. Supabase SQL migration을 적용합니다.
   - `supabase/migrations/20260617022058_admin_archive_cms.sql`
   - `supabase/migrations/20260617032014_admin_archive_cms_locale_storage.sql`
   - `supabase/migrations/20260617062524_admin_archive_event_types.sql`
   - `supabase/migrations/20260617084133_admin_change_logs.sql`
   - 두 번째 migration은 전 언어 CMS용 `(public_id, locale)` unique 제약과
     `archive-gallery` Storage bucket/RLS를 추가합니다.
   - 세 번째 migration은 실제 비디오 데이터의 `live`, `music_video`, `interview`
     event type을 DB constraint에 반영합니다.
   - 네 번째 migration은 저장/내리기/복구 변경 이력을 기록하는 `cms_change_logs`를
     추가합니다.
2. Supabase Auth에서 운영진 사용자를 생성하거나 이메일 OTP 로그인을 허용합니다.
   - Authentication URL configuration의 Redirect URLs에
     `https://peaceandmusic.net/admin/callback`을 등록합니다.
   - 로컬 확인용으로 `http://127.0.0.1:3000/admin/callback`도 필요하면 등록합니다.
3. CLI 링크가 현재 PEACE 프로젝트를 가리키는지 확인하고 migration을 적용합니다.

```bash
pnpm dlx supabase@2.106.0 link --project-ref jmelvfcluezlhdxewger --yes
pnpm dlx supabase@2.106.0 db push --yes
pnpm dlx supabase@2.106.0 migration list
```

4. SQL editor 또는 Supabase CLI `db query --linked`로 관리자 allowlist를 추가합니다.

```sql
insert into public.admin_members (email, display_name, role, active)
values ('operator@example.com', '운영진 이름', 'owner', true)
on conflict (email) do update
set active = true, display_name = excluded.display_name, role = excluded.role;
```

5. 기존 JSON 아카이브를 Supabase로 seed합니다.

```bash
SUPABASE_SERVICE_ROLE_KEY=... pnpm seed:archive-cms
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버/로컬 실행 전용입니다. 절대 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다.
seed는 repo의 13개 locale 전체를 순회해 영상, 언론보도, 페이지 문구를 넣고, 갤러리는
공통 이미지 URL을 각 locale row로 복제해 설명/상태를 언어별로 관리할 수 있게 합니다.

service role key를 쓰지 않는 CLI-only 경로가 필요하면 SQL seed 파일을 생성한 뒤
request size 제한을 피하도록 분할해서 적용합니다.

```bash
mkdir -p .codex-tmp
SEED_TIMESTAMP='2026-06-17T00:00:00.000Z' \
  SEED_SQL_PARTS_DIR=.codex-tmp/admin-archive-seed-parts \
  pnpm seed:archive-cms:sql

for file in .codex-tmp/admin-archive-seed-parts/*.sql; do
  pnpm dlx supabase@2.106.0 db query --linked --file "$file"
  sleep 3
done
```

## 공개 반영 방식

- `/videos`, `/gallery`, `/press`는 현재 locale의 Supabase CMS 항목을 기존 `public/data`
  JSON 위에 덮어씁니다.
- CMS에 아직 없는 `public_id`는 기존 JSON을 fallback으로 유지해, 부분 이관/부분 번역 상태에서도
  공개 아카이브가 줄어들지 않게 합니다.
- 비한국어 페이지가 한국어 CMS row를 대신 표시하지 않습니다.
- 비디오, 갤러리, 언론보도는 관리자에서 `hidden`으로 내리면 같은 `public_id`의 모든
  locale row가 공개 목록에서 내려갑니다.
- 저장/내리기 후 관련 목록, 상세 페이지, sitemap revalidation을 즉시 요청합니다.

## 갤러리 업로드

- 관리자 갤러리 화면에서 이미지 파일을 업로드하면 Supabase Storage `archive-gallery` bucket에
  저장되고 `image_url`에 public URL이 자동 입력됩니다.
- 업로드만으로 공개 데이터가 바뀌지는 않습니다. 항목 저장을 눌러야 DB row와 공개 페이지에
  반영됩니다.
- 업로드 권한은 active admin allowlist와 Storage RLS로 제한합니다.

## 변경 이력과 복구

- 관리자 저장, 공개에서 내리기, 복구 작업은 `cms_change_logs`에 before/after JSON snapshot을 남깁니다.
- `/admin/history`에서 최근 변경 이력을 보고 이전 값으로 복구할 수 있습니다.
- 비디오, 갤러리, 언론보도를 공개에서 내릴 때는 같은 `public_id`의 모든 locale row가 내려가며,
  각 locale row별로 변경 이력이 기록됩니다.
- 복구는 기존 row가 남아 있는 항목을 이전 snapshot으로 되돌립니다. 완전히 삭제된 row 재생성은 v1 범위가 아닙니다.

## 문구 override 키

문구 테이블은 `route_path + placement`로 공개 페이지 문구를 덮어씁니다.

- `seo.title`
- `seo.description`
- `hero.title`
- `hero.subtitle`
- `intro.eyebrow`
- `intro.heading`
- `intro.p1`
- `intro.p2`
- `intro.p3`

현재 v1 적용 경로는 `/videos`, `/gallery`, `/press`입니다.
