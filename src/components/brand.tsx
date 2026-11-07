import { Link } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-primary">
        <svg viewBox="0 0 24 24" className="size-4.5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 3c3.5 4.2 6 7.4 6 10.5A6 6 0 0 1 6 13.5C6 10.4 8.5 7.2 12 3Z" />
          <path d="M12 13v5" className="text-gold" stroke="currentColor" />
        </svg>
      </span>
      <span className={`font-display text-[15px] font-semibold tracking-tight ${inverted ? "text-ink-foreground" : "text-foreground"}`}>
        Oil<span className="text-gold">Swift</span>
      </span>
    </Link>
  );
}

export function HelpLink() {
  return (
    <a href="mailto:support@example.com" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <LifeBuoy className="size-4" /> Need help?
    </a>
  );
}
