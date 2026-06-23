# peace 프로젝트 작업 지침

## Supabase — 반드시 CLI로

Supabase DB 조회·수정은 **MCP가 아니라 Supabase CLI(또는 psql / service role 키)** 로 직접 한다.

- MCP Supabase 도구는 연결된 일부 프로젝트만 노출해서, 이 레포의 Supabase(`jmelvfcluezlhdxewger` — 백서·회원·게시판)가 목록에 안 잡힌다. "권한 밖"이 아니라 MCP 한계다.
- supabase CLI는 이미 link됨(`supabase/.temp/project-ref`).
- service role 키 취득: `supabase projects api-keys --project-ref jmelvfcluezlhdxewger`
- 임의 SQL/데이터: service_role 키 + `@supabase/supabase-js`(설치됨) 스크립트, 또는 psql connection string. `.env.local`엔 anon 키만 있으니 service role은 CLI로 가져온다.
- 관리자 백서: `admin_documents` 테이블, slug `camp-2026-whitepaper`, `body_md` 컬럼. `/admin/whitepaper`가 렌더.

## 기타

- 의존성은 **pnpm**. `package.json` 변경 시 `pnpm-lock.yaml` 함께 커밋(안 하면 Vercel 빌드 실패).
- 커밋 전 **prettier** 필수(CI에 `format:check` 있음).
- 작업 완료 후 `git push origin main`.
