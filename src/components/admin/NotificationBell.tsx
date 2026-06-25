import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (!res.ok) return;
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
    const t = setInterval(fetchFeed, POLL_MS);
    return () => clearInterval(t);
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
      setLoading(true);
      await fetchFeed();
      setLoading(false);
      // 종을 여는 순간 읽음 처리 → 배지 즉시 0, 목록 강조는 유지
      setUnreadCount(0);
      fetch('/api/admin/notifications/seen', { method: 'POST' }).catch(() => {});
    }
  };

  const handleItemClick = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const now = new Date();

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
