import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import clsx from 'clsx';
import type { NotificationItem } from '@/types';
import { formatClock } from '@/utils/format';

const TONE_ICON: Record<NotificationItem['tone'], typeof Bell> = {
  critical: XCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const TONE_COLOR: Record<NotificationItem['tone'], string> = {
  critical: 'text-accent-red',
  warning: 'text-accent-amber',
  success: 'text-accent-green',
  info: 'text-accent-blue',
};

export function NotificationCenter({
  notifications,
  onOpen,
}: {
  notifications: NotificationItem[];
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) onOpen();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-surface-border bg-surface-raised text-ink-secondary transition hover:border-surface-borderStrong hover:text-ink-primary"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 animate-slideIn overflow-hidden rounded-lg border border-surface-border bg-surface-overlay shadow-floating">
          <div className="border-b border-surface-border px-4 py-3">
            <p className="text-sm font-semibold text-ink-primary">Notifications</p>
            <p className="text-xs text-ink-muted">{notifications.length} recent events</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-ink-muted">No notifications yet.</p>
            )}
            {notifications.map((n) => {
              const Icon = TONE_ICON[n.tone];
              return (
                <div
                  key={n.id}
                  className={clsx(
                    'flex gap-2.5 border-b border-surface-border/60 px-4 py-3 text-xs last:border-0',
                    !n.read && 'bg-surface-panel/60',
                  )}
                >
                  <Icon size={14} className={clsx('mt-0.5 flex-shrink-0', TONE_COLOR[n.tone])} />
                  <div>
                    <p className="text-ink-secondary">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">{formatClock(new Date(n.timestamp))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
