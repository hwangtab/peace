export type AdminNotificationType = 'inquiry' | 'post' | 'comment' | 'signup';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  summary: string;
  createdAt: string;
  href: string;
  isUnread: boolean;
}

export interface NotificationFeed {
  items: AdminNotification[];
  unreadCount: number;
}

export interface RawInquiry {
  id: string;
  subject: string | null;
  from_name: string | null;
  from_email: string | null;
  created_at: string;
}
export interface RawPost {
  id: string;
  title: string;
  created_at: string;
  profiles?: { nickname?: string } | { nickname?: string }[] | null;
}
export interface RawComment {
  id: string;
  body: string;
  created_at: string;
  posts?: { title?: string } | { title?: string }[] | null;
}
export interface RawSignup {
  id: string;
  nickname: string | null;
  created_at: string;
}
export interface RawSources {
  inquiries: RawInquiry[];
  posts: RawPost[];
  comments: RawComment[];
  signups: RawSignup[];
}

const pickOne = <T>(rel: T | T[] | null | undefined): T | null =>
  Array.isArray(rel) ? (rel[0] ?? null) : (rel ?? null);

const truncate = (text: string, max = 60): string =>
  text.length > max ? `${text.slice(0, max)}…` : text;

const mapInquiry = (row: RawInquiry): Omit<AdminNotification, 'isUnread'> => ({
  id: `inquiry:${row.id}`,
  type: 'inquiry',
  title: '새 문의 메일',
  summary: truncate(
    `${row.from_name || row.from_email || '익명'}: ${row.subject || '(제목 없음)'}`
  ),
  createdAt: row.created_at,
  href: '/admin/mailbox',
});

const mapPost = (row: RawPost): Omit<AdminNotification, 'isUnread'> => {
  const author = pickOne(row.profiles)?.nickname || '회원';
  return {
    id: `post:${row.id}`,
    type: 'post',
    title: '새 게시글',
    summary: truncate(`${author}: ${row.title}`),
    createdAt: row.created_at,
    href: '/admin/board-posts',
  };
};

const mapComment = (row: RawComment): Omit<AdminNotification, 'isUnread'> => {
  const postTitle = pickOne(row.posts)?.title || '게시글';
  return {
    id: `comment:${row.id}`,
    type: 'comment',
    title: '새 댓글',
    summary: truncate(`"${postTitle}"에 댓글: ${row.body}`),
    createdAt: row.created_at,
    href: '/admin/board-posts',
  };
};

const mapSignup = (row: RawSignup): Omit<AdminNotification, 'isUnread'> => ({
  id: `signup:${row.id}`,
  type: 'signup',
  title: '신규 회원가입',
  summary: truncate(`${row.nickname || '새 회원'}님이 가입했습니다`),
  createdAt: row.created_at,
  href: '/admin/members',
});

export function buildNotificationFeed(
  sources: RawSources,
  seenAt: string | null,
  limit = 20
): NotificationFeed {
  const seenMs = seenAt ? new Date(seenAt).getTime() : null;
  const merged = [
    ...sources.inquiries.map(mapInquiry),
    ...sources.posts.map(mapPost),
    ...sources.comments.map(mapComment),
    ...sources.signups.map(mapSignup),
  ].map((n) => ({
    ...n,
    isUnread: seenMs === null || new Date(n.createdAt).getTime() > seenMs,
  }));

  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = merged.filter((n) => n.isUnread).length;
  return { items: merged.slice(0, limit), unreadCount };
}

export function formatRelativeTime(iso: string, now: Date): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  return `${day}일 전`;
}
