import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Globe, Users, Lock, ShieldCheck, Bell, KeyRound, UserCog, Check, ChevronRight,
  Building2, Crown,
} from "lucide-react";
import { Logo, HelpLink } from "@/components/brand";
import { AvatarDropdown } from "@/components/avatar-dropdown";
import { PATHS, isPathType, loadProfile, type PathType } from "@/lib/onboarding";
import { loadVisibility, saveVisibility, isSectionVisible, type Visibility, type VisibilitySettings, type SectionKey } from "@/lib/store";
import { EmptyState, Badge } from "@/lib/auth";

export const Route = createFileRoute("/settings/$type")({
  loader: ({ params }) => {
    if (!isPathType(params.type)) throw notFound();
    return { type: params.type };
  },
  head: ({ loaderData }) => {
    const label = loaderData ? PATHS[loaderData.type].label : "Settings";
    return {
      meta: [
        { title: `${label} settings — OilSwift` },
        { name: "description", content: `Manage your ${label} account, privacy and preferences.` },
        { property: "og:title", content: `${label} settings — OilSwift` },
        { property: "og:description", content: `Manage your OilSwift settings.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: SettingsPage,
});

const TABS = [
  { id: "account", label: "Account", icon: UserCog },
  { id: "security", label: "Password & Security", icon: KeyRound },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
  { id: "visibility", label: "Profile Visibility", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Building2 },
] as const;

const VIS_OPTIONS: { value: Visibility; label: string; icon: typeof Globe; desc: string }[] = [
  { value: "public", label: "Public", icon: Globe, desc: "Anyone can view your permitted profile sections, including visitors who are not signed in." },
  { value: "members", label: "OilSwift Members", icon: Users, desc: "Only authenticated OilSwift users can view your permitted profile sections." },
  { value: "private", label: "Private", icon: Lock, desc: "Your profile won't appear in searches or talent discovery. Only you can see it." },
];

const SECTION_LABELS: { key: SectionKey; label: string }[] = [
  { key: "about", label: "About" },
  { key: "disciplines", label: "Sector & Roles" },
  { key: "experience", label: "Work Experience" },
  { key: "certifications", label: "Certifications" },
  { key: "mentoring", label: "Mentoring Information" },
  { key: "credentials", label: "Credentials" },
  { key: "education", label: "Education" },
  { key: "projects", label: "Projects" },
  { key: "company", label: "Company Information" },
];

const SECTION_VIS: { value: Visibility; label: string }[] = [
  { value: "public", label: "Visible to everyone" },
  { value: "members", label: "Visible to OilSwift Members" },
  { value: "private", label: "Only visible to me" },
];

function SettingsPage() {
  const { type } = Route.useLoaderData();
  const [tab, setTab] = useState<string>("account");
  const v = loadProfile(type);
  const name = type === "organization" ? (v["companyName"] as string) || "Your company" : (v["displayName"] as string) || "there";
  const avatar = typeof v["avatar"] === "string" ? v["avatar"] : undefined;

  const tabs = type === "organization"
    ? TABS.filter((t) => t.id !== "visibility")
    : TABS.filter((t) => t.id !== "preferences");

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-10">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden text-sm text-muted-foreground sm:inline">·</span>
          <span className="hidden font-medium text-foreground sm:inline">Settings</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block"><HelpLink /></span>
          <Link to="/dashboard/$type" params={{ type }} className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:inline">Back to dashboard</Link>
          <AvatarDropdown type={type} avatar={avatar} name={name} shape={type === "organization" ? "rounded-lg" : "rounded-full"} />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Tab nav */}
          <nav className="flex gap-1 overflow-x-auto md:flex-col">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    tab === t.id ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                  <Icon className="size-4" /> {t.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="space-y-6">
            {tab === "account" && <AccountTab type={type} />}
            {tab === "security" && <SecurityTab />}
            {tab === "privacy" && <PrivacyTab />}
            {tab === "visibility" && <VisibilityTab type={type} />}
            {tab === "notifications" && <NotificationsTab />}
            {tab === "preferences" && <PreferencesTab type={type} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-border">
      <h2 className="font-semibold text-foreground">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AccountTab({ type }: { type: PathType }) {
  const v = loadProfile(type);
  const email = type === "organization" ? v["contactEmail"] as string : "your.email@example.com";
  const name = type === "organization" ? v["companyName"] as string : v["displayName"] as string;
  return (
    <>
      <SectionCard title="Account information" desc="Your basic account details.">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border py-2.5 text-sm">
            <span className="text-muted-foreground">{type === "organization" ? "Company name" : "Full name"}</span>
            <span className="font-medium text-foreground">{name || "—"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2.5 text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">{email || "—"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2.5 text-sm">
            <span className="text-muted-foreground">Account type</span>
            <span className="font-medium text-foreground capitalize">{type}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium text-foreground">November 2026</span>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
          Account information is managed through your onboarding details. To update your name or email, edit your profile or contact support.
        </p>
      </SectionCard>
    </>
  );
}

function SecurityTab() {
  return (
    <>
      <SectionCard title="Password" desc="Change your account password.">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Current password</label>
            <input type="password" placeholder="••••••••" className="field" disabled />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">New password</label>
            <input type="password" placeholder="••••••••" className="field" disabled />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm new password</label>
            <input type="password" placeholder="••••••••" className="field" disabled />
          </div>
          <button disabled className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground opacity-40">
            Update password
          </button>
          <p className="rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
            Password management requires Supabase authentication integration. This will be enabled once your account is connected to the authentication backend.
          </p>
        </div>
      </SectionCard>
      <SectionCard title="Two-factor authentication" desc="Add an extra layer of security to your account.">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Not enabled</p>
          <button disabled className="h-9 rounded-full border border-border px-4 text-sm font-medium text-muted-foreground opacity-50">Enable 2FA</button>
        </div>
        <p className="mt-3 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
          Two-factor authentication will be available once Supabase auth is integrated.
        </p>
      </SectionCard>
    </>
  );
}

function PrivacyTab() {
  return (
    <>
      <SectionCard title="Contact information privacy" desc="How your personal contact details are protected.">
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-foreground">Phone numbers are <strong>never</strong> displayed publicly on your profile.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-foreground">Email addresses are not exposed unless you explicitly authorize sharing.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-foreground">Exact residential addresses are never displayed publicly. Only city or state may be shown where permitted.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-foreground">Messaging stays within OilSwift's messaging system — personal contact details are not automatically shared.</span>
          </li>
        </ul>
      </SectionCard>
      <SectionCard title="Search & discovery" desc="How your visibility settings affect who can find you.">
        <p className="text-sm text-muted-foreground">
          Your profile visibility setting controls whether you appear in professional discovery, organization talent search, networking, and mentorship discovery. Private profiles are excluded from all search results and talent discovery. You can manage this in the Profile Visibility tab.
        </p>
      </SectionCard>
    </>
  );
}

function VisibilityTab({ type }: { type: PathType }) {
  const [settings, setSettings] = useState<VisibilitySettings>(() => loadVisibility(type));
  const [saved, setSaved] = useState(false);

  const setOverall = (value: Visibility) => {
    const next = { ...settings, overall: value };
    setSettings(next);
    saveVisibility(type, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setSection = (key: SectionKey, value: Visibility) => {
    const next = { ...settings, sections: { ...settings.sections, [key]: value } };
    setSettings(next);
    saveVisibility(type, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground animate-in fade-in slide-in-from-top-1">
          <Check className="size-4 text-primary" /> Visibility settings saved
        </div>
      )}

      <SectionCard title="Overall profile visibility" desc="Control who can discover and view your profile.">
        <div className="space-y-3">
          {VIS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = settings.overall === opt.value;
            return (
              <button key={opt.value} onClick={() => setOverall(opt.value)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  active ? "border-primary bg-secondary/40 ring-1 ring-primary" : "border-input bg-card hover:border-primary/40"
                }`}>
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{opt.label}</p>
                    {active && <Badge tone="green"><Check className="size-3" /> Selected</Badge>}
                    {opt.value === "members" && !active && <Badge tone="gold">Default</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Section visibility" desc="Control who can see each part of your profile. Individual settings cannot override your overall visibility.">
        <div className="space-y-1">
          {SECTION_LABELS.map((section) => {
            const current = settings.sections[section.key] ?? "members";
            const effective = settings.overall === "private" ? "private" : current;
            return (
              <div key={section.key} className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{section.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {SECTION_VIS.find((s) => s.value === effective)?.label}
                    {settings.overall === "private" && current !== "private" && " (overridden by Private overall setting)"}
                  </p>
                </div>
                <select value={current} onChange={(e) => setSection(section.key, e.target.value as Visibility)}
                  className="field h-9 w-full text-sm sm:w-56">
                  {SECTION_VIS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="How visibility works" desc="Understanding the relationship between overall and section settings.">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" /> If your overall profile is <strong className="text-foreground">Private</strong>, no section becomes publicly accessible regardless of its individual setting.</li>
          <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" /> If your overall profile is <strong className="text-foreground">OilSwift Members</strong>, only signed-in users can see sections set to "Visible to everyone".</li>
          <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" /> Sections set to <strong className="text-foreground">Only visible to me</strong> are never shown to other users.</li>
        </ul>
      </SectionCard>
    </>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    messages: true,
    connections: true,
    mentorship: true,
    applications: true,
    applicants: true,
    courses: true,
    services: true,
    verification: true,
    weekly: false,
  });

  const items: { key: string; label: string; desc: string }[] = [
    { key: "messages", label: "New messages", desc: "When you receive a new message" },
    { key: "connections", label: "Connection requests", desc: "When someone sends you a connection request" },
    { key: "mentorship", label: "Mentorship requests", desc: "When someone requests or responds to mentorship" },
    { key: "applications", label: "Application updates", desc: "Status changes on your job applications" },
    { key: "applicants", label: "New applicants", desc: "When someone applies to your job posting" },
    { key: "courses", label: "Course updates", desc: "Enrolment confirmations and course approvals" },
    { key: "services", label: "Service requests", desc: "When someone requests one of your services" },
    { key: "verification", label: "Verification updates", desc: "When your verification status changes" },
    { key: "weekly", label: "Weekly digest", desc: "A weekly summary of your activity" },
  ];

  return (
    <SectionCard title="Notification preferences" desc="Choose which notifications you want to receive.">
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between border-b border-border py-3 last:border-0">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <button onClick={() => setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${prefs[item.key] ? "bg-primary" : "bg-input"}`}>
              <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${prefs[item.key] ? "left-[1.375rem]" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function PreferencesTab({ type }: { type: PathType }) {
  return (
    <>
      <SectionCard title="Organization preferences" desc="Manage how your organization appears and operates on OilSwift.">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border py-2.5 text-sm">
            <span className="text-muted-foreground">Default job posting visibility</span>
            <span className="font-medium text-foreground">All members</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2.5 text-sm">
            <span className="text-muted-foreground">Auto-shortlist high-match candidates</span>
            <span className="font-medium text-foreground">Off</span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Show company in talent search</span>
            <span className="font-medium text-foreground">Yes</span>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Subscription" desc="Your current plan.">
        <div className="flex items-center gap-3 rounded-xl bg-ink p-4 text-ink-foreground">
          <Crown className="size-6 text-gold" />
          <div>
            <p className="font-semibold">Pro Plan</p>
            <p className="text-sm text-ink-foreground/70">₦45,000/month · Next billing: 1 Dec 2026</p>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
