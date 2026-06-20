# Supabase 인증 이메일 템플릿 (강정 피스앤뮤직캠프)

회원/관리자에게 발송되는 Supabase Auth 이메일을 사이트 톤(바다·석양)으로 꾸민 HTML입니다.
모두 table 레이아웃 + 인라인 CSS로 작성해 Gmail/Outlook/모바일에서 안정적으로 보입니다.

## 적용 방법 (Supabase 대시보드)

Supabase 프로젝트 → **Authentication → Email Templates** 에서 각 템플릿의
**Message body (Source/HTML)** 에 해당 파일 내용을 붙여넣고 저장합니다.

| Supabase 템플릿 | 이 저장소 파일 | 권장 제목(Subject) | 쓰이는 곳 |
|---|---|---|---|
| **Confirm signup** | `confirm-signup.html` | 강정 피스앤뮤직캠프 가입을 확인해 주세요 | 일반 회원 가입 확인(`/signup`) |
| **Reset password** | `reset-password.html` | 비밀번호 재설정 안내 | 회원 비밀번호 재설정(`/reset-password` → `/update-password`) |
| **Magic Link** | `magic-link.html` | 로그인 링크를 보내드려요 | 관리자 로그인(`/admin/login`, 매직링크) |

## 변수
세 템플릿 모두 Supabase 표준 변수 `{{ .ConfirmationURL }}`(클릭 시 인증/이동 링크)만 사용합니다.
필요하면 `{{ .Email }}`, `{{ .SiteURL }}`, `{{ .Token }}`(OTP 코드) 등을 추가할 수 있습니다.

## 주의
- 대시보드는 GUI라 코드로 자동 적용되지 않습니다. 위 파일 내용을 직접 붙여넣어야 합니다.
- 가입 확인 메일이 실제로 발송되려면 Authentication → Email 에서 **Confirm email = ON** 이어야 합니다.
- Redirect URLs 허용목록에 `<도메인>/auth/confirm`, `<도메인>/update-password` 가 등록돼 있어야 링크가 정상 동작합니다.
- 이 파일들은 버전 관리/참조용입니다. 템플릿을 바꾸면 이 파일과 대시보드를 함께 갱신하세요.
