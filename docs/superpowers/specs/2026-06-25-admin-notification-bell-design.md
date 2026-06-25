# 관리자 종 알림 (Notification Bell) 설계

작성일: 2026-06-25

## 목적

관리자(기획단) 페이지 헤더 우측에 페이스북 스타일의 종 아이콘 알림을 추가한다.
주요 이벤트가 발생하면 빨간 배지에 안 읽은 개수가 표시되고, 종을 클릭하면 드롭다운으로
최근 이벤트 목록을 보여준다. 각 항목을 클릭하면 해당 관리 페이지로 이동한다.

대상 이벤트:

- 새 문의 메일 (`mailbox_messages`, direction=inbound)
- 새 게시글 (`posts`, status=published)
- 새 댓글 (`post_comments`, status=published)
- 신규 회원가입 (`profiles`)

## 접근: 파생(derived) 방식

알림을 별도로 저장하지 않는다. 종을 열거나 폴링할 때 기존 테이블에서 최근 이벤트를
실시간으로 쿼리해 병합한다. 읽음 처리는 관리자 개인별로, "마지막으로 종을 연 시각"
이후에 발생한 이벤트를 안 읽음으로 판정한다.

전용 `notifications` 테이블 + 트리거 방식(접근 B)은 채택하지 않는다. 개별 알림 읽음/삭제
토글이나 영구 히스토리가 현재 요구사항이 아니므로 과설계(YAGNI)다.

## 1. 데이터 / 읽음 처리

- `admin_members`에 컬럼 추가: `notifications_seen_at timestamptz`
  - 기본값은 NULL 또는 `now()` (마이그레이션에서 기존 행은 `now()`로 채워 과거 이벤트가
    한꺼번에 안 읽음으로 잡히지 않게 한다)
- 안 읽음 판정: `이벤트.createdAt > admin_member.notifications_seen_at`
  - `notifications_seen_at`이 NULL이면 모두 안 읽음으로 간주
- 종 드롭다운을 여는 순간 `notifications_seen_at = now()`로 갱신 → 배지 카운트 0

## 2. API

### `GET /api/admin/notifications`

- `requireAdminApi()`로 보호 (인증된 관리자만)
- 현재 관리자의 `notifications_seen_at`을 조회
- 4개 소스를 각각 최근 ~10건씩 쿼리한 뒤 `createdAt` 기준 내림차순 병합, 상위 ~20건 반환
- 각 소스 매핑:
  - 새 문의: `mailbox_messages` where direction=inbound → href `/admin/mailbox`
  - 새 게시글: `posts` where status=published → href `/admin/board-posts`
  - 새 댓글: `post_comments` where status=published → href `/admin/board-posts`
  - 신규 가입: `profiles` → href `/admin/members`
- 응답 형태:

```ts
type AdminNotification = {
  id: string; // `${type}:${sourceId}` 형태로 유니크 보장
  type: 'inquiry' | 'post' | 'comment' | 'signup';
  title: string; // 예: "새 문의 메일"
  summary: string; // 예: 보낸사람/제목, 글 제목, 닉네임 등
  createdAt: string; // ISO
  href: string;
  isUnread: boolean;
};

type NotificationsResponse = {
  items: AdminNotification[];
  unreadCount: number;
};
```

- `unreadCount`는 병합된 상위 목록 기준이 아니라, 각 소스에서 `seen_at` 이후 건수를 합산
  (목록은 20건으로 잘려도 배지 숫자는 정확하도록). 단, 표시 상한은 `9+` 처리.

### `POST /api/admin/notifications/seen`

- `requireAdminApi()`로 보호
- 현재 관리자의 `notifications_seen_at = now()`로 갱신
- 성공 응답만 반환 (`{ ok: true }`)

## 3. UI — `<NotificationBell />`

- 위치: `src/components/admin/AdminLayout.tsx` 헤더 우측, 로그아웃 버튼 앞
- 구성:
  - 종 아이콘 버튼 + 빨간 배지(unreadCount, `9+` 처리, 0이면 배지 숨김)
  - 클릭 시 드롭다운 패널
- 드롭다운 항목: 타입별 아이콘 + 제목 + 요약 + 상대시간("3분 전"), 안 읽음 항목은 배경 강조
- 드롭다운이 열리는 순간 `POST /seen` 호출 → 배지 즉시 0, 목록 항목은 그대로 표시
  (이미 받은 목록의 `isUnread` 강조는 그 세션 동안 유지해도 무방)
- 항목 클릭 → `href`로 이동 (Next router)
- 목록이 비어있으면 "새 알림이 없습니다" 표시
- 외부 클릭 시 닫힘 + Framer Motion 애니메이션은 기존 `src/components/layout/NavigationDropdown.tsx`
  패턴을 참고/재사용
- 색상은 admin 팔레트(jeju-ocean, coastal-gray, sunset-coral 배지 등) 사용

## 4. 갱신 방식

- 컴포넌트 마운트 시 1회 fetch
- 60초 간격 폴링(`setInterval`)으로 `unreadCount` 갱신
  - 폴링 시에는 배지 숫자 갱신이 목적 (목록 전체 재조회도 가능하나 드롭다운이 닫혀 있으면 카운트만 써도 됨)
- 드롭다운을 열 때 전체 목록을 재fetch (최신 상태 보장)
- 언마운트 시 `clearInterval`

## 5. 파일

신규:

- `pages/api/admin/notifications/index.ts` (GET)
- `pages/api/admin/notifications/seen.ts` (POST)
- `src/components/admin/NotificationBell.tsx`
- `src/types`에 `AdminNotification` 타입 (예: `src/types/notification.ts` 또는 기존 타입 파일에 추가)

수정:

- `src/components/admin/AdminLayout.tsx` (종 컴포넌트 삽입)
- Supabase 마이그레이션 1개 (`admin_members.notifications_seen_at` 추가)

## 에러 처리

- API 한 소스 쿼리가 실패해도 전체가 실패하지 않도록, 가능한 소스만 병합하고 로깅
  (한 테이블 장애가 전체 알림을 막지 않게)
- 클라이언트는 fetch 실패 시 조용히 무시하고 다음 폴링에서 재시도 (헤더 UI는 깨지지 않음)
- `POST /seen` 실패는 무시 가능 (다음 열림에서 재시도)

## 테스트

- API: `seen_at` 경계 기준 안 읽음 카운트 계산이 정확한지 (이전/이후/동일 시각)
- API: 한 소스 쿼리 실패 시에도 나머지가 반환되는지
- 권한: 비관리자 요청은 401
- UI: 배지 표시/숨김, 드롭다운 열림 시 seen 호출, 항목 클릭 시 라우팅

## 범위 밖 (Non-goals)

- 개별 알림 하나씩 읽음/삭제 토글
- 알림 영구 히스토리 보존
- Supabase Realtime 실시간 푸시 (60초 폴링으로 충분)
- 이메일/푸시 등 외부 채널 알림
