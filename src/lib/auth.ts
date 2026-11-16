import type { ReactNode } from "react";

/**
 * Auth stub — the existing app uses localStorage profiles with no backend auth.
 * These functions preserve the current "session" pattern so the avatar dropdown
 * and sign-out work. Real Supabase auth integration is still required.
 */

const SESSION_KEY = "ep-session";

export type Session = {
  type: "professional" | "student" | "organization";
  createdAt: string;
};

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(type: Session["type"]) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ type, createdAt: new Date().toISOString() }));
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-input bg-card/50 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">{icon}</span>
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "gold" | "red" | "blue" }) {
  const tones: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    green: "bg-secondary text-secondary-foreground",
    gold: "bg-gold-soft text-foreground ring-1 ring-gold/30",
    red: "bg-destructive/10 text-destructive",
    blue: "bg-primary/10 text-primary",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
