import { buildNotificationFeed, formatRelativeTime, type RawSources } from './adminNotifications';

const sources: RawSources = {
  inquiries: [
    {
      id: 'm1',
      subject: '공연 문의',
      from_name: '홍길동',
      from_email: 'h@x.com',
      created_at: '2026-06-25T10:00:00Z',
    },
  ],
  posts: [
    {
      id: 'p1',
      title: '좋은 캠프였어요',
      created_at: '2026-06-25T09:00:00Z',
      profiles: { nickname: '바다' },
    },
    {
      id: 'p2',
      title: '질문 있습니다',
      created_at: '2026-06-25T08:00:00Z',
      profiles: [{ nickname: '산' }],
    },
  ],
  comments: [
    {
      id: 'c1',
      body: '동감합니다',
      created_at: '2026-06-25T11:00:00Z',
      posts: { title: '좋은 캠프였어요' },
    },
  ],
  signups: [{ id: 'u1', nickname: '새회원', created_at: '2026-06-25T07:00:00Z' }],
};

describe('buildNotificationFeed', () => {
  it('모든 소스를 createdAt 내림차순으로 병합한다', () => {
    const feed = buildNotificationFeed(sources, '2026-06-25T00:00:00Z');
    expect(feed.items.map((i) => i.id)).toEqual([
      'comment:c1',
      'inquiry:m1',
      'post:p1',
      'post:p2',
      'signup:u1',
    ]);
  });

  it('seenAt 이후 이벤트만 안읽음으로 표시하고 unreadCount를 센다', () => {
    const feed = buildNotificationFeed(sources, '2026-06-25T08:30:00Z');
    // 08:30 이후: comment(11:00), inquiry(10:00), post p1(09:00) = 3건
    expect(feed.unreadCount).toBe(3);
    expect(feed.items.find((i) => i.id === 'post:p2')?.isUnread).toBe(false);
    expect(feed.items.find((i) => i.id === 'inquiry:m1')?.isUnread).toBe(true);
  });

  it('seenAt이 null이면 전부 안읽음', () => {
    const feed = buildNotificationFeed(sources, null);
    expect(feed.unreadCount).toBe(feed.items.length);
  });

  it('조인이 객체/배열 어느 형태든 작성자·제목을 뽑는다', () => {
    const feed = buildNotificationFeed(sources, null);
    expect(feed.items.find((i) => i.id === 'post:p2')?.summary).toContain('산');
    expect(feed.items.find((i) => i.id === 'comment:c1')?.summary).toContain('좋은 캠프였어요');
  });

  it('타입별 href가 올바르다', () => {
    const feed = buildNotificationFeed(sources, null);
    const href = (id: string) => feed.items.find((i) => i.id === id)?.href;
    expect(href('inquiry:m1')).toBe('/admin/mailbox');
    expect(href('post:p1')).toBe('/admin/board-posts');
    expect(href('comment:c1')).toBe('/admin/board-posts');
    expect(href('signup:u1')).toBe('/admin/members');
  });

  it('limit으로 상위 N건만 반환하되 unreadCount는 잘리기 전 기준', () => {
    const feed = buildNotificationFeed(sources, null, 2);
    expect(feed.items).toHaveLength(2);
    expect(feed.unreadCount).toBe(5);
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-06-25T12:00:00Z');
  it('1분 미만은 방금 전', () => {
    expect(formatRelativeTime('2026-06-25T11:59:30Z', now)).toBe('방금 전');
  });
  it('분 단위', () => {
    expect(formatRelativeTime('2026-06-25T11:57:00Z', now)).toBe('3분 전');
  });
  it('시간 단위', () => {
    expect(formatRelativeTime('2026-06-25T09:00:00Z', now)).toBe('3시간 전');
  });
  it('일 단위', () => {
    expect(formatRelativeTime('2026-06-23T12:00:00Z', now)).toBe('2일 전');
  });
});
