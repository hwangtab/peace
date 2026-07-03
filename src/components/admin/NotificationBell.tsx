import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
// LazyMotion strict 환경: 전체 motion 대신 경량 m을 사용해야 함(번들·런타임 경고 방지)
import { AnimatePresence, m as motion } from 'framer-motion';
import classNames from 'classnames';
import { formatRelativeTime, type AdminNotification } from '@/lib/adminNotifications';

const POLL_MS = 60_000;

const TYPE_ICON: Record<AdminNotification['type'], string> = {
  inquiry: '✉️',
  post: '📝',
  comment: '💬',
  signup: '🎉',
};

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  // 드롭다운을 열 때 기준 시각을 고정해 상대시간 기준이 렌더마다 흔들리지 않도록 한다.
  const [now, setNow] = useState(() => new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  // 403(권한 부족)을 만나면 폴링 인터벌을 멈춘다 — viewer 등 editor 미만 역할에
  // AdminLayout이 벨을 렌더하지 않지만, 만일 렌더되더라도 이중 방어로 재시도를 끊는다.
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (!res.ok) {
        // 403은 역할 미달 — 새로고침 전엔 상태가 바뀌지 않으므로 폴링을 중단한다.
        if (res.status === 403 && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        return;
      }
      const data = (await res.json()) as { items: AdminNotification[]; unreadCount: number };
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // 네트워크 오류는 조용히 무시 — 다음 폴링에서 재시도
    }
  }, []);

  // 마운트 시 1회 + 60초 폴링
  useEffect(() => {
    fetchFeed();
    pollRef.current = setInterval(fetchFeed, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [fetchFeed]);

  // 외부 클릭 닫힘
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setNow(new Date());
      setLoading(true);
      await fetchFeed();
      setLoading(false);
      // 종을 여는 순간 읽음 처리 — 낙관적 업데이트 후 실패 시 롤백
      const prevCount = unreadCount;
      const prevItems = items;
      setUnreadCount(0);
      // 배지뿐 아니라 목록의 안 읽음 표시(점)도 즉시 지워 배지와 어긋나지 않게 한다.
      setItems((prev) => prev.map((it) => (it.isUnread ? { ...it, isUnread: false } : it)));
      try {
        const res = await fetch('/api/admin/notifications/seen', { method: 'POST' });
        if (!res.ok) {
          // POST 실패 시 배지·목록 원복
          setUnreadCount(prevCount);
          setItems(prevItems);
        }
      } catch {
        // 네트워크 오류 시 원복
        setUnreadCount(prevCount);
        setItems(prevItems);
      }
    }
  };

  const handleItemClick = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="알림"
        aria-expanded={open}
        className="relative rounded border border-deep-ocean/20 bg-white p-2 text-deep-ocean transition hover:border-jeju-ocean hover:text-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-sunset-coral px-1 text-[0.7rem] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-lg border border-deep-ocean/10 bg-white shadow-lg"
          >
            <div className="border-b border-deep-ocean/10 px-4 py-3">
              <span className="font-display text-sm font-bold text-deep-ocean">알림</span>
            </div>
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-coastal-gray">불러오는 중…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-coastal-gray">새 알림이 없습니다</p>
            ) : (
              <ul className="divide-y divide-deep-ocean/5">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item.href)}
                      className={classNames(
                        'flex w-full gap-3 px-4 py-3 text-left transition hover:bg-ocean-sand',
                        item.isUnread && 'bg-jeju-ocean/5'
                      )}
                    >
                      <span aria-hidden className="text-base leading-none">
                        {TYPE_ICON[item.type]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-deep-ocean">
                          {item.title}
                        </span>
                        <span className="block truncate text-xs text-coastal-gray">
                          {item.summary}
                        </span>
                        <span className="mt-0.5 block text-[0.7rem] text-coastal-gray/70">
                          {formatRelativeTime(item.createdAt, now)}
                        </span>
                      </span>
                      {item.isUnread && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sunset-coral" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
