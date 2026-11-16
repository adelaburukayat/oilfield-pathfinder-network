import { useState } from "react";
import { Bell, Check, X as XIcon } from "lucide-react";
import type { PathType } from "@/lib/onboarding";
import { loadNotifications, saveNotifications, type Notification } from "@/lib/store";

export function NotificationBell({ type }: { type: PathType }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(() => loadNotifications(type));
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    const next = items.map((n) => ({ ...n, read: true }));
    setItems(next);
    saveNotifications(type, next);
  };

  const dismiss = (id: string) => {
    const next = items.filter((n) => n.id !== id);
    setItems(next);
    saveNotifications(type, next);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
        <Bell className="size-5" />
        {unread > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-gold text-[10px] font-bold text-ink">{unread}</span>}
      </button>
      {open && (
        <>
          <button className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-lift animate-in fade-in slide-in-from-top-1 duration-150 sm:w-96">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-semibold text-foreground">Notifications</p>
              {unread > 0 && <button onClick={markAllRead} className="text-xs font-medium text-primary hover:text-primary-deep">Mark all read</button>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
              ) : items.map((n) => (
                <div key={n.id} className={`group flex gap-3 border-b border-border px-4 py-3 last:border-0 ${!n.read ? "bg-secondary/30" : ""}`}>
                  <div className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-gold"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.createdAt}</p>
                  </div>
                  <button onClick={() => dismiss(n.id)} className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100">
                    <XIcon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <button onClick={() => setOpen(false)} className="flex w-full items-center justify-center gap-1.5 border-t border-border py-2.5 text-xs font-medium text-primary hover:text-primary-deep">
                <Check className="size-3.5" /> All caught up
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
