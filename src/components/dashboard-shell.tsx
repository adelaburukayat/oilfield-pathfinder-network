import { useState, type ReactNode } from "react";
import { Bell, Menu, X, ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand";
import { AvatarDropdown } from "@/components/avatar-dropdown";
import { NotificationBell } from "@/components/notification-bell";
import type { PathType } from "@/lib/onboarding";
import { loadProfileData } from "@/lib/store";

export type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

export function DashboardShell({
  type, navItems, active, onNavigate, children, pageTitle,
}: {
  type: PathType;
  navItems: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
  pageTitle: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const v = loadProfileData(type);
  const name = type === "organization" ? (v["companyName"] as string) || "Your company" : (v["displayName"] as string) || "there";
  const avatar = typeof v["avatar"] === "string" ? v["avatar"] : undefined;
  const shape = type === "organization" ? "rounded-lg" : "rounded-full";

  const navList = (
    <nav className="flex flex-col gap-0.5">
      {navItems.map((item) => (
        <button key={item.id} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
            active === item.id ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}>
          <span className={active === item.id ? "text-primary-foreground" : "text-muted-foreground"}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center px-6">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">{navList}</div>
        <div className="border-t border-border p-3">
          <AvatarDropdown type={type} avatar={avatar} name={name} shape={shape} />
        </div>
      </aside>

      {/* Sidebar — mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-card animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-between px-6">
              <Logo />
              <button onClick={() => setSidebarOpen(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><X className="size-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">{navList}</div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden">
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="hidden sm:inline capitalize">{type}</span>
              <ChevronRight className="hidden size-3.5 sm:inline" />
              <span className="font-medium text-foreground">{pageTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell type={type} />
            <AvatarDropdown type={type} avatar={avatar} name={name} shape={shape} />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
