import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ChevronDown, User as UserIcon, Settings, LogOut } from "lucide-react";
import type { PathType } from "@/lib/onboarding";
import { signOut } from "@/lib/auth";

export function AvatarDropdown({
  type, avatar, name, shape = "rounded-full",
}: {
  type: PathType;
  avatar?: string;
  name: string;
  shape?: "rounded-full" | "rounded-lg";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = name.charAt(0).toUpperCase() || "?";

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-muted">
        <span className={`grid size-9 place-items-center overflow-hidden bg-secondary text-sm font-semibold text-primary ${shape}`}>
          {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : initial}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-lift animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{type} account</p>
          </div>
          <div className="py-1">
            <Link to="/profile/$type" params={{ type }} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
              <UserIcon className="size-4 text-muted-foreground" /> View Profile
            </Link>
            <Link to="/settings/$type" params={{ type }} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
              <Settings className="size-4 text-muted-foreground" /> Settings
            </Link>
          </div>
          <div className="border-t border-border pt-1">
            <button onClick={() => { setOpen(false); signOut(); navigate({ to: "/" }); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/5">
              <LogOut className="size-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
